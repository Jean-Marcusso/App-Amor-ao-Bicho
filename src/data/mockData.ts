import { 
  UnitInfo, 
  Pet, 
  PrescriptionOrder, 
  DoseSchedule, 
  TherapeuticGuideItem, 
  BlogPost,
  UserAccount
} from '../types';

export const INITIAL_USERS: UserAccount[] = [
  {
    id: 'user-tutor-1',
    name: 'Mariana Duarte',
    email: 'mariana.duarte@email.com',
    phone: '(19) 99123-4567',
    cpf: '345.678.901-22',
    role: 'tutor',
    avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
    address: {
      street: 'Rua das Palmeiras',
      number: '312',
      neighborhood: 'Jardim São Paulo',
      city: 'Americana',
      state: 'SP',
      cep: '13468-000'
    }
  },
  {
    id: 'user-vet-1',
    name: 'Dr. Lucas Silveira',
    email: 'lucas.silveira@veterinaria.com.br',
    phone: '(19) 98765-4321',
    cpf: '234.567.890-11',
    role: 'vet',
    crmv: 'CRMV-SP 38.920',
    crmvState: 'SP',
    clinicName: 'Centro Veterinário São Francisco - Americana / SP',
    specialty: 'Clínica Médica e Ortopedia de Pequenos Animais',
    avatarUrl: 'https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=200&q=80',
    address: {
      street: 'Av. Brasil',
      number: '1450',
      neighborhood: 'Santo Antônio',
      city: 'Americana',
      state: 'SP',
      cep: '13465-000'
    }
  },
  {
    id: 'user-pharm-1',
    name: 'Dra. Flávia Semeghini',
    email: 'flavia@amoraobicho.com.br',
    phone: '(19) 99876-5432',
    role: 'admin',
    crf: 'CRF-SP 48.912',
    pharmacyUnit: 'americana',
    avatarUrl: 'https://images.unsplash.com/photo-1594824813590-78dd75618f0a?auto=format&fit=crop&w=200&q=80'
  },
  {
    id: 'user-pharm-2',
    name: 'Dra. Carolina Giordano',
    email: 'carolina@amoraobicho.com.br',
    phone: '(19) 99765-4321',
    role: 'admin',
    crf: 'CRF-SP 52.340',
    pharmacyUnit: 'valinhos',
    avatarUrl: 'https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=200&q=80'
  }
];

export const PHARMACY_UNITS: Record<string, UnitInfo> = {
  americana: {
    id: 'americana',
    name: 'Unidade Americana',
    city: 'Americana - SP',
    address: 'Rua das Paineiras, 450 - Jardim São Paulo',
    phone: '(19) 3461-8820',
    whatsapp: '(19) 99876-5432',
    technicalResponsible: 'Dra. Flávia Semeghini',
    crf: 'CRF-SP 48.912',
    openingHours: 'Seg a Sex: 08h às 18h | Sáb: 08h às 12h'
  },
  valinhos: {
    id: 'valinhos',
    name: 'Unidade Valinhos',
    city: 'Valinhos - SP',
    address: 'Av. Onze de Agosto, 1280 - Vila Clayton',
    phone: '(19) 3871-3340',
    whatsapp: '(19) 99765-4321',
    technicalResponsible: 'Dra. Carolina Giordano',
    crf: 'CRF-SP 52.340',
    openingHours: 'Seg a Sex: 08h às 18h | Sáb: 08h às 12h'
  }
};

