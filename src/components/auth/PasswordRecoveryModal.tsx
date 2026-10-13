import React, { useState, useEffect, useRef } from 'react';
import { 
  X, 
  Mail, 
  MessageSquare, 
  Lock, 
  KeyRound, 
  CheckCircle2, 
  AlertCircle, 
  ArrowLeft, 
  ArrowRight, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  ShieldCheck,
  Sparkles
} from 'lucide-react';
import { UserAccount } from '../../types';
import { INITIAL_USERS } from '../../data/mockData';

interface PasswordRecoveryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (user: UserAccount) => void;
  onBackToLogin: () => void;
  defaultEmail?: string;
}

export const PasswordRecoveryModal: React.FC<PasswordRecoveryModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
  onBackToLogin,
  defaultEmail = ''
}) => {
  // Passos: 1 = Envio, 2 = Código OTP, 3 = Nova Senha, 4 = Sucesso
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);

  // Passo 1: Canal e Identificador
  const [identifier, setIdentifier] = useState(defaultEmail || 'mariana.duarte@email.com');
  const [channel, setChannel] = useState<'email' | 'sms'>('email');

  // Passo 2: Código OTP de 6 dígitos
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const [generatedCode, setGeneratedCode] = useState('739412');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [otpError, setOtpError] = useState('');
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  // Passo 3: Nova Senha
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  // Usuário recuperado
  const [recoveredUser, setRecoveredUser] = useState<UserAccount | null>(null);

  // Timer do OTP
  useEffect(() => {
    let timer: any;
    if (step === 2 && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => {
          if (prev <= 1) {
            setCanResend(true);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, countdown]);

  if (!isOpen) return null;

  // Gerar código aleatório
  const generateNewOtp = () => {
    const code = Math.floor(100000 + Math.random() * 900000).toString();
    setGeneratedCode(code);
    setCountdown(60);
    setCanResend(false);
    setOtpDigits(['', '', '', '', '', '']);
    setOtpError('');
    return code;
  };

  // Passo 1: Enviar código
  const handleSendCode = (e: React.FormEvent) => {
    e.preventDefault();
    if (!identifier.trim()) return;

    // Localiza usuário correspondente ou utiliza padrão
    const found = INITIAL_USERS.find(
      (u) =>
        u.email.toLowerCase() === identifier.trim().toLowerCase() ||
        u.phone.replace(/\D/g, '').includes(identifier.replace(/\D/g, ''))
    ) || INITIAL_USERS[0];

    setRecoveredUser(found);
    const newCode = generateNewOtp();
    setStep(2);

    // Auto-focus no primeiro dígito
    setTimeout(() => {
      inputRefs.current[0]?.focus();
    }, 150);
  };

  // Manipulação dos inputs OTP (1 por caixa, com suporte a paste e backspace)
  const handleOtpChange = (index: number, value: string) => {
    setOtpError('');
    const char = value.slice(-1); // Apenas o último caractere digitado

    if (!/^\d*$/.test(char)) return; // Somente números

    const newDigits = [...otpDigits];
    newDigits[index] = char;
    setOtpDigits(newDigits);

    // Avança o foco se preencheu
    if (char && index < 5) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      inputRefs.current[index - 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pasted)) {
      const split = pasted.split('');
      setOtpDigits(split);
      inputRefs.current[5]?.focus();
    }
  };

  // Preencher código de teste com 1 clique
  const handleAutoFillTestOtp = () => {
    setOtpDigits(generatedCode.split(''));
    setOtpError('');
    inputRefs.current[5]?.focus();
  };

  // Passo 2: Validar código
  const handleVerifyOtp = (e: React.FormEvent) => {
    e.preventDefault();
    const entered = otpDigits.join('');

    if (entered.length < 6) {
      setOtpError('Preencha os 6 dígitos do código.');
      return;
    }

    if (entered !== generatedCode) {
      setOtpError('Código inválido ou expirado. Tente novamente.');
      return;
    }

    setOtpError('');
    setStep(3);
  };

  // Passo 3: Salvar nova senha
  const handleSaveNewPassword = (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');

    if (newPassword.length < 6) {
      setPasswordError('A nova senha deve ter no mínimo 6 caracteres.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('As senhas digitadas não coincidem.');
      return;
    }

    setStep(4);
  };

  // Concluir e logar automaticamente
  const handleFinishAndLogin = () => {
    if (recoveredUser) {
      onSuccessLogin(recoveredUser);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-md w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Modal Top Header */}
        <div className="bg-[#0b4d3a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-700 flex items-center justify-center text-white">
              <KeyRound className="w-4 h-4 text-emerald-200" />
            </div>
            <div>
              <h3 className="font-bold text-sm leading-tight">
                Recuperação de Senha
              </h3>
              <p className="text-[11px] text-emerald-200">
                Amor ao Bicho • Segurança Farmacêutica
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

        {/* Stepper Progress */}
        <div className="px-6 py-2.5 bg-emerald-50/60 border-b border-emerald-100/60 flex items-center justify-between text-[11px]">
          <span className={`font-semibold ${step === 1 ? 'text-emerald-900 font-bold' : 'text-slate-400'}`}>
            1. Canal
          </span>
          <span className="text-slate-300">→</span>
          <span className={`font-semibold ${step === 2 ? 'text-emerald-900 font-bold' : 'text-slate-400'}`}>
            2. Código OTP
          </span>
          <span className="text-slate-300">→</span>
          <span className={`font-semibold ${step === 3 ? 'text-emerald-900 font-bold' : 'text-slate-400'}`}>
            3. Nova Senha
          </span>
          <span className="text-slate-300">→</span>
          <span className={`font-semibold ${step === 4 ? 'text-emerald-900 font-bold' : 'text-slate-400'}`}>
            4. Concluído
          </span>
        </div>

        <div className="p-6">
          {/* PASSO 1: IDENTIFICAÇÃO E ESCOLHA DE CANAL */}
          {step === 1 && (
            <form onSubmit={handleSendCode} className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Como deseja receber seu código?
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Selecione o canal para envio do código de verificação de 6 dígitos.
                </p>
              </div>

              {/* Seletor de canal (E-mail ou SMS) */}
              <div className="grid grid-cols-2 gap-2.5">
                <button
                  type="button"
                  onClick={() => setChannel('email')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    channel === 'email'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <Mail className="w-4 h-4 text-emerald-700 mb-1" />
                  <p className="text-xs font-bold">Por E-mail</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Link e código OTP</p>
                </button>

                <button
                  type="button"
                  onClick={() => setChannel('sms')}
                  className={`p-3 rounded-xl border text-left transition-all ${
                    channel === 'sms'
                      ? 'border-emerald-600 bg-emerald-50/80 ring-2 ring-emerald-500/20 text-emerald-950 font-bold'
                      : 'border-slate-200 text-slate-700 hover:border-slate-300'
                  }`}
                >
                  <MessageSquare className="w-4 h-4 text-emerald-700 mb-1" />
                  <p className="text-xs font-bold">SMS / WhatsApp</p>
                  <p className="text-[10px] text-slate-500 font-normal mt-0.5">Mensagem direta no celular</p>
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  {channel === 'email' ? 'Seu E-mail Cadastrado:' : 'Seu Telefone ou Celular:'}
                </label>
                <div className="relative">
                  {channel === 'email' ? (
                    <Mail className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  ) : (
                    <MessageSquare className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  )}
                  <input
                    type={channel === 'email' ? 'email' : 'text'}
                    required
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={channel === 'email' ? 'seu.email@exemplo.com' : '(19) 99123-4567'}
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-[11px] text-slate-600 space-y-1">
                <span className="font-semibold text-slate-800">Dica de Acesso Rápido:</span>
                <p>
                  Usuários de demonstração cadastrados: <strong>mariana.duarte@email.com</strong> (Tutor) ou <strong>lucas.silveira@veterinaria.com.br</strong> (Veterinário).
                </p>
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={onBackToLogin}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold flex items-center gap-1"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar ao login</span>
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Enviar Código</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* PASSO 2: DIGITAÇÃO DO CÓDIGO OTP */}
          {step === 2 && (
            <form onSubmit={handleVerifyOtp} className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Insira o Código de Verificação
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Enviamos um código de 6 dígitos para{' '}
                  <strong className="text-slate-800">
                    {channel === 'email' ? identifier : `SMS (${identifier})`}
                  </strong>
                  .
                </p>
              </div>

              {/* Banner de Demonstração Interativo */}
              <div className="bg-emerald-50/80 border border-emerald-200 rounded-xl p-3 flex items-center justify-between text-xs">
                <div>
                  <span className="text-[10px] uppercase font-bold text-emerald-800">
                    Simulador Amor ao Bicho ({channel.toUpperCase()}):
                  </span>
                  <p className="font-mono font-bold text-emerald-950 text-sm mt-0.5">
                    {generatedCode}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAutoFillTestOtp}
                  className="px-2.5 py-1 bg-emerald-700 hover:bg-emerald-800 text-white text-[11px] font-bold rounded-lg shadow-2xs"
                >
                  Preencher Código
                </button>
              </div>

              {/* 6 Caixas para Dígitos OTP */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-2 text-center">
                  Digite os 6 dígitos:
                </label>
                <div className="flex justify-center gap-2" onPaste={handleOtpPaste}>
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => { inputRefs.current[idx] = el; }}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-bold font-mono rounded-xl border border-slate-300 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-500/30 focus:outline-hidden bg-slate-50 focus:bg-white transition-all"
                    />
                  ))}
                </div>
              </div>

              {otpError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{otpError}</span>
                </div>
              )}

              {/* Contador de Reenvio */}
              <div className="text-center text-xs text-slate-500">
                {countdown > 0 ? (
                  <span>Reenviar código em {countdown} segundos</span>
                ) : (
                  <button
                    type="button"
                    onClick={generateNewOtp}
                    className="text-emerald-700 font-bold hover:underline inline-flex items-center gap-1"
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
                    <span>Reenviar novo código</span>
                  </button>
                )}
              </div>

              <div className="pt-2 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="text-xs text-slate-600 hover:text-slate-900 font-semibold"
                >
                  ← Alterar canal / e-mail
                </button>

                <button
                  type="submit"
                  className="px-5 py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <span>Validar Código</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </form>
          )}

          {/* PASSO 3: NOVA SENHA */}
          {step === 3 && (
            <form onSubmit={handleSaveNewPassword} className="space-y-4">
              <div>
                <h4 className="font-bold text-sm text-slate-900">
                  Crie sua Nova Senha
                </h4>
                <p className="text-xs text-slate-500 mt-1">
                  Código verificado com sucesso para {recoveredUser?.name || 'sua conta'}.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nova Senha (mínimo 6 caracteres) *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Nova senha segura"
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

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Confirme a Nova Senha *
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Repita a nova senha"
                    className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                  />
                </div>
              </div>

              {/* Indicador de Força */}
              <div className="space-y-1 text-[11px]">
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className={newPassword.length >= 6 ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {newPassword.length >= 6 ? '✓' : '•'} Mínimo de 6 caracteres
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-600">
                  <span className={newPassword && newPassword === confirmPassword ? 'text-emerald-600 font-bold' : 'text-slate-400'}>
                    {newPassword && newPassword === confirmPassword ? '✓' : '•'} As duas senhas coincidem
                  </span>
                </div>
              </div>

              {passwordError && (
                <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
                  <span>{passwordError}</span>
                </div>
              )}

              <div className="pt-2">
                <button
                  type="submit"
                  className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Redefinir Senha e Continuar</span>
                </button>
              </div>
            </form>
          )}

          {/* PASSO 4: SUCESSO E LOGIN AUTOMÁTICO */}
          {step === 4 && (
            <div className="text-center space-y-4 py-2">
              <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-700 mx-auto shadow-inner">
                <CheckCircle2 className="w-8 h-8" />
              </div>

              <div>
                <h4 className="font-bold text-base text-slate-900">
                  Senha Redefinida com Sucesso!
                </h4>
                <p className="text-xs text-slate-600 mt-1">
                  Sua conta Amor ao Bicho (<strong>{recoveredUser?.name}</strong>) foi atualizada com a nova credencial de segurança.
                </p>
              </div>

              <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-3 text-xs text-emerald-800 flex items-center gap-2 text-left">
                <Sparkles className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>
                  Você já pode acessar seu histórico de manipulações, doses do pet e orçamentos.
                </span>
              </div>

              <button
                type="button"
                onClick={handleFinishAndLogin}
                className="w-full py-3 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold shadow-md transition-all"
              >
                Entrar Diretamente no Aplicativo →
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
