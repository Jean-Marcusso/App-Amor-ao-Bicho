import React, { useState } from 'react';
import { 
  X, 
  Mail, 
  Lock, 
  Eye, 
  EyeOff, 
  ArrowRight, 
  AlertCircle,
  Building2,
  Heart,
  User,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { UserAccount, PharmacyUnit, RegisterData } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  onRegister: (data: RegisterData) => void;
  initialMode?: 'login' | 'register';
  forcedMessage?: string;
  onStaffLogin?: (unit: PharmacyUnit) => void;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  initialMode = 'register',
  forcedMessage,
  onStaffLogin
}) => {
  const [tab, setTab] = useState<'register' | 'login'>(initialMode);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setError('Por favor, informe seu e-mail.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setError('Por favor, digite um e-mail válido.');
      return;
    }

    if (!password || password.length < 4) {
      setError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    // Se estiver fazendo login:
    if (tab === 'login') {
      // Verifica se é conta de funcionária admin
      const adminUser = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'admin');
      if (adminUser) {
        onLogin(adminUser);
        onClose();
        return;
      }

      // Se for tutor existente nos dados iniciais
      const existing = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail);
      if (existing) {
        onLogin(existing);
        onClose();
        return;
      }
    }

    // Cadastro ou login rápido de tutor com apenas e-mail e senha
    const namePart = cleanEmail.split('@')[0];
    const formattedName = namePart.charAt(0).toUpperCase() + namePart.slice(1);

    const tutorData: RegisterData = {
      name: formattedName,
      email: cleanEmail,
      password: password,
      phone: '(19) 99000-0000',
      role: 'tutor',
      city: 'Americana',
      unit: 'americana'
    };

    onRegister(tutorData);
    onClose();
  };

  const handleDemoTutorLogin = () => {
    onLogin(INITIAL_USERS[0]); // Mariana Duarte
    onClose();
  };

  const handleQuickStaffLogin = (unit: PharmacyUnit) => {
    if (onStaffLogin) {
      onStaffLogin(unit);
    } else {
      const staff = INITIAL_USERS.find(u => u.role === 'admin' && u.pharmacyUnit === unit) || INITIAL_USERS[2];
      onLogin(staff);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Barra superior de destaque */}
        <div className="h-2 bg-gradient-to-r from-emerald-600 via-teal-600 to-emerald-500" />

        {/* Header do Modal com botão fechar */}
        <div className="px-6 pt-5 pb-3 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 text-white flex items-center justify-center shadow-xs">
              <Heart className="w-5 h-5 fill-rose-300 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-sm text-slate-900 leading-tight">
                Amor ao Bicho
              </h3>
              <p className="text-[10px] text-emerald-800 font-semibold">
                Manipulação Veterinária
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 hover:text-slate-800 flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Forced Message se houver */}
        {forcedMessage && (
          <div className="mx-6 mb-3 p-2.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{forcedMessage}</span>
          </div>
        )}

        <div className="p-6 pt-2 space-y-5">
          {/* Abas: Criar Cadastro ou Já Tenho Conta */}
          <div className="grid grid-cols-2 p-1 bg-slate-100/90 rounded-2xl border border-slate-200/80">
            <button
              type="button"
              onClick={() => {
                setTab('register');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'register'
                  ? 'bg-white text-emerald-950 shadow-sm border border-emerald-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🐾 Criar Cadastro</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setTab('login');
                setError(null);
              }}
              className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                tab === 'login'
                  ? 'bg-white text-emerald-950 shadow-sm border border-emerald-100'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <span>🔑 Já Tenho Conta</span>
            </button>
          </div>

          {/* Título da Ação */}
          <div className="text-left space-y-1">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {tab === 'register' ? 'Cadastre-se na Área do Tutor' : 'Acesse sua Área do Tutor'}
            </h2>
            <p className="text-xs text-slate-500">
              {tab === 'register' 
                ? 'Informe apenas e-mail e senha para começar a cuidar dos horários do seu pet.' 
                : 'Digite seu e-mail e senha para acessar seus pets e horários de remédios.'}
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
          <form onSubmit={handleSubmit} className="space-y-3.5">
            {/* Campo E-mail */}
            <div className="space-y-1 text-left">
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
            <div className="space-y-1 text-left">
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

            {/* Botão Principal de Envio */}
            <button
              type="submit"
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
            >
              <span>{tab === 'register' ? 'Criar Cadastro e Acessar Área do Tutor' : 'Entrar na Minha Área do Tutor'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </form>

          {/* Atalho Demo */}
          <div className="pt-2 text-center">
            <button
              type="button"
              onClick={handleDemoTutorLogin}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Entrar direto como Mariana Duarte (Conta Demonstração)
            </button>
          </div>

          {/* Acesso Funcionárias Farmácia (Admin) */}
          <div className="pt-3 border-t border-slate-100 space-y-2">
            <span className="text-[11px] font-bold text-slate-500 block text-left">
              Funcionária da Farmácia Amor ao Bicho?
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleQuickStaffLogin('americana')}
                className="p-2 rounded-xl border border-amber-200 bg-amber-50/70 hover:bg-amber-100 text-amber-950 text-left text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-700 shrink-0" />
                <span className="truncate">Dra. Flávia (Americana)</span>
              </button>
              <button
                type="button"
                onClick={() => handleQuickStaffLogin('valinhos')}
                className="p-2 rounded-xl border border-slate-200 bg-slate-50 hover:bg-slate-100 text-slate-800 text-left text-[11px] font-bold flex items-center gap-1.5 transition-all cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                <span className="truncate">Dra. Carolina (Valinhos)</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
