export const POSTGRESQL_SCHEMA_SQL = `-- ==============================================================================
-- MODELAGEM RELACIONAL DE DADOS OTIMIZADA PARA POSTGRESQL
-- PROJETO: Amor ao Bicho - Farmácia de Manipulação Veterinária (Americana & Valinhos)
-- STACK: Node.js / FastAPI + PostgreSQL 16 + Redis (Cache de Sessão/Fila BullMQ)
-- ==============================================================================

-- 1. EXTENSÕES NECESSÁRIAS
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 2. TIPOS ENUMERADOS (DOMÍNIOS RESTRITOS)
CREATE TYPE pharmacy_unit_enum AS ENUM ('americana', 'valinhos');
CREATE TYPE user_role_enum AS ENUM ('tutor', 'veterinario', 'farmaceutico', 'admin');
CREATE TYPE pet_species_enum AS ENUM ('canino', 'felino', 'ave', 'roedor', 'equino', 'exotico');
CREATE TYPE dosage_form_enum AS ENUM (
    'biscoito_palatavel',
    'pasta_oral',
    'gel_transdermico',
    'xarope_suspensao',
    'capsula',
    'solucao_otologica',
    'pomada_topica',
    'colirio'
);
CREATE TYPE flavor_enum AS ENUM (
    'carne',
    'frango',
    'bacon',
    'figado',
    'peixe_salmao',
    'doce_de_leite',
    'baunilha',
    'frutas_vermelhas',
    'tutti_frutti',
    'sem_sabor'
);
CREATE TYPE order_status_enum AS ENUM (
    'analise_farmaceutica',
    'em_manipulacao',
    'controle_qualidade',
    'pronto_retirada',
    'saiu_para_entrega',
    'concluido',
    'cancelado'
);
CREATE TYPE payment_status_enum AS ENUM (
    'aguardando_analise',
    'orcamento_disponivel',
    'pago',
    'estornado',
    'cancelado'
);
CREATE TYPE shipping_method_enum AS ENUM (
    'retirada_americana',
    'retirada_valinhos',
    'entrega_expressa_rmc',
    'sedex'
);

-- ==============================================================================
-- 3. TABELAS DE DOMÍNIO E LOCALIDADES
-- ==============================================================================

-- Unidades físicas da Farmácia Amor ao Bicho
CREATE TABLE pharmacy_units (
    id pharmacy_unit_enum PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    city VARCHAR(80) NOT NULL,
    address VARCHAR(255) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    whatsapp VARCHAR(20) NOT NULL,
    technical_responsible VARCHAR(120) NOT NULL,
    crf_registration VARCHAR(30) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Usuários do ecossistema (Tutores, Veterinários, Equipe Técnica)
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    full_name VARCHAR(150) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    cpf VARCHAR(14) UNIQUE,
    role user_role_enum NOT NULL DEFAULT 'tutor',
    preferred_unit pharmacy_unit_enum REFERENCES pharmacy_units(id) DEFAULT 'americana',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Perfil Complementar de Médicos-Veterinários Prescritores
CREATE TABLE vet_profiles (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    crmv VARCHAR(20) NOT NULL,
    crmv_state CHAR(2) NOT NULL DEFAULT 'SP',
    clinic_name VARCHAR(150),
    clinic_address TEXT,
    specialty VARCHAR(100),
    wants_technical_visit BOOLEAN DEFAULT FALSE,
    wants_sample_kit BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_crmv_state UNIQUE (crmv, crmv_state)
);

-- ==============================================================================
-- 4. CADASTRO DE PETS (PACIENTES)
-- ==============================================================================

CREATE TABLE pets (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    tutor_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    name VARCHAR(80) NOT NULL,
    species pet_species_enum NOT NULL,
    breed VARCHAR(80) NOT NULL,
    birth_date DATE,
    age_years NUMERIC(4, 1),
    weight_kg NUMERIC(6, 2) NOT NULL CHECK (weight_kg > 0),
    allergies TEXT,
    chronic_condition TEXT,
    favorite_flavor flavor_enum,
    preferred_form dosage_form_enum,
    photo_url TEXT,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 5. RECEITAS, ORÇAMENTOS E ITENS MANIPULADOS
-- ==============================================================================

-- Prescrições enviadas pelos Tutores ou geradas pelos Veterinários
CREATE TABLE prescriptions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL, -- Ex: AB-2026-1042
    tutor_id UUID NOT NULL REFERENCES users(id),
    pet_id UUID NOT NULL REFERENCES pets(id),
    prescribing_vet_id UUID REFERENCES users(id),
    unit_id pharmacy_unit_enum NOT NULL REFERENCES pharmacy_units(id),
    file_url TEXT, -- Arquivo anexado (foto ou PDF da receita)
    external_recipe_link TEXT, -- Link de receita digital (VetSmart, Mevo, SimplesVet)
    preferred_form dosage_form_enum,
    preferred_flavor flavor_enum,
    tutor_notes TEXT,
    technical_assessment TEXT, -- Avaliação da Dra. Flávia ou Dra. Carolina
    evaluated_by UUID REFERENCES users(id),
    status order_status_enum NOT NULL DEFAULT 'analise_farmaceutica',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Fórmulas e componentes cotados na prescrição
CREATE TABLE prescription_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    active_substance VARCHAR(200) NOT NULL,
    concentration VARCHAR(100) NOT NULL,
    dosage_form dosage_form_enum NOT NULL,
    flavor flavor_enum,
    quantity_description VARCHAR(100) NOT NULL, -- Ex: '60 biscoitos em ossinho', '1 seringa de 30ml'
    posology TEXT NOT NULL,
    unit_price NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Orçamentos Consolidados
CREATE TABLE quotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    prescription_id UUID UNIQUE NOT NULL REFERENCES prescriptions(id) ON DELETE CASCADE,
    subtotal NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    shipping_method shipping_method_enum NOT NULL DEFAULT 'retirada_americana',
    shipping_cost NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    discount_amount NUMERIC(10, 2) DEFAULT 0.00,
    total NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
    payment_status payment_status_enum NOT NULL DEFAULT 'aguardando_analise',
    payment_method VARCHAR(30), -- 'pix', 'cartao'
    pix_payload TEXT,
    pix_qr_url TEXT,
    pix_transaction_id VARCHAR(100),
    valid_until TIMESTAMPTZ NOT NULL,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 6. PEDIDOS, RASTREAMENTO E HISTÓRICO DE ESTÁGIOS
-- ==============================================================================

CREATE TABLE orders (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    code VARCHAR(20) UNIQUE NOT NULL,
    quote_id UUID UNIQUE NOT NULL REFERENCES quotes(id),
    tutor_id UUID NOT NULL REFERENCES users(id),
    pet_id UUID NOT NULL REFERENCES pets(id),
    unit_id pharmacy_unit_enum NOT NULL REFERENCES pharmacy_units(id),
    current_status order_status_enum NOT NULL DEFAULT 'analise_farmaceutica',
    shipping_method shipping_method_enum NOT NULL,
    delivery_address TEXT,
    estimated_delivery_at TIMESTAMPTZ,
    erp_order_id VARCHAR(50), -- Chave no Fórmula Certa / Pharmacie
    laudo_qualidade_url TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Auditoria e Tracking em Tempo Real
CREATE TABLE order_tracking_events (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    order_id UUID NOT NULL REFERENCES orders(id) ON DELETE CASCADE,
    status order_status_enum NOT NULL,
    title VARCHAR(120) NOT NULL,
    description TEXT NOT NULL,
    operator_name VARCHAR(100),
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 7. HORA DO REMÉDIO & CLUBE DE RECOMPRA INTELIGENTE
-- ==============================================================================

CREATE TABLE dose_schedules (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    pet_id UUID NOT NULL REFERENCES pets(id) ON DELETE CASCADE,
    order_id UUID REFERENCES orders(id) ON DELETE SET NULL,
    medication_name VARCHAR(180) NOT NULL,
    dosage_instruction VARCHAR(150) NOT NULL,
    dosage_form dosage_form_enum NOT NULL,
    time_of_day TIME NOT NULL,
    interval_hours INT NOT NULL DEFAULT 24,
    start_date DATE NOT NULL,
    total_days INT NOT NULL,
    total_doses INT NOT NULL,
    doses_given INT NOT NULL DEFAULT 0,
    is_chronic BOOLEAN NOT NULL DEFAULT FALSE,
    repurchase_alert_sent BOOLEAN DEFAULT FALSE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- Registro diário de administração
CREATE TABLE dose_administrations (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    dose_schedule_id UUID NOT NULL REFERENCES dose_schedules(id) ON DELETE CASCADE,
    scheduled_at TIMESTAMPTZ NOT NULL,
    administered_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP,
    was_administered BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT, -- Ex: 'Pet aceitou o biscoito de primeira'
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 8. GUIA TERAPÊUTICO VETERINÁRIO & INTEGRAÇÃO WHATSAPP
-- ==============================================================================

CREATE TABLE therapeutic_guide (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    active_substance VARCHAR(150) NOT NULL,
    category VARCHAR(100) NOT NULL,
    species_target VARCHAR(50) NOT NULL,
    dose_range_description TEXT NOT NULL,
    frequency_description TEXT NOT NULL,
    recommended_forms dosage_form_enum[] NOT NULL,
    contraindications TEXT,
    ph_stability TEXT,
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE whatsapp_webhook_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    recipient_phone VARCHAR(20) NOT NULL,
    message_content TEXT NOT NULL,
    provider VARCHAR(50) DEFAULT 'evolution_api',
    external_message_id VARCHAR(100),
    status VARCHAR(30) DEFAULT 'sent',
    created_at TIMESTAMPTZ DEFAULT CURRENT_TIMESTAMP
);

-- ==============================================================================
-- 9. ÍNDICES DE ALTA PERFORMANCE (B-TREE & GIN)
-- ==============================================================================

CREATE INDEX idx_pets_tutor ON pets(tutor_id) WHERE is_active = TRUE;
CREATE INDEX idx_prescriptions_unit_status ON prescriptions(unit_id, status);
CREATE INDEX idx_orders_tutor ON orders(tutor_id);
CREATE INDEX idx_orders_unit_status ON orders(unit_id, current_status);
CREATE INDEX idx_dose_schedules_pet ON dose_schedules(pet_id) WHERE is_active = TRUE;
CREATE INDEX idx_dose_schedules_repurchase ON dose_schedules(is_chronic, is_active, repurchase_alert_sent);
CREATE INDEX idx_tracking_order ON order_tracking_events(order_id);

-- Gatilho de Atualização Automática de updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER trg_pets_updated_at BEFORE UPDATE ON pets FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_prescriptions_updated_at BEFORE UPDATE ON prescriptions FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_quotes_updated_at BEFORE UPDATE ON quotes FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_orders_updated_at BEFORE UPDATE ON orders FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER trg_dose_schedules_updated_at BEFORE UPDATE ON dose_schedules FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
`;