export const INITIAL_PETS: Pet[] = [
  {
    id: 'pet-1',
    name: 'Thor',
    species: 'canino',
    breed: 'Golden Retriever',
    ageYears: 5,
    weightKg: 32.5,
    allergies: 'Sensibilidade a corantes artificiais',
    chronicCondition: 'Displasia coxofemoral leve (uso de condroprotetor)',
    favoriteFlavor: 'carne',
    photoUrl: 'https://images.unsplash.com/photo-1552053831-71594a27632d?auto=format&fit=crop&w=400&q=80',
    tutorName: 'Mariana Duarte',
    tutorPhone: '(19) 99123-4567'
  },
  {
    id: 'pet-2',
    name: 'Mia',
    species: 'felino',
    breed: 'Siamês',
    ageYears: 7,
    weightKg: 4.2,
    allergies: 'Nenhuma conhecida',
    chronicCondition: 'Insuficiência renal crônica estágio 2',
    favoriteFlavor: 'peixe_salmao',
    photoUrl: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?auto=format&fit=crop&w=400&q=80',
    tutorName: 'Mariana Duarte',
    tutorPhone: '(19) 99123-4567'
  },
  {
    id: 'pet-3',
    name: 'Bento',
    species: 'canino',
    breed: 'Buldogue Francês',
    ageYears: 3,
    weightKg: 12.8,
    allergies: 'Atopia cutânea severa',
    chronicCondition: 'Dermatite atópica',
    favoriteFlavor: 'bacon',
    photoUrl: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?auto=format&fit=crop&w=400&q=80',
    tutorName: 'Mariana Duarte',
    tutorPhone: '(19) 99123-4567'
  }
];

export const INITIAL_DOSE_SCHEDULES: DoseSchedule[] = [
  {
    id: 'dose-1',
    petId: 'pet-1',
    petName: 'Thor',
    medicationName: 'Condroitina + Glicosamina + MSM (Biscoito de Carne)',
    dosage: '1 biscoito palatável mastigável (2g)',
    form: 'biscoito_palatavel',
    time: '08:00',
    intervalHours: 24,
    startDate: '2026-09-18',
    totalDays: 30,
    daysRemaining: 4, // Trigger Clube de Recompra! (<= 5 dias)
    totalDoses: 30,
    dosesGiven: 26,
    nextDoseTime: 'Hoje às 08:00',
    isChronic: true,
    takenToday: false
  },
  {
    id: 'dose-2',
    petId: 'pet-2',
    petName: 'Mia',
    medicationName: 'Gel Transdérmico Auricular Renal Protect',
    dosage: '1 click dosador (0.1 mL) na face interna da orelha',
    form: 'gel_transdermico',
    time: '19:00',
    intervalHours: 24,
    startDate: '2026-10-01',
    totalDays: 60,
    daysRemaining: 48,
    totalDoses: 60,
    dosesGiven: 12,
    nextDoseTime: 'Hoje às 19:00',
    isChronic: true,
    takenToday: true,
    lastTakenAt: 'Hoje às 18:55'
  },
  {
    id: 'dose-3',
    petId: 'pet-3',
    petName: 'Bento',
    medicationName: 'Omeprazol Pasta Oral Sabor Bacon',
    dosage: '0.5 mL antes da primeira refeição',
    form: 'pasta_oral',
    time: '07:30',
    intervalHours: 24,
    startDate: '2026-10-05',
    totalDays: 14,
    daysRemaining: 6,
    totalDoses: 14,
    dosesGiven: 8,
    nextDoseTime: 'Amanhã às 07:30',
    isChronic: false,
    takenToday: true,
    lastTakenAt: 'Hoje às 07:28'
  }
];

