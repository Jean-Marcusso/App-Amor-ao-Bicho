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
  Cookie, 
  RefreshCw,
  ExternalLink,
  BookOpen,
  Bell,
  Volume2,
  MessageSquare
} from 'lucide-react';
import { Pet, PrescriptionOrder, DoseSchedule, PharmacyUnit } from '../../types';
import { PHARMACEUTICAL_FORMS_INFO, BLOG_POSTS, PHARMACY_UNITS } from '../../data/mockData';
import { notificationService } from '../../services/notificationService';

interface TutorDashboardProps {
  pets: Pet[];
  orders: PrescriptionOrder[];
  doseSchedules: DoseSchedule[];
  selectedUnit: PharmacyUnit;
  onOpenNewPrescription: () => void;
  onOpenNewPet: () => void;
  onOpenNewReminder: () => void;
  onSelectOrder: (order: PrescriptionOrder) => void;
  onToggleDoseAdministered: (scheduleId: string) => void;
  onQuickRepurchase: (schedule: DoseSchedule) => void;
}

export const TutorDashboard: React.FC<TutorDashboardProps> = ({
  pets,
  orders,
  doseSchedules,
  selectedUnit,
  onOpenNewPrescription,
  onOpenNewPet,
  onOpenNewReminder,
  onSelectOrder,
  onToggleDoseAdministered,
  onQuickRepurchase
}) => {
  const [selectedBlogArticle, setSelectedBlogArticle] = useState<typeof BLOG_POSTS[0] | null>(null);
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
    const petName = schedule ? schedule.petName : 'Thor';
    const medName = schedule ? schedule.medicationName : 'Condroitina Palatável';
    const time = schedule ? schedule.time : '12:00';
    notificationService.sendNotification(`⏰ Hora do Remédio: ${petName}!`, {
      body: `Horário previsto: ${time}. Dose de ${medName}. Favor medicar seu pet!`
    });
  };

  // Clube de Recompra: identifica tratamentos com 5 dias ou menos restantes
  const repurchaseAlerts = doseSchedules.filter(d => d.isChronic && d.daysRemaining <= 5);

  const unit = PHARMACY_UNITS[selectedUnit];

  return (
    <div className="space-y-8 pb-16">
      {/* Hero Banner: Amor e Cuidado Especializado */}
      <div className="relative rounded-3xl bg-gradient-to-r from-[#0b4d3a] via-[#0d5c46] to-[#127057] text-white p-6 sm:p-8 shadow-xl overflow-hidden">
        {/* Subtle decorative background pattern */}
        <div className="absolute right-0 top-0 bottom-0 w-1/3 opacity-10 pointer-events-none flex items-center justify-center">
          <Heart className="w-80 h-80" />
        </div>

        <div className="relative z-10 max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-800/80 text-emerald-200 text-xs font-semibold backdrop-blur-xs border border-emerald-600/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-300" />
            <span>Farmácia Especializada em Cães, Gatos e Exóticos</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white leading-tight">
            Remédios que seu pet toma sem estresse, na medida exata do amor.
          </h1>

          <p className="text-sm text-emerald-100/90 leading-relaxed">
            Formas palatáveis desenvolvidas pelas farmacêuticas Flávia Semeghini e Carolina Giordano: biscoitos mastigáveis, gel transdérmico na orelha e pastas deliciosas com manipulação ágil em <strong>{unit.city}</strong>.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenNewPrescription}
              className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-white text-emerald-950 font-bold text-xs shadow-lg hover:bg-emerald-50 transition-all active:scale-95"
            >
              <Upload className="w-4 h-4 text-emerald-700" />
              <span>Enviar Receita Veterinária Agora</span>
            </button>

            <button
              onClick={onOpenNewReminder}
              className="inline-flex items-center gap-2 px-4 py-3 rounded-xl bg-emerald-900/60 hover:bg-emerald-900 text-white font-semibold text-xs border border-emerald-500/30 transition-all"
            >
              <Clock className="w-4 h-4 text-emerald-300" />
              <span>Programar Hora do Remédio</span>
            </button>
          </div>
        </div>
      </div>

      {/* CLUBE DE RECOMPRA INTELIGENTE - Alerta de 5 dias antes de acabar */}
      {repurchaseAlerts.length > 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-300/80 rounded-2xl p-5 shadow-xs">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                <RefreshCw className="w-5 h-5 animate-spin-slow" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-bold text-sm text-amber-950">
                    Alerta do Clube de Recompra Inteligente
                  </span>
                  <span className="text-[10px] font-semibold bg-amber-200 text-amber-900 px-2 py-0.5 rounded">
                    Faltam {repurchaseAlerts[0].daysRemaining} dias para acabar!
                  </span>
                </div>
                <p className="text-xs text-amber-800 mt-1">
                  O tratamento contínuo do(a) <strong>{repurchaseAlerts[0].petName}</strong> ({repurchaseAlerts[0].medicationName}) está perto do fim. Renove a fórmula antes que acabe para manter o pet protegido.
                </p>
              </div>
            </div>

            <button
              onClick={() => onQuickRepurchase(repurchaseAlerts[0])}
              className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shrink-0 shadow-sm transition-all"
            >
              Repetir Pedido em 1 Clique
            </button>
          </div>
        </div>
      )}

      {/* SESSÃO 1: HORA DO REMÉDIO & GESTÃO DIÁRIA */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-5 h-5 text-emerald-700" />
              Hora do Remédio (Doses de Hoje)
            </h2>
            <p className="text-xs text-slate-500">
              Notificações sonoras automáticas no seu celular ou navegador na hora exata de cada dose
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleTestAlert()}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1.5 transition-all"
              title="Testar alerta sonoro e notificação no celular"
            >
              <Volume2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Testar Som no Celular</span>
            </button>

            <button
              onClick={onOpenNewReminder}
              className="text-xs font-semibold px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white flex items-center gap-1 transition-all shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Novo Lembrete</span>
            </button>
          </div>
        </div>

        {/* Banner de Status de Automação de Notificações */}
        <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white rounded-2xl p-4 shadow-md flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-600/60 border border-emerald-400/40 flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5 text-emerald-200 animate-bounce" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
                  Notificações de Doses no Celular & Dispositivo
                </span>
                <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                  notificationStatus === 'granted'
                    ? 'bg-emerald-400 text-emerald-950'
                    : 'bg-amber-400 text-amber-950'
                }`}>
                  {notificationStatus === 'granted' ? 'Alertas Ativos no Dispositivo' : 'Aguardando Permissão'}
                </span>
              </div>
              <p className="text-xs text-emerald-100/90 mt-0.5">
                {notificationStatus === 'granted'
                  ? 'O dispositivo tocará e exibirá alertas na tela automaticamente no horário exato da medicação do seu pet.'
                  : 'Ative as notificações para receber alertas sonoros no celular ou navegador mesmo com o app em segundo plano.'}
              </p>
            </div>
          </div>

          {notificationStatus !== 'granted' && (
            <button
              onClick={handleRequestNotification}
              className="px-4 py-2 rounded-xl bg-emerald-400 hover:bg-emerald-300 text-emerald-950 font-bold text-xs shrink-0 shadow-sm transition-all"
            >
              Ativar no Celular / Navegador
            </button>
          )}
        </div>

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
                    <p className="text-xs font-bold text-slate-800 line-clamp-1 mt-0.5">
                      {schedule.medicationName}
                    </p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {schedule.dosage}
                    </p>
                  </div>
                  <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                    {schedule.time}
                  </span>
                </div>

                <div className="mt-3 flex items-center gap-2">
                  <button
                    onClick={() => handleTestAlert(schedule)}
                    className="flex-1 py-1.5 px-2 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-200 text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all"
                    title="Disparar notificação e som de teste no celular"
                  >
                    <Bell className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Testar Alerta no Celular</span>
                  </button>
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <div className="text-[11px] text-slate-500">
                  <span>Doses: {schedule.dosesGiven}/{schedule.totalDoses}</span>
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
      </section>

      {/* SESSÃO 2: MEUS PEDIDOS & TRACKING DE MANIPULAÇÃO */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-emerald-700" />
              Pedidos em Andamento & Orçamentos
            </h2>
            <p className="text-xs text-slate-500">
              Acompanhamento de etapas do laboratório e pagamento PIX Express
            </p>
          </div>

          <button
            onClick={onOpenNewPrescription}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <span>+ Enviar outra receita</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {orders.map((order) => {
            const isFinished = order.status === 'concluido';
            return (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="cursor-pointer bg-white border border-slate-200 hover:border-emerald-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between text-xs mb-2">
                    <span className="font-mono font-bold text-slate-800">
                      Pedido #{order.code}
                    </span>
                    <span className="text-slate-400 text-[11px]">{order.createdAt}</span>
                  </div>

                  <div className="flex items-start justify-between">
                    <div>
                      <p className="font-bold text-sm text-slate-900">
                        {order.petName} ({order.petSpecies} • {order.petWeightKg}kg)
                      </p>
                      <p className="text-xs text-slate-500 mt-0.5">
                        {order.items[0]?.description || 'Manipulado sob medida'}
                      </p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs font-bold text-emerald-800">
                        R$ {order.total.toFixed(2)}
                      </span>
                      <p className="text-[10px] text-slate-500">
                        {order.paymentStatus === 'pago' ? 'Pago' : 'Aguardando Pagto'}
                      </p>
                    </div>
                  </div>

                  {/* Stage pill */}
                  <div className="mt-4 p-2.5 rounded-xl bg-emerald-50/70 border border-emerald-100 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      <span className="font-semibold text-emerald-950">
                        {order.status === 'analise_farmaceutica' && '1. Em Análise Farmacêutica'}
                        {order.status === 'em_manipulacao' && '2. No Laboratório de Manipulação'}
                        {order.status === 'controle_qualidade' && '3. Em Controle de Qualidade & Laudo'}
                        {order.status === 'pronto_retirada' && '4. Pronto para Retirada no Balcão'}
                        {order.status === 'saiu_para_entrega' && '4. Saiu para Entrega (Motoboy)'}
                        {order.status === 'concluido' && '5. Entregue e Concluído'}
                      </span>
                    </div>
                    <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-0.5">
                      Ver detalhes <ChevronRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-2 text-[11px] text-slate-400 flex justify-between items-center">
                  <span>Unidade {order.unit.toUpperCase()}</span>
                  <span>Previsão: {order.estimatedDeliveryDate}</span>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* SESSÃO 3: MEUS PETS */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
              <Heart className="w-5 h-5 text-rose-500" />
              Meus Pets Cadastrados
            </h2>
            <p className="text-xs text-slate-500">
              Doses precisas calculadas pelo peso e preferências de sabor do animal
            </p>
          </div>

          <button
            onClick={onOpenNewPet}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Outro Pet</span>
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {pets.map((pet) => (
            <div
              key={pet.id}
              className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs flex flex-col justify-between"
            >
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
          ))}
        </div>
      </section>

      {/* SESSÃO 4: FORMAS FARMACÊUTICAS & SABORES DA AMOR AO BICHO */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-amber-600" />
            Guia de Formas Farmacêuticas & Palatabilizantes
          </h2>
          <p className="text-xs text-slate-500">
            Saiba qual formato garante a maior aceitação do seu pet sem estresse
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {PHARMACEUTICAL_FORMS_INFO.slice(0, 3).map((form) => (
            <div
              key={form.id}
              className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs flex flex-col justify-between"
            >
              <div>
                <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-md">
                  {form.targetSpecies}
                </span>
                <h3 className="font-bold text-slate-900 text-sm mt-2">{form.name}</h3>
                <p className="text-xs text-slate-500 mt-0.5">{form.subtitle}</p>

                <ul className="mt-3 space-y-1.5 text-xs text-slate-600">
                  {form.benefits.slice(0, 3).map((b, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <span className="text-emerald-600 font-bold">•</span>
                      <span>{b}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex justify-between items-center text-xs">
                <span className="text-slate-400">Ideal para: {form.bestFor.slice(0, 24)}...</span>
                <button
                  onClick={onOpenNewPrescription}
                  className="font-bold text-emerald-700 hover:underline"
                >
                  Pedir nesta forma →
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SESSÃO 5: BLOG & DICAS DAS FARMACÊUTICAS */}
      <section className="space-y-4">
        <div>
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-teal-700" />
            Blog Amor ao Bicho: Saúde & Farmacotécnica
          </h2>
          <p className="text-xs text-slate-500">
            Artigos educativos escritos por Dra. Flávia Semeghini e Dra. Carolina Giordano
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {BLOG_POSTS.map((post) => (
            <div
              key={post.id}
              onClick={() => setSelectedBlogArticle(post)}
              className="cursor-pointer bg-white border border-slate-200 hover:border-teal-300 rounded-2xl p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-2">
                  <span>{post.tag}</span>
                  <span>{post.readTime}</span>
                </div>
                <h3 className="font-bold text-slate-900 text-sm leading-snug">
                  {post.title}
                </h3>
                <p className="text-xs text-slate-500 mt-2 line-clamp-3">
                  {post.summary}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="font-medium text-teal-800">{post.author}</span>
                <span className="font-bold text-teal-700">Ler artigo →</span>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Modal de Leitura do Blog */}
      {selectedBlogArticle && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex justify-between items-start">
              <div>
                <span className="text-xs font-semibold text-teal-700 bg-teal-50 px-2 py-0.5 rounded">
                  {selectedBlogArticle.tag}
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-2">
                  {selectedBlogArticle.title}
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Por {selectedBlogArticle.author} ({selectedBlogArticle.authorRole}) • {selectedBlogArticle.date}
                </p>
              </div>
              <button
                onClick={() => setSelectedBlogArticle(null)}
                className="text-slate-400 hover:text-slate-700 text-lg font-bold"
              >
                ✕
              </button>
            </div>
            <p className="text-xs text-slate-700 leading-relaxed">
              {selectedBlogArticle.content}
            </p>
            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedBlogArticle(null)}
                className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold"
              >
                Fechar Artigo
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
