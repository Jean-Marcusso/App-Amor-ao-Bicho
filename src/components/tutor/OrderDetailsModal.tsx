import React, { useState } from 'react';
import { 
  X, 
  CheckCircle2, 
  Clock, 
  FlaskConical, 
  ShieldCheck, 
  Truck, 
  Copy, 
  QrCode, 
  CreditCard, 
  MessageSquare,
  AlertCircle
} from 'lucide-react';
import { PrescriptionOrder, OrderStatus } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';

interface OrderDetailsModalProps {
  order: PrescriptionOrder | null;
  isOpen: boolean;
  onClose: () => void;
  onSimulatePayPix: (orderId: string) => void;
}

export const OrderDetailsModal: React.FC<OrderDetailsModalProps> = ({
  order,
  isOpen,
  onClose,
  onSimulatePayPix
}) => {
  const [copiedPix, setCopiedPix] = useState(false);
  const [activeTab, setActiveTab] = useState<'tracking' | 'checkout'>('tracking');

  if (!isOpen || !order) return null;

  const unit = PHARMACY_UNITS[order.unit];

  const stages: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    {
      key: 'analise_farmaceutica',
      label: '1. Análise Farmacêutica',
      desc: `Conferência de dosagem e viabilidade técnica pela ${unit.technicalResponsible}`,
      icon: <Clock className="w-4 h-4" />
    },
    {
      key: 'em_manipulacao',
      label: '2. Em Manipulação',
      desc: 'Pesagem de precisão e homogeneização nos laboratórios de sólidos/líquidos',
      icon: <FlaskConical className="w-4 h-4" />
    },
    {
      key: 'controle_qualidade',
      label: '3. Controle de Qualidade',
      desc: 'Inspeção analítica, peso médio, teste de palatabilidade e emissão do laudo',
      icon: <ShieldCheck className="w-4 h-4" />
    },
    {
      key: 'pronto_retirada',
      label: '4. Pronto para Retirada / Saiu para Entrega',
      desc: order.shippingMethod.startsWith('retirada') 
        ? `Disponível no balcão da ${unit.name}` 
        : 'Em trânsito com motoboy especializado para a sua residência',
      icon: <Truck className="w-4 h-4" />
    },
    {
      key: 'concluido',
      label: '5. Tratamento em Casa',
      desc: 'Medicação entregue ao tutor e integrada à Hora do Remédio',
      icon: <CheckCircle2 className="w-4 h-4" />
    }
  ];

  const getStageIndex = (status: OrderStatus) => {
    switch (status) {
      case 'analise_farmaceutica': return 0;
      case 'em_manipulacao': return 1;
      case 'controle_qualidade': return 2;
      case 'pronto_retirada':
      case 'saiu_para_entrega': return 3;
      case 'concluido': return 4;
      default: return 0;
    }
  };

  const currentStageIdx = getStageIndex(order.status);

  const pixKey = order.pixCode || `00020126580014br.gov.bcb.pix0136amoraobicho-${order.unit}@pix.com.br520400005303986540${order.total.toFixed(2)}5802BR5921AMOR AO BICHO FARMACIA6008${order.unit.toUpperCase()}62070503***6304${order.code.slice(-4)}`;

  const handleCopyPix = () => {
    navigator.clipboard.writeText(pixKey);
    setCopiedPix(true);
    setTimeout(() => setCopiedPix(false), 2500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-2xl w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Header */}
        <div className="bg-[#0b4d3a] px-6 py-4 text-white flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-base">Pedido #{order.code}</span>
              <span className="text-[11px] bg-emerald-800 text-emerald-100 px-2 py-0.5 rounded font-mono">
                {order.unit.toUpperCase()}
              </span>
            </div>
            <p className="text-xs text-emerald-200 mt-0.5">
              Paciente: <strong>{order.petName}</strong> ({order.petSpecies} • {order.petWeightKg}kg)
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs px-6">
          <button
            onClick={() => setActiveTab('tracking')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'tracking'
                ? 'border-emerald-700 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Rastreamento da Manipulação
          </button>
          <button
            onClick={() => setActiveTab('checkout')}
            className={`py-3 px-4 font-semibold border-b-2 transition-colors ${
              activeTab === 'checkout'
                ? 'border-emerald-700 text-emerald-900 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            Orçamento & PIX Express
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6">
          {activeTab === 'tracking' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between bg-emerald-50/80 p-3.5 rounded-xl border border-emerald-200/60">
                <div>
                  <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
                    Status Atual:
                  </span>
                  <p className="font-bold text-sm text-emerald-950 mt-0.5">
                    {stages[currentStageIdx]?.label}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[11px] text-slate-500">Previsão:</span>
                  <p className="text-xs font-bold text-slate-800">{order.estimatedDeliveryDate}</p>
                </div>
              </div>

              {/* 5-step visual tracking timeline */}
              <div className="relative pl-6 space-y-6 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-200">
                {stages.map((stage, idx) => {
                  const isDone = idx < currentStageIdx;
                  const isCurrent = idx === currentStageIdx;
                  return (
                    <div key={stage.key} className="relative flex items-start gap-3">
                      <div
                        className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ring-4 ring-white ${
                          isDone
                            ? 'bg-emerald-600 text-white'
                            : isCurrent
                            ? 'bg-amber-500 text-white animate-pulse'
                            : 'bg-slate-200 text-slate-500'
                        }`}
                      >
                        {isDone ? '✓' : idx + 1}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <p className={`text-xs font-bold ${isCurrent ? 'text-amber-950' : isDone ? 'text-slate-800' : 'text-slate-400'}`}>
                            {stage.label}
                          </p>
                          {isCurrent && (
                            <span className="text-[10px] bg-amber-100 text-amber-800 font-semibold px-2 py-0.2 rounded">
                              Em andamento
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-500 mt-0.5">{stage.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Responsible Pharmacist footer stamp */}
              <div className="border-t border-slate-200 pt-4 flex items-center justify-between text-xs text-slate-500">
                <div>
                  <span>Laboratório: </span>
                  <strong className="text-slate-700">{unit.name} ({unit.city})</strong>
                </div>
                <div>
                  <span>Responsável Técnica: </span>
                  <strong className="text-emerald-800">{unit.technicalResponsible}</strong>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'checkout' && (
            <div className="space-y-5">
              {/* Items Breakdown */}
              <div className="border border-slate-200 rounded-xl overflow-hidden">
                <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 text-xs font-bold text-slate-700">
                  Composição da Fórmula Manipulada
                </div>
                <div className="divide-y divide-slate-100 p-4 space-y-3">
                  {order.items.map((it) => (
                    <div key={it.id} className="flex justify-between items-start text-xs">
                      <div>
                        <p className="font-bold text-slate-900">{it.description}</p>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {it.activeSubstance} • {it.quantity} {it.flavor ? `• Sabor ${it.flavor}` : ''}
                        </p>
                      </div>
                      <span className="font-bold text-slate-900">R$ {it.unitPrice.toFixed(2)}</span>
                    </div>
                  ))}

                  <div className="pt-2 flex justify-between items-center text-xs text-slate-600">
                    <span>Frete / Retirada ({order.shippingMethod.replace(/_/g, ' ')})</span>
                    <span>{order.shippingCost === 0 ? 'Grátis' : `R$ ${order.shippingCost.toFixed(2)}`}</span>
                  </div>

                  <div className="pt-2 flex justify-between items-center text-sm font-bold text-emerald-950 border-t border-slate-200">
                    <span>Valor Total do Pedido</span>
                    <span className="text-base text-emerald-700">R$ {order.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* PIX Payment section */}
              {order.paymentStatus === 'pago' ? (
                <div className="bg-emerald-50 border border-emerald-300 rounded-xl p-4 text-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-600 mx-auto mb-1.5" />
                  <p className="font-bold text-emerald-900 text-sm">Pagamento Confirmado via PIX!</p>
                  <p className="text-xs text-emerald-700 mt-0.5">
                    Sua fórmula já está em processo de manipulação laboratorial prioritária.
                  </p>
                </div>
              ) : (
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <QrCode className="w-5 h-5 text-emerald-700" />
                      <span className="font-bold text-xs text-slate-900">Pague com PIX Instantâneo</span>
                    </div>
                    <span className="text-[11px] text-emerald-700 font-semibold bg-emerald-100/70 px-2 py-0.5 rounded">
                      Liberação Imediata
                    </span>
                  </div>

                  <div className="flex flex-col sm:flex-row items-center gap-4 bg-white p-3 rounded-lg border border-slate-200">
                    {/* Simulated QR Code SVG */}
                    <div className="w-28 h-28 bg-emerald-950 p-2 rounded-lg shrink-0 flex items-center justify-center">
                      <div className="w-full h-full bg-white p-1 rounded flex flex-col justify-between">
                        <div className="flex justify-between">
                          <div className="w-5 h-5 bg-black" />
                          <div className="w-5 h-5 bg-black" />
                        </div>
                        <div className="text-[7px] text-center font-mono font-bold text-emerald-900">
                          PIX AMOR AO BICHO
                        </div>
                        <div className="flex justify-between">
                          <div className="w-5 h-5 bg-black" />
                          <div className="w-4 h-4 bg-emerald-700 rounded-full" />
                        </div>
                      </div>
                    </div>

                    <div className="flex-1 w-full space-y-2">
                      <p className="text-[11px] text-slate-600">
                        Copie o código abaixo e cole no aplicativo do seu banco:
                      </p>
                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={pixKey}
                          className="w-full bg-slate-100 border border-slate-300 rounded px-2.5 py-1.5 text-[10px] font-mono text-slate-700 focus:outline-hidden"
                        />
                        <button
                          onClick={handleCopyPix}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded text-xs font-semibold shrink-0 flex items-center gap-1"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>{copiedPix ? 'Copiado!' : 'Copiar'}</span>
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 flex justify-end">
                    <button
                      onClick={() => onSimulatePayPix(order.id)}
                      className="px-4 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-xs"
                    >
                      Simular Confirmação de Pagamento PIX ✓
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