export const INITIAL_ORDERS: PrescriptionOrder[] = [
  {
    id: 'ord-101',
    code: 'AB-2026-1042',
    createdAt: 'Hoje, 09:15',
    tutorName: 'Mariana Duarte',
    tutorPhone: '(19) 99123-4567',
    petId: 'pet-1',
    petName: 'Thor',
    petSpecies: 'canino',
    petWeightKg: 32.5,
    unit: 'americana',
    status: 'controle_qualidade', // Estágio 3 de 5
    prescriptionImageUrl: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=600&q=80',
    preferredForm: 'biscoito_palatavel',
    preferredFlavor: 'carne',
    prescribingVetName: 'Dr. Lucas Silveira',
    crmv: 'CRMV-SP 38.920',
    items: [
      {
        id: 'it-1',
        description: 'Biscoitos Palatáveis Articulares - Condroitina 500mg + Glicosamina 500mg',
        activeSubstance: 'Sulfato de Condroitina / Glicosamina',
        concentration: '500mg/500mg',
        dosageForm: 'biscoito_palatavel',
        flavor: 'carne',
        quantity: '60 unidades em formato de ossinho',
        unitPrice: 128.50
      }
    ],
    subtotal: 128.50,
    shippingMethod: 'retirada_americana',
    shippingCost: 0.00,
    total: 128.50,
    paymentMethod: 'pix',
    paymentStatus: 'pago',
    pharmacistSignature: 'Dra. Flávia Semeghini (CRF-SP 48.912)',
    estimatedDeliveryDate: 'Hoje às 17h00',
    whatsappLogs: [
      {
        id: 'log-1',
        timestamp: 'Hoje, 09:20',
        recipient: '(19) 99123-4567',
        message: 'Olá Mariana! Recebemos a receita do Thor na unidade Americana da Amor ao Bicho. Nossa farmacêutica Dra. Flávia já está calculando o laudo.',
        status: 'read'
      },
      {
        id: 'log-2',
        timestamp: 'Hoje, 10:45',
        recipient: '(19) 99123-4567',
        message: 'A fórmula do Thor acaba de entrar no laboratório de manipulação de sólidos da Amor ao Bicho Americana! 🐾',
        status: 'read'
      },
      {
        id: 'log-3',
        timestamp: 'Hoje, 14:10',
        recipient: '(19) 99123-4567',
        message: 'Controle de Qualidade em andamento: laudo analítico e pesagem média aprovados. Previsão de liberação às 17h.',
        status: 'delivered'
      }
    ]
  },
  {
    id: 'ord-102',
    code: 'AB-2026-1049',
    createdAt: 'Ontem, 16:30',
    tutorName: 'Mariana Duarte',
    tutorPhone: '(19) 99123-4567',
    petId: 'pet-2',
    petName: 'Mia',
    petSpecies: 'felino',
    petWeightKg: 4.2,
    unit: 'valinhos',
    status: 'analise_farmaceutica', // Aguardando análise da Dra. Carolina
    prescriptionImageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=600&q=80',
    preferredForm: 'gel_transdermico',
    notes: 'Mia não aceita comprimidos de jeito nenhum. Gostaria de gel na orelha para estresse zero!',
    items: [
      {
        id: 'it-2',
        description: 'Gel Transdérmico Auricular Renal Protect com aplicador tipo caneta',
        activeSubstance: 'Benazepril + Complexo B',
        concentration: '2.5mg/click',
        dosageForm: 'gel_transdermico',
        quantity: 'Frasco aplicador com 60 clicks',
        unitPrice: 115.00
      }
    ],
    subtotal: 115.00,
    shippingMethod: 'entrega_expressa_rmc',
    shippingCost: 15.00,
    total: 130.00,
    paymentMethod: 'pix',
    paymentStatus: 'orcamento_disponivel',
    pixCode: '00020126580014br.gov.bcb.pix0136amoraobicho-valinhos@pix.com.br5204000053039865406130.005802BR5921AMOR AO BICHO FARMACIA6008VALINHOS62070503***6304D1B9',
    pharmacistSignature: 'Dra. Carolina Giordano (CRF-SP 52.340)',
    estimatedDeliveryDate: 'Amanhã até as 12h00',
    whatsappLogs: [
      {
        id: 'log-4',
        timestamp: 'Ontem, 16:35',
        recipient: '(19) 99123-4567',
        message: 'Olá Mariana! A receita da Mia chegou em Valinhos. Dra. Carolina Giordano avaliou a indicação de Gel Transdérmico e preparou seu orçamento.',
        status: 'read'
      }
    ]
  }
];

