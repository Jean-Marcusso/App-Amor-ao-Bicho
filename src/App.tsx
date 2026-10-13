import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  PharmacyUnit, 
  Pet, 
  PrescriptionOrder, 
  DoseSchedule, 
  OrderStatus, 
  UserAccount, 
  RegisterData 
} from './types';
import { 
  INITIAL_PETS, 
  INITIAL_ORDERS, 
  INITIAL_DOSE_SCHEDULES, 
  INITIAL_USERS, 
  PHARMACY_UNITS 
} from './data/mockData';
import { Header } from './components/Header';
import { TutorDashboard } from './components/tutor/TutorDashboard';
import { VetModule } from './components/vet/VetModule';
import { AdminModule } from './components/admin/AdminModule';
import { ArchitectureAndDbView } from './components/architecture/ArchitectureAndDbView';
import { NewPrescriptionModal } from './components/tutor/NewPrescriptionModal';
import { PetFormModal } from './components/tutor/PetFormModal';
import { MedicineReminderModal } from './components/tutor/MedicineReminderModal';
import { OrderDetailsModal } from './components/tutor/OrderDetailsModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { CheckCircle2, Heart, MapPin } from 'lucide-react';
import { notificationService } from './services/notificationService';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('tutor');
  const [selectedUnit, setSelectedUnit] = useState<PharmacyUnit>('americana');

  // Usuário Autenticado (Inicia com Mariana Duarte pré-carregada para facilitar teste imediato)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('amor_ao_bicho_user');
      return stored ? JSON.parse(stored) : INITIAL_USERS[0];
    } catch {
      return INITIAL_USERS[0];
    }
  });

  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [orders, setOrders] = useState<PrescriptionOrder[]>(INITIAL_ORDERS);
  const [doseSchedules, setDoseSchedules] = useState<DoseSchedule[]>(INITIAL_DOSE_SCHEDULES);

  // Modals de Operação
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<PrescriptionOrder | null>(null);

  // Modals de Autenticação & Perfil
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');
  const [authForcedMessage, setAuthForcedMessage] = useState<string | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  // Feedback Toast
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage(null);
    }, 4000);
  };

  // Salva no LocalStorage sempre que o usuário muda
  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('amor_ao_bicho_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('amor_ao_bicho_user');
    }
  }, [currentUser]);

  // Auth Handlers
  const handleLogin = (user: UserAccount) => {
    setCurrentUser(user);
    if (user.role === 'vet') {
      setCurrentRole('vet');
    } else if (user.role === 'admin') {
      setCurrentRole('admin');
      if (user.pharmacyUnit) setSelectedUnit(user.pharmacyUnit);
    } else {
      setCurrentRole('tutor');
    }
    showToast(`Bem-vindo(a), ${user.name}! Sessão iniciada com sucesso.`);
  };

  const handleRegister = (data: RegisterData) => {
    const newUser: UserAccount = {
      id: `user-${Date.now()}`,
      name: data.name,
      email: data.email,
      phone: data.phone,
      cpf: data.cpf,
      role: data.role,
      crmv: data.crmv,
      crmvState: data.crmvState,
      clinicName: data.clinicName,
      pharmacyUnit: data.unit,
      address: {
        street: 'Rua Principal',
        number: '100',
        neighborhood: 'Centro',
        city: data.city || 'Americana',
        state: 'SP',
        cep: '13465-000'
      }
    };

    setCurrentUser(newUser);
    if (newUser.role === 'vet') {
      setCurrentRole('vet');
    } else if (newUser.role === 'admin') {
      setCurrentRole('admin');
      if (newUser.pharmacyUnit) setSelectedUnit(newUser.pharmacyUnit);
    } else {
      setCurrentRole('tutor');
    }
    showToast(`Conta criada com sucesso! Bem-vindo(a) à Amor ao Bicho, ${newUser.name}.`);
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setIsProfileModalOpen(false);
    showToast('Sessão encerrada com sucesso. Você pode navegar ou entrar novamente.');
  };

  const handleUpdateUser = (updatedUser: UserAccount) => {
    setCurrentUser(updatedUser);
    showToast('Dados cadastrais atualizados com sucesso!');
  };

  const openAuthWithReason = (mode: 'login' | 'register', reason?: string) => {
    setAuthModalMode(mode);
    setAuthForcedMessage(reason);
    setIsAuthModalOpen(true);
  };

  // Prescription Flow with Auth Check
  const handleTriggerNewPrescription = () => {
    if (!currentUser) {
      openAuthWithReason('login', 'Para enviar uma receita e solicitar orçamento, faça login ou crie sua conta.');
      return;
    }
    setIsPrescriptionModalOpen(true);
  };

  const handleAddNewOrder = (newOrder: PrescriptionOrder) => {
    setOrders(prev => [newOrder, ...prev]);
    showToast(`Receita ${newOrder.code} enviada com sucesso para a Amor ao Bicho ${PHARMACY_UNITS[newOrder.unit].name}!`);
  };

  const handleSavePet = (newPet: Pet) => {
    setPets(prev => {
      const exists = prev.some(p => p.id === newPet.id);
      if (exists) {
        return prev.map(p => p.id === newPet.id ? newPet : p);
      }
      return [...prev, newPet];
    });
    showToast(`Perfil do pet ${newPet.name} salvo com sucesso!`);
  };

  const handleAddSchedule = (schedule: DoseSchedule) => {
    setDoseSchedules(prev => [schedule, ...prev]);
    showToast(`Alarme criado para ${schedule.petName}: ${schedule.medicationName}`);
  };

  // Monitoramento em segundo plano para lembretes automáticos no navegador
  useEffect(() => {
    const checkScheduledDoses = () => {
      const now = new Date();
      const currentHoursMinutes = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
      
      doseSchedules.forEach(schedule => {
        if (!schedule.takenToday && schedule.time === currentHoursMinutes) {
          notificationService.sendNotification(`⏰ Hora do Remédio: ${schedule.petName}!`, {
            body: `Horário previsto: ${schedule.time}. Dose de ${schedule.medicationName}. Favor medicar seu pet!`
          });
        }
      });
    };

    const interval = setInterval(checkScheduledDoses, 30000);
    return () => clearInterval(interval);
  }, [doseSchedules]);

  const handleToggleDose = (scheduleId: string) => {
    setDoseSchedules(prev => prev.map(s => {
      if (s.id === scheduleId) {
        const nextState = !s.takenToday;
        if (nextState) {
          notificationService.playAlertSound();
          showToast(`Parabéns! Dose de ${s.petName} registrada com sucesso. 🐾`);
        }
        return {
          ...s,
          takenToday: nextState,
          dosesGiven: nextState ? s.dosesGiven + 1 : Math.max(0, s.dosesGiven - 1)
        };
      }
      return s;
    }));
  };

  const handleQuickRepurchase = (schedule: DoseSchedule) => {
    const pet = pets.find(p => p.id === schedule.petId);
    const newCode = `AB-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrder: PrescriptionOrder = {
      id: `ord-repurchase-${Date.now()}`,
      code: newCode,
      createdAt: 'Agora mesmo',
      tutorName: pet?.tutorName || currentUser?.name || 'Mariana Duarte',
      tutorPhone: pet?.tutorPhone || currentUser?.phone || '(19) 99123-4567',
      petId: schedule.petId,
      petName: schedule.petName,
      petSpecies: pet?.species || 'canino',
      petWeightKg: pet?.weightKg || 10,
      unit: selectedUnit,
      status: 'em_manipulacao',
      preferredForm: schedule.form,
      items: [
        {
          id: `item-rep-${Date.now()}`,
          description: `Renovação de Tratamento Contínuo: ${schedule.medicationName}`,
          activeSubstance: 'Princípio Ativo Contínuo',
          concentration: schedule.dosage,
          dosageForm: schedule.form,
          quantity: `${schedule.totalDays} doses`,
          unitPrice: 118.00
        }
      ],
      subtotal: 118.00,
      shippingMethod: selectedUnit === 'americana' ? 'retirada_americana' : 'retirada_valinhos',
      shippingCost: 0,
      total: 118.00,
      paymentMethod: 'pix',
      paymentStatus: 'pago',
      estimatedDeliveryDate: 'Amanhã às 14h00',
      whatsappLogs: [
        {
          id: `wlog-${Date.now()}`,
          timestamp: 'Agora mesmo',
          recipient: pet?.tutorPhone || '(19) 99123-4567',
          message: `Olá! Seu pedido de renovação do Clube de Recompra para o(a) ${schedule.petName} (${newCode}) já entrou em manipulação prioritária na Amor ao Bicho ${PHARMACY_UNITS[selectedUnit].name}.`,
          status: 'sent'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
    showToast(`Renovação expressa criada para ${schedule.petName}! O pedido ${newCode} já foi encaminhado ao laboratório.`);
  };

  const handleSimulatePayPix = (orderId: string) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          paymentStatus: 'pago',
          status: 'em_manipulacao',
          whatsappLogs: [
            ...o.whatsappLogs,
            {
              id: `wlog-${Date.now()}`,
              timestamp: 'Agora mesmo',
              recipient: o.tutorPhone,
              message: `Pagamento PIX do pedido ${o.code} recebido com sucesso! O laboratório Amor ao Bicho iniciou a manipulação da fórmula.`,
              status: 'sent'
            }
          ]
        };
      }
      return o;
    }));
    setSelectedOrderForTracking(prev => prev?.id === orderId ? { ...prev, paymentStatus: 'pago', status: 'em_manipulacao' } : prev);
    showToast('Pagamento PIX confirmado instantaneamente! A fórmula entrou na bancada de manipulação.');
  };

  const handleUpdateOrderStatus = (orderId: string, newStatus: OrderStatus) => {
    const statusLabels: Record<OrderStatus, string> = {
      analise_farmaceutica: 'Em Análise Farmacêutica',
      em_manipulacao: 'No Laboratório de Manipulação',
      controle_qualidade: 'Em Controle de Qualidade & Emissão de Laudo',
      pronto_retirada: 'Pronto para Retirada no Balcão',
      saiu_para_entrega: 'Saiu para Entrega via Motoboy',
      concluido: 'Entregue e Concluído',
      cancelado: 'Cancelado'
    };

    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          status: newStatus,
          whatsappLogs: [
            ...o.whatsappLogs,
            {
              id: `wlog-${Date.now()}`,
              timestamp: 'Agora mesmo',
              recipient: o.tutorPhone,
              message: `Atualização Amor ao Bicho: O pedido ${o.code} do(a) ${o.petName} avançou para: "${statusLabels[newStatus]}".`,
              status: 'sent'
            }
          ]
        };
      }
      return o;
    }));
    showToast(`Status atualizado para: ${statusLabels[newStatus]}`);
  };

  const handleApproveQuotePrice = (orderId: string, newPrice: number) => {
    setOrders(prev => prev.map(o => {
      if (o.id === orderId) {
        return {
          ...o,
          subtotal: newPrice,
          total: newPrice + o.shippingCost,
          paymentStatus: 'orcamento_disponivel',
          status: 'analise_farmaceutica',
          whatsappLogs: [
            ...o.whatsappLogs,
            {
              id: `wlog-${Date.now()}`,
              timestamp: 'Agora mesmo',
              recipient: o.tutorPhone,
              message: `Seu orçamento para a fórmula do(a) ${o.petName} está pronto na Amor ao Bicho (R$ ${(newPrice + o.shippingCost).toFixed(2)}). Acesse o app para pagar via PIX em 1 clique!`,
              status: 'sent'
            }
          ]
        };
      }
      return o;
    }));
    showToast(`Orçamento de R$ ${newPrice.toFixed(2)} disponibilizado ao tutor com sucesso!`);
  };

  const handleSendPrescriptionFromVet = (prescriptionSummary: any) => {
    const newOrder: PrescriptionOrder = {
      id: `ord-vet-${Date.now()}`,
      code: prescriptionSummary.code,
      createdAt: 'Agora mesmo',
      tutorName: prescriptionSummary.tutorName,
      tutorPhone: '(19) 99123-4567',
      petId: 'pet-1',
      petName: prescriptionSummary.petName,
      petSpecies: 'canino',
      petWeightKg: 32.5,
      unit: prescriptionSummary.unit,
      status: 'analise_farmaceutica',
      preferredForm: 'biscoito_palatavel',
      prescribingVetName: prescriptionSummary.prescriber,
      crmv: 'CRMV-SP 38.920',
      items: [
        {
          id: `item-v-${Date.now()}`,
          description: prescriptionSummary.medication,
          activeSubstance: 'Princípio Ativo Prescrito',
          concentration: 'Dose veterinária',
          dosageForm: 'biscoito_palatavel',
          quantity: 'Tratamento conforme receita',
          unitPrice: 110.00
        }
      ],
      subtotal: 110.00,
      shippingMethod: prescriptionSummary.unit === 'americana' ? 'retirada_americana' : 'retirada_valinhos',
      shippingCost: 0,
      total: 110.00,
      paymentStatus: 'orcamento_disponivel',
      estimatedDeliveryDate: 'Em até 24h úteis',
      whatsappLogs: [
        {
          id: `wlog-${Date.now()}`,
          timestamp: 'Agora mesmo',
          recipient: '(19) 99123-4567',
          message: `Olá! Seu médico-veterinário (${prescriptionSummary.prescriber}) enviou a receita digital do(a) ${prescriptionSummary.petName} diretamente para a Amor ao Bicho ${PHARMACY_UNITS[prescriptionSummary.unit as PharmacyUnit].name}. O orçamento já está disponível para aprovação!`,
          status: 'sent'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);
  };

  return (
    <div className="min-h-screen bg-[#f8faf9] flex flex-col justify-between font-sans">
      {/* Toast Feedback */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-4 py-3 rounded-2xl shadow-2xl border border-slate-700 flex items-center gap-3 animate-bounce">
          <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
          <span className="text-xs font-semibold">{toastMessage}</span>
        </div>
      )}

      {/* Main Header with User Auth Status */}
      <Header
        currentRole={currentRole}
        onRoleChange={setCurrentRole}
        selectedUnit={selectedUnit}
        onUnitChange={setSelectedUnit}
        onOpenNewPrescription={handleTriggerNewPrescription}
        currentUser={currentUser}
        onOpenAuthModal={(m) => openAuthWithReason(m || 'login')}
        onOpenProfileModal={() => setIsProfileModalOpen(true)}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-6 flex-1 w-full">
        {currentRole === 'tutor' && (
          <TutorDashboard
            pets={pets}
            orders={orders}
            doseSchedules={doseSchedules}
            selectedUnit={selectedUnit}
            onOpenNewPrescription={handleTriggerNewPrescription}
            onOpenNewPet={() => {
              if (!currentUser) {
                openAuthWithReason('login', 'Faça login para cadastrar e gerenciar seus pets.');
                return;
              }
              setIsPetModalOpen(true);
            }}
            onOpenNewReminder={() => {
              if (!currentUser) {
                openAuthWithReason('login', 'Faça login para programar lembretes da Hora do Remédio.');
                return;
              }
              setIsReminderModalOpen(true);
            }}
            onSelectOrder={(order) => setSelectedOrderForTracking(order)}
            onToggleDoseAdministered={handleToggleDose}
            onQuickRepurchase={handleQuickRepurchase}
          />
        )}

        {currentRole === 'vet' && (
          <VetModule
            selectedUnit={selectedUnit}
            onSendPrescriptionToPharmacy={handleSendPrescriptionFromVet}
            onBackToHome={() => setCurrentRole('tutor')}
          />
        )}

        {currentRole === 'admin' && (
          <AdminModule
            orders={orders}
            selectedUnit={selectedUnit}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onApproveQuotePrice={handleApproveQuotePrice}
            onBackToHome={() => setCurrentRole('tutor')}
          />
        )}

        {currentRole === 'architecture' && (
          <ArchitectureAndDbView onBackToHome={() => setCurrentRole('tutor')} />
        )}
      </main>

      {/* Official Footer */}
      <footer className="bg-[#083b2c] text-emerald-100 border-t border-emerald-900/60 mt-12 py-10 px-4 sm:px-6">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          {/* Col 1 */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
                <Heart className="w-4 h-4 fill-rose-300" />
              </div>
              <span className="font-bold text-base text-white">Amor ao Bicho</span>
            </div>
            <p className="text-emerald-200/80 leading-relaxed">
              Farmácia de manipulação veterinária especializada em formas farmacêuticas palatáveis para cães, gatos e animais silvestres. Carinho e precisão científica em cada dose.
            </p>
            <p className="text-emerald-300/60 text-[11px]">
              Referência técnica: <a href="https://amoraobicho.com.br" target="_blank" rel="noopener noreferrer" className="underline hover:text-white">amoraobicho.com.br</a>
            </p>
          </div>

          {/* Col 2 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Unidade Americana - SP
            </h4>
            <p className="text-emerald-200/90">{PHARMACY_UNITS.americana.address}</p>
            <p className="text-emerald-200/90 font-medium">Fone: {PHARMACY_UNITS.americana.phone}</p>
            <p className="text-emerald-200/90 font-medium">WhatsApp: {PHARMACY_UNITS.americana.whatsapp}</p>
            <p className="text-[11px] text-emerald-300/70 pt-1">
              Farmacêutica Responsável: <strong>{PHARMACY_UNITS.americana.technicalResponsible}</strong> ({PHARMACY_UNITS.americana.crf})
            </p>
          </div>

          {/* Col 3 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-emerald-400" />
              Unidade Valinhos - SP
            </h4>
            <p className="text-emerald-200/90">{PHARMACY_UNITS.valinhos.address}</p>
            <p className="text-emerald-200/90 font-medium">Fone: {PHARMACY_UNITS.valinhos.phone}</p>
            <p className="text-emerald-200/90 font-medium">WhatsApp: {PHARMACY_UNITS.valinhos.whatsapp}</p>
            <p className="text-[11px] text-emerald-300/70 pt-1">
              Farmacêutica Responsável: <strong>{PHARMACY_UNITS.valinhos.technicalResponsible}</strong> ({PHARMACY_UNITS.valinhos.crf})
            </p>
          </div>

          {/* Col 4 */}
          <div className="space-y-2">
            <h4 className="font-bold text-sm text-white">Horário de Funcionamento</h4>
            <p className="text-emerald-200/80">Segunda a Sexta: 08h às 18h</p>
            <p className="text-emerald-200/80">Sábados: 08h às 12h</p>
            <div className="pt-2">
              <span className="text-[11px] font-semibold text-emerald-300 bg-emerald-900/80 px-2.5 py-1 rounded-md border border-emerald-700/50">
                Atendimento RMC com Entrega Expressa
              </span>
            </div>
            <div className="pt-2 flex items-center justify-between flex-wrap gap-2 text-[10px] text-emerald-400/60">
              <span>© {new Date().getFullYear()} Amor ao Bicho Farmácia Veterinária.</span>
              <div className="flex items-center gap-2.5">
                <button
                  onClick={() => setCurrentRole('admin')}
                  className="text-emerald-400/40 hover:text-emerald-200 underline"
                >
                  Acesso Farmácia (Lab)
                </button>
                <span>•</span>
                <button
                  onClick={() => setCurrentRole('architecture')}
                  className="text-emerald-400/40 hover:text-emerald-200 underline"
                >
                  Docs & DB
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Auth Modal (Login / Cadastro / Recuperação de Senha) */}
      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => {
          setIsAuthModalOpen(false);
          setAuthForcedMessage(undefined);
        }}
        onLogin={handleLogin}
        onRegister={handleRegister}
        initialMode={authModalMode}
        forcedMessage={authForcedMessage}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
        />
      )}

      {/* Operating Modals */}
      <NewPrescriptionModal
        isOpen={isPrescriptionModalOpen}
        onClose={() => setIsPrescriptionModalOpen(false)}
        pets={pets}
        selectedUnit={selectedUnit}
        onSubmit={handleAddNewOrder}
        onAddNewPetClick={() => {
          setIsPrescriptionModalOpen(false);
          setIsPetModalOpen(true);
        }}
      />

      <PetFormModal
        isOpen={isPetModalOpen}
        onClose={() => setIsPetModalOpen(false)}
        onSave={handleSavePet}
      />

      <MedicineReminderModal
        isOpen={isReminderModalOpen}
        onClose={() => setIsReminderModalOpen(false)}
        pets={pets}
        onAddSchedule={handleAddSchedule}
      />

      <OrderDetailsModal
        isOpen={!!selectedOrderForTracking}
        onClose={() => setSelectedOrderForTracking(null)}
        order={selectedOrderForTracking}
        onSimulatePayPix={handleSimulatePayPix}
      />
    </div>
  );
}
