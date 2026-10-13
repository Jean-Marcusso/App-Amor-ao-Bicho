import React, { useState } from 'react';
import { 
  X, 
  LogIn, 
  UserPlus, 
  Lock, 
  Mail, 
  Phone, 
  User, 
  Stethoscope, 
  Building2, 
  ShieldCheck, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  ArrowRight,
  Eye,
  EyeOff
} from 'lucide-react';
import { UserAccount, UserRole, PharmacyUnit, RegisterData } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';
import { PasswordRecoveryModal } from './PasswordRecoveryModal';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onLogin: (user: UserAccount) => void;
  onRegister: (data: RegisterData) => void;
  initialMode?: 'login' | 'register';
  forcedMessage?: string;
}

export const AuthModal: React.FC<AuthModalProps> = ({
  isOpen,
  onClose,
  onLogin,
  onRegister,
  initialMode = 'login',
  forcedMessage
}) => {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot'>(initialMode);
  
  // Login form states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Register form states
  const [regRole, setRegRole] = useState<UserRole>('tutor');
  const [regName, setRegName] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regCity, setRegCity] = useState('Americana');
  const [regCrmv, setRegCrmv] = useState('');
  const [regCrmvState, setRegCrmvState] = useState('SP');
  const [regClinic, setRegClinic] = useState('');
  const [regUnit, setRegUnit] = useState<PharmacyUnit>('americana');

  // Forgot password
  if (!isOpen) return null;

  if (mode === 'forgot') {
    return (
      <PasswordRecoveryModal
        isOpen={isOpen}
        onClose={onClose}
        defaultEmail={loginEmail}
        onBackToLogin={() => setMode('login')}
        onSuccessLogin={(user) => {
          onLogin(user);
          onClose();
        }}
      />
    );
  }

  const handleManualLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!loginEmail.trim()) {
      setErrorMessage('Por favor, informe seu e-mail cadastrado.');
      return;
    }

    // Procura nos usuários iniciais ou cria sessão baseada no e-mail
    const existing = INITIAL_USERS.find(u => u.email.toLowerCase() === loginEmail.toLowerCase());
    if (existing) {
      onLogin(existing);
      onClose();
    } else {
      // Se for um novo email, gera conta de tutor rápida
      const newUser: UserAccount = {
        id: `user-${Date.now()}`,
        name: loginEmail.split('@')[0],
        email: loginEmail,
        phone: '(19) 99000-0000',
        role: 'tutor'
      };
      onLogin(newUser);
      onClose();
    }
  };

  const handleQuickDemoLogin = (user: UserAccount) => {
    onLogin(user);
    onClose();
  };

  const handleManualRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!regName.trim() || !regEmail.trim()) {
      setErrorMessage('Preencha os campos obrigatórios.');
      return;
    }

    if (regRole === 'vet' && !regCrmv.trim()) {
      setErrorMessage('Informe o seu número de registro no CRMV.');
      return;
    }

    const regData: RegisterData = {
      name: regName.trim(),
      email: regEmail.trim(),
      password: regPassword,
      phone: regPhone.trim() || '(19) 99876-0000',
      cpf: regCpf.trim() || undefined,
      role: regRole,
      city: regCity,
      crmv: regRole === 'vet' ? `CRMV-${regCrmvState} ${regCrmv}` : undefined,
      crmvState: regRole === 'vet' ? regCrmvState : undefined,
      clinicName: regRole === 'vet' ? regClinic : undefined,
      unit: regUnit
    };

    onRegister(regData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-[#0b4d3a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-600 flex items-center justify-center text-white font-bold">
              🐾
            </div>
            <div>
              <h3 className="font-bold text-base leading-tight">
                {mode === 'login' ? 'Acessar Amor ao Bicho' : mode === 'register' ? 'Criar Conta de Acesso' : 'Recuperar Senha'}
              </h3>
              <p className="text-[11px] text-emerald-200">
                Farmácia de Manipulação Veterinária • Americana & Valinhos
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-emerald-200 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Forced Message (se tentou fazer ação que exige login) */}
        {forcedMessage && (
          <div className="bg-amber-50 border-b border-amber-200 px-6 py-2.5 flex items-center gap-2 text-xs text-amber-900 font-medium">
            <AlertCircle className="w-4 h-4 text-amber-600 shrink-0" />
            <span>{forcedMessage}</span>
          </div>
        )}

        {/* Mode Switcher Tabs */}
        <div className="flex border-b border-slate-200 bg-slate-50 text-xs">
          <button
            onClick={() => { setMode('login'); setErrorMessage(''); }}
            className={`flex-1 py-3 font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'login'
                ? 'border-emerald-700 text-emerald-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <LogIn className="w-3.5 h-3.5" />
            <span>Já Tenho Conta (Entrar)</span>
          </button>
          <button
            onClick={() => { setMode('register'); setErrorMessage(''); }}
            className={`flex-1 py-3 font-bold border-b-2 transition-colors flex items-center justify-center gap-1.5 ${
              mode === 'register'
                ? 'border-emerald-700 text-emerald-950 bg-white'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Criar Nova Conta</span>
          </button>
        </div>

        <div className="p-6">
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-start gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* TAB 1: LOGIN */}
          {mode === 'login' && (
            <div className="space-y-5">
              <form onSubmit={handleManualLogin} className="space-y-3.5">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail Cadastrado
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type="email"
                      required
                      value={loginEmail}
                      onChange={(e) => setLoginEmail(e.target.value)}
                      placeholder="seu.email@exemplo.com.br"
                      className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label className="block text-xs font-semibold text-slate-700">
                      Senha
                    </label>
                    <button
                      type="button"
                      onClick={() => setMode('forgot')}
                      className="text-[11px] text-emerald-700 hover:underline"
                    >
                      Esqueceu a senha?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={loginPassword}
                      onChange={(e) => setLoginPassword(e.target.value)}
                      placeholder="••••••••"
                      className="w-full pl-9 pr-9 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-all mt-2"
                >
                  Entrar no Aplicativo
                </button>
              </form>

              {/* Acesso Rápido de Demonstração (1-Clique) */}
              <div className="pt-3 border-t border-slate-200 space-y-2.5">
                <div className="flex items-center justify-between text-slate-500">
                  <span className="text-[11px] font-semibold uppercase tracking-wider">
                    Ou acesse com 1-clique (Contas Pré-configuradas):
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                  {INITIAL_USERS.map((u) => (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(u)}
                      className="p-2.5 rounded-xl border border-slate-200 hover:border-emerald-500 bg-slate-50 hover:bg-emerald-50/50 text-left transition-all flex items-center gap-2.5"
                    >
                      <img
                        src={u.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                        alt={u.name}
                        className="w-8 h-8 rounded-full object-cover shrink-0 border border-slate-200"
                      />
                      <div className="overflow-hidden">
                        <p className="font-bold text-slate-800 truncate text-[11px]">{u.name}</p>
                        <p className="text-[10px] text-emerald-800 truncate">
                          {u.role === 'tutor' ? '🐶 Tutor (Mariana)' : u.role === 'vet' ? '🩺 Vet (CRMV-SP)' : `🏢 Farmácia (${u.pharmacyUnit})`}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: CADASTRO DE NOVO USUÁRIO */}
          {mode === 'register' && (
            <form onSubmit={handleManualRegister} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Qual é o seu perfil de acesso?
                </label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setRegRole('tutor')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      regRole === 'tutor'
                        ? 'border-emerald-700 bg-emerald-50 text-emerald-950 ring-1 ring-emerald-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    🐶 Tutor (Pet)
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('vet')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      regRole === 'vet'
                        ? 'border-teal-700 bg-teal-50 text-teal-950 ring-1 ring-teal-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    🩺 Veterinário
                  </button>
                  <button
                    type="button"
                    onClick={() => setRegRole('admin')}
                    className={`py-2 px-2 rounded-xl text-xs font-bold border transition-all text-center ${
                      regRole === 'admin'
                        ? 'border-amber-700 bg-amber-50 text-amber-950 ring-1 ring-amber-600'
                        : 'border-slate-200 text-slate-600 hover:border-slate-300'
                    }`}
                  >
                    🏢 Farmácia
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  required
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  placeholder="Ex: João da Silva"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    E-mail *
                  </label>
                  <input
                    type="email"
                    required
                    value={regEmail}
                    onChange={(e) => setRegEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    WhatsApp / Telefone *
                  </label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    placeholder="(19) 99876-5432"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Campos específicos para Médico-Veterinário */}
              {regRole === 'vet' && (
                <div className="bg-teal-50/70 p-3 rounded-xl border border-teal-200 space-y-3">
                  <div className="grid grid-cols-3 gap-2">
                    <div className="col-span-2">
                      <label className="block text-[11px] font-bold text-teal-950 mb-1">
                        Número CRMV *
                      </label>
                      <input
                        type="text"
                        required
                        value={regCrmv}
                        onChange={(e) => setRegCrmv(e.target.value)}
                        placeholder="Ex: 38920"
                        className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-teal-300 bg-white font-mono font-bold"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-teal-950 mb-1">
                        UF *
                      </label>
                      <select
                        value={regCrmvState}
                        onChange={(e) => setRegCrmvState(e.target.value)}
                        className="w-full px-2 py-1.5 text-xs rounded-lg border border-teal-300 bg-white font-bold"
                      >
                        <option value="SP">SP</option>
                        <option value="MG">MG</option>
                        <option value="RJ">RJ</option>
                        <option value="PR">PR</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-teal-950 mb-1">
                      Clínica / Hospital Veterinário
                    </label>
                    <input
                      type="text"
                      value={regClinic}
                      onChange={(e) => setRegClinic(e.target.value)}
                      placeholder="Ex: Clínica Veterinária São Francisco"
                      className="w-full px-2.5 py-1.5 text-xs rounded-lg border border-teal-300 bg-white"
                    />
                  </div>
                </div>
              )}

              {/* Campos para Tutor */}
              {regRole === 'tutor' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      CPF (para NF e Receituário)
                    </label>
                    <input
                      type="text"
                      value={regCpf}
                      onChange={(e) => setRegCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Cidade (Região RMC)
                    </label>
                    <select
                      value={regCity}
                      onChange={(e) => setRegCity(e.target.value)}
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium"
                    >
                      <option value="Americana">Americana</option>
                      <option value="Valinhos">Valinhos</option>
                      <option value="Santa Bárbara d'Oeste">Santa Bárbara d'Oeste</option>
                      <option value="Nova Odessa">Nova Odessa</option>
                      <option value="Campinas">Campinas</option>
                      <option value="Vinhedo">Vinhedo</option>
                      <option value="Sumaré">Sumaré</option>
                      <option value="Hortolândia">Hortolândia</option>
                    </select>
                  </div>
                </div>
              )}

              {/* Campos para Farmácia */}
              {regRole === 'admin' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Unidade de Lotação Amor ao Bicho:
                  </label>
                  <select
                    value={regUnit}
                    onChange={(e) => setRegUnit(e.target.value as PharmacyUnit)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 bg-white"
                  >
                    <option value="americana">Americana (Dra. Flávia Semeghini)</option>
                    <option value="valinhos">Valinhos (Dra. Carolina Giordano)</option>
                  </select>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Criar Senha de Acesso *
                </label>
                <input
                  type="password"
                  required
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white font-bold rounded-xl text-xs shadow-md transition-all"
              >
                Concluir Cadastro e Acessar ✓
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
