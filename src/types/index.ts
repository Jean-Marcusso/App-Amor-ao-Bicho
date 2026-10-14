export type UserRole = 'tutor' | 'vet' | 'admin' | 'architecture';

export type PharmacyUnit = 'americana' | 'valinhos';

export interface UnitInfo {
  id: PharmacyUnit;
  name: string;
  city: string;
  address: string;
  phone: string;
  whatsapp: string;
  technicalResponsible: string;
  crf: string;
  openingHours: string;
}

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  cpf?: string;
  role: UserRole;
  avatarUrl?: string;
  address?: {
    street: string;
    number: string;
    complement?: string;
    neighborhood: string;
    city: string;
    state: string;
    cep: string;
  };
  // Dados do Médico-Veterinário
  crmv?: string;
  crmvState?: string;
  clinicName?: string;
  specialty?: string;
  // Dados do Farmacêutico
  crf?: string;
  pharmacyUnit?: PharmacyUnit;
}

export interface LoginCredentials {
  email: string;
  password?: string;
}

export interface RegisterData {
  name: string;
  email: string;
  password?: string;
  phone: string;
  cpf?: string;
  role: UserRole;
  city?: string;
  crmv?: string;
  crmvState?: string;
  clinicName?: string;
  unit?: PharmacyUnit;
}

export type PetSpecies = 'canino' | 'felino' | 'ave' | 'roedor' | 'equino' | 'exotico';

export interface Pet {
  id: string;
  name: string;
  species: PetSpecies;
  breed: string;
  ageYears: number;
  weightKg: number;
  allergies?: string;
  chronicCondition?: string;
  favoriteFlavor?: Flavor;
  photoUrl?: string;
  tutorName: string;
  tutorPhone: string;
}

export type DosageForm = 
  | 'biscoito_palatavel'
  | 'pasta_oral'
  | 'gel_transdermico'
  | 'xarope_suspensao'
  | 'capsula'
  | 'solucao_otologica'
  | 'pomada_topica'
  | 'colirio';

export type Flavor = 
  | 'carne'
  | 'frango'
  | 'bacon'
  | 'figado'
  | 'peixe_salmao'
  | 'doce_de_leite'
  | 'baunilha'
  | 'frutas_vermelhas'
  | 'tutti_frutti'
  | 'sem_sabor';

export type OrderStatus = 
  | 'analise_farmaceutica'
  | 'em_manipulacao'
  | 'controle_qualidade'
  | 'pronto_retirada'
  | 'saiu_para_entrega'
  | 'concluido'
  | 'cancelado';

export interface DoseSchedule {
  id: string;
  petId: string;
  petName: string;
  medicationName: string;
  dosage: string;
  form: DosageForm;
  time: string; // "08:00", "20:00"
  intervalHours: number; // 8, 12, 24
  startDate: string;
  totalDays: number;
  daysRemaining: number;
  totalDoses: number;
  dosesGiven: number;
  nextDoseTime: string;
  isChronic: boolean;
  takenToday: boolean;
  lastTakenAt?: string;
  lowStockAlertDays?: number; // Dias de antecedência para alertar que está acabando (padrão: 5 dias)
}

export interface InAppNotification {
  id: string;
  title: string;
  message: string;
  timestamp: string;
  type: 'dose_alarm' | 'low_stock' | 'order_update' | 'system';
  petName?: string;
  read: boolean;
}

export interface QuoteItem {
  id: string;
  description: string;
  activeSubstance: string;
  concentration: string;
  dosageForm: DosageForm;
  flavor?: Flavor;
  quantity: string;
  unitPrice: number;
}

export interface PrescriptionOrder {
  id: string;
  code: string; // Ex: AB-2026-891
  createdAt: string;
  tutorName: string;
  tutorPhone: string;
  petId: string;
  petName: string;
  petSpecies: PetSpecies;
  petWeightKg: number;
  unit: PharmacyUnit;
  status: OrderStatus;
  prescriptionImageUrl?: string;
  prescriptionExternalLink?: string;
  preferredForm: DosageForm;
  preferredFlavor?: Flavor;
  notes?: string;
  prescribingVetName?: string;
  crmv?: string;
  items: QuoteItem[];
  subtotal: number;
  shippingMethod: 'retirada_americana' | 'retirada_valinhos' | 'entrega_expressa_rmc' | 'sedex';
  shippingCost: number;
  total: number;
  paymentMethod?: 'pix' | 'cartao';
  paymentStatus: 'aguardando_analise' | 'orcamento_disponivel' | 'pago' | 'em_processo';
  pixCode?: string;
  pixQrUrl?: string;
  pharmacistSignature?: string;
  estimatedDeliveryDate?: string;
  whatsappLogs: WhatsAppLog[];
}

export interface WhatsAppLog {
  id: string;
  timestamp: string;
  recipient: string;
  message: string;
  status: 'sent' | 'delivered' | 'read';
}

export interface TherapeuticGuideItem {
  id: string;
  activeSubstance: string;
  category: string;
  speciesIndications: {
    species: 'canino' | 'felino' | 'ambos';
    doseRange: string; // "0.1 a 0.2 mg/kg"
    frequency: string; // "A cada 24 horas"
    recommendedForms: DosageForm[];
    recommendedFlavors: Flavor[];
    observations: string;
  }[];
  contraindications: string;
  phStability: string;
}

export interface BlogPost {
  id: string;
  title: string;
  summary: string;
  author: string;
  authorRole: string;
  date: string;
  readTime: string;
  tag: string;
  content: string;
}
