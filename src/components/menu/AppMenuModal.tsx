import React, { useState, useEffect } from 'react';
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
  ShieldCheck,
  LogOut,
  MapPin,
  MessageSquare,
  CheckCircle2,
  Save,
  Phone
} from 'lucide-react';
import { UserAccount, PharmacyUnit, RegisterData } from '../../types';
import { INITIAL_USERS, PHARMACY_UNITS } from '../../data/mockData';

interface AppMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onLogin: (user: UserAccount) => void;
  onQuickRegister: (email: string, password?: string) => void;
  onQuickLogin: (email: string, password?: string) => void;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
  onStaffLogin: (unit: PharmacyUnit) => void;
  selectedUnit: PharmacyUnit;
  onUnitChange: (unit: PharmacyUnit) => void;
  initialTab?: 'auth' | 'profile' | 'staff';
}

export const AppMenuModal: React.FC<AppMenuModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onLogin,
  onQuickRegister,
  onQuickLogin,
  onUpdateUser,
  onLogout,
  onStaffLogin,
  selectedUnit,
  onUnitChange,
  initialTab = 'auth'
}) => {
  // Tabs do Menu: 'auth' (Cadastro/Login), 'profile' (Minha Conta), 'staff' (Farmácia Admin)
  const [activeTab, setActiveTab] = useState<'auth' | 'profile' | 'staff'>('auth');
  
  // Sub-aba de Auth: 'register' (Criar Cadastro) ou 'login' (Já Tenho Conta)
  const [authSubTab, setAuthSubTab] = useState<'register' | 'login'>('register');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Campos de Edição de Perfil
  const [profileName, setProfileName] = useState('');
  const [profilePhone, setProfilePhone] = useState('');
  const [profileCpf, setProfileCpf] = useState('');
  const [profileStreet, setProfileStreet] = useState('');
  const [profileNumber, setProfileNumber] = useState('');
  const [profileNeighborhood, setProfileNeighborhood] = useState('');
  const [profileCity, setProfileCity] = useState('');
  const [profileCep, setProfileCep] = useState('');
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Sincroniza dados do usuário ao abrir o modal
  useEffect(() => {
    if (isOpen) {
      if (initialTab) {
        setActiveTab(initialTab);
      } else if (currentUser) {
        setActiveTab('profile');
      } else {
        setActiveTab('auth');
      }
      setAuthError(null);
    }
  }, [isOpen, initialTab, currentUser]);

  useEffect(() => {
    if (currentUser) {
      setProfileName(currentUser.name || '');
      setProfilePhone(currentUser.phone || '');
      setProfileCpf(currentUser.cpf || '');
      setProfileStreet(currentUser.address?.street || '');
      setProfileNumber(currentUser.address?.number || '');
      setProfileNeighborhood(currentUser.address?.neighborhood || '');
      setProfileCity(currentUser.address?.city || (selectedUnit === 'americana' ? 'Americana' : 'Valinhos'));
      setProfileCep(currentUser.address?.cep || '');
    }
  }, [currentUser, selectedUnit]);

  if (!isOpen) return null;

  const handleAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = email.trim().toLowerCase();
    if (!cleanEmail) {
      setAuthError('Por favor, informe seu e-mail.');
      return;
    }

    if (!cleanEmail.includes('@') || !cleanEmail.includes('.')) {
      setAuthError('Por favor, digite um e-mail válido.');
      return;
    }

    if (!password || password.length < 4) {
      setAuthError('A senha deve ter no mínimo 4 caracteres.');
      return;
    }

    if (authSubTab === 'register') {
      onQuickRegister(cleanEmail, password);
      onClose();
    } else {
      onQuickLogin(cleanEmail, password);
      onClose();
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    const updated: UserAccount = {
      ...currentUser,
      name: profileName,
      phone: profilePhone,
      cpf: profileCpf.trim() || undefined,
      address: {
        street: profileStreet,
        number: profileNumber,
        neighborhood: profileNeighborhood,
        city: profileCity,
        state: 'SP',
        cep: profileCep
      }
    };

    onUpdateUser(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1000);
  };

  const handleStaffSelect = (unit: PharmacyUnit) => {
    onStaffLogin(unit);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden relative">
        {/* Top Header Decorativo */}
        <div className="bg-[#0b4d3a] px-5 sm:px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-700 flex items-center justify-center shadow-md">
              <Heart className="w-5 h-5 fill-rose-300 text-white" />
            </div>
            <div>
              <h3 className="font-extrabold text-base leading-tight">
                Menu Amor ao Bicho
              </h3>
              <p className="text-xs text-emerald-200/90 font-medium">
                {currentUser ? `Conectado como ${currentUser.name}` : 'Acesse ou Cadastre-se na Área do Tutor'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-emerald-900/60 hover:bg-emerald-800 text-emerald-200 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            title="Fechar menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Barra de Abas do Menu */}
        <div className="grid grid-cols-3 bg-slate-100 border-b border-slate-200 p-1.5 gap-1 text-xs">
          <button
            type="button"
            onClick={() => {
              setActiveTab('auth');
              setAuthError(null);
            }}
            className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'auth'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">Cadastro / Login</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('profile');
              setAuthError(null);
            }}
            className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'profile'
                ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/60'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
            <span className="truncate">Minha Conta</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setActiveTab('staff');
              setAuthError(null);
            }}
            className={`py-2 px-2 rounded-xl font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'staff'
                ? 'bg-white text-amber-950 shadow-xs border border-amber-200/80'
                : 'text-slate-600 hover:text-amber-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span className="truncate">Farmácia Admin</span>
          </button>
        </div>

        {/* Conteúdo Dinâmico por Aba */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {/* ================= ABA 1: CADASTRO E LOGIN ================= */}
          {activeTab === 'auth' && (
            <div className="space-y-4 animate-in fade-in">
              {/* Seletor de Sub-aba: Criar Cadastro ou Já Tenho Conta */}
              <div className="grid grid-cols-2 p-1 bg-slate-100 rounded-2xl border border-slate-200">
                <button
                  type="button"
                  onClick={() => {
                    setAuthSubTab('register');
                    setAuthError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authSubTab === 'register'
                      ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🐾 Criar Cadastro</span>
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthSubTab('login');
                    setAuthError(null);
                  }}
                  className={`py-2 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                    authSubTab === 'login'
                      ? 'bg-white text-emerald-950 shadow-xs border border-emerald-200/60'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <span>🔑 Já Tenho Conta</span>
                </button>
              </div>

              {/* Título Principal Conforme Imagem do Usuário */}
              <div className="text-left space-y-1">
                <h2 className="text-base sm:text-lg font-extrabold text-slate-900">
                  {authSubTab === 'register' ? 'Cadastre-se na Área do Tutor' : 'Acesse sua Área do Tutor'}
                </h2>
                <p className="text-xs text-slate-500 leading-relaxed">
                  {authSubTab === 'register'
                    ? 'Informe apenas e-mail e senha para começar a cuidar dos horários do seu pet.'
                    : 'Informe seu e-mail e senha cadastrados para acessar seus pets e tratamentos.'}
                </p>
              </div>

              {/* Alerta de Erro */}
              {authError && (
                <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-xs font-semibold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Formulário de Apenas E-mail e Senha */}
              <form onSubmit={handleAuthSubmit} className="space-y-3.5">
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
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
                      required
                    />
                  </div>
                </div>

                {/* Campo Senha */}
                <div className="space-y-1 text-left">
                  <label className="block text-xs font-bold text-slate-700">
                    {authSubTab === 'register' ? 'Crie uma Senha' : 'Sua Senha'}
                  </label>
                  <div className="relative">
                    <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder={authSubTab === 'register' ? 'Mínimo de 4 dígitos' : 'Digite sua senha'}
                      className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50/70 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-600 transition-all font-medium text-slate-900 placeholder:text-slate-400"
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

                {/* Botão de Ação */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-700 hover:from-emerald-700 hover:to-teal-800 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-700/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <span>
                    {authSubTab === 'register'
                      ? 'Criar Cadastro e Acessar Área do Tutor'
                      : 'Entrar na Minha Área do Tutor'}
                  </span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>

              {/* Botão de Teste Demo */}
              <div className="pt-2 text-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    onLogin(INITIAL_USERS[0]); // Mariana Duarte
                    onClose();
                  }}
                  className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-900 underline cursor-pointer"
                >
                  Acessar com a conta de demonstração (Mariana Duarte)
                </button>
              </div>
            </div>
          )}

          {/* ================= ABA 2: MINHA CONTA / PERFIL ================= */}
          {activeTab === 'profile' && (
            <div className="space-y-4 animate-in fade-in">
              {currentUser ? (
                <>
                  <div className="p-3 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=120&q=80'}
                        alt={currentUser.name}
                        className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-300 shadow-xs"
                      />
                      <div>
                        <h4 className="font-extrabold text-sm text-emerald-950">
                          {currentUser.name}
                        </h4>
                        <p className="text-[11px] text-emerald-700 font-medium">
                          {currentUser.email}
                        </p>
                        <span className="inline-block mt-0.5 text-[10px] font-bold text-emerald-800 bg-emerald-100/90 px-2 py-0.5 rounded-full">
                          {currentUser.role === 'admin' ? 'Farmacêutica (Admin)' : 'Tutor Cadastrado'}
                        </span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        onLogout();
                        setActiveTab('auth');
                      }}
                      className="px-2.5 py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                      title="Sair desta conta"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">Sair</span>
                    </button>
                  </div>

                  {saveSuccess && (
                    <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                      <span>Dados salvos com sucesso!</span>
                    </div>
                  )}

                  {/* Edição de Dados */}
                  <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Nome do Tutor
                        </label>
                        <input
                          type="text"
                          required
                          value={profileName}
                          onChange={(e) => setProfileName(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          WhatsApp / Telefone
                        </label>
                        <input
                          type="tel"
                          required
                          value={profilePhone}
                          onChange={(e) => setProfilePhone(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          CPF (Para Cupom Fiscal)
                        </label>
                        <input
                          type="text"
                          value={profileCpf}
                          onChange={(e) => setProfileCpf(e.target.value)}
                          placeholder="000.000.000-00"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Cidade Principal
                        </label>
                        <select
                          value={profileCity}
                          onChange={(e) => setProfileCity(e.target.value)}
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden bg-white"
                        >
                          <option value="Americana">Americana - SP</option>
                          <option value="Valinhos">Valinhos - SP</option>
                          <option value="Campinas">Campinas - SP</option>
                          <option value="Santa Bárbara d'Oeste">Santa Bárbara d'Oeste - SP</option>
                          <option value="Nova Odessa">Nova Odessa - SP</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-3 gap-2">
                      <div className="col-span-2">
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Endereço para Entrega
                        </label>
                        <input
                          type="text"
                          value={profileStreet}
                          onChange={(e) => setProfileStreet(e.target.value)}
                          placeholder="Rua / Avenida"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-700 mb-1">
                          Número
                        </label>
                        <input
                          type="text"
                          value={profileNumber}
                          onChange={(e) => setProfileNumber(e.target.value)}
                          placeholder="123"
                          className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer mt-1"
                    >
                      <Save className="w-4 h-4" />
                      <span>Salvar Alterações de Perfil</span>
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-6 space-y-3">
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                    <User className="w-6 h-6" />
                  </div>
                  <h4 className="font-bold text-sm text-slate-800">
                    Nenhum usuário conectado
                  </h4>
                  <p className="text-xs text-slate-500 max-w-xs mx-auto">
                    Crie seu cadastro ou faça login com apenas e-mail e senha para gerenciar seus dados cadastrais.
                  </p>
                  <button
                    type="button"
                    onClick={() => setActiveTab('auth')}
                    className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
                  >
                    Ir para Cadastro / Login
                  </button>
                </div>
              )}
            </div>
          )}

          {/* ================= ABA 3: ACESSO FARMÁCIA (ADMIN) ================= */}
          {activeTab === 'staff' && (
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 rounded-2xl bg-amber-50/80 border border-amber-200 space-y-1.5 text-left">
                <div className="flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
                  <span className="font-extrabold text-xs text-amber-950">
                    Acesso Exclusivo: Equipe Farmacêutica
                  </span>
                </div>
                <p className="text-[11px] text-amber-900 leading-relaxed">
                  Esta área é restrita aos profissionais da Amor ao Bicho para visualização de pedidos, manipulação laboratorial, laudos de controle e aprovação de orçamentos.
                </p>
              </div>

              <div className="space-y-2.5">
                <span className="text-xs font-bold text-slate-700 block text-left">
                  Selecione a Farmacêutica Responsável:
                </span>

                {/* Unidade Americana: Dra. Flávia */}
                <div
                  onClick={() => handleStaffSelect('americana')}
                  className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                      FS
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-950">
                        {PHARMACY_UNITS.americana.technicalResponsible}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Farmacêutica Responsável • {PHARMACY_UNITS.americana.crf}
                      </p>
                      <span className="inline-block text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200/60 mt-0.5">
                        Unidade Americana - SP
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>

                {/* Unidade Valinhos: Dra. Carolina */}
                <div
                  onClick={() => handleStaffSelect('valinhos')}
                  className="p-3.5 rounded-2xl border-2 border-slate-200 hover:border-amber-500 bg-white hover:bg-amber-50/40 transition-all cursor-pointer flex items-center justify-between group shadow-xs"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold text-sm shrink-0 group-hover:scale-105 transition-transform">
                      CG
                    </div>
                    <div className="text-left">
                      <h4 className="font-bold text-xs text-slate-900 group-hover:text-amber-950">
                        {PHARMACY_UNITS.valinhos.technicalResponsible}
                      </h4>
                      <p className="text-[11px] text-slate-500">
                        Farmacêutica Responsável • {PHARMACY_UNITS.valinhos.crf}
                      </p>
                      <span className="inline-block text-[10px] font-bold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-md border border-teal-200/60 mt-0.5">
                        Unidade Valinhos - SP
                      </span>
                    </div>
                  </div>

                  <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-amber-600 transition-colors" />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Rodapé do Menu com Links Rápidos das Unidades */}
        <div className="bg-slate-50 border-t border-slate-200 px-5 py-3 flex items-center justify-between flex-wrap gap-2 text-[11px]">
          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">WhatsApp:</span>
            <a
              href={`https://wa.me/55${PHARMACY_UNITS.americana.whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20atendimento%20da%20Amor%20ao%20Bicho%20(Americana)`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1"
            >
              <span>Americana</span>
            </a>
            <span className="text-slate-300">•</span>
            <a
              href={`https://wa.me/55${PHARMACY_UNITS.valinhos.whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20atendimento%20da%20Amor%20ao%20Bicho%20(Valinhos)`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-emerald-700 hover:text-emerald-900 font-bold underline flex items-center gap-1"
            >
              <span>Valinhos</span>
            </a>
          </div>

          <a
            href="https://amoraobicho.com.br"
            target="_blank"
            rel="noopener noreferrer"
            className="text-slate-500 hover:text-slate-700 font-semibold"
          >
            amoraobicho.com.br
          </a>
        </div>
      </div>
    </div>
  );
};