export const THERAPEUTIC_GUIDE: TherapeuticGuideItem[] = [
  {
    id: 'tg-1',
    activeSubstance: 'Meloxicam',
    category: 'Anti-inflamatório Não Esteroidal (AINE)',
    speciesIndications: [
      {
        species: 'canino',
        doseRange: '0.2 mg/kg no 1º dia (dose de ataque), seguido por 0.1 mg/kg a cada 24h',
        frequency: 'A cada 24 horas (via oral)',
        recommendedForms: ['biscoito_palatavel', 'xarope_suspensao', 'pasta_oral'],
        recommendedFlavors: ['carne', 'frango', 'bacon'],
        observations: 'Excelente aceitação em biscoito macio de carne. Administrar junto com refeição.'
      },
      {
        species: 'felino',
        doseRange: '0.05 mg/kg dose única ou máximo 0.05 mg/kg q24h por curto período (conforme avaliação renal)',
        frequency: 'A cada 24 horas (curta duração)',
        recommendedForms: ['pasta_oral', 'xarope_suspensao'],
        recommendedFlavors: ['peixe_salmao', 'frango'],
        observations: 'Em felinos, monitorar hidratação e função renal. A pasta oral em micro-seringa garante precisão.'
      }
    ],
    contraindications: 'Úlcera gastrointestinal ativa, insuficiência renal severa, animais desidratados ou hipovolêmicos.',
    phStability: 'Estável em pH 7.0 a 8.5. Conservar ao abrigo da luz e umidade.'
  },
  {
    id: 'tg-2',
    activeSubstance: 'Gabapentina',
    category: 'Neuromodulador & Analgésico para Dor Crônica e Manejo Pré-Consulta',
    speciesIndications: [
      {
        species: 'canino',
        doseRange: '5 a 15 mg/kg a cada 8 a 12 horas para dor neuropática; até 20 mg/kg em titulação gradual',
        frequency: 'A cada 8 ou 12 horas',
        recommendedForms: ['biscoito_palatavel', 'capsula'],
        recommendedFlavors: ['carne', 'figado', 'bacon'],
        observations: 'Pode causar sedação transitória nos primeiros 3 dias. Biscoitos mastigáveis evitam recusa.'
      },
      {
        species: 'felino',
        doseRange: '50 a 100 mg/gato dose total 90 minutos antes de consultas ou viagens (protocolo Cat Friendly)',
        frequency: 'Dose única pré-evento ou 5 a 10 mg/kg q12h para dor crônica',
        recommendedForms: ['gel_transdermico', 'pasta_oral', 'xarope_suspensao'],
        recommendedFlavors: ['peixe_salmao', 'frango'],
        observations: 'Gel transdérmico auricular em base Lipoderm é a forma de ouro para gatos de difícil manejo.'
      }
    ],
    contraindications: 'Hipersensibilidade à molécula. Atenção na descontinuação: fazer desmame gradual.',
    phStability: 'Sensível a umidade. Veículo anidro ou xarope sem açúcar recomendado.'
  },
  {
    id: 'tg-3',
    activeSubstance: 'Pimobendan',
    category: 'Inodilatador Cardíaco (Inotrópico Positivo + Vasodilatador)',
    speciesIndications: [
      {
        species: 'canino',
        doseRange: '0.25 mg/kg a cada 12 horas (dose total diária 0.5 mg/kg)',
        frequency: 'A cada 12 horas, 1 hora antes das refeições',
        recommendedForms: ['biscoito_palatavel', 'capsula'],
        recommendedFlavors: ['carne', 'bacon'],
        observations: 'Essencial para cães com DMVD ou DCM. Biscoito medicamentoso garante adesão rigorosa diária.'
      },
      {
        species: 'felino',
        doseRange: '0.15 a 0.3 mg/kg a cada 12 horas (conforme protocolo de cardiologia felina)',
        frequency: 'A cada 12 horas',
        recommendedForms: ['pasta_oral', 'gel_transdermico'],
        recommendedFlavors: ['peixe_salmao'],
        observations: 'Uso em cardiomiopatias com disfunção sistólica. Alta tolerância em pasta oral sabor peixe.'
      }
    ],
    contraindications: 'Estenose aórtica ou pulmonar severa, cardiomiopatia hipertrófica obstrutiva.',
    phStability: 'Baixa solubilidade em pH neutro. Requer tecnologia de micro-cristalização Amor ao Bicho.'
  },
  {
    id: 'tg-4',
    activeSubstance: 'Omeprazol',
    category: 'Inibidor de Bomba de Prótons (Gastroprotetor)',
    speciesIndications: [
      {
        species: 'ambos',
        doseRange: '0.5 a 1.0 mg/kg a cada 24 horas',
        frequency: 'A cada 24 horas em jejum matinal',
        recommendedForms: ['pasta_oral', 'capsula'],
        recommendedFlavors: ['bacon', 'frango', 'peixe_salmao'],
        observations: 'Molécula ácido-lábil. Na Amor ao Bicho manipulamos em microgrânulos gastrorresistentes.'
      }
    ],
    contraindications: 'Hipersensibilidade a benzimidazóis.',
    phStability: 'Degrada rapidamente em pH ácido. Manipulado exclusivamente com revestimento entérico.'
  },
  {
    id: 'tg-5',
    activeSubstance: 'Doxiciclina (Hiclato ou Monoidrato)',
    category: 'Antimicrobiano de Amplo Espectro (Tetraciclina)',
    speciesIndications: [
      {
        species: 'canino',
        doseRange: '5 a 10 mg/kg a cada 12 ou 24 horas (conforme afecção: Erliquiose, Leptospirose)',
        frequency: 'A cada 12 ou 24 horas',
        recommendedForms: ['biscoito_palatavel', 'xarope_suspensao'],
        recommendedFlavors: ['carne', 'frango'],
        observations: 'Oferecer com pequena porção de comida para mitigar náuseas.'
      },
      {
        species: 'felino',
        doseRange: '5 mg/kg a cada 12 horas ou 10 mg/kg q24h',
        frequency: 'A cada 12 horas',
        recommendedForms: ['xarope_suspensao', 'pasta_oral'],
        recommendedFlavors: ['peixe_salmao'],
        observations: 'NUNCA administrar comprimido seco em gatos (risco de estenose esofágica). Xarope ou pasta obrigatórios!'
      }
    ],
    contraindications: 'Fêmeas gestantes e animais em fase precoce de crescimento dental.',
    phStability: 'Fotossensível. Embalagens âmbar de alta barreira.'
  },
  {
    id: 'tg-6',
    activeSubstance: 'Dipirona Sódica',
    category: 'Analgésico e Antipirético',
    speciesIndications: [
      {
        species: 'canino',
        doseRange: '25 mg/kg a cada 8 horas (ou 1 gota/kg se solução oral 500mg/mL)',
        frequency: 'A cada 8 horas conforme dor ou febre',
        recommendedForms: ['xarope_suspensao', 'biscoito_palatavel'],
        recommendedFlavors: ['carne', 'frango', 'doce_de_leite'],
        observations: 'Excelente controle térmico e analgésico pós-cirúrgico ou ortopédico.'
      },
      {
        species: 'felino',
        doseRange: '10 a 15 mg/kg a cada 12 ou 24 horas',
        frequency: 'A cada 12 ou 24 horas com acompanhamento',
        recommendedForms: ['pasta_oral', 'xarope_suspensao'],
        recommendedFlavors: ['peixe_salmao'],
        observations: 'Em felinos a metabolização hepática por glucuronidação é lenta; respeitar o intervalo mínimo de 12-24h.'
      }
    ],
    contraindications: 'Hipersensibilidade a pirazolonas, discrasias sanguíneas severas.',
    phStability: 'Solúvel em água. Estável em pH 6.0 a 7.5.'
  },
  {
    id: 'tg-7',
    activeSubstance: 'Prednisolona',
    category: 'Glicocorticoide / Anti-inflamatório e Imunossupressor',
    speciesIndications: [
      {
        species: 'canino',
        doseRange: '0.5 mg/kg a cada 24h (anti-inflamatório) ou 1 a 2 mg/kg q12h (imunossupressor)',
        frequency: 'A cada 12 ou 24 horas',
        recommendedForms: ['biscoito_palatavel', 'xarope_suspensao'],
        recommendedFlavors: ['carne', 'figado', 'baunilha'],
        observations: 'Administrar preferencialmente pela manhã em cães para respeitar o ciclo do cortisol.'
      },
      {
        species: 'felino',
        doseRange: '1 a 2 mg/kg a cada 24 horas (prednisolona é a forma ativa preferida em gatos)',
        frequency: 'A cada 24 horas (à noite)',
        recommendedForms: ['pasta_oral', 'gel_transdermico'],
        recommendedFlavors: ['peixe_salmao', 'frango'],
        observations: 'Gatos têm ciclo circadiano noturno. Preferir administração noturna.'
      }
    ],
    contraindications: 'Infecções fúngicas sistêmicas, úlceras de córnea, diabetes descompensado.',
    phStability: 'Manter em frasco hermético protegido da umidade.'
  },
  {
    id: 'tg-8',
    activeSubstance: 'Condroitina + Glicosamina',
    category: 'Condroprotetor e Regenerador Articular',
    speciesIndications: [
      {
        species: 'ambos',
        doseRange: '15 a 20 mg/kg de cada princípio ativo a cada 24 horas',
        frequency: 'A cada 24 horas (uso contínuo crônico)',
        recommendedForms: ['biscoito_palatavel', 'pasta_oral'],
        recommendedFlavors: ['carne', 'bacon', 'peixe_salmao'],
        observations: 'Tratamento de osteoartrose e displasias. Altíssima adesão em biscoitos palatáveis Amor ao Bicho.'
      }
    ],
    contraindications: 'Nenhuma contraindicação relevante.',
    phStability: 'Muito estável em formulações secas e biscoitos assados em temperatura controlada.'
  }
];

