import React from 'react';
import { X, Clock, Plus, Volume2, CheckCircle2, MessageSquare, AlertCircle } from 'lucide-react';
import { DoseSchedule, Pet, PharmacyUnit } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';

interface AlarmsModalProps {
  isOpen: boolean;
  onClose: () => void;
  doseSchedules: DoseSchedule[];
  pets: Pet[];
  selectedUnit: PharmacyUnit;
  onToggleDoseAdministered: (scheduleId: string) => void;
  onOpenNewReminder: () => void;
}

export const AlarmsModal: React.FC<AlarmsModalProps> = ({
  isOpen,
  onClose,
  doseSchedules,
  selectedUnit,
  onToggleDoseAdministered,
  onOpenNewReminder
}) => {
  if (!isOpen) return null;

  const handleTestAlert = (schedule: DoseSchedule) => {
    notificationService.sendNotification(`⏰ Hora do Remédio: ${schedule.petName}!`, {
      body: `Horário previsto: ${schedule.time}. Dose de ${schedule.medicationName}. Favor medicar seu pet!`
    });
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4">
      <div className="bg-white rounded-2xl max-w-xl w-full shadow-2xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-teal-900 to-emerald-950 px-5 py-4 text-white flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-teal-600/30 border border-teal-400/40 flex items-center justify-center">
              <Clock className="w-5 h-5 text-teal-300" />
            </div>
            <div>
              <h3 className="font-bold text-sm sm:text-base text-white">Alarmes e Lembretes de Remédio</h3>
              <p className="text-[11px] text-teal-200/80">
                {doseSchedules.length} {doseSchedules.length === 1 ? 'alarme configurado' : 'alarmes configurados'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-teal-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-3.5 flex-1">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-700">Seus Alarmes Programados</span>
            <button
              onClick={() => {
                onClose();
                onOpenNewReminder();
              }}
              className="text-xs font-bold px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 transition-all"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Novo Alarme</span>
            </button>
          </div>

          {doseSchedules.length === 0 ? (
            <div className="text-center py-10 bg-slate-50 rounded-2xl border border-dashed border-slate-200 space-y-3 p-4">
              <div className="w-12 h-12 rounded-full bg-teal-50 text-teal-700 flex items-center justify-center mx-auto">
                <Clock className="w-6 h-6" />
              </div>
              <p className="font-bold text-slate-800 text-sm">Você ainda não possui alarmes cadastrados</p>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Cadastre o remédio do seu pet para receber avisos e notificações sonoras no celular.
              </p>
              <button
                onClick={() => {
                  onClose();
                  onOpenNewReminder();
                }}
                className="px-4 py-2 rounded-xl bg-emerald-700 text-white font-bold text-xs"
              >
                + Criar Meu Primeiro Alarme
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {doseSchedules.map((schedule) => (
                <div
                  key={schedule.id}
                  className={`p-4 rounded-2xl border transition-all flex flex-col justify-between ${
                    schedule.takenToday
                      ? 'bg-emerald-50/50 border-emerald-200'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wide">
                        🐾 {schedule.petName}
                      </span>
                      <h4 className="font-bold text-slate-900 text-sm mt-0.5">
                        {schedule.medicationName}
                      </h4>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {schedule.dosage} • {schedule.intervalHours === 24 ? '1x ao dia' : schedule.intervalHours === 12 ? '2x ao dia' : `${schedule.intervalHours}h em ${schedule.intervalHours}h`}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-1 rounded-md inline-block">
                        🔔 {schedule.time}
                      </span>
                      <span className={`block text-[10px] font-semibold mt-1 ${schedule.takenToday ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {schedule.takenToday ? 'Dose administrada ✓' : 'Aguardando medicação'}
                      </span>
                    </div>
                  </div>

                  {schedule.daysRemaining <= (schedule.lowStockAlertDays || 5) && (
                    <div className="mt-2.5 px-3 py-1.5 rounded-xl bg-amber-100/70 border border-amber-300 text-amber-900 text-xs font-semibold flex items-center justify-between">
                      <span className="flex items-center gap-1.5">
                        <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
                        Restam {schedule.daysRemaining} dias de tratamento
                      </span>
                      <a
                        href={notificationService.buildWhatsAppUrl(
                          PHARMACY_UNITS[selectedUnit].whatsapp,
                          `Olá! Gostaria de renovar a fórmula do meu pet ${schedule.petName} (${schedule.medicationName}).`
                        )}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-amber-950 font-bold underline text-[11px]"
                      >
                        Renovar
                      </a>
                    </div>
                  )}

                  <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => handleTestAlert(schedule)}
                      className="px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-xs font-semibold flex items-center gap-1 transition-all"
                    >
                      <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Testar Som</span>
                    </button>

                    <button
                      onClick={() => onToggleDoseAdministered(schedule.id)}
                      className={`px-3 py-1.5 rounded-lg font-bold text-xs transition-all flex items-center gap-1.5 ${
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
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex justify-between items-center text-xs">
          <span className="text-slate-500 text-[11px]">
            🔔 Notificações disparam até a confirmação
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
