import React, { useState, useEffect } from 'react';
import { 
  X, 
  Heart, 
  User, 
  LogOut, 
  CheckCircle2, 
  Save, 
  Phone,
  ShieldCheck,
  MapPin,
  Lock
} from 'lucide-react';
import { UserAccount, PharmacyUnit } from '../../types';
import { PHARMACY_UNITS } from '../../data/mockData';

interface AppMenuModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount | null;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
  onOpenAuth?: () => void;
  // Legacy optional props to avoid type mismatches
  onLogin?: (user: UserAccount) => void;
  onQuickRegister?: (email: string, password?: string, extra?: any) => void;
  onQuickLogin?: (email: string, password?: string) => void;
  onStaffLogin?: (unit: PharmacyUnit) => void;
  selectedUnit?: PharmacyUnit;
  onUnitChange?: (unit: PharmacyUnit) => void;
  initialTab?: string;
}

export const AppMenuModal: React.FC<AppMenuModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenAuth,
  selectedUnit
}) => {
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

  // Formatador de WhatsApp
  const handleProfilePhoneChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 2) {
      setProfilePhone(digits ? `(${digits}` : '');
    } else if (digits.length <= 7) {
      setProfilePhone(`(${digits.slice(0, 2)}) ${digits.slice(2)}`);
    } else {
      setProfilePhone(`(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`);
    }
  };

  // Formatador de CPF
  const handleProfileCpfChange = (val: string) => {
    const digits = val.replace(/\D/g, '').slice(0, 11);
    if (digits.length <= 3) {
      setProfileCpf(digits);
    } else if (digits.length <= 6) {
      setProfileCpf(`${digits.slice(0, 3)}.${digits.slice(3)}`);
    } else if (digits.length <= 9) {
      setProfileCpf(`${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`);
    } else {
      setProfileCpf(`${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`);
    }
  };

  // Sincroniza dados do usuário ao abrir o modal
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
  }, [currentUser, selectedUnit, isOpen]);

  if (!isOpen) return null;

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
        city: profileCity.trim() || 'Americana',
        state: 'SP',
        cep: profileCep
      }
    };

    onUpdateUser(updated);
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      onClose();
    }, 1200);
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

        {/* Conteúdo Exclusivo dos Dados do Usuário */}
        <div className="p-5 sm:p-6 space-y-4 max-h-[75vh] overflow-y-auto">
          {currentUser ? (
            <div className="space-y-4 animate-in fade-in">
              {/* Card Resumo do Usuário */}
              <div className="p-3.5 rounded-2xl bg-emerald-50/70 border border-emerald-200/70 flex items-center justify-between gap-3">
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
                    onClose();
                  }}
                  className="p-2 sm:px-2.5 sm:py-1.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center gap-1 transition-all cursor-pointer"
                  title="Sair desta conta"
                >
                  <LogOut className="w-4 h-4" />
                  <span className="hidden sm:inline">Sair</span>
                </button>
              </div>

              {saveSuccess && (
                <div className="p-3 rounded-xl bg-emerald-100 border border-emerald-300 text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in">
                  <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
                  <span>Dados salvos com sucesso!</span>
                </div>
              )}

              {/* Formulário de Edição de Dados */}
              <form onSubmit={handleSaveProfile} className="space-y-3 pt-1">
                {/* Nome do Tutor */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Nome do Tutor
                  </label>
                  <input
                    type="text"
                    required
                    value={profileName}
                    onChange={(e) => setProfileName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900"
                  />
                </div>

                {/* WhatsApp / Telefone */}
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    WhatsApp / Telefone
                  </label>
                  <input
                    type="tel"
                    required
                    value={profilePhone}
                    onChange={(e) => handleProfilePhoneChange(e.target.value)}
                    placeholder="(19) 99999-9999"
                    className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900"
                  />
                </div>

                {/* CPF e Cidade */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      CPF (Para Cupom Fiscal)
                    </label>
                    <input
                      type="text"
                      value={profileCpf}
                      onChange={(e) => handleProfileCpfChange(e.target.value)}
                      placeholder="000.000.000-00"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Cidade Principal
                    </label>
                    <input
                      type="text"
                      value={profileCity}
                      onChange={(e) => setProfileCity(e.target.value)}
                      placeholder="Digite sua cidade"
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Endereço e Número */}
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900"
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
                      className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden font-medium text-slate-900"
                    />
                  </div>
                </div>

                {/* Botão de Salvar Alterações */}
                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-emerald-700 to-teal-800 hover:from-emerald-800 hover:to-teal-900 text-white font-bold text-xs sm:text-sm shadow-md shadow-emerald-800/20 transition-all active:scale-[0.98] flex items-center justify-center gap-2 cursor-pointer mt-2"
                >
                  <Save className="w-4 h-4" />
                  <span>Salvar Alterações de Perfil</span>
                </button>
              </form>
            </div>
          ) : (
            <div className="text-center py-8 space-y-3">
              <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mx-auto text-slate-400">
                <User className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-sm text-slate-800">
                Nenhum usuário conectado
              </h4>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Crie seu cadastro ou acesse sua conta para visualizar e atualizar seus dados cadastrais.
              </p>
              {onOpenAuth && (
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenAuth();
                  }}
                  className="px-4 py-2 rounded-xl bg-emerald-700 text-white text-xs font-bold shadow-xs hover:bg-emerald-800 transition-colors cursor-pointer"
                >
                  Criar Cadastro / Entrar
                </button>
              )}
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
