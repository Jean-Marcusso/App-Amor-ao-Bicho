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
  Phone,
  ShieldCheck,
  MapPin,
  Loader2
} from 'lucide-react';
import { UserAccount, PharmacyUnit, RegisterData } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import { 
  loginWithEmail, 
  registerWithEmail, 
  loginWithGoogle, 
  formatFirebaseError 
} from '../../services/firebase';

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
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [cpf, setCpf] = useState('');
  const [city, setCity] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  React.useEffect(() => {
    if (isOpen) {
      setTab(initialMode);
      setError(null);
      setIsLoading(false);
      setIsGoogleLoading(false);
    }
  }, [isOpen, initialMode]);

  if (!isOpen) return null;

  // Formatador de WhatsApp
  const handlePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      setPhone(digits ? `(${digits}` : '');
    } else if (digits.length <= 7) {
      setPhone(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else {
      setPhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
    }
  };

  // Formatador de CPF
  const handleCpfChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) {
      setCpf(digits);
    } else if (digits.length <= 6) {
      setCpf(`${digits.slice(0, 3)}.${digits.slice(3)}`);
    } else if (digits.length <= 9) {
      setCpf(`${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`);
    } else {
      setCpf(`${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`);
    }
  };

  // Login com o Google
  const handleGoogleAuth = async () => {
    setError(null);
    setIsGoogleLoading(true);
    try {
      const user = await loginWithGoogle();
      onLogin(user);
      onClose();
    } catch (err: any) {
      console.error('Erro na autenticação com Google:', err);
      setError(formatFirebaseError(err));
    } finally {
      setIsGoogleLoading(false);
    }
  };

  // Login ou Cadastro com E-mail e Senha
  const handleSubmit = async (e: React.FormEvent) => {
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

    if (!password || password.length < 6) {
      setError('A senha deve ter no mínimo 6 caracteres.');
      return;
    }

    // Se for email de funcionária admin para login direto em dev:
    if (tab === 'login') {
      const adminUser = INITIAL_USERS.find(u => u.email.toLowerCase() === cleanEmail && u.role === 'admin');
      if (adminUser && password === '123456') {
        onLogin(adminUser);
        onClose();
        return;
      }
    }

    setIsLoading(true);
    try {
      if (tab === 'login') {
        // Autentica via Firebase Auth com e-mail e senha
        const user = await loginWithEmail(cleanEmail, password);
        onLogin(user);
        onClose();
      } else {
        // Validações do formulário de cadastro
        if (!name.trim()) {
          setError('Por favor, informe seu nome completo.');
          setIsLoading(false);
          return;
        }
        if (!phone.trim()) {
          setError('Por favor, informe seu número de WhatsApp.');
          setIsLoading(false);
          return;
        }

        const tutorData: RegisterData = {
          name: name.trim(),
          email: cleanEmail,
          password: password,
          phone: phone.trim() || '(19) 99000-0000',
          cpf: cpf.trim() || undefined,
          role: 'tutor',
          city: city.trim() || 'Americana',
          unit: city.trim().toLowerCase().includes('valinhos') ? 'valinhos' : 'americana'
        };

        // Cria a conta no Firebase Auth com e-mail e senha
        const user = await registerWithEmail(tutorData);
        onLogin(user);
        onRegister(tutorData);
        onClose();
      }
    } catch (err: any) {
      console.error('Erro na autenticação Firebase:', err);
      setError(formatFirebaseError(err));
    } finally {
      setIsLoading(false);
    }
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

        <div className="p-6 pt-2 space-y-4">
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
          <div className="text-left space-y-0.5">
            <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
              {tab === 'register' ? 'Cadastre-se na Área do Tutor' : 'Acesse sua Área do Tutor'}
            </h2>
            <p className="text-xs text-slate-500">
              {tab === 'register' 
                ? 'Conecte-se com sua conta Google ou preencha seus dados para salvar pets e alarmes.' 
                : 'Entre com sua conta Google ou informe seu e-mail e senha cadastrados.'}
            </p>
          </div>

          {/* Mensagem de Erro */}
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {/* BOTÃO OFICIAL DE LOGIN COM O GOOGLE */}
          <div className="space-y-3">
            <button
              type="button"
              disabled={isGoogleLoading || isLoading}
              onClick={handleGoogleAuth}
              className="w-full py-2.5 px-4 rounded-xl border border-slate-300 hover:border-emerald-600/60 bg-white hover:bg-emerald-50/40 text-slate-700 hover:text-slate-900 font-bold text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2.5 active:scale-[0.98] cursor-pointer disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <Loader2 className="w-4 h-4 text-emerald-600 animate-spin" />
              ) : (
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 9.99 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                  />
                </svg>
              )}
              <span>
                {isGoogleLoading
                  ? 'Conectando ao Google...'
                  : tab === 'register'
                  ? 'Cadastrar com o Google'
                  : 'Entrar com o Google'}
              </span>
            </button>

            {/* Divisor */}
            <div className="relative flex items-center justify-center">
              <div className="border-t border-slate-200 w-full" />
              <span className="bg-white px-2.5 text-[10px] font-bold text-slate-400 uppercase tracking-wider shrink-0">
                ou com e-mail e senha
              </span>
              <div className="border-t border-slate-200 w-full" />
            </div>
          </div>

          {/* Formulário com E-mail e Senha */}
          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Campos adicionais exibidos apenas no Cadastro */}
            {tab === 'register' && (
              <>
                {/* Campo Nome Completo */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Nome Completo <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Ex: Mariana Duarte"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                      required={tab === 'register'}
                    />
                  </div>
                </div>

                {/* Grid WhatsApp e CPF */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {/* Campo WhatsApp */}
                  <div className="space-y-1 text-left">
                    <label className="block text-xs font-bold text-slate-700">
                      WhatsApp <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Phone className="w-4 h-4 text-emerald-600 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="tel"
                        value={phone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                        placeholder="(19) 99999-9999"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                        required={tab === 'register'}
                      />
                    </div>
                  </div>

                  {/* Campo CPF */}
                  <div className="space-y-1 text-left">
                    <label className="block text-xs font-bold text-slate-700">
                      CPF
                    </label>
                    <div className="relative">
                      <ShieldCheck className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={cpf}
                        onChange={(e) => handleCpfChange(e.target.value)}
                        placeholder="000.000.000-00"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>
                </div>

                {/* Campo Cidade */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    Cidade
                  </label>
                  <div className="relative">
                    <MapPin className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      placeholder="Ex: Americana, Valinhos, Campinas..."
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/50 text-xs focus:bg-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                    />
                  </div>
                </div>
              </>
            )}

            {/* Campo E-mail */}
            <div className="space-y-1 text-left">
              <label className="block text-xs font-bold text-slate-700">
                Seu E-mail <span className="text-rose-500">*</span>
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
                {tab === 'register' ? 'Crie uma Senha' : 'Sua Senha'} <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={tab === 'register' ? 'Mínimo de 6 dígitos' : 'Digite sua senha'}
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
              disabled={isLoading || isGoogleLoading}
              className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2 disabled:opacity-60"
            >
              {isLoading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin text-white" />
                  <span>{tab === 'register' ? 'Criando conta no Firebase...' : 'Entrando...'}</span>
                </>
              ) : (
                <>
                  <span>{tab === 'register' ? 'Criar Cadastro e Acessar Área do Tutor' : 'Entrar com E-mail e Senha'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Atalho Demo */}
          <div className="pt-1 text-center">
            <button
              type="button"
              onClick={handleDemoTutorLogin}
              className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
            >
              Entrar direto como Mariana Duarte (Conta Demonstração)
            </button>
          </div>

          {/* Acesso Funcionárias Farmácia (Admin) */}
          <div className="pt-2.5 border-t border-slate-100 space-y-2">
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