export const PHARMACEUTICAL_FORMS_INFO = [
  {
    id: 'biscoito_palatavel',
    name: 'Biscoitos Palatáveis Mastigáveis',
    subtitle: 'Formato de ossinho ou peixinho com sabor gourmet',
    targetSpecies: 'Cães e Gatos seletivos',
    bestFor: 'Tratamentos crônicos (artrite, coração, alergias, suplementos)',
    benefits: [
      'O pet come voluntariamente como se fosse um petisco',
      'Zero estresse e zero necessidade de forçar a boca do animal',
      'Formatos e texturas macias para animais idosos ou com problemas dentários',
      'Sabores naturais: Picanha, Frango, Bacon, Fígado e Salmão'
    ],
    icon: 'cookie'
  },
  {
    id: 'gel_transdermico',
    name: 'Gel Transdérmico Auricular (Cat Friendly)',
    subtitle: 'Aplicação indolor na parte interna da orelha',
    targetSpecies: 'Gatos e Cães que cospem comprimidos',
    bestFor: 'Gabapentina, Fluoxetina, Metimazol, Benazepril e antieméticos',
    benefits: [
      'Absorção pela microcirculação do pavilhão auricular interno',
      'Zero brigas, arranhões ou traumas diários com o felino',
      'Caneta dosadora com clique de alta precisão (0.05 a 0.1 mL por clique)',
      'Veículo transdérmico de permeabilidade acelerada Amor ao Bicho'
    ],
    icon: 'sparkles'
  },
  {
    id: 'pasta_oral',
    name: 'Pasta Oral com Seringa Dosadora',
    subtitle: 'Base cremosa e palatável de alta aderência',
    targetSpecies: 'Cães, Gatos, Ferrets e Roedores',
    bestFor: 'Probióticos, vermífugos, protetores gástricos e analgésicos',
    benefits: [
      'Seringa com anel rosqueável para dosagem milimétrica exata',
      'Adere à língua e ao céu da boca, impedindo que o pet cuspa a dose',
      'Opções de sabores salgados (Bacon, Peixe) ou adocicados (Doce de Leite)'
    ],
    icon: 'syringe'
  },
  {
    id: 'xarope_suspensao',
    name: 'Xaropes & Suspensões Aromatizadas',
    subtitle: 'Soluções líquidas homogêneas sem álcool e sem açúcar',
    targetSpecies: 'Filhotes, cães pequenos, gatos e exóticos (aves/répteis)',
    bestFor: 'Antibióticos, anti-inflamatórios e xaropes para tosse',
    benefits: [
      'Acompanha seringa dosadora graduada por peso corporal',
      'Aroma e sabor envolventes que mascaram o amargor de princípios ativos',
      'Ideal para dosagens fracionadas impossíveis de partir em comprimidos'
    ],
    icon: 'flask'
  },
  {
    id: 'capsula',
    name: 'Mini-Cápsulas Gelatinosas Coloridas',
    subtitle: 'Tamanhos reduzidos (000, 0, 1 a 4) adequados ao porte',
    targetSpecies: 'Cães médios e grandes',
    bestFor: 'Associações de múltiplos princípios ativos em cápsula única',
    benefits: [
      'Revestimento gastrorresistente disponível para moléculas sensíveis',
      'Cápsulas coloridas identificadas para facilitar horários diferentes',
      'Laudos de pesagem individual e uniformidade de conteúdo'
    ],
    icon: 'pill'
  }
];

