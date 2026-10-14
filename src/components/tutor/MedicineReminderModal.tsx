import React, { useState } from 'react';
import { X, Bell, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Pet, DoseSchedule, DosageForm } from '../../types';

interface MedicineReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  onAddSchedule: (schedule: DoseSchedule) => void;
  initialPetId?: string;
}

export const MedicineReminderModal: React.FC<MedicineReminderModalProps> = ({
  isOpen,
  onClose,
  pets,
  onAddSchedule,
  initialPetId
}) => {
  const [selectedPetId, setSelectedPetId] = useState(initialPetId || pets[0]?.id || '');

  React.useEffect(() => {
    if (initialPetId) {
      setSelectedPetId(initialPetId);
    } else if (pets[0]?.id && !selectedPetId) {
      setSelectedPetId(pets[0].id);
    }
  }, [initialPetId, isOpen, pets]);
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<DosageForm>('biscoito_palatavel');
  const [time, setTime] = useState('08:00');
  const [intervalHours, setIntervalHours] = useState(24);
  const [totalDays, setTotalDays] = useState(30);
  const [isChronic, setIsChronic] = useState(true);
  const [lowStockAlertDays, setLowStockAlertDays] = useState(5);

  if (!isOpen) return null;

  const currentPet = pets.find(p => p.id === selectedPetId);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!medicationName.trim() || !currentPet) return;

    const newSchedule: DoseSchedule = {
      id: `dose-${Date.now()}`,
      petId: currentPet.id,
      petName: currentPet.name,
      medicationName: medicationName.trim(),
      dosage: dosage.trim() || '1 dose conforme orientação',
      form,
      time,
      intervalHours: Number(intervalHours),
      startDate: new Date().toISOString().split('T')[0],
      totalDays: Number(totalDays),
      daysRemaining: Number(totalDays),
      totalDoses: Number(totalDays),
      dosesGiven: 0,
      nextDoseTime: `Hoje às ${time}`,
      isChronic,
      takenToday: false,
      lowStockAlertDays: Number(lowStockAlertDays)
    };

    onAddSchedule(newSchedule);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        <div className="bg-[#0b4d3a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-emerald-300" />
            <h3 className="font-bold text-base">Novo Lembrete: Hora do Remédio</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Pet Paciente:
            </label>
            <select
              value={selectedPetId}
              onChange={(e) => setSelectedPetId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
            >
              {pets.map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.species} • {p.weightKg}kg)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nome do Medicamento ou Fórmula Amor ao Bicho:
            </label>
            <input
              type="text"
              required
              value={medicationName}
              onChange={(e) => setMedicationName(e.target.value)}
              placeholder="Ex: Condroprotetor Articular, Meloxicam..."
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Forma Farmacêutica:
              </label>
              <select
                value={form}
                onChange={(e) => setForm(e.target.value as DosageForm)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value="biscoito_palatavel">Biscoito Palatável</option>
                <option value="gel_transdermico">Gel Transdérmico (Orelha)</option>
                <option value="pasta_oral">Pasta Oral</option>
                <option value="xarope_suspensao">Xarope / Suspensão</option>
                <option value="capsula">Cápsula</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Dose (ex: 1 biscoito, 0.5 mL):
              </label>
              <input
                type="text"
                value={dosage}
                onChange={(e) => setDosage(e.target.value)}
                placeholder="Ex: 1 biscoito ao dia"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Horário da 1ª Dose:
              </label>
              <input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-mono font-bold"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Intervalo de Administração:
              </label>
              <select
                value={intervalHours}
                onChange={(e) => setIntervalHours(Number(e.target.value))}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              >
                <option value={24}>A cada 24h (1x ao dia)</option>
                <option value={12}>A cada 12h (2x ao dia)</option>
                <option value={8}>A cada 8h (3x ao dia)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Duração do Tratamento (dias):
            </label>
            <input
              type="number"
              min={1}
              value={totalDays}
              onChange={(e) => setTotalDays(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
            />
          </div>

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-semibold text-emerald-950">
              <span className="flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-700" />
                Horários Diários Calculados Automaticamente:
              </span>
              <span className="text-[11px] font-mono bg-emerald-200/70 text-emerald-900 px-2 py-0.5 rounded font-bold">
                {intervalHours === 24 ? '1 dose/dia' : intervalHours === 12 ? '2 doses/dia' : '3 doses/dia'}
              </span>
            </div>
            <div className="flex items-center gap-2 pt-1">
              {(() => {
                const [h, m] = time.split(':').map(Number);
                const count = Math.floor(24 / intervalHours);
                const times = [];
                for (let i = 0; i < count; i++) {
                  const nextH = (h + i * intervalHours) % 24;
                  times.push(`${String(nextH).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
                }
                return times.map((t, idx) => (
                  <span key={idx} className="bg-white px-2.5 py-1 rounded-lg text-xs font-mono font-bold text-emerald-900 border border-emerald-300 shadow-2xs">
                    🔔 {t}
                  </span>
                ));
              })()}
            </div>
          </div>
          <div className="p-3 bg-amber-50/80 rounded-xl border border-amber-200/80 space-y-2">
            <div className="flex items-start gap-2.5">
              <input
                type="checkbox"
                id="isChronicCheck"
                checked={isChronic}
                onChange={(e) => setIsChronic(e.target.checked)}
                className="mt-0.5 rounded text-amber-600 focus:ring-amber-500"
              />
              <label htmlFor="isChronicCheck" className="text-xs text-amber-950 cursor-pointer">
                <strong>Programar Alerta de Remédio Acabando</strong>
                <p className="text-[11px] text-amber-800 mt-0.5">
                  Receba uma notificação sonora e no celular antes do tratamento terminar para renovar a fórmula sem interrupção.
                </p>
              </label>
            </div>

            {isChronic && (
              <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-xs">
                <span className="text-[11px] font-semibold text-amber-900">Avisar com antecedência de:</span>
                <div className="flex items-center gap-1.5">
                  {[3, 5, 7].map((days) => (
                    <button
                      key={days}
                      type="button"
                      onClick={() => setLowStockAlertDays(days)}
                      className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-all ${
                        lowStockAlertDays === days
                          ? 'bg-amber-600 text-white shadow-2xs'
                          : 'bg-white border border-amber-300 text-amber-900 hover:bg-amber-100/50'
                      }`}
                    >
                      {days} dias antes
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
            >
              Criar Alarme
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
