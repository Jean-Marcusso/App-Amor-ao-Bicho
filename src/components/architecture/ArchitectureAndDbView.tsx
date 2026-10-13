import React, { useState } from 'react';
import { 
  Database, 
  Copy, 
  Check, 
  Layers, 
  Server, 
  ShieldCheck, 
  Cpu, 
  Terminal, 
  CheckCircle2, 
  FileCode,
  ArrowRight
} from 'lucide-react';
import { POSTGRESQL_SCHEMA_SQL, ARCHITECTURE_SPECIFICATION } from '../../data/databaseSql';

export const ArchitectureAndDbView: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'sql' | 'architecture' | 'integrations'>('sql');

  const handleCopySql = () => {
    navigator.clipboard.writeText(POSTGRESQL_SCHEMA_SQL);
    setCopied(true);
    setTimeout(() => setCopied(false), 2500);
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Header */}
      <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Database className="w-6 h-6 text-indigo-400" />
            <h1 className="text-lg font-bold">Modelagem Relacional PostgreSQL & Arquitetura de Software</h1>
            <span className="text-[11px] bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded font-mono">
              PostgreSQL 16+
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Estrutura de dados relacional otimizada para o ecossistema B2B2C da farmácia Amor ao Bicho (Americana & Valinhos).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleCopySql}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            <span>{copied ? 'SQL Copiado com Sucesso!' : 'Copiar DDL SQL Completo'}</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 text-xs font-semibold gap-2">
        <button
          onClick={() => setActiveTab('sql')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'sql'
              ? 'border-indigo-600 text-indigo-950 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <FileCode className="w-4 h-4 text-indigo-600" />
          <span>Script SQL DDL (Tabelas, Enums, Índices & Triggers)</span>
        </button>

        <button
          onClick={() => setActiveTab('architecture')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'architecture'
              ? 'border-indigo-600 text-indigo-950 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Layers className="w-4 h-4 text-indigo-600" />
          <span>Diagrama Relacional & Entidades (ER)</span>
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`py-3 px-4 border-b-2 flex items-center gap-2 transition-colors ${
            activeTab === 'integrations'
              ? 'border-indigo-600 text-indigo-950 bg-indigo-50/50'
              : 'border-transparent text-slate-600 hover:text-slate-900'
          }`}
        >
          <Server className="w-4 h-4 text-indigo-600" />
          <span>Integrações (ERP Fórmula Certa, WhatsApp, PIX, Frete)</span>
        </button>
      </div>

      {/* ABA 1: SCRIPT DDL SQL POSTGRESQL */}
      {activeTab === 'sql' && (
        <div className="space-y-4">
          <div className="bg-slate-900 text-slate-100 p-5 rounded-2xl shadow-inner border border-slate-800 font-mono text-xs overflow-x-auto max-h-[600px] space-y-2">
            <div className="flex justify-between items-center pb-3 border-b border-slate-800 text-slate-400">
              <span className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                schema_amor_ao_bicho.sql
              </span>
              <button
                onClick={handleCopySql}
                className="text-xs text-indigo-300 hover:text-white flex items-center gap-1"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copied ? 'Copiado!' : 'Copiar'}</span>
              </button>
            </div>
            <pre className="text-[11px] leading-relaxed text-emerald-300/90 whitespace-pre">
              {POSTGRESQL_SCHEMA_SQL}
            </pre>
          </div>
        </div>
      )}

      {/* ABA 2: DIAGRAMA ER & ENTIDADES */}
      {activeTab === 'architecture' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-indigo-800 font-bold text-sm">
                <span className="w-3 h-3 rounded-full bg-indigo-600" />
                <span>1. Núcleo de Pacientes & Tutores</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-600">
                <li><strong>users</strong>: id (UUID), role (tutor/vet/farmacêutico), cpf, email, telefone.</li>
                <li><strong>pets</strong>: tutor_id (FK), nome, espécie (enum), peso_kg, alergias, sabor_favorito.</li>
                <li><strong>vet_profiles</strong>: user_id (FK), crmv, crmv_state, clínica, especialidade.</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-emerald-800 font-bold text-sm">
                <span className="w-3 h-3 rounded-full bg-emerald-600" />
                <span>2. Prescrições, Orçamentos & Pedidos</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-600">
                <li><strong>prescriptions</strong>: pet_id, unit_id (Americana/Valinhos), file_url, status.</li>
                <li><strong>prescription_items</strong>: princípio_ativo, concentração, forma_farmacêutica, sabor.</li>
                <li><strong>quotes</strong>: subtotal, frete_valor, total, pix_payload, valid_until.</li>
                <li><strong>orders</strong>: quote_id, tracking_events (5 etapas em tempo real).</li>
              </ul>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2 text-amber-800 font-bold text-sm">
                <span className="w-3 h-3 rounded-full bg-amber-600" />
                <span>3. Hora do Remédio & Recompra</span>
              </div>
              <ul className="text-xs space-y-2 text-slate-600">
                <li><strong>dose_schedules</strong>: pet_id, horário, intervalo, dias_restantes, is_crônico.</li>
                <li><strong>dose_administrations</strong>: registro timestamp da dose dada pelo tutor com feedback.</li>
                <li><strong>whatsapp_webhook_logs</strong>: disparos de evolução de status via Evolution API.</li>
              </ul>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <h3 className="font-bold text-sm text-slate-900">
              Estratégia de Performance em Produção
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Os índices relacionais incluem índices parciais (ex: <code>WHERE is_active = TRUE</code>) e índices compostos sobre <code>(unit_id, status)</code> para consultas sub-milissegundo da esteira do laboratório. Chaves primárias UUID v4 garantem distribuição horizontal e integridade ao sincronizar com apps offline (React Native / Flutter).
            </p>
          </div>
        </div>
      )}

      {/* ABA 3: INTEGRAÇÕES */}
      {activeTab === 'integrations' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  ERP
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Fórmula Certa / Pharmacie</h4>
                  <p className="text-[11px] text-slate-500">Conector Bidirecional de Manipulação</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Ao aprovar o orçamento no app, o pedido é inserido via fila REST no Fórmula Certa das unidades Americana ou Valinhos. O laudo analítico e lote das matérias-primas são sincronizados automaticamente.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-teal-100 text-teal-800 flex items-center justify-center font-bold text-xs">
                  WA
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Evolution API / Z-API (WhatsApp)</h4>
                  <p className="text-[11px] text-slate-500">Gatilhos de Notificação Automáticos</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Disparo de templates oficiais com links curtos autenticados para:
                1) Receita recebida; 2) Orçamento pronto com link PIX; 3) Entrada no laboratório; 4) Saída para entrega / liberação para retirada; 5) Alerta de recompra de 5 dias.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-indigo-100 text-indigo-800 flex items-center justify-center font-bold text-xs">
                  PIX
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Gateway de Pagamento (Asaas / Pagar.me)</h4>
                  <p className="text-[11px] text-slate-500">PIX Dinâmico com Webhook Instantâneo</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Geração do EMV Payload e QR Code PIX com split automático de contas para a unidade correta (CNPJ Americana ou CNPJ Valinhos). Webhook confirma o pagamento em menos de 2 segundos e avança o status para a esteira laboratorial.
              </p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-xs">
                  RMC
                </div>
                <div>
                  <h4 className="font-bold text-sm text-slate-900">Logística Expressa & Frete</h4>
                  <p className="text-[11px] text-slate-500">Motoboy RMC + Melhor Envio</p>
                </div>
              </div>
              <p className="text-xs text-slate-600">
                Cálculo de taxas de entrega regional para Americana, Santa Bárbara d'Oeste, Nova Odessa, Valinhos, Campinas e Vinhedo, além de Sedex refrigerado para produtos que exigem cadeia fria (ex: colírios e certas suspensões).
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
