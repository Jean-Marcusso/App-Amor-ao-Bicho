import React, { useState } from 'react';
import { 
  Heart, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  Clock, 
  Bell, 
  ShieldCheck, 
  Building2, 
  Sparkles,
  MapPin,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { PharmacyUnit, UserAccount } from '../../types';
import { PHARMACY_UNITS, INITIAL_USERS } from '../../data/mockData';

interface InitialAuthLandingProps {
  selectedUnit: PharmacyUnit;
  onUnitChange: (unit: PharmacyUnit) => void;
  onQuickRegister: (email: string, password?: string) => void;
  onQuickLogin: (email: string, password?: string) => void;
  onStaffLogin: (unit: PharmacyUnit) => void;
}

export const InitialAuthLanding: React.FC<InitialAuthLandingProps> = ({
  selectedUnit,
  onUnitChange,
  onQuickRegister,
  onQuickLogin,
  onStaffLogin
}) => {
  const [tab, setTab] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isStaffModalOpen, setIsStaffModalOpen] = useState(false);

  const unit = PHARMACY_UNITS[selectedUnit];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim();
    if (!cleanEmail) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Por favor, digite um formato de e-mail válido.');
      return;
    }

    if (!password || password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (tab === 'register') {
      onQuickRegister(cleanEmail, password);
    } else {
      onQuickLogin(cleanEmail, password);
    }
  };

  const handleDemoTutorLogin = () => {
    const demo = INITIAL_USERS[0]; // Mariana Duarte
    onQuickLogin(demo.email, '123456');
  };

  return (
    <div className="min-h-[85vh] flex flex-col justify-between py-6 px-4 sm:px-6 max-w-4xl mx-auto space-y-8">
      {/* Top Header Card com Unidades */}
      <div className="text-center space-y-3">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/70 text-emerald-800 text-xs font-semibold shadow-xs">
          <Heart className="w-3.5 h-3.5 fill-rose-400 text-rose-500 animate-pulse" />
          <span>Farmácia de Manipulação Veterinária Oficial</span>
        </div>

        <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-slate-900 leading-tight">
          Cuidado e precisão em cada dose para seu pet.
        </h1>

        <p className="text-xs sm:text-sm text-slate-600 max-w-xl mx-auto leading-relaxed">
          Manipulação sob medida com formas palatáveis (biscoitos, pastas e gotas) nas unidades de <strong>Americana</strong> e <strong>Valinhos - SP</strong>.
        </p>

        {/* Seletor de Unidade */}
        <div className="pt-1 flex items-center justify-center gap-2 text-xs">
          <span className="text-slate-500 font-medium flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-emerald-600" />
            Sua Unidade:
          </span>
          <div className="inline-flex rounded-xl p-1 bg-slate-100 border border-slate-200">
            <button
              type="button"
              onClick={() => onUnitChange('americana')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedUnit === 'americana'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Americana
            </button>
            <button
              type="button"
              onClick={() => onUnitChange('valinhos')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                selectedUnit === 'valinhos'
                  ? 'bg-emerald-700 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Valinhos
            </button>
          </div>
        </div>
      </div>

      {/* Card Principal: Cadastro e Login com Apenas E-mail e Senha */}
      <div className="max-w-md w-full mx-auto bg-white rounded-3xl border border-slate-200 shadow-xl p-6 sm:p-8 space-y-6 relative overflow-hidden">
        {/* Glow de fundo */}
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500" />

        {/* Abas: Cadastro ou Login */}
        <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
          <button
            type="button"
            onClick={() => {
              setTab('register');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'register'
                ? 'bg-white text-emerald-950 shadow-sm border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🐾 Criar Cadastro
          </button>
          <button
            type="button"
            onClick={() => {
              setTab('login');
              setError(null);
            }}
            className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              tab === 'login'
                ? 'bg-white text-emerald-950 shadow-sm border border-emerald-100'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            🔑 Já Tenho Conta
          </button>
        </div>

        {/* Título da Ação */}
        <div className="text-left space-y-1">
          <h2 className="text-lg font-extrabold text-slate-900">
            {tab === 'register' ? 'Cadastre-se na Área do Tutor' : 'Acesse sua Área do Tutor'}
          </h2>
          <p className="text-xs text-slate-500">
            {tab === 'register' 
              ? 'Informe apenas e-mail e senha para começar a cuidar dos horários do seu pet.' 
              : 'Digite seu e-mail e senha para visualizar seus pets e alarmes.'}
          </p>
        </div>

        {/* Mensagem de Erro */}
        {error && (
          <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulário com Apenas E-mail e Senha */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Campo E-mail */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-700">
              Seu E-mail
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="exemplo@email.com"
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                required
              />
            </div>
          </div>

          {/* Campo Senha */}
          <div className="space-y-1.5 text-left">
            <label className="block text-xs font-bold text-slate-700">
              {tab === 'register' ? 'Crie uma Senha' : 'Sua Senha'}
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={tab === 'register' ? 'Mínimo de 4 dígitos' : 'Digite sua senha'}
                className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="p-1 text-slate-400 hover:text-slate-600 absolute right-3 top-1/2 -translate-y-1/2 cursor-pointer"
                title={showPassword ? 'Ocultar senha' : 'Ver senha'}
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Botão de Envio */}
          <button
            type="submit"
            className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
          >
            <span>{tab === 'register' ? 'Criar Cadastro e Acessar Área do Tutor' : 'Entrar na Minha Área do Tutor'}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        {/* Opção Rápida de Teste */}
        <div className="pt-2 border-t border-slate-100 text-center space-y-2">
          <p className="text-[11px] text-slate-400">Quer testar imediatamente sem digitar?</p>
          <button
            type="button"
            onClick={handleDemoTutorLogin}
            className="text-xs font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
          >
            Entrar direto como Mariana Duarte (Conta Demonstração)
          </button>
        </div>
      </div>

      {/* Benefícios do Tutor na Farmácia */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-700 flex items-center justify-center">
            <Clock className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Hora do Remédio</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Alarmes diários com som suave no celular para você não esquecer a dose.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Alerta de Reposição</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Notificação antecipada quando a fórmula estiver a poucos dias de acabar.
          </p>
        </div>

        <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
          <div className="w-8 h-8 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center">
            <Heart className="w-4 h-4 fill-rose-300" />
          </div>
          <h4 className="text-xs font-bold text-slate-900">Amor e Ciência</h4>
          <p className="text-[11px] text-slate-500 leading-relaxed">
            Doses precisas pelo peso e formatos mastigáveis no sabor favorito do pet.
          </p>
        </div>
      </div>

      {/* Acesso Exclusivo para Funcionárias da Farmácia (Admin) */}
      <div className="pt-4 border-t border-slate-200/80">
        <div className="p-4 rounded-2xl bg-slate-900 text-white flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-600 flex items-center justify-center text-white shrink-0 shadow-sm">
              <Building2 className="w-5 h-5" />
            </div>
            <div className="text-left">
              <span className="font-bold text-white text-xs block">
                Acesso Funcionárias Farmácia Amor ao Bicho
              </span>
              <span className="text-[11px] text-slate-300 block">
                Área técnica restrita para manipulação e supervisão farmacêutica
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={() => onStaffLogin('americana')}
              className="px-3 py-1.5 rounded-xl bg-amber-600 hover:bg-amber-500 text-white font-bold text-xs transition-all shadow-xs cursor-pointer"
            >
              Entrar Dra. Flávia (Americana)
            </button>
            <button
              type="button"
              onClick={() => onStaffLogin('valinhos')}
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 font-bold text-xs transition-all cursor-pointer"
            >
              Dra. Carolina (Valinhos)
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
