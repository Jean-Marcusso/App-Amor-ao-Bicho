import React, { useState } from 'react';
import { 
  Plus, 
  Clock, 
  CheckCircle2, 
  AlertCircle, 
  Calendar, 
  Sparkles, 
  Upload, 
  ChevronRight, 
  ShieldCheck, 
  Heart, 
  RefreshCw,
  Bell,
  Volume2,
  Trash2,
  Check,
  MessageSquare
} from 'lucide-react';
import { Pet, PrescriptionOrder, DoseSchedule, PharmacyUnit, InAppNotification } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';

interface TutorDashboardProps {
  pets: Pet[];
  orders: PrescriptionOrder[];
  doseSchedules: DoseSchedule[];
  selectedUnit: PharmacyUnit;
  notifications?: InAppNotification[];
  onOpenNewPrescription: () => void;
  onOpenNewPet: () => void;
  onOpenNewReminder: (petId?: string) => void;
  onSelectOrder: (order: PrescriptionOrder) => void;
  onToggleDoseAdministered: (scheduleId: string) => void;
  onQuickRepurchase: (schedule: DoseSchedule) => void;
  onDismissNotification?: (id: string) => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  pets,
  orders,
  doseSchedules,
  selectedUnit,
  notifications = [],
  onOpenNewPrescription,
  onOpenNewPet,
  onOpenNewReminder,
  onSelectOrder,
  onToggleDoseAdministered,
  onQuickRepurchase,
  onDismissNotification
}) => {
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'dose_alarm' | 'low_stock' | 'order_update'>('all');
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

  const filteredNotifications = notifications.filter(n => {
    if (notificationFilter === 'all') return true;
    return n.type === notificationFilter;
  });

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner: Foco em Notificações & Gestão do Pet */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0b4d3a] via-[#0d5c46] to-[#127057] text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Heart className="w-80 h-80" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold backdrop-blur-xs border border-emerald-600/30">
            <Bell className="w-3.5 h-3.5 text-emerald-300 animate-pulse" />
            <span>Central de Notificações, Horários e Cuidados com o Pet</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Nunca mais esqueça a hora do remédio nem deixe a fórmula acabar.
          </h1>

          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Configure alarmes com som para cada medicação, monitore a quantidade restante de doses e repita pedidos com a Amor ao Bicho de <strong>{unit.city}</strong> sem complicação.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={() => onOpenNewReminder()}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-lg hover:bg-emerald-50 transition-all active:scale-95"
            >
              <Clock className="w-4 h-4 text-emerald-700" />
              <span>Programar Hora do Remédio</span>
            </button>

            <button
              onClick={onOpenNewPet}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-900/70 hover:bg-emerald-900 text-white font-semibold text-xs border border-emerald-500/30 transition-all"
            >
              <Heart className="w-4 h-4 text-rose-300" />
              <span>Cadastrar Novo Pet</span>
            </button>

            <a
              href={notificationService.buildWhatsAppUrl(unit.whatsapp, `Olá! Gostaria de falar com a farmácia Amor ao Bicho (${unit.name}) sobre fórmulas e manipulação para meu pet.`)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs shadow-md transition-all active:scale-95"
            >
              <MessageSquare className="w-4 h-4 text-white" />
              <span>Falar com a Farmácia no WhatsApp</span>
            </a>
          </div>
        </div>
      </div>

      {/* BANNER DE STATUS DE NOTIFICAÇÕES & TESTE SONORO */}
      <div className="bg-gradient-to-r from-emerald-950 via-slate-900 to-teal-950 text-white rounded-2xl p-4 sm:p-5 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-emerald-500/30">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-emerald-600/30 border border-emerald-400/30 flex items-center justify-center shrink-0">
            <Bell className="w-5 h-5 text-emerald-300" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                Notificações Nativas & Som de Alerta
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
                ? 'Toca bipe suave e exibe notificações sonoras no horário exato de cada remédio.'
                : 'Ative as notificações para seu dispositivo tocar mesmo com o aplicativo em segundo plano.'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 shrink-0 flex-wrap">
          <button
            onClick={() => handleTestAlert()}
            className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs"
            title="Toca o bipe do alarme e exibe notificação de teste"
          >
            <Volume2 className="w-3.5 h-3.5 text-emerald-300" />
            <span>Testar Som no Dispositivo</span>
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

                  <div className="pt-2 border-t border-amber-200/80 flex items-center justify-between gap-3">
                    <span className="text-[11px] text-amber-800">
                      Unidade Amor ao Bicho {PHARMACY_UNITS[selectedUnit].name}
                    </span>

                    <button
                      onClick={() => onQuickRepurchase(schedule)}
                      className="px-4 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition-all flex items-center gap-1.5"
                    >
                      <RefreshCw className="w-3.5 h-3.5" />
                      <span>Renovar Fórmula em 1 Clique</span>
                    </button>
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
                      <button
                        onClick={() => onQuickRepurchase(schedule)}
                        className="underline text-amber-950 hover:text-amber-700"
                      >
                        Renovar
                      </button>
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

      {/* SESSÃO 2: 🔔 CENTRAL DE NOTIFICAÇÕES & HISTÓRICO DE ALERTAS */}
      <section className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Central de Notificações Recebidas
              </h2>
              <p className="text-xs text-slate-500">
                Histórico em tempo real de alarmes de doses, alertas de reposição e atualizações de pedidos
              </p>
            </div>
          </div>

          {/* Filtros de Notificação */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs overflow-x-auto">
            <button
              onClick={() => setNotificationFilter('all')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                notificationFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Todas ({notifications.length})
            </button>
            <button
              onClick={() => setNotificationFilter('dose_alarm')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                notificationFilter === 'dose_alarm' ? 'bg-white text-emerald-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⏰ Hora do Remédio
            </button>
            <button
              onClick={() => setNotificationFilter('low_stock')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                notificationFilter === 'low_stock' ? 'bg-white text-amber-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              ⚠️ Remédio Acabando
            </button>
            <button
              onClick={() => setNotificationFilter('order_update')}
              className={`px-2.5 py-1 rounded-lg font-semibold transition-all ${
                notificationFilter === 'order_update' ? 'bg-white text-teal-800 shadow-xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              📦 Farmácia
            </button>
          </div>
        </div>

        {filteredNotifications.length === 0 ? (
          <div className="p-6 text-center text-xs text-slate-400 bg-slate-50 rounded-xl border border-slate-100">
            Nenhuma notificação encontrada nesta categoria.
          </div>
        ) : (
          <div className="space-y-2.5">
            {filteredNotifications.map((notif) => (
              <div
                key={notif.id}
                className={`p-3.5 rounded-xl border flex items-start justify-between gap-3 text-xs transition-all ${
                  notif.type === 'low_stock'
                    ? 'bg-amber-50/70 border-amber-200 text-amber-950'
                    : notif.type === 'dose_alarm'
                    ? 'bg-emerald-50/70 border-emerald-200 text-emerald-950'
                    : 'bg-slate-50 border-slate-200 text-slate-800'
                }`}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-sm ${
                    notif.type === 'low_stock'
                      ? 'bg-amber-200 text-amber-900'
                      : notif.type === 'dose_alarm'
                      ? 'bg-emerald-200 text-emerald-900'
                      : 'bg-teal-200 text-teal-900'
                  }`}>
                    {notif.type === 'low_stock' ? '⚠️' : notif.type === 'dose_alarm' ? '⏰' : '📦'}
                  </div>

                  <div>
                    <div className="flex items-center gap-2">
                      <strong className="text-xs font-bold">{notif.title}</strong>
                      <span className="text-[10px] text-slate-400 font-normal">{notif.timestamp}</span>
                    </div>
                    <p className="mt-0.5 text-xs text-slate-600 leading-relaxed">
                      {notif.message}
                    </p>
                  </div>
                </div>

                {onDismissNotification && (
                  <button
                    onClick={() => onDismissNotification(notif.id)}
                    className="p-1 rounded text-slate-400 hover:text-slate-600 transition-colors"
                    title="Dispensar notificação"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
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

              {/* Botão de Atalho para Programar Remédio para este Pet */}
              <button
                onClick={() => onOpenNewReminder(pet.id)}
                className="w-full py-2 px-3 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-bold flex items-center justify-center gap-1.5 transition-all"
              >
                <Clock className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Programar Remédio para {pet.name}</span>
              </button>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
