import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  MessageSquare, 
  Users, 
  Filter, 
  ArrowLeft,
  Bell,
  Search,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PrescriptionOrder, OrderStatus, PharmacyUnit, DoseSchedule, Pet } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';

interface AdminModuleProps {
  orders?: PrescriptionOrder[];
  selectedUnit: PharmacyUnit;
  doseSchedules?: DoseSchedule[];
  pets?: Pet[];
  onUpdateOrderStatus?: (orderId: string, newStatus: OrderStatus) => void;
  onApproveQuotePrice?: (orderId: string, newPrice: number) => void;
  onBackToHome?: () => void;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
  orders = [],
  selectedUnit,
  doseSchedules = [],
  pets = [],
  onBackToHome
}) => {
  const [filterUnit, setFilterUnit] = useState<PharmacyUnit | 'todas'>(selectedUnit);
  const [clientSearchTerm, setClientSearchTerm] = useState('');
  const [clientFilterStatus, setClientFilterStatus] = useState<'all' | 'low_stock' | 'has_alarms'>('all');

  return (
    <div className="space-y-6 pb-16">
      {/* Botão Voltar para Área do Tutor */}
      {onBackToHome && (
        <button
          type="button"
          onClick={onBackToHome}
          className="group flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-emerald-50 border border-slate-200 hover:border-emerald-300 text-slate-700 hover:text-emerald-800 text-sm font-semibold transition-all shadow-xs"
        >
          <ArrowLeft className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 transition-colors" />
          ← Voltar para Área do Tutor (Início)
        </button>
      )}

      {/* Top Banner do Acesso Administrador da Farmácia */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Acesso Administrador - Gestão de Alertas & Clientes</h1>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                Farmácia Amor ao Bicho
              </span>
            </div>
            <p className="text-xs text-slate-300 mt-0.5">
              Supervisão Técnica: Dra. Flávia Semeghini (Americana) e Dra. Carolina Giordano (Valinhos)
            </p>
          </div>
        </div>

        {/* Filtro por Unidade */}
        <div className="flex items-center gap-2 text-xs">
          <Filter className="w-4 h-4 text-slate-400" />
          <span className="text-slate-400">Filtrar Unidade:</span>
          <div className="inline-flex rounded-lg p-0.5 bg-slate-800">
            <button
              onClick={() => setFilterUnit('todas')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${filterUnit === 'todas' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              Todas (RMC)
            </button>
            <button
              onClick={() => setFilterUnit('americana')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${filterUnit === 'americana' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              Americana
            </button>
            <button
              onClick={() => setFilterUnit('valinhos')}
              className={`px-2.5 py-1 rounded text-xs font-semibold ${filterUnit === 'valinhos' ? 'bg-amber-600 text-white' : 'text-slate-400'}`}
            >
              Valinhos
            </button>
          </div>
        </div>
      </div>

      {/* SEÇÃO PRINCIPAL: CLIENTES & PETS CADASTRADOS PARA RECEBER ALERTA */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Users className="w-5 h-5 text-amber-600" />
              Clientes & Pets Cadastrados para Receber Alertas
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento de tutores, pets e rotinas de remédios configuradas para envio de alarmes e lembretes de renovação
            </p>
          </div>
          <span className="text-xs font-semibold px-3 py-1 bg-amber-50 text-amber-900 border border-amber-200 rounded-full shrink-0">
            Unidade {filterUnit.toUpperCase()}
          </span>
        </div>

        {/* Estatísticas Rápidas de Clientes & Alertas */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-500 text-[11px] block">Pets Cadastrados:</span>
            <strong className="text-lg font-black text-slate-900">{pets.length}</strong>
            <p className="text-[10px] text-slate-400 mt-0.5">Com ficha ativa no app</p>
          </div>

          <div className="p-3.5 rounded-xl bg-emerald-50/70 border border-emerald-200">
            <span className="text-emerald-800 text-[11px] block">Alarmes de Doses Ativos:</span>
            <strong className="text-lg font-black text-emerald-950">{doseSchedules.length}</strong>
            <p className="text-[10px] text-emerald-700 mt-0.5">Notificações diárias no app</p>
          </div>

          <div className="p-3.5 rounded-xl bg-amber-50/80 border border-amber-200">
            <span className="text-amber-800 text-[11px] block">Remédio Acabando:</span>
            <strong className="text-lg font-black text-amber-950">
              {doseSchedules.filter(d => d.daysRemaining <= (d.lowStockAlertDays || 5)).length}
            </strong>
            <p className="text-[10px] text-amber-700 mt-0.5">Prontos para contato/recompra</p>
          </div>

          <div className="p-3.5 rounded-xl bg-teal-50/70 border border-teal-200">
            <span className="text-teal-800 text-[11px] block">Tutores Ativos:</span>
            <strong className="text-lg font-black text-teal-950">
              {new Set(pets.map(p => p.tutorName)).size}
            </strong>
            <p className="text-[10px] text-teal-700 mt-0.5">Com WhatsApp cadastrado</p>
          </div>
        </div>

        {/* Barra de Busca e Filtros de Clientes/Pets */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-1">
          <div className="relative flex-1">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={clientSearchTerm}
              onChange={(e) => setClientSearchTerm(e.target.value)}
              placeholder="Buscar por nome do tutor, pet ou medicamento..."
              className="w-full pl-9 pr-3 py-2 rounded-xl border border-slate-300 text-xs focus:ring-2 focus:ring-amber-500 focus:outline-hidden"
            />
          </div>

          <div className="flex items-center gap-1.5 overflow-x-auto text-xs shrink-0">
            <button
              onClick={() => setClientFilterStatus('all')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                clientFilterStatus === 'all'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:text-slate-900'
              }`}
            >
              Todos ({pets.length})
            </button>
            <button
              onClick={() => setClientFilterStatus('low_stock')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                clientFilterStatus === 'low_stock'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-amber-50 text-amber-800 hover:bg-amber-100/70'
              }`}
            >
              ⚠️ Remédio Acabando ({doseSchedules.filter(d => d.daysRemaining <= (d.lowStockAlertDays || 5)).length})
            </button>
            <button
              onClick={() => setClientFilterStatus('has_alarms')}
              className={`px-3 py-1.5 rounded-xl font-bold transition-all ${
                clientFilterStatus === 'has_alarms'
                  ? 'bg-amber-600 text-white shadow-2xs'
                  : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100/70'
              }`}
            >
              ⏰ Com Alarmes Ativos ({pets.filter(p => doseSchedules.some(s => s.petId === p.id)).length})
            </button>
          </div>
        </div>

        {/* Lista Detalhada de Pets e Clientes com Alertas */}
        <div className="space-y-4">
          {pets
            .filter((pet) => {
              const petSchedules = doseSchedules.filter((s) => s.petId === pet.id);
              const hasLowStock = petSchedules.some((s) => s.daysRemaining <= (s.lowStockAlertDays || 5));
              const hasAlarms = petSchedules.length > 0;

              if (clientFilterStatus === 'low_stock' && !hasLowStock) return false;
              if (clientFilterStatus === 'has_alarms' && !hasAlarms) return false;

              if (clientSearchTerm.trim()) {
                const term = clientSearchTerm.toLowerCase();
                const matchesPet = pet.name.toLowerCase().includes(term) || pet.breed.toLowerCase().includes(term);
                const matchesTutor = (pet.tutorName || '').toLowerCase().includes(term) || (pet.tutorPhone || '').includes(term);
                const matchesMed = petSchedules.some((s) => s.medicationName.toLowerCase().includes(term));
                return matchesPet || matchesTutor || matchesMed;
              }

              return true;
            })
            .map((pet) => {
              const petSchedules = doseSchedules.filter((s) => s.petId === pet.id);
              const hasLowStock = petSchedules.some((s) => s.daysRemaining <= (s.lowStockAlertDays || 5));
              const tutorPhone = pet.tutorPhone || '(19) 99123-4567';
              const tutorName = pet.tutorName || 'Mariana Duarte';

              const urgentSchedule = petSchedules.find((s) => s.daysRemaining <= (s.lowStockAlertDays || 5));
              const whatsAppText = urgentSchedule
                ? `Olá ${tutorName}! Aqui é da farmácia Amor ao Bicho (${PHARMACY_UNITS[selectedUnit].name}). Notamos que o tratamento do(a) ${pet.name} (${urgentSchedule.medicationName}) está a ${urgentSchedule.daysRemaining} dias do término. Gostaria de solicitar a manipulação da renovação da fórmula?`
                : `Olá ${tutorName}! Aqui é da farmácia Amor ao Bicho (${PHARMACY_UNITS[selectedUnit].name}). Estamos acompanhando os alarmes do(a) ${pet.name}. Como está indo o tratamento?`;

              return (
                <div
                  key={pet.id}
                  className={`p-4 sm:p-5 rounded-2xl border transition-all text-xs flex flex-col justify-between space-y-4 ${
                    hasLowStock
                      ? 'bg-amber-50/40 border-amber-300 shadow-2xs'
                      : 'bg-white border-slate-200 shadow-xs'
                  }`}
                >
                  <div className="flex flex-col md:flex-row md:items-start justify-between gap-4">
                    {/* Dados do Pet & Tutor */}
                    <div className="flex items-start gap-3.5">
                      <img
                        src={pet.photoUrl || 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?auto=format&fit=crop&w=150&q=80'}
                        alt={pet.name}
                        className="w-16 h-16 rounded-2xl object-cover border border-slate-200 shrink-0"
                      />
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-extrabold text-sm text-slate-900">🐾 {pet.name}</h3>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-slate-100 text-slate-700">
                            {pet.species} • {pet.breed}
                          </span>
                          <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded">
                            {pet.weightKg} kg • {pet.ageYears} anos
                          </span>
                        </div>

                        <p className="text-slate-600 text-xs">
                          Tutor(a) Responsável: <strong className="text-slate-900">{tutorName}</strong> • {tutorPhone}
                        </p>

                        <div className="flex items-center gap-2 pt-0.5 flex-wrap text-[11px] text-slate-500">
                          <span>Sabor favorito: <strong className="capitalize text-slate-700">{pet.favoriteFlavor || 'Carne'}</strong></span>
                          {pet.chronicCondition && (
                            <>
                              <span>•</span>
                              <span className="text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/50">
                                Crônico: {pet.chronicCondition}
                              </span>
                            </>
                          )}
                          {pet.allergies && (
                            <>
                              <span>•</span>
                              <span className="text-rose-800 bg-rose-50 px-2 py-0.5 rounded border border-rose-200/50">
                                Alergia: {pet.allergies}
                              </span>
                            </>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Botão de Contato Rápido no WhatsApp */}
                    <div className="shrink-0 flex items-center md:flex-col md:items-end justify-between gap-2">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full uppercase tracking-wider ${
                        hasLowStock
                          ? 'bg-amber-200 text-amber-950 border border-amber-300'
                          : petSchedules.length > 0
                          ? 'bg-emerald-100 text-emerald-900 border border-emerald-200'
                          : 'bg-slate-100 text-slate-600'
                      }`}>
                        {hasLowStock
                          ? '⚠️ Alerta: Remédio Acabando'
                          : petSchedules.length > 0
                          ? '🔔 Alarmes Ativos'
                          : '○ Sem Alarmes'}
                      </span>

                      <a
                        href={notificationService.buildWhatsAppUrl(tutorPhone, whatsAppText)}
                        target="_blank"
                        rel="noreferrer"
                        className="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-2xs"
                      >
                        <MessageSquare className="w-3.5 h-3.5" />
                        <span>Falar com Tutor no WhatsApp</span>
                      </a>
                    </div>
                  </div>

                  {/* Lista de Remédios e Alarmes Configurados para este Pet */}
                  <div className="pt-3 border-t border-slate-100 space-y-2">
                    <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                      Medicações e Alarmes Programados para {pet.name}:
                    </span>

                    {petSchedules.length === 0 ? (
                      <div className="p-3 rounded-xl bg-slate-50 text-slate-400 text-xs italic">
                        Nenhum alarme de remédio programado atualmente para este pet no aplicativo.
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2.5">
                        {petSchedules.map((schedule) => {
                          const isLow = schedule.daysRemaining <= (schedule.lowStockAlertDays || 5);
                          return (
                            <div
                              key={schedule.id}
                              className={`p-3 rounded-xl border flex flex-col justify-between space-y-2 ${
                                isLow
                                  ? 'bg-amber-100/60 border-amber-300 text-amber-950'
                                  : 'bg-slate-50 border-slate-200 text-slate-800'
                              }`}
                            >
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <strong className="text-xs font-bold text-slate-900 block">
                                    {schedule.medicationName}
                                  </strong>
                                  <span className="text-[11px] text-slate-500">
                                    {schedule.dosage} • Forma: {schedule.form.replace(/_/g, ' ')}
                                  </span>
                                </div>
                                <span className="font-mono font-bold text-xs bg-white px-2 py-0.5 rounded border border-slate-200 text-slate-800 shrink-0">
                                  🔔 {schedule.time}
                                </span>
                              </div>

                              <div className="flex items-center justify-between text-[11px] pt-1 border-t border-slate-200/50">
                                <span className="text-slate-600">
                                  {schedule.intervalHours === 24
                                    ? '1x ao dia'
                                    : schedule.intervalHours === 12
                                    ? '2x ao dia'
                                    : `${schedule.intervalHours}h em ${schedule.intervalHours}h`} • Doses: {schedule.dosesGiven}/{schedule.totalDoses}
                                </span>

                                <span className={`font-bold px-2 py-0.5 rounded text-[10px] ${
                                  isLow
                                    ? 'bg-amber-200 text-amber-950 font-black'
                                    : 'bg-emerald-100 text-emerald-900'
                                }`}>
                                  {isLow ? `⚠️ Restam ${schedule.daysRemaining} dias!` : `Estoque: ${schedule.daysRemaining}d`}
                                </span>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
        </div>
      </section>
    </div>
  );
};
