import React, { useState, useEffect } from 'react';
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
  Filter,
  Play,
  Pause,
  Zap,
  RefreshCw,
  Sparkles,
  ExternalLink,
  ArrowLeft,
  LayoutGrid,
  BarChart3,
  Beaker
} from 'lucide-react';
import { PrescriptionOrder, OrderStatus, PharmacyUnit } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';

type AdminSubTab = 'todos' | 'kanban' | 'automacao' | 'metricas' | 'vets';

interface AdminModuleProps {
  orders: PrescriptionOrder[];
  selectedUnit: PharmacyUnit;
  onUpdateOrderStatus: (orderId: string, newStatus: OrderStatus) => void;
  onApproveQuotePrice: (orderId: string, newPrice: number) => void;
  onBackToHome?: () => void;
}

export const AdminModule: React.FC<AdminModuleProps> = ({
  orders,
  selectedUnit,
  onUpdateOrderStatus,
  onApproveQuotePrice,
  onBackToHome
}) => {
  const [activeSubTab, setActiveSubTab] = useState<AdminSubTab>('todos');
  const [filterUnit, setFilterUnit] = useState<PharmacyUnit | 'todas'>(selectedUnit);
  const [selectedOrderForQuote, setSelectedOrderForQuote] = useState<PrescriptionOrder | null>(null);
  const [previewRxOrder, setPreviewRxOrder] = useState<PrescriptionOrder | null>(null);
  const [quoteInputPrice, setQuoteInputPrice] = useState<number>(110.0);
  const [quoteDeliveryHours, setQuoteDeliveryHours] = useState<number>(24);

  const formatDosageForm = (form?: string): string => {
    if (!form) return 'Formulação sob Medida';
    const map: Record<string, string> = {
      biscoito_palatavel: 'Biscoito Palatável',
      pasta_oral: 'Pasta Oral',
      gel_transdermico: 'Gel Transdérmico (Orelha)',
      xarope_suspensao: 'Xarope / Suspensão',
      capsula: 'Cápsula',
      solucao_otologica: 'Solução Otológica',
      pomada_topica: 'Pomada Tópica',
      colirio: 'Colírio'
    };
    return map[form] || form.replace(/_/g, ' ');
  };

  const formatFlavor = (flavor?: string): string => {
    if (!flavor) return 'Sem sabor específico';
    const map: Record<string, string> = {
      carne: 'Carne',
      frango: 'Frango',
      bacon: 'Bacon',
      figado: 'Fígado',
      peixe_salmao: 'Peixe / Salmão',
      doce_de_leite: 'Doce de Leite',
      baunilha: 'Baunilha',
      frutas_vermelhas: 'Frutas Vermelhas',
      tutti_frutti: 'Tutti-Frutti',
      sem_sabor: 'Sem Sabor'
    };
    return map[flavor] || flavor.replace(/_/g, ' ');
  };

  const formatShipping = (shipping?: string): string => {
    if (!shipping) return 'A combinar';
    const map: Record<string, string> = {
      retirada_americana: 'Retirada na Unidade Americana (Balcão)',
      retirada_valinhos: 'Retirada na Unidade Valinhos (Balcão)',
      entrega_expressa_rmc: 'Entrega Expressa RMC (Motoboy)',
      sedex: 'SEDEX Correios'
    };
    return map[shipping] || shipping.replace(/_/g, ' ');
  };

  const filteredOrders = orders.filter(o => filterUnit === 'todas' || o.unit === filterUnit);

  const pendingQuotes = filteredOrders.filter(o => o.status === 'analise_farmaceutica' || o.paymentStatus === 'aguardando_analise');
  const inProduction = filteredOrders.filter(o => o.status === 'em_manipulacao');
  const inQualityControl = filteredOrders.filter(o => o.status === 'controle_qualidade');
  const readyOrShipping = filteredOrders.filter(o => o.status === 'pronto_retirada' || o.status === 'saiu_para_entrega');
  const completed = filteredOrders.filter(o => o.status === 'concluido');

  // Métricas de BI
  const totalRevenue = filteredOrders.reduce((acc, curr) => acc + curr.total, 0);
  const conversionRate = 82.5;

  // Estados da Automação de Linha de Produção
  const [isAutoRunning, setIsAutoRunning] = useState(false);
  const [autoSpeedSeconds, setAutoSpeedSeconds] = useState(4);
  const [autoProcessedCount, setAutoProcessedCount] = useState(0);

  // Função para avançar automaticamente o próximo pedido da esteira
  const advanceNextOrderInPipeline = () => {
    // 1. Procura primeiro pedido em análise farmacêutica
    const firstPending = filteredOrders.find(o => o.status === 'analise_farmaceutica');
    if (firstPending) {
      onUpdateOrderStatus(firstPending.id, 'em_manipulacao');
      notificationService.playAlertSound();
      setAutoProcessedCount(c => c + 1);
      return;
    }

    // 2. Procura em manipulação laboratorial
    const firstManip = filteredOrders.find(o => o.status === 'em_manipulacao');
    if (firstManip) {
      onUpdateOrderStatus(firstManip.id, 'controle_qualidade');
      notificationService.playAlertSound();
      setAutoProcessedCount(c => c + 1);
      return;
    }

    // 3. Procura em controle de qualidade
    const firstQC = filteredOrders.find(o => o.status === 'controle_qualidade');
    if (firstQC) {
      const nextStatus: OrderStatus = firstQC.shippingMethod.startsWith('retirada') 
        ? 'pronto_retirada' 
        : 'saiu_para_entrega';
      onUpdateOrderStatus(firstQC.id, nextStatus);
      notificationService.playAlertSound();
      setAutoProcessedCount(c => c + 1);
      return;
    }

    // 4. Procura pronto ou saiu para entrega
    const firstReady = filteredOrders.find(o => o.status === 'pronto_retirada' || o.status === 'saiu_para_entrega');
    if (firstReady) {
      onUpdateOrderStatus(firstReady.id, 'concluido');
      notificationService.playAlertSound();
      setAutoProcessedCount(c => c + 1);
      return;
    }

    // Se todos estiverem concluídos
    setIsAutoRunning(false);
  };

  useEffect(() => {
    if (!isAutoRunning) return;
    const interval = setInterval(() => {
      advanceNextOrderInPipeline();
    }, autoSpeedSeconds * 1000);
    return () => clearInterval(interval);
  }, [isAutoRunning, autoSpeedSeconds, filteredOrders]);

  const handleOpenQuoteModal = (order: PrescriptionOrder) => {
    setSelectedOrderForQuote(order);
    setQuoteInputPrice(order.total || 95.0);
  };

  const handleSaveAndDispatchQuote = () => {
    if (!selectedOrderForQuote) return;
    onApproveQuotePrice(selectedOrderForQuote.id, quoteInputPrice);
    setSelectedOrderForQuote(null);
  };

  const handleOpenWhatsAppMessage = (order: PrescriptionOrder) => {
    const lastLog = order.whatsappLogs[order.whatsappLogs.length - 1];
    const text = lastLog ? lastLog.message : `Atualização do pedido ${order.code} da farmácia Amor ao Bicho.`;
    const url = notificationService.buildWhatsAppUrl(order.tutorPhone, text);
    window.open(url, '_blank');
  };

  const subTabs: { key: AdminSubTab; label: string; icon: React.ReactNode }[] = [
    { key: 'todos', label: 'Visão Geral', icon: <LayoutGrid className="w-3.5 h-3.5" /> },
    { key: 'kanban', label: 'Esteira & Triagem', icon: <FlaskConical className="w-3.5 h-3.5" /> },
    { key: 'automacao', label: 'Automação da Esteira', icon: <Zap className="w-3.5 h-3.5" /> },
    { key: 'metricas', label: 'Métricas & Indicadores', icon: <BarChart3 className="w-3.5 h-3.5" /> },
    { key: 'vets', label: 'Veterinários Parceiros', icon: <Users className="w-3.5 h-3.5" /> },
  ];

  return (
    <div className="space-y-8 pb-16">
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

      {/* SUB-MENU DA FARMÁCIA */}
      <nav className="flex items-center gap-1.5 p-1.5 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-x-auto">
        {subTabs.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setActiveSubTab(tab.key)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              activeSubTab === tab.key
                ? 'bg-amber-600 text-white shadow-sm'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            {tab.icon}
            {tab.label}
          </button>
        ))}
      </nav>

      {/* DASHBOARD DE MÉTRICAS / BI DA FARMÁCIA */}
      {(activeSubTab === 'todos' || activeSubTab === 'metricas') && (
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
      )}

      {/* ESTEIRA LABORATORIAL AUTOMATIZADA (PIPELINE AUTO-RUN) */}
      {(activeSubTab === 'todos' || activeSubTab === 'automacao') && (
      <section className="bg-gradient-to-r from-slate-900 via-[#0d2a22] to-slate-900 text-white p-5 sm:p-6 rounded-2xl shadow-lg border border-emerald-500/30 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 shadow-md ${
              isAutoRunning 
                ? 'bg-emerald-500 text-white animate-pulse' 
                : 'bg-slate-800 text-slate-300 border border-slate-700'
            }`}>
              <Zap className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-white flex items-center gap-2">
                  Automação da Linha de Produção Laboratorial
                </h2>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                  isAutoRunning 
                    ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/50' 
                    : 'bg-slate-700 text-slate-300 border border-slate-600'
                }`}>
                  {isAutoRunning ? '● Esteira Operando em Tempo Real' : '○ Modo Manual'}
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-0.5">
                Avança os pedidos automaticamente pela esteira laboratorial, emitindo laudos de controle de qualidade e liberando para entrega.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Seletor de velocidade */}
            <div className="flex items-center bg-slate-800 border border-slate-700 rounded-xl p-1 text-xs">
              <span className="text-[11px] text-slate-400 px-2 font-medium">Ciclo:</span>
              <button
                type="button"
                onClick={() => setAutoSpeedSeconds(2)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  autoSpeedSeconds === 2 ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                2s Turbo
              </button>
              <button
                type="button"
                onClick={() => setAutoSpeedSeconds(4)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  autoSpeedSeconds === 4 ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                4s Padrão
              </button>
              <button
                type="button"
                onClick={() => setAutoSpeedSeconds(8)}
                className={`px-2 py-1 rounded-lg font-bold text-[11px] transition-all ${
                  autoSpeedSeconds === 8 ? 'bg-emerald-600 text-white' : 'text-slate-300 hover:text-white'
                }`}
              >
                8s Lento
              </button>
            </div>

            {/* Botão de avanço imediato com 1 clique */}
            <button
              type="button"
              onClick={advanceNextOrderInPipeline}
              className="px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0"
              title="Avança a próxima etapa do primeiro pedido pendente"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Avançar 1 Etapa</span>
            </button>

            {/* Botão Play / Pause */}
            <button
              type="button"
              onClick={() => setIsAutoRunning(!isAutoRunning)}
              className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-1.5 shadow-sm transition-all shrink-0 ${
                isAutoRunning
                  ? 'bg-rose-600 hover:bg-rose-700 text-white'
                  : 'bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black'
              }`}
            >
              {isAutoRunning ? (
                <>
                  <Pause className="w-4 h-4" />
                  <span>Pausar Esteira</span>
                </>
              ) : (
                <>
                  <Play className="w-4 h-4 fill-current" />
                  <span>Iniciar Automação</span>
                </>
              )}
            </button>
          </div>
        </div>

        {autoProcessedCount > 0 && (
          <div className="pt-2 border-t border-emerald-900/40 flex items-center justify-between text-xs text-slate-300">
            <span className="flex items-center gap-1.5 text-emerald-300 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              Total de etapas concluídas na esteira: <strong>{autoProcessedCount}</strong>
            </span>
            <span className="text-slate-400">
              Unidade atual: <strong className="text-white capitalize">{filterUnit}</strong>
            </span>
          </div>
        )}
      </section>
      )}

      {/* KANBAN OPERACIONAL DE PRODUÇÃO E LABORATÓRIO */}
      {(activeSubTab === 'todos' || activeSubTab === 'kanban') && (
      <section className="space-y-4">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <FlaskConical className="w-5 h-5 text-emerald-700" />
            Esteira Laboratorial de Manipulação (Kanban)
          </h2>
          <p className="text-xs text-slate-500">
            Acompanhamento e evolução das fórmulas pelas bancadas do laboratório Amor ao Bicho
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

            <div className="space-y-3">
              {pendingQuotes.map((order) => (
                <div key={order.id} className="bg-white p-3.5 rounded-2xl border border-slate-200 shadow-xs space-y-3 text-xs">
                  {/* Cabeçalho do Card */}
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-sm font-black text-slate-900">{order.code}</span>
                      <p className="text-[10px] text-slate-400">{order.createdAt}</p>
                    </div>
                    <span className="text-emerald-800 bg-emerald-50 border border-emerald-200 font-bold uppercase text-[10px] px-2 py-0.5 rounded-md">
                      {order.unit}
                    </span>
                  </div>

                  {/* Dados do Paciente e Tutor */}
                  <div className="bg-slate-50 p-2.5 rounded-xl border border-slate-100 space-y-1">
                    <p className="text-slate-800 font-bold flex items-center justify-between">
                      <span>🐾 {order.petName}</span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {order.petSpecies || 'Pet'} • {order.petWeightKg} kg
                      </span>
                    </p>
                    <p className="text-slate-500 text-[11px]">
                      Tutor: <strong className="text-slate-700">{order.tutorName}</strong> • {order.tutorPhone}
                    </p>
                  </div>

                  {/* BOX DO RESUMO DO QUE O TUTOR SOLICITOU */}
                  <div className="bg-amber-50/70 border border-amber-200/90 rounded-xl p-2.5 space-y-2 text-amber-950">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-[11px] uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                        <FileText className="w-3.5 h-3.5 text-amber-700" />
                        Resumo do que o Tutor Solicitou:
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-1.5 text-[11px]">
                      <div className="bg-white/90 p-2 rounded-lg border border-amber-200/60">
                        <span className="text-[10px] text-slate-500 block">Forma Escolhida:</span>
                        <strong className="text-emerald-900">{formatDosageForm(order.preferredForm)}</strong>
                      </div>
                      <div className="bg-white/90 p-2 rounded-lg border border-amber-200/60">
                        <span className="text-[10px] text-slate-500 block">Sabor Escolhido:</span>
                        <strong className="text-amber-900">{formatFlavor(order.preferredFlavor)}</strong>
                      </div>
                    </div>

                    <div className="text-[11px] bg-white/90 p-2 rounded-lg border border-amber-200/60">
                      <span className="text-[10px] text-slate-500 block">Forma de Retirada / Envio:</span>
                      <strong className="text-slate-800">{formatShipping(order.shippingMethod)}</strong>
                    </div>

                    {order.items[0]?.description && (
                      <div className="text-[11px] bg-white/90 p-2 rounded-lg border border-amber-200/60">
                        <span className="text-[10px] text-slate-500 block">Fórmula Prescrita:</span>
                        <p className="font-medium text-slate-800 line-clamp-2">{order.items[0]?.description}</p>
                      </div>
                    )}

                    {order.notes && (
                      <div className="text-[11px] bg-amber-100/70 p-2 rounded-lg border border-amber-300/70 text-amber-950">
                        <span className="text-[10px] font-bold text-amber-900 block">Observação do Tutor:</span>
                        <p className="italic">"{order.notes}"</p>
                      </div>
                    )}

                    {/* Botões de Ver Foto ou Link da Receita */}
                    {order.prescriptionImageUrl && (
                      <button
                        type="button"
                        onClick={() => setPreviewRxOrder(order)}
                        className="w-full py-1.5 px-2 bg-white hover:bg-amber-100/60 border border-amber-300 rounded-lg text-amber-900 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all shadow-2xs"
                      >
                        <Eye className="w-3.5 h-3.5 text-amber-700" />
                        <span>Ver Foto da Receita Original</span>
                      </button>
                    )}

                    {order.prescriptionExternalLink && (
                      <a
                        href={order.prescriptionExternalLink}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full py-1.5 px-2 bg-white hover:bg-slate-50 border border-slate-300 rounded-lg text-blue-800 font-bold text-[11px] flex items-center justify-center gap-1.5 transition-all"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Abrir Link da Receita Digital</span>
                      </a>
                    )}
                  </div>

                  {/* Ações da Farmacêutica */}
                  <div className="pt-2 flex items-center justify-between border-t border-slate-100 gap-2">
                    <button
                      onClick={() => handleOpenQuoteModal(order)}
                      className="flex-1 py-2 px-3 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-[11px] font-bold shadow-2xs transition-all flex items-center justify-center gap-1.5"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      <span>Preencher Orçamento</span>
                    </button>
                    <button
                      onClick={() => onUpdateOrderStatus(order.id, 'em_manipulacao')}
                      className="py-2 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 rounded-xl text-[11px] font-bold transition-all"
                      title="Aprovar direto e enviar ao laboratório"
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
      )}

      {/* TOP PRESCritores VETERINÁRIOS DA RMC */}
      {(activeSubTab === 'todos' || activeSubTab === 'vets') && (
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
      )}

      {/* MODAL DE CONFERÊNCIA & LANÇAMENTO DE ORÇAMENTO FARMACÊUTICO */}
      {selectedOrderForQuote && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl max-w-3xl w-full p-6 space-y-4 shadow-2xl border border-slate-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center border-b pb-3 border-slate-200">
              <div className="flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold text-xs">
                  AB
                </span>
                <div>
                  <h3 className="font-bold text-base text-slate-900">
                    Conferência Farmacêutica & Orçamento ({selectedOrderForQuote.code})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Compare o que o médico prescreveu com as preferências indicadas pelo tutor
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedOrderForQuote(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* COLUNA ESQUERDA: FOTO DA RECEITA MÉDICA */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-xs text-slate-800 flex items-center gap-1.5">
                    <FileText className="w-3.5 h-3.5 text-emerald-700" />
                    Receita Médica Veterinária:
                  </span>
                  <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded">
                    Documento Original
                  </span>
                </div>

                {selectedOrderForQuote.prescriptionImageUrl ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden bg-slate-950 flex items-center justify-center max-h-72">
                    <img
                      src={selectedOrderForQuote.prescriptionImageUrl}
                      alt="Receita Médica"
                      className="max-h-72 w-auto object-contain cursor-zoom-in"
                      onClick={() => setPreviewRxOrder(selectedOrderForQuote)}
                      title="Clique para ampliar em tela cheia"
                    />
                  </div>
                ) : (
                  <div className="p-8 border-2 border-dashed border-slate-200 rounded-xl text-center text-slate-400 text-xs">
                    Nenhum anexo de imagem enviado.
                  </div>
                )}

                {selectedOrderForQuote.prescriptionExternalLink && (
                  <a
                    href={selectedOrderForQuote.prescriptionExternalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2 px-3 bg-blue-50 hover:bg-blue-100 border border-blue-200 text-blue-900 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Ver Receita Digital (VetSmart / Mevo)</span>
                  </a>
                )}
              </div>

              {/* COLUNA DIREITA: RESUMO DO QUE O TUTOR SOLICITOU & PREÇO */}
              <div className="space-y-3 text-xs">
                {/* Resumo do Tutor */}
                <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-3.5 space-y-2 text-amber-950">
                  <h4 className="font-bold text-xs uppercase tracking-wider text-amber-900 flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    Resumo do que o Tutor Solicitou:
                  </h4>

                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-white/90 p-2 rounded-lg border border-amber-200/50">
                      <span className="text-[10px] text-slate-500 block">Paciente:</span>
                      <strong>🐾 {selectedOrderForQuote.petName} ({selectedOrderForQuote.petWeightKg} kg)</strong>
                    </div>
                    <div className="bg-white/90 p-2 rounded-lg border border-amber-200/50">
                      <span className="text-[10px] text-slate-500 block">Tutor:</span>
                      <strong>{selectedOrderForQuote.tutorName}</strong>
                    </div>
                    <div className="bg-white/90 p-2 rounded-lg border border-amber-200/50">
                      <span className="text-[10px] text-slate-500 block">Forma Escolhida:</span>
                      <strong className="text-emerald-900">{formatDosageForm(selectedOrderForQuote.preferredForm)}</strong>
                    </div>
                    <div className="bg-white/90 p-2 rounded-lg border border-amber-200/50">
                      <span className="text-[10px] text-slate-500 block">Sabor Escolhido:</span>
                      <strong className="text-amber-900">{formatFlavor(selectedOrderForQuote.preferredFlavor)}</strong>
                    </div>
                  </div>

                  <div className="bg-white/90 p-2 rounded-lg border border-amber-200/50">
                    <span className="text-[10px] text-slate-500 block">Entrega / Retirada:</span>
                    <strong>{formatShipping(selectedOrderForQuote.shippingMethod)}</strong>
                  </div>

                  {selectedOrderForQuote.notes && (
                    <div className="bg-amber-100/70 p-2 rounded-lg border border-amber-300/60">
                      <span className="text-[10px] font-bold text-amber-900 block">Observação do Tutor:</span>
                      <p className="italic">"{selectedOrderForQuote.notes}"</p>
                    </div>
                  )}
                </div>

                {/* Formulário de Cálculo do Orçamento */}
                <div className="space-y-3 pt-1">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Valor Final Calculado da Fórmula (R$):
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
                      Prazo de Manipulação na Bancada:
                    </label>
                    <select
                      value={quoteDeliveryHours}
                      onChange={(e) => setQuoteDeliveryHours(Number(e.target.value))}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                    >
                      <option value={12}>12 horas úteis (Produção Expressa)</option>
                      <option value={24}>24 horas úteis (Padrão Laboratorial)</option>
                      <option value={48}>48 horas úteis (Fórmula complexa)</option>
                    </select>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl text-xs text-emerald-800">
              Ao clicar em <strong>Disponibilizar ao Tutor</strong>, o app gerará automaticamente o valor aprovado e liberará o pagamento PIX no app do tutor.
            </div>

            <div className="pt-2 flex justify-end gap-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setSelectedOrderForQuote(null)}
                className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleSaveAndDispatchQuote}
                className="px-6 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-sm transition-all"
              >
                Disponibilizar ao Tutor ✓
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE VISUALIZAÇÃO AMPLIADA DA RECEITA MÉDICA */}
      {previewRxOrder && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-center border-b pb-3 border-slate-200">
              <div>
                <h3 className="font-bold text-base text-slate-900">
                  Receita Médica Original ({previewRxOrder.code})
                </h3>
                <p className="text-xs text-slate-500">
                  Paciente: {previewRxOrder.petName} ({previewRxOrder.petWeightKg}kg) • Tutor: {previewRxOrder.tutorName}
                </p>
              </div>
              <button
                onClick={() => setPreviewRxOrder(null)}
                className="text-slate-400 hover:text-slate-700 font-bold p-1 rounded-lg"
              >
                ✕
              </button>
            </div>

            {previewRxOrder.prescriptionImageUrl ? (
              <div className="rounded-xl overflow-hidden bg-black flex items-center justify-center max-h-[60vh] border border-slate-300">
                <img
                  src={previewRxOrder.prescriptionImageUrl}
                  alt="Receita Médica Veterinária"
                  className="max-h-[60vh] w-auto object-contain"
                />
              </div>
            ) : (
              <div className="p-8 text-center text-slate-400 text-xs">
                Nenhuma imagem anexada.
              </div>
            )}

            <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
              <div>
                <span className="font-bold text-slate-800 block">Forma e Sabor Solicitados pelo Tutor:</span>
                <span className="text-emerald-800 font-semibold">{formatDosageForm(previewRxOrder.preferredForm)}</span>
                <span className="text-slate-400 mx-1.5">•</span>
                <span className="text-amber-800 font-semibold">{formatFlavor(previewRxOrder.preferredFlavor)}</span>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  type="button"
                  onClick={() => setPreviewRxOrder(null)}
                  className="px-4 py-2 border border-slate-300 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-100 transition-all flex-1 sm:flex-none"
                >
                  Fechar
                </button>
                <button
                  type="button"
                  onClick={() => {
                    handleOpenQuoteModal(previewRxOrder);
                    setPreviewRxOrder(null);
                  }}
                  className="px-5 py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-2xs transition-all flex-1 sm:flex-none"
                >
                  Lançar Orçamento Deste Pedido →
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
