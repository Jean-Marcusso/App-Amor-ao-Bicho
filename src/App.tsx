import React, { useState, useEffect } from 'react';
import { 
  UserRole, 
  PharmacyUnit, 
  Pet, 
  PrescriptionOrder, 
  DoseSchedule, 
  OrderStatus, 
  UserAccount, 
  RegisterData,
  InAppNotification
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
import { AlarmsModal } from './components/tutor/AlarmsModal';
import { PetsListModal } from './components/tutor/PetsListModal';
import { OrderDetailsModal } from './components/tutor/OrderDetailsModal';
import { AuthModal } from './components/auth/AuthModal';
import { UserProfileModal } from './components/auth/UserProfileModal';
import { AppMenuModal } from './components/menu/AppMenuModal';
import { CheckCircle2, Heart, MapPin, Clock, Plus, MessageSquare, Building2, User, Menu } from 'lucide-react';
import { notificationService } from './services/notificationService';
import { subscribeToAuthChanges, logoutFirebase } from './services/firebase';
import { 
  saveUserProfileToFirestore,
  subscribeUserPets,
  savePetToFirestore,
  deletePetFromFirestore,
  subscribeUserSchedules,
  saveScheduleToFirestore,
  updateScheduleInFirestore,
  subscribeOrders,
  saveOrderToFirestore,
  updateOrderStatusInFirestore
} from './services/firestoreService';

export default function App() {
  const [currentRole, setCurrentRole] = useState<UserRole>('tutor');
  const [selectedUnit, setSelectedUnit] = useState<PharmacyUnit>('americana');

  // Usuário Autenticado (Inicia com usuário salvo se houver, ou nulo para navegar como Visitante)
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(() => {
    try {
      const stored = localStorage.getItem('amor_ao_bicho_user');
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const [pets, setPets] = useState<Pet[]>(INITIAL_PETS);
  const [orders, setOrders] = useState<PrescriptionOrder[]>(INITIAL_ORDERS);
  const [doseSchedules, setDoseSchedules] = useState<DoseSchedule[]>(INITIAL_DOSE_SCHEDULES);
  const [selectedPetForReminder, setSelectedPetForReminder] = useState<string | undefined>(undefined);

  // Central de Notificações Recebidas pelo Tutor
  const [notifications, setNotifications] = useState<InAppNotification[]>([
    {
      id: 'notif-1',
      title: '⏰ Hora do Remédio: Thor',
      message: 'Horário de hoje: 08:00. Dose de Condroitina + Glicosamina + MSM (Biscoito de Carne). Favor medicar seu pet!',
      timestamp: 'Hoje às 08:00',
      type: 'dose_alarm',
      petName: 'Thor',
      read: false
    },
    {
      id: 'notif-2',
      title: '⚠️ Remédio Acabando: Thor',
      message: 'O tratamento contínuo do Thor está a 4 dias do término (restam 4 doses). Repita o pedido para não interromper a terapia!',
      timestamp: 'Hoje às 07:30',
      type: 'low_stock',
      petName: 'Thor',
      read: false
    },
    {
      id: 'notif-3',
      title: '📦 Pedido AB-2026-891 em Manipulação',
      message: 'A fórmula prescrita entrou na bancada do laboratório Amor ao Bicho Americana.',
      timestamp: 'Hoje às 09:10',
      type: 'order_update',
      petName: 'Thor',
      read: true
    }
  ]);

  const handleDismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Modals de Operação
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false);
  const [isPetModalOpen, setIsPetModalOpen] = useState(false);
  const [isPetsListModalOpen, setIsPetsListModalOpen] = useState(false);
  const [isReminderModalOpen, setIsReminderModalOpen] = useState(false);
  const [isAlarmsListModalOpen, setIsAlarmsListModalOpen] = useState(false);
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState<PrescriptionOrder | null>(null);

  // Modals de Autenticação, Menu & Perfil
  const [isMenuModalOpen, setIsMenuModalOpen] = useState(false);
  const [menuInitialTab, setMenuInitialTab] = useState<'auth' | 'profile' | 'staff'>('auth');
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('register');
  const [authForcedMessage, setAuthForcedMessage] = useState<string | undefined>(undefined);
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);

  const handleOpenMenu = () => {
    if (!currentUser) {
      openAuthWithReason('register', 'Para acessar seus dados e perfil, crie seu cadastro ou acesse sua conta.');
      return;
    }
    setIsMenuModalOpen(true);
  };

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

  // Sincroniza sessão ativa do Firebase Auth
  useEffect(() => {
    const unsubscribe = subscribeToAuthChanges((user) => {
      if (user) {
        setCurrentUser(user);
        if (user.role === 'admin') {
          setCurrentRole('admin');
          if (user.pharmacyUnit) setSelectedUnit(user.pharmacyUnit);
        } else if (user.role === 'vet') {
          setCurrentRole('vet');
        } else {
          setCurrentRole('tutor');
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Sincronização em Tempo Real com o Cloud Firestore (Pets, Alarmes e Pedidos)
  useEffect(() => {
    if (!currentUser?.id) return;

    // Salva perfil atualizado no Firestore
    saveUserProfileToFirestore(currentUser);

    // Escuta Pets do usuário logado
    const unsubPets = subscribeUserPets(currentUser.id, (firestorePets) => {
      if (firestorePets && firestorePets.length > 0) {
        setPets(firestorePets);
      }
    });

    // Escuta Horários e Alarmes do usuário logado
    const unsubSchedules = subscribeUserSchedules(currentUser.id, (firestoreSchedules) => {
      if (firestoreSchedules && firestoreSchedules.length > 0) {
        setDoseSchedules(firestoreSchedules);
      }
    });

    // Escuta Pedidos de Receita do usuário logado / farmácia
    const unsubOrders = subscribeOrders(currentUser.id, currentRole, (firestoreOrders) => {
      if (firestoreOrders && firestoreOrders.length > 0) {
        setOrders(firestoreOrders);
      }
    });

    return () => {
      unsubPets();
      unsubSchedules();
      unsubOrders();
    };
  }, [currentUser?.id, currentRole]);

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

  // Cadastro Rápido do Tutor (Nome, WhatsApp, CPF, Cidade, E-mail e Senha)
  const handleQuickTutorRegister = (
    email: string, 
    password?: string,
    extra?: { name?: string; phone?: string; cpf?: string; city?: string }
  ) => {
    const cleanEmail = email.trim().toLowerCase();
    const formattedName = extra?.name?.trim() 
      ? extra.name.trim() 
      : (() => {
          const namePart = cleanEmail.split('@')[0];
          return namePart.charAt(0).toUpperCase() + namePart.slice(1);
        })();

    const userCity = extra?.city || (selectedUnit === 'americana' ? 'Americana' : 'Valinhos');

    const newUser: UserAccount = {
      id: `tutor-${Date.now()}`,
      name: formattedName,
      email: cleanEmail,
      role: 'tutor',
      phone: extra?.phone?.trim() || '(19) 99000-0000',
      cpf: extra?.cpf?.trim() || undefined,
      pharmacyUnit: userCity.toLowerCase() === 'valinhos' ? 'valinhos' : 'americana',
      avatarUrl: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=200&q=80',
      address: {
        street: 'Rua Principal',
        number: '100',
        neighborhood: 'Centro',
        city: userCity,
        state: 'SP',
        cep: userCity === 'Valinhos' ? '13270-000' : '13465-000'
      }
    };

    setCurrentUser(newUser);
    setCurrentRole('tutor');
    showToast(`Bem-vindo(a) à Amor ao Bicho, ${newUser.name}! Sua Área do Tutor foi liberada.`);
  };

  // Login Rápido (E-mail e Senha)
  const handleQuickTutorLogin = (email: string, password?: string) => {
    const cleanEmail = email.trim().toLowerCase();

    // Se for email de funcionária admin:
    const adminUser = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'admin');
    if (adminUser) {
      setCurrentUser(adminUser);
      setCurrentRole('admin');
      if (adminUser.pharmacyUnit) setSelectedUnit(adminUser.pharmacyUnit);
      showToast(`Acesso Farmácia autorizado: Bem-vinda, ${adminUser.name}!`);
      return;
    }

    // Se for usuário existente
    const existing = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      setCurrentUser(existing);
      setCurrentRole(existing.role);
      showToast(`Bem-vindo(a) de volta, ${existing.name}!`);
    } else {
      handleQuickTutorRegister(email, password);
    }
  };

  // Login Direto de Funcionárias da Farmácia (Admin)
  const handleStaffLogin = (unit: PharmacyUnit = 'americana') => {
    const staff = INITIAL_USERS.find(u => u.role === 'admin' && u.pharmacyUnit === unit) || INITIAL_USERS[2];
    setCurrentUser(staff);
    setSelectedUnit(unit);
    setCurrentRole('admin');
    setIsMenuModalOpen(false);
    setIsProfileModalOpen(false);
    showToast(`Acesso Farmácia concedido para ${staff.name} (${staff.crf})!`);
  };

  const handleLogout = async () => {
    try {
      await logoutFirebase();
    } catch (e) {
      console.warn('Erro ao deslogar do Firebase:', e);
    }
    setCurrentUser(null);
    setCurrentRole('tutor');
    setIsProfileModalOpen(false);
    setIsMenuModalOpen(false);
    localStorage.removeItem('amor_ao_bicho_user');
    showToast('Você saiu da sua conta. Agora está navegando como visitante.');
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
    if (currentUser?.id) {
      saveOrderToFirestore(newOrder, currentUser.id);
    }
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
    if (currentUser?.id) {
      savePetToFirestore(newPet, currentUser.id);
    }
    showToast(`Perfil do pet ${newPet.name} salvo com sucesso!`);
  };

  const handleDeletePet = (petId: string) => {
    const petToRemove = pets.find(p => p.id === petId);
    setPets(prev => prev.filter(p => p.id !== petId));
    // Remove alarmes e horários associados a este pet
    setDoseSchedules(prev => prev.filter(s => s.petId !== petId));
    if (currentUser?.id) {
      deletePetFromFirestore(petId);
    }
    showToast(`Pet ${petToRemove?.name || ''} foi removido com sucesso.`);
  };

  const handleAddSchedule = (schedule: DoseSchedule) => {
    setDoseSchedules(prev => [schedule, ...prev]);
    if (currentUser?.id) {
      saveScheduleToFirestore(schedule, currentUser.id);
    }
    setNotifications(prev => [
      {
        id: `notif-sched-${Date.now()}`,
        title: `⏰ Alarme Criado: ${schedule.petName}`,
        message: `Lembrete programado para ${schedule.medicationName} às ${schedule.time}. Alertas sonoros ativos.`,
        timestamp: 'Agora mesmo',
        type: 'dose_alarm',
        petName: schedule.petName,
        read: false
      },
      ...prev
    ]);
    showToast(`Alarme criado para ${schedule.petName}: ${schedule.medicationName}`);
  };

  // Monitoramento de lembretes de remédio
  // Só executa quando o tutor está conectado E tem alarmes/remédios cadastrados para seus pets
  useEffect(() => {
    // Se o usuário não está conectado (visitante na tela inicial) ou não é tutor, NUNCA tocar som nem alarme
    if (!currentUser || currentRole !== 'tutor') {
      notificationService.stopPersistentChime();
      return;
    }

    // Guarda a última vez que cada remédio apitou (em timestamp ms)
    const lastNotifiedMap = new Map<string, number>();

    const checkScheduledDoses = () => {
      if (!currentUser || currentRole !== 'tutor') {
        notificationService.stopPersistentChime();
        return;
      }

      // Filtra apenas pets cadastrados do tutor
      const userPetIds = new Set(pets.map(p => p.id));
      const pendingSchedules = doseSchedules.filter(s => userPetIds.has(s.petId) && !s.takenToday);

      if (pendingSchedules.length === 0) {
        notificationService.stopPersistentChime();
        return;
      }

      const now = new Date();
      const currentMinutesFromMidnight = now.getHours() * 60 + now.getMinutes();

      let hasPendingDueDoses = false;

      pendingSchedules.forEach(schedule => {
        const [schedH, schedM] = schedule.time.split(':').map(Number);
        const schedMinutes = schedH * 60 + schedM;

        // Se já chegou no horário programado hoje
        if (currentMinutesFromMidnight >= schedMinutes) {
          hasPendingDueDoses = true;
          const lastNotified = lastNotifiedMap.get(schedule.id) || 0;
          const nowMs = Date.now();

          // Dispara a cada 2 minutos enquanto NÃO for marcado como administrado
          if (nowMs - lastNotified >= 2 * 60 * 1000) {
            lastNotifiedMap.set(schedule.id, nowMs);

            const minutesDelayed = currentMinutesFromMidnight - schedMinutes;
            const delayText = minutesDelayed > 0 ? ` (Atrasado há ${minutesDelayed} min)` : '';

            notificationService.sendNotification(`🚨 AVISO URGENTE: Medicar ${schedule.petName}!`, {
              body: `Remédio: ${schedule.medicationName} (${schedule.dosage}). Horário: ${schedule.time}${delayText}. Toque para abrir o app e marcar que foi dado!`,
              tag: `dose-pending-${schedule.id}`, // Agrupa e atualiza a notificação no celular
              renotify: true // Faz vibrar e tocar no celular novamente
            });

            setNotifications(prev => [
              {
                id: `notif-auto-${Date.now()}-${schedule.id}`,
                title: `🚨 Alerta Contínuo: Medicar ${schedule.petName}!`,
                message: `A dose de ${schedule.medicationName} das ${schedule.time} ainda NÃO foi confirmada.${delayText} Favor medicar seu pet agora.`,
                timestamp: `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`,
                type: 'dose_alarm',
                petName: schedule.petName,
                read: false
              },
              ...prev.slice(0, 25)
            ]);
          }
        }
      });

      if (!hasPendingDueDoses) {
        notificationService.stopPersistentChime();
      }
    };

    // Checa a cada 15 segundos
    checkScheduledDoses();
    const interval = setInterval(checkScheduledDoses, 15000);
    return () => {
      clearInterval(interval);
      notificationService.stopPersistentChime();
    };
  }, [doseSchedules, currentUser, currentRole, pets]);

  const handleToggleDose = (scheduleId: string) => {
    setDoseSchedules(prev => prev.map(s => {
      if (s.id === scheduleId) {
        const nextState = !s.takenToday;
        if (nextState) {
          notificationService.playAlertSound();
          notificationService.stopPersistentChime();
          showToast(`Parabéns! Dose de ${s.petName} registrada com sucesso. Alerta pausado! 🐾`);
        }
        const updated = {
          ...s,
          takenToday: nextState,
          dosesGiven: nextState ? s.dosesGiven + 1 : Math.max(0, s.dosesGiven - 1)
        };
        if (currentUser?.id) {
          updateScheduleInFirestore(scheduleId, {
            takenToday: updated.takenToday,
            dosesGiven: updated.dosesGiven
          });
        }
        return updated;
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
    if (currentUser?.id) {
      saveOrderToFirestore(newOrder, currentUser.id);
    }
    setNotifications(prev => [
      {
        id: `notif-rep-${Date.now()}`,
        title: `⚠️ Pedido de Renovação: ${schedule.petName}`,
        message: `Renovação expressa da fórmula de ${schedule.medicationName} (${newCode}) enviada ao laboratório Amor ao Bicho.`,
        timestamp: 'Agora mesmo',
        type: 'order_update',
        petName: schedule.petName,
        read: false
      },
      ...prev
    ]);
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

    if (currentUser?.id) {
      updateOrderStatusInFirestore(orderId, newStatus);
    }

    setNotifications(prev => [
      {
        id: `notif-st-${Date.now()}`,
        title: `📦 Status Atualizado: Pedido #${orderId.slice(-4).toUpperCase()}`,
        message: `Seu pedido avançou para a etapa: "${statusLabels[newStatus]}".`,
        timestamp: 'Agora mesmo',
        type: 'order_update',
        read: false
      },
      ...prev
    ]);
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
        onOpenMenu={handleOpenMenu}
      />

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6 flex-1 w-full">
        {currentRole === 'tutor' && (
          <TutorDashboard
            pets={pets}
            orders={orders}
            doseSchedules={doseSchedules}
            selectedUnit={selectedUnit}
            notifications={notifications}
            currentUser={currentUser}
            onOpenMenu={handleOpenMenu}
            onOpenNewPrescription={handleTriggerNewPrescription}
            onOpenNewPet={() => {
              if (!currentUser) {
                openAuthWithReason('register', 'Para cadastrar seu pet, crie seu cadastro ou acesse sua conta.');
                return;
              }
              setIsPetModalOpen(true);
            }}
            onOpenNewReminder={(petId) => {
              if (!currentUser) {
                openAuthWithReason('register', 'Para programar a hora do remédio e alarmes, crie seu cadastro ou acesse sua conta.');
                return;
              }
              setSelectedPetForReminder(petId);
              setIsReminderModalOpen(true);
            }}
            onSelectOrder={(order) => setSelectedOrderForTracking(order)}
            onToggleDoseAdministered={handleToggleDose}
            onQuickRepurchase={handleQuickRepurchase}
            onDismissNotification={handleDismissNotification}
            onDeletePet={handleDeletePet}
          />
        )}

        {currentRole === 'admin' && (
          <AdminModule
            orders={orders}
            selectedUnit={selectedUnit}
            doseSchedules={doseSchedules}
            pets={pets}
            onUpdateOrderStatus={handleUpdateOrderStatus}
            onApproveQuotePrice={handleApproveQuotePrice}
            onLogout={handleLogout}
          />
        )}

        {currentRole === 'vet' && (
          <VetModule
            selectedUnit={selectedUnit}
            onSendPrescriptionToPharmacy={handleSendPrescriptionFromVet}
            onBackToHome={() => setCurrentRole('tutor')}
          />
        )}

        {currentRole === 'architecture' && (
          <ArchitectureAndDbView onBackToHome={() => setCurrentRole('tutor')} />
        )}
      </main>

      {/* Official Footer */}
      <footer className="bg-[#083b2c] text-emerald-100 border-t border-emerald-900/60 mt-12 py-10 pb-28 md:pb-10 px-4 sm:px-6">
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
                  type="button"
                  onClick={() => handleStaffLogin(selectedUnit)}
                  className="text-emerald-400/70 hover:text-emerald-200 underline cursor-pointer"
                >
                  Acesso Funcionárias Farmácia (Admin)
                </button>
              </div>
            </div>
          </div>
        </div>
      </footer>

      {/* Dock de Atalhos Móvel (Exibido para Tutores no Celular) */}
      {currentRole === 'tutor' && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 backdrop-blur-md border-t border-slate-200/90 shadow-2xl px-3 py-1.5 flex items-center justify-around">
          <button
            onClick={() => {
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-emerald-800 font-bold transition-all active:scale-95 cursor-pointer"
          >
            <Heart className="w-5 h-5 fill-rose-400 text-rose-500" />
            <span className="text-[10px] leading-none">Início</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                openAuthWithReason('register', 'Para ver e programar seus alarmes, crie seu cadastro ou faça login.');
                return;
              }
              setIsAlarmsListModalOpen(true);
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-500 hover:text-emerald-700 transition-all active:scale-95 cursor-pointer"
          >
            <Clock className="w-5 h-5 text-teal-700" />
            <span className="text-[10px] leading-none">Alarmes</span>
          </button>

          <button
            onClick={() => {
              if (!currentUser) {
                openAuthWithReason('register', 'Para ver e cadastrar seus pets, crie seu cadastro ou faça login.');
                return;
              }
              setIsPetsListModalOpen(true);
            }}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-500 hover:text-emerald-700 transition-all active:scale-95 cursor-pointer"
          >
            <User className="w-5 h-5 text-emerald-700" />
            <span className="text-[10px] leading-none">Pets</span>
          </button>

          <a
            href={`https://wa.me/55${PHARMACY_UNITS[selectedUnit].whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20atendimento%20da%20Amor%20ao%20Bicho`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-500 hover:text-emerald-700 transition-all active:scale-95"
            title="Falar no WhatsApp"
          >
            <MessageSquare className="w-5 h-5 text-emerald-600" />
            <span className="text-[10px] leading-none">WhatsApp</span>
          </a>

          {/* Botão Menu no Dock Mobile */}
          <button
            onClick={handleOpenMenu}
            className="flex flex-col items-center gap-0.5 py-1 px-2 rounded-xl text-slate-600 hover:text-emerald-800 transition-all active:scale-95 cursor-pointer"
            title="Abrir Meus Dados"
          >
            <Menu className="w-5 h-5 text-emerald-700" />
            <span className="text-[10px] leading-none font-bold text-emerald-800">Menu</span>
          </button>
        </nav>
      )}

      {/* Menu Principal (Dados do Usuário / Perfil) */}
      <AppMenuModal
        isOpen={isMenuModalOpen}
        onClose={() => setIsMenuModalOpen(false)}
        currentUser={currentUser}
        onUpdateUser={handleUpdateUser}
        onLogout={handleLogout}
        onOpenAuth={() => openAuthWithReason('login')}
        selectedUnit={selectedUnit}
      />

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
        onStaffLogin={handleStaffLogin}
      />

      {/* User Profile Modal */}
      {currentUser && (
        <UserProfileModal
          isOpen={isProfileModalOpen}
          onClose={() => setIsProfileModalOpen(false)}
          currentUser={currentUser}
          onUpdateUser={handleUpdateUser}
          onLogout={handleLogout}
          onOpenAuthModal={() => {
            setIsProfileModalOpen(false);
            handleOpenMenu('auth');
          }}
          onSwitchToAdmin={() => {
            setIsProfileModalOpen(false);
            handleStaffLogin(selectedUnit);
          }}
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
        onClose={() => {
          setIsReminderModalOpen(false);
          setSelectedPetForReminder(undefined);
        }}
        pets={pets}
        onAddSchedule={handleAddSchedule}
        initialPetId={selectedPetForReminder}
      />

      <AlarmsModal
        isOpen={isAlarmsListModalOpen}
        onClose={() => setIsAlarmsListModalOpen(false)}
        doseSchedules={doseSchedules}
        pets={pets}
        selectedUnit={selectedUnit}
        onToggleDoseAdministered={handleToggleDose}
        onOpenNewReminder={() => {
          setSelectedPetForReminder(undefined);
          setIsReminderModalOpen(true);
        }}
      />

      <PetsListModal
        isOpen={isPetsListModalOpen}
        onClose={() => setIsPetsListModalOpen(false)}
        pets={pets}
        onOpenNewPet={() => setIsPetModalOpen(true)}
        onOpenNewReminder={(petId) => {
          setSelectedPetForReminder(petId);
          setIsReminderModalOpen(true);
        }}
        onDeletePet={handleDeletePet}
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