export const BLOG_POSTS: BlogPost[] = [
  {
    id: 'blog-1',
    title: 'Por que o Gel Transdérmico é uma revolução no tratamento de felinos?',
    summary: 'Dar comprimido para gato costuma ser traumático. Descubra como a manipulação na orelha garante a cura sem estresse.',
    author: 'Dra. Carolina Giordano',
    authorRole: 'Farmacêutica Responsável - Unidade Valinhos',
    date: '10 Outubro 2026',
    readTime: '3 min de leitura',
    tag: 'Medicina Felina',
    content: 'Quem tem gato sabe: forçar um comprimido amargo pode quebrar a relação de afeto e levar a falhas no tratamento. O gel transdérmico penetra na barreira cutânea da face interna da orelha e cai diretamente na circulação sanguínea...'
  },
  {
    id: 'blog-2',
    title: 'Biscoitos Palatáveis: A importância do sabor na adesão a tratamentos crônicos',
    summary: 'Doenças cardíacas e articulares exigem medicação diária por toda a vida do pet. Veja como o biscoito transforma sofrimento em festa.',
    author: 'Dra. Flávia Semeghini',
    authorRole: 'Farmacêutica Responsável - Unidade Americana',
    date: '04 Outubro 2026',
    readTime: '4 min de leitura',
    tag: 'Farmacotécnica Veterinária',
    content: 'Na Amor ao Bicho, nossos biscoitos são assados em temperatura controlada para preservar 100% da integridade da molécula terapêutica, utilizando proteínas hidrolisadas hipoalergênicas...'
  },
  {
    id: 'blog-3',
    title: 'Receita Digital Veterinária: Mais segurança e rapidez para tutores na RMC',
    summary: 'Como funciona a validação automática de receitas digitais em Americana e Valinhos e por que isso acelera o início da medicação.',
    author: 'Equipe Amor ao Bicho',
    authorRole: 'Garantia da Qualidade',
    date: '28 Setembro 2026',
    readTime: '2 min de leitura',
    tag: 'Inovação & Saúde',
    content: 'Agora os veterinários prescrevem direto pelo app ou plataformas parceiras e a receita entra na fila da Amor ao Bicho em segundos...'
  }
];