export const ARCHITECTURE_SPECIFICATION = {
  title: 'Arquitetura de Microsserviços e Integrações - Amor ao Bicho',
  version: '2.4 (Americana & Valinhos)',
  layers: [
    {
      name: '1. Frontend Multi-Plataforma (B2B2C)',
      tech: 'React / React Native + Tailwind CSS + Lucide Icons',
      details: 'PWA e App Mobile com fluxos otimizados para Tutores (Envio de Receita, Hora do Remédio, Tracking, Checkout PIX) e Médicos-Veterinários (Calculadora de Doses, Prescrição Digital, Guia Terapêutico).'
    },
    {
      name: '2. Backend API Gateway & Microsserviços',
      tech: 'Node.js (Express / NestJS) ou Python (FastAPI)',
      details: 'Rotas RESTful protegidas com JWT e RBAC (Tutor, Veterinário com CRMV validado, Farmacêutico e Backoffice Admin).'
    },
    {
      name: '3. Camada de Dados & Filas Assíncronas',
      tech: 'PostgreSQL 16 + Redis + BullMQ',
      details: 'PostgreSQL relacional com enums nativos e índices para busca de receitas e doses. Redis para cache de fórmulas e fila assíncrona para notificações de doses e disparos de WhatsApp.'
    },
    {
      name: '4. Integrações de Terceiros e ERP Farmacêutico',
      tech: 'Gateways de Pagamento, WhatsApp e ERP',
      details: [
        'ERP Farmacêutico: Conector bidirecional com Fórmula Certa ou Pharmacie (sincronização de laudos, estoques de matérias-primas e lote).',
        'WhatsApp API: Integração via Evolution API / Z-API para envio de link de orçamento, avisos de etapas de manipulação e alertas de dose.',
        'Pagamento: Gateway com suporte a PIX instantâneo (com Webhook de confirmação imediata) e Cartão de Crédito.',
        'Logística: Integração com Melhor Envio / Correios e despacho local por motoboy nas regiões de Americana, Santa Bárbara d\'Oeste, Valinhos, Campinas e Vinhedo.'
      ]
    }
  ]
};
