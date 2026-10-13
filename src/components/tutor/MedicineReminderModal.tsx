import React, { useState } from 'react';
import { X, Bell, Clock, Calendar, AlertCircle } from 'lucide-react';
import { Pet, DoseSchedule, DosageForm } from '../../types';

interface MedicineReminderModalProps {
  isOpen: boolean;
  onClose: () => void;
  pets: Pet[];
  onAddSchedule: (schedule: DoseSchedule) => void;
}

export const MedicineReminderModal: React.FC<MedicineReminderModalProps> = ({
  isOpen,
  onClose,
  pets,
  onAddSchedule
}) => {
  const [selectedPetId, setSelectedPetId] = useState(pets[0]?.id || '');
  const [medicationName, setMedicationName] = useState('');
  const [dosage, setDosage] = useState('');
  const [form, setForm] = useState<DosageForm>('biscoito_palatavel');
  const [time, setTime] = useState('08:00');
  const [intervalHours, setIntervalHours] = useState(24);
  const [totalDays, setTotalDays] = useState(30);
  const [isChronic, setIsChronic] = useState(true);

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
      takenToday: false
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

          <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200/60 flex items-start gap-2.5">
            <input
              type="checkbox"
              id="isChronicCheck"
              checked={isChronic}
              onChange={(e) => setIsChronic(e.target.checked)}
              className="mt-0.5 rounded text-emerald-700 focus:ring-emerald-500"
            />
            <label htmlFor="isChronicCheck" className="text-xs text-emerald-900 cursor-pointer">
              <strong>Ativar Clube de Recompra Inteligente</strong>
              <p className="text-[11px] text-emerald-700 mt-0.5">
                O aplicativo alertará automaticamente 5 dias antes da fórmula acabar para garantir que o pet não interrompa o tratamento.
              </p>
            </label>
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
