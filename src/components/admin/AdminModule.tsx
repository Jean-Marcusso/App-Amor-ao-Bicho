import React, { useState } from 'react';
import { 
  Building2, 
  Clock, 
  FlaskConical, 
  ShieldCheck, 
  Truck, 
  CheckCircle2, 
  DollarSign, 
  MessageSquare, 
  TrendingUp, 
  Users, 
  FileText, 
  Send,
  Eye,
  Check,
  Filter
} from 'lucide-react';
import { PrescriptionOrder, OrderStatus, PharmacyUnit } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';

interface AdminModuleProps {
  orders: PrescriptionOrder[];
  selectedUnit: PharmacyUnit;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onApproveQuotePrice: (orderId: string, newPrice: number) => void;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
  orders,
  selectedUnit,
  onUpdateOrderStatus,
  onApproveQuotePrice
}) => {
  const [filterUnit, setFilterUnit] = useState<PharmacyUnit | 'todas'>(selectedUnit);
  const [selectedOrderForQuote, setSelectedOrderForQuote] = useState<PrescriptionOrder | null>(null);
  const [quoteInputPrice, setQuoteInputPrice] = useState<number>(110.0);
  const [quoteDeliveryHours, setQuoteDeliveryHours] = useState<number>(24);

  const filteredOrders = orders.filter(o => filterUnit === 'todas' || o.unit === filterUnit);

  const pendingQuotes = filteredOrders.filter(o => o.status === 'analise_farmaceutica' || o.paymentStatus === 'aguardando_analise');
  const inProduction = filteredOrders.filter(o => o.status === 'em_manipulacao');
  const inQualityControl = filteredOrders.filter(o => o.status === 'controle_qualidade');
  const readyOrShipping = filteredOrders.filter(o => o.status === 'pronto_retirada' || o.status === 'saiu_para_entrega');
  const completed = filteredOrders.filter(o => o.status === 'concluido');

  // Métricas de BI
  const totalRevenue = filteredOrders.reduce((acc, curr) => acc + curr.total, 0);
  const conversionRate = 82.5;

  const handleOpenQuoteModal = (order: PrescriptionOrder) => {
    setSelectedOrderForQuote(order);
    setQuoteInputPrice(order.total || 95.0);
  };

  const handleSaveAndDispatchQuote = () => {
    if (!selectedOrderForQuote) return;
    onApproveQuotePrice(selectedOrderForQuote.id, quoteInputPrice);
    setSelectedOrderForQuote(null);
  };

  return (
    <div className="space-y-8 pb-16">
      {/* Top Banner do Backoffice Farmácia */}
      <div className="bg-slate-900 text-white rounded-2xl p-5 sm:p-6 shadow-md flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-md">
            <Building2 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-bold">Backoffice Laboratorial & Gestão de Fórmulas</h1>
              <span className="text-[11px] bg-amber-500/20 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded-full font-semibold">
                ERP Integrado
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

      {/* DASHBOARD DE MÉTRICAS / BI DA FARMÁCIA */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Fórmulas em Fila</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{filteredOrders.length}</p>
            <span className="text-[11px] text-emerald-600 font-semibold">Americana e Valinhos</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center">
            <FlaskConical className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Conversão de Orçamentos</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{conversionRate}%</p>
            <span className="text-[11px] text-emerald-600 font-semibold">+4.2% este mês</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
            <TrendingUp className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Faturamento Cotado</span>
            <p className="text-2xl font-black text-slate-900 mt-0.5">R$ {totalRevenue.toFixed(2)}</p>
            <span className="text-[11px] text-slate-400 font-semibold">PIX + Cartão</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <DollarSign className="w-5 h-5" />
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
          <div>
            <span className="text-xs text-slate-500">Forma Mais Solicitada</span>
            <p className="text-base font-bold text-slate-900 mt-1">Biscoito Palatável</p>
            <span className="text-[11px] text-teal-700 font-semibold">44% dos pedidos</span>
          </div>
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-700 flex items-center justify-center">
            <CheckCircle2 className="w-5 h-5" />
          </div>
        </div>
      </section>

      {/* KANBAN OPERACIONAL DE PRODUÇÃO E LABORATÓRIO */}
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-700" />
            Esteira Laboratorial de Manipulação (Kanban)
          </h2>
          <p className="text-xs text-slate-500">
            Avançar a etapa dispara automaticamente notificação no WhatsApp do cliente via Z-API / Evolution API
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Coluna 1: Análise Farmacêutica */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-amber-600" />
                1. Triagem & Cotação
              </span>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {pendingQuotes.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {pendingQuotes.map((order) => (
                <div key={order.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{order.code}</span>
                    <span className="text-emerald-700 uppercase text-[10px]">{order.unit}</span>
                  </div>
                  <p className="text-slate-700"><strong>Pet:</strong> {order.petName} ({order.petWeightKg}kg)</p>
                  <p className="text-slate-500 text-[11px]">Tutor: {order.tutorName} • {order.tutorPhone}</p>
                  
                  <div className="pt-2 flex justify-between items-center border-t border-slate-100">
                    <button
                      onClick={() => handleOpenQuoteModal(order)}
                      className="px-2.5 py-1 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-[11px] font-bold"
                    >
                      Preencher Orçamento
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'em_manipulacao')}
                      className="text-[11px] text-emerald-700 font-bold hover:underline"
                    >
                      Aprovar →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 2: Em Manipulação */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <FlaskConical className="w-3.5 h-3.5 text-teal-600" />
                2. No Laboratório
              </span>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {inProduction.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {inProduction.map((order) => (
                <div key={order.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{order.code}</span>
                    <span className="text-emerald-700 uppercase text-[10px]">{order.unit}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{order.petName}</p>
                  <p className="text-slate-500 text-[11px] line-clamp-1">{order.items[0]?.description}</p>

                  <div className="pt-2 flex justify-end border-t border-slate-100">
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'controle_qualidade')}
                      className="px-2.5 py-1 bg-teal-700 hover:bg-teal-800 text-white rounded-lg text-[11px] font-bold"
                    >
                      Concluir Mistura → CQ
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 3: Controle de Qualidade */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                3. Controle de Qualidade
              </span>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {inQualityControl.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {inQualityControl.map((order) => (
                <div key={order.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{order.code}</span>
                    <span className="text-emerald-700 uppercase text-[10px]">{order.unit}</span>
                  </div>
                  <p className="text-slate-700 font-medium">{order.petName} (Laudo Pendente)</p>

                  <div className="pt-2 flex justify-end border-t border-slate-100">
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'pronto_retirada')}
                      className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-[11px] font-bold"
                    >
                      Aprovar Laudo & Liberar
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Coluna 4: Expedição / Entrega */}
          <div className="bg-slate-100/70 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-indigo-600" />
                4. Retirada / Motoboy
              </span>
              <span className="text-xs font-bold bg-white px-2 py-0.5 rounded-full border border-slate-200">
                {readyOrShipping.length}
              </span>
            </div>

            <div className="space-y-2.5">
              {readyOrShipping.map((order) => (
                <div key={order.id} className="bg-white p-3 rounded-xl border border-slate-200 shadow-xs space-y-2 text-xs">
                  <div className="flex justify-between font-bold text-slate-900">
                    <span>{order.code}</span>
                    <span className="text-emerald-700 uppercase text-[10px]">{order.unit}</span>
                  </div>
                  <p className="text-slate-700">{order.shippingMethod.replace(/_/g, ' ')}</p>

                  <div className="pt-2 flex justify-end border-t border-slate-100">
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'concluido')}
                      className="px-2.5 py-1 bg-indigo-700 hover:bg-indigo-800 text-white rounded-lg text-[11px] font-bold"
                    >
                      Marcar como Entregue ✓
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* TOP PRESCritores VETERINÁRIOS DA RMC */}
      <section className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
          <Users className="w-5 h-5 text-teal-700" />
          Top Médicos-Veterinários Prescritores Parceiros (Americana, Valinhos e RMC)
        </h2>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
          {[
            { name: 'Dr. Lucas Silveira', crmv: 'CRMV-SP 38.920', clinic: 'Centro Vet São Francisco (Americana)', rxCount: 42, favoriteForm: 'Biscoitos Articulares' },
            { name: 'Dra. Beatriz Nogueira', crmv: 'CRMV-SP 41.108', clinic: 'Clínica Felinos & Cia (Valinhos)', rxCount: 38, favoriteForm: 'Gel Transdérmico Auricular' },
            { name: 'Dr. Roberto Vasconcelos', crmv: 'CRMV-SP 29.840', clinic: 'Hospital Veterinário RMC (Campinas)', rxCount: 29, favoriteForm: 'Pastas Orais Saborizadas' }
          ].map((vet, i) => (
            <div key={i} className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-bold text-slate-900">{vet.name}</h3>
                  <span className="text-teal-700 font-semibold">{vet.crmv}</span>
                </div>
                <span className="font-mono font-bold text-xs bg-teal-100 text-teal-900 px-2 py-0.5 rounded">
                  {vet.rxCount} receitas
                </span>
              </div>
              <p className="text-slate-500 text-[11px]">{vet.clinic}</p>
              <p className="text-slate-600 text-[11px]">
                <strong>Preferência:</strong> {vet.favoriteForm}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* MODAL DE DIGITAÇÃO DE ORÇAMENTO FARMACÊUTICO */}
      {selectedOrderForQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3 border-slate-200">
              <h3 className="font-bold text-base text-slate-900">
                Lançar Orçamento Farmacêutico ({selectedOrderForQuote.code})
              </h3>
              <button
                onClick={() => setSelectedOrderForQuote(null)}
                className="text-slate-400 hover:text-slate-700 font-bold"
              >
                ✕
              </button>
            </div>

            <div className="text-xs space-y-2">
              <p><strong>Paciente:</strong> {selectedOrderForQuote.petName} ({selectedOrderForQuote.petWeightKg}kg)</p>
              <p><strong>Tutor:</strong> {selectedOrderForQuote.tutorName} ({selectedOrderForQuote.tutorPhone})</p>
              <p><strong>Forma Solicitada:</strong> {selectedOrderForQuote.preferredForm}</p>
            </div>

            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Valor Calculado da Fórmula (R$):
                </label>
                <input
                  type="number"
                  step="0.5"
                  value={quoteInputPrice}
                  onChange={(e) => setQuoteInputPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm font-bold text-emerald-900 rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Prazo de Manipulação no Laboratório:
                </label>
                <select
                  value={quoteDeliveryHours}
                  onChange={(e) => setQuoteDeliveryHours(Number(e.target.value))}
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value={12}>12 horas úteis (Expressa)</option>
                  <option value={24}>24 horas úteis (Padrão)</option>
                  <option value={48}>48 horas úteis (Fórmula complexa)</option>
                </select>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800">
              Ao clicar em <strong>Disponibilizar ao Tutor</strong>, o app gerará automaticamente o QR Code PIX e disparará a mensagem no WhatsApp do tutor.
            </div>

            <div className="pt-2 flex justify-end gap-2">
              <button
                onClick={() => setSelectedOrderForQuote(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700"
              >
                Cancelar
              </button>
              <button
                onClick={handleSaveAndDispatchQuote}
                className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold"
              >
                Disponibilizar ao Tutor ✓
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
