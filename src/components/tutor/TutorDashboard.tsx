import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Upload, 
  ChevronRight, 
  ShieldCheck, 
  Heart, 
  RefreshCw,
  Bell,
  Volume2,
  Trash2,
  Check,
  MessageSquare,
  AlertTriangle
} from 'lucide-react';
import { Pet, PrescriptionOrder, DoseSchedule, PharmacyUnit, InAppNotification, UserAccount } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';

interface TutorDashboardProps {
  pets: Pet[];
  orders: PrescriptionOrder[];
  doseSchedules: DoseSchedule[];
  selectedUnit: PharmacyUnit;
  notifications?: InAppNotification[];
  currentUser?: UserAccount | null;
  onOpenMenu?: () => void;
  onOpenNewPrescription: () => void;
  onOpenNewPet: () => void;
  onOpenNewReminder: (petId?: string) => void;
  onSelectOrder: (order: PrescriptionOrder) => void;
  onToggleDoseAdministered: (scheduleId: string) => void;
  onQuickRepurchase: (schedule: DoseSchedule) => void;
  onDismissNotification?: (id: string) => void;
  onDeletePet?: (petId: string) => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  pets,
  orders,
  doseSchedules,
  selectedUnit,
  notifications = [],
  currentUser,
  onOpenMenu,
  onOpenNewPrescription,
  onOpenNewPet,
  onOpenNewReminder,
  onSelectOrder,
  onToggleDoseAdministered,
  onQuickRepurchase,
  onDismissNotification,
  onDeletePet
}) => {
  const [confirmDeletePetId, setConfirmDeletePetId] = useState<string | null>(null);
  const [notificationStatus, setNotificationStatus] = useState<NotificationPermission>(
    notificationService.getPermission()
  );

  const handleRequestNotification = async () => {
    const granted = await notificationService.requestPermission();
    setNotificationStatus(notificationService.getPermission());
    if (granted) {
      notificationService.sendNotification('🐾 Amor ao Bicho - Notificações Ativadas!', {
        body: 'Você receberá alertas sonoros e nativos quando chegar a hora do remédio do seu pet.'
      });
    }
  };

  const handleTestAlert = (schedule?: DoseSchedule) => {
    const petName = schedule ? schedule.petName : (pets[0]?.name || 'Thor');
    const medName = schedule ? schedule.medicationName : 'Condroitina Palatável';
    const time = schedule ? schedule.time : '12:00';
    notificationService.sendNotification(`⏰ Hora do Remédio: ${petName}!`, {
      body: `Horário previsto: ${time}. Dose de ${medName}. Favor medicar seu pet!`
    });
  };

  // Remédios com estoque baixo / acabando (conforme configuração ou padrão de 5 dias)
  const lowStockAlerts = doseSchedules.filter(d => {
    const threshold = d.lowStockAlertDays ?? 5;
    return d.daysRemaining <= threshold;
  });

  const unit = PHARMACY_UNITS[selectedUnit];

  return (
    <div className="space-y-6 sm:space-y-8 pb-16">
      {/* SEÇÃO DE ATALHOS RÁPIDOS DO APLICATIVO */}
      <section className="space-y-2.5">
        <div className="flex items-center justify-between px-1">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h2 className="text-xs sm:text-sm font-extrabold tracking-tight text-slate-800 uppercase">
              Atalhos Rápidos
            </h2>
          </div>
          <span className="text-[11px] text-emerald-800 font-semibold bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60">
            Acesso em 1 toque
          </span>
        </div>

        <div className="grid grid-cols-3 gap-2 sm:gap-3.5">
          {/* Atalho 1: Programar Hora do Remédio */}
          <button
            onClick={() => onOpenNewReminder()}
            className="group flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left sm:gap-3.5 p-2.5 sm:p-4 rounded-2xl bg-gradient-to-b from-teal-50/70 to-white hover:from-teal-100/70 hover:to-white border border-teal-200/80 hover:border-teal-300 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-teal-600 to-cyan-700 text-white flex items-center justify-center shadow-sm shadow-teal-700/20 group-hover:scale-105 transition-transform mb-1.5 sm:mb-0 shrink-0">
              <Clock className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-teal-950 leading-tight block">
                Hora do Remédio
              </span>
              <span className="text-[10px] sm:text-xs text-teal-800 font-medium leading-tight block mt-0.5 truncate">
                Alarmes c/ som
              </span>
            </div>
          </button>

          {/* Atalho 2: Cadastrar Novo Pet */}
          <button
            onClick={onOpenNewPet}
            className="group flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left sm:gap-3.5 p-2.5 sm:p-4 rounded-2xl bg-gradient-to-b from-rose-50/70 to-white hover:from-rose-100/70 hover:to-white border border-rose-200/80 hover:border-rose-300 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-rose-500 to-pink-600 text-white flex items-center justify-center shadow-sm shadow-rose-700/20 group-hover:scale-105 transition-transform mb-1.5 sm:mb-0 shrink-0">
              <Heart className="w-5 h-5 text-white fill-white/40" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-rose-950 leading-tight block">
                Cadastrar Pet
              </span>
              <span className="text-[10px] sm:text-xs text-rose-800 font-medium leading-tight block mt-0.5 truncate">
                Novo animal
              </span>
            </div>
          </button>

          {/* Atalho 3: Falar no WhatsApp */}
          <a
            href={notificationService.buildWhatsAppUrl(unit.whatsapp, `Olá! Gostaria de falar com a farmácia Amor ao Bicho (${unit.name}) sobre manipulação veterinária para meu pet.`)}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col sm:flex-row items-center sm:items-center text-center sm:text-left sm:gap-3.5 p-2.5 sm:p-4 rounded-2xl bg-gradient-to-b from-emerald-50/80 to-white hover:from-emerald-100/80 hover:to-white border border-emerald-300 shadow-xs hover:shadow-md transition-all active:scale-95 cursor-pointer"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 to-green-700 text-white flex items-center justify-center shadow-sm shadow-emerald-700/20 group-hover:scale-105 transition-transform mb-1.5 sm:mb-0 shrink-0">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <div className="min-w-0 flex-1">
              <span className="text-xs sm:text-sm font-bold text-emerald-950 leading-tight block">
                WhatsApp
              </span>
              <span className="text-[10px] sm:text-xs text-emerald-800 font-medium leading-tight block mt-0.5 truncate">
                {unit.city}
              </span>
            </div>
          </a>
        </div>
      </section>



      {/* BANNER DE STATUS DE NOTIFICAÇÕES & TESTE SONORO */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/30">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Lembrete Insistente & Notificações Nativas
              </span>
              <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                notificationStatus === 'granted'
                  ? 'bg-emerald-400 text-emerald-950'
                  : 'bg-amber-400 text-amber-950'
              }`}>
                {notificationStatus === 'granted' ? 'Alertas Ativos no Dispositivo' : 'Permissão Pendente'}
              </span>
            </div>
            <p className="text-xs text-emerald-100/80 mt-1">
              {notificationStatus === 'granted'
                ? '🔔 Enquanto você não marcar que a dose foi dada, o celular continuará notificando e vibrando a cada 2 minutos.'
                : 'Ative as notificações para receber alarmes repetitivos no celular até você marcar que o remédio foi administrado.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => handleTestAlert()}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Toca o alarme insistente e exibe notificação de teste"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Testar Alarme no Dispositivo</span>
          </button>

          {notificationStatus !== 'granted' && (
            <button
              onClick={handleRequestNotification}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs shadow-sm transition-all"
            >
              Ativar Notificações
            </button>
          )}
        </div>
      </div>

      {/* SEÇÕES COMPLETAS DA ÁREA DO TUTOR (Apenas exibidas após o cadastro/login) */}
      {currentUser ? (
        <>
          {/* SESSÃO CRÍTICA: ⚠️ ALERTA DE REMÉDIO ACABANDO */}
          {lowStockAlerts.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                  <h2 className="text-base font-bold text-amber-950 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-amber-600" />
                    Atenção: Remédio Acabando ({lowStockAlerts.length})
                  </h2>
                </div>
                <span className="text-xs text-amber-800 font-semibold">
                  Evite interromper o tratamento do seu pet
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {lowStockAlerts.map((schedule) => {
                  const total = schedule.totalDoses || schedule.totalDays || 30;
                  const remaining = schedule.daysRemaining;
                  const pct = Math.max(0, Math.min(100, Math.round(((total - remaining) / total) * 100)));

                  return (
                    <div
                      key={schedule.id}
                      className="bg-gradient-to-r from-amber-50/90 to-orange-50/90 border border-amber-300 rounded-2xl p-5 shadow-xs flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">
                              🐾 {schedule.petName}
                            </span>
                            <h3 className="font-bold text-sm text-amber-950 mt-0.5">
                              {schedule.medicationName}
                            </h3>
                            <p className="text-xs text-amber-900/80 mt-0.5">
                              {schedule.dosage} • Forma: {schedule.form.replace(/_/g, ' ')}
                            </p>
                          </div>

                          <span className="text-xs font-mono font-bold bg-amber-200/90 text-amber-950 px-2.5 py-1 rounded-lg border border-amber-300/80">
                            {remaining === 1 ? 'Resta 1 dia!' : `Restam ${remaining} dias!`}
                          </span>
                        </div>

                        {/* Barra de Progresso do Frasco/Tratamento */}
                        <div className="space-y-1 pt-1">
                          <div className="flex justify-between text-[11px] text-amber-900 font-medium">
                            <span>Tratamento utilizado: {pct}%</span>
                            <span>{schedule.dosesGiven} de {total} doses dadas</span>
                          </div>
                          <div className="w-full bg-amber-200/70 rounded-full h-2 overflow-hidden">
                            <div
                              className="bg-amber-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-amber-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <span className="text-[11px] text-amber-800">
                          Unidade Amor ao Bicho {PHARMACY_UNITS[selectedUnit].name}
                        </span>

                        <a
                          href={notificationService.buildWhatsAppUrl(
                            PHARMACY_UNITS[selectedUnit].whatsapp,
                            `Olá, Farmácia Amor ao Bicho (${PHARMACY_UNITS[selectedUnit].name})! Gostaria de renovar a fórmula manipulada do meu pet.\n\n🐾 Pet: ${schedule.petName}\n💊 Medicamento/Fórmula: ${schedule.medicationName}\n📋 Posologia: ${schedule.dosage}\n⏳ Dias restantes de tratamento: ${schedule.daysRemaining} dias.`
                          )}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 active:scale-95"
                        >
                          <MessageSquare className="w-4 h-4 text-white" />
                          <span>Renovar a fórmula entrar em contato no WhatsApp</span>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </section>
          )}

          {/* SESSÃO 1: HORA DO REMÉDIO & GESTÃO DIÁRIA */}
          <section className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Clock className="w-5 h-5 text-emerald-700" />
                  Hora do Remédio (Alarmes & Doses do Dia)
                </h2>
                <p className="text-xs text-slate-500">
                  Alarmes com som no celular e lembretes para você medicar seu pet sem atrasos
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => onOpenNewReminder()}
                  className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Programar Novo Remédio</span>
                </button>
              </div>
            </div>

            {doseSchedules.length === 0 ? (
              <div className="bg-white border-2 border-dashed border-slate-200 rounded-2xl p-8 text-center space-y-3">
                <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center mx-auto">
                  <Clock className="w-6 h-6" />
                </div>
                <div>
                  <p className="font-bold text-slate-800 text-sm">Nenhum lembrete de remédio cadastrado</p>
                  <p className="text-xs text-slate-500 mt-1">Programe os horários das medicações para receber alertas diários com som.</p>
                </div>
                <button
                  onClick={() => onOpenNewReminder()}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
                >
                  + Programar 1º Remédio
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {doseSchedules.map((schedule) => (
                  <div
                    key={schedule.id}
                    className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                      schedule.takenToday
                        ? 'bg-emerald-50/50 border-emerald-200'
                        : 'bg-white border-slate-200 shadow-xs hover:border-slate-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between">
                        <div>
                          <span className="text-[11px] font-bold text-emerald-800">
                            🐾 {schedule.petName}
                          </span>
                          <p className="text-xs font-bold text-slate-900 line-clamp-1 mt-0.5">
                            {schedule.medicationName}
                          </p>
                          <p className="text-[11px] text-slate-500 mt-0.5">
                            {schedule.dosage} • {schedule.intervalHours === 24 ? '1x ao dia' : schedule.intervalHours === 12 ? '2x ao dia' : `${schedule.intervalHours}h em ${schedule.intervalHours}h`}
                          </p>
                        </div>
                        <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                          🔔 {schedule.time}
                        </span>
                      </div>

                      {schedule.daysRemaining <= (schedule.lowStockAlertDays || 5) && (
                        <div className="mt-2.5 px-2.5 py-1 rounded-lg bg-amber-100/70 border border-amber-300 text-amber-900 text-[10px] font-bold flex items-center justify-between">
                          <span>Restam apenas {schedule.daysRemaining} dias</span>
                          <a
                            href={notificationService.buildWhatsAppUrl(
                              PHARMACY_UNITS[selectedUnit].whatsapp,
                              `Olá! Gostaria de renovar a fórmula do meu pet ${schedule.petName} (${schedule.medicationName}).`
                            )}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline text-amber-950 hover:text-amber-700 flex items-center gap-1 font-bold"
                          >
                            <MessageSquare className="w-3 h-3 text-emerald-800" />
                            Renovar no WhatsApp
                          </a>
                        </div>
                      )}

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={() => handleTestAlert(schedule)}
                          className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                          title="Disparar som de teste no dispositivo"
                        >
                          <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>Testar Alarme</span>
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                      <div className="text-[11px] text-slate-500">
                        <span>{schedule.dosesGiven}/{schedule.totalDoses} doses</span>
                        <span className="mx-1">•</span>
                        <span>{schedule.daysRemaining}d restantes</span>
                      </div>

                      <button
                        onClick={() => onToggleDoseAdministered(schedule.id)}
                        className={`px-3 py-1.5 rounded-lg font-bold text-[11px] transition-all flex items-center gap-1.5 ${
                          schedule.takenToday
                            ? 'bg-emerald-600 text-white shadow-xs'
                            : 'bg-slate-100 hover:bg-emerald-100 text-slate-700 hover:text-emerald-900'
                        }`}
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>{schedule.takenToday ? 'Dose dada ✓' : 'Marcar como dada'}</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>



          {/* SESSÃO 3: MEUS PETS CADASTRADOS */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-rose-500" />
                  Meus Pets Cadastrados ({pets.length})
                </h2>
                <p className="text-xs text-slate-500">
                  Perfis dos seus animais para cálculo exato de doses pelo peso e sabor favorito
                </p>
              </div>

              <button
                onClick={onOpenNewPet}
                className="text-xs font-bold px-3.5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1.5 transition-all shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Cadastrar Outro Pet</span>
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {pets.map((pet) => (
                <div
                  key={pet.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center gap-3">
                      <img
                        src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=200&q=80'}
                        alt={pet.name}
                        className="w-14 h-14 rounded-2xl object-cover border border-slate-200"
                      />
                      <div>
                        <h3 className="font-bold text-slate-900 text-sm">{pet.name}</h3>
                        <p className="text-xs text-slate-500">{pet.breed}</p>
                        <p className="text-xs font-semibold text-emerald-800">
                          {pet.weightKg} kg • {pet.ageYears} anos
                        </p>
                      </div>
                    </div>

                    <div className="mt-3 pt-3 border-t border-slate-100 space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Sabor preferido:</span>
                        <strong className="text-slate-800 capitalize">{pet.favoriteFlavor?.replace(/_/g, ' ') || 'Carne'}</strong>
                      </div>

                      {pet.chronicCondition && (
                        <div className="text-[11px] text-amber-800 bg-amber-50 p-1.5 rounded-lg border border-amber-200/50">
                          <strong>Crônico:</strong> {pet.chronicCondition}
                        </div>
                      )}

                      {pet.allergies && (
                        <div className="text-[11px] text-rose-800 bg-rose-50 p-1.5 rounded-lg border border-rose-200/50">
                          <strong>Alergia:</strong> {pet.allergies}
                        </div>
                      )}
                    </div>
                  </div>

                  {confirmDeletePetId === pet.id ? (
                    <div className="bg-rose-50 border border-rose-200 rounded-xl p-3 flex flex-col sm:flex-row items-center justify-between gap-2.5 animate-in fade-in">
                      <div className="flex items-center gap-2 text-rose-800 text-xs font-semibold">
                        <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
                        <span>Remover <strong>{pet.name}</strong> da sua lista de pets?</span>
                      </div>
                      <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                        <button
                          type="button"
                          onClick={() => {
                            if (onDeletePet) onDeletePet(pet.id);
                            setConfirmDeletePetId(null);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
                        >
                          Sim, remover
                        </button>
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePetId(null)}
                          className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-slate-700 text-xs font-semibold hover:bg-slate-50 transition-all cursor-pointer"
                        >
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex flex-col sm:flex-row items-center gap-2">
                      <button
                        type="button"
                        onClick={() => onOpenNewReminder(pet.id)}
                        className="w-full sm:flex-1 py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                      >
                        <Clock className="w-3.5 h-3.5 text-emerald-600" />
                        <span>+ Programar Remédio para {pet.name}</span>
                      </button>

                      {onDeletePet && (
                        <button
                          type="button"
                          onClick={() => setConfirmDeletePetId(pet.id)}
                          className="w-full sm:w-auto py-2 px-3 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer hover:border-rose-300"
                          title={`Remover pet ${pet.name}`}
                        >
                          <Trash2 className="w-3.5 h-3.5 text-rose-600 shrink-0" />
                          <span>Remover Pet</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>
        </>
      ) : (
        /* CONVITE VISUAL PARA VISITANTES CRIAR CADASTRO OU ENTRAR */
        <section className="bg-gradient-to-b from-white to-emerald-50/40 rounded-3xl p-6 sm:p-8 border border-emerald-200/80 text-center space-y-4 shadow-sm">
          <div className="w-14 h-14 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto shadow-inner">
            <Heart className="w-7 h-7 text-emerald-700 fill-emerald-600/30" />
          </div>
          <div className="max-w-md mx-auto space-y-1.5">
            <h3 className="text-base sm:text-lg font-extrabold text-slate-900">
              Cadastre-se para gerenciar seus Pets e Remédios
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Crie seu cadastro ou acesse sua conta para cadastrar seus pets, programar horários de medicação e receber notificações sonoras no celular.
            </p>
          </div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
            <button
              onClick={onOpenNewPet}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Heart className="w-4 h-4 fill-white/40" />
              <span>Criar Cadastro de Tutor</span>
            </button>
            <button
              onClick={onOpenNewReminder}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs border border-emerald-300 shadow-xs transition-all active:scale-95 cursor-pointer flex items-center justify-center gap-1.5"
            >
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Já Tenho Conta (Entrar)</span>
            </button>
          </div>
        </section>
      )}
    </div>
  );
};
