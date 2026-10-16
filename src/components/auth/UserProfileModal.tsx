import React, { useState } from 'react';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  ShieldCheck, 
  LogOut, 
  Check, 
  Stethoscope, 
  Building2 
} from 'lucide-react';
import { UserAccount } from '../../types';

interface UserProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onUpdateUser: (updatedUser: UserAccount) => void;
  onLogout: () => void;
  onOpenAuthModal?: () => void;
  onSwitchToAdmin?: () => void;
}

export const UserProfileModal: React.FC<UserProfileModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  onUpdateUser,
  onLogout,
  onOpenAuthModal,
  onSwitchToAdmin
}) => {
  const [name, setName] = useState(currentUser.name);
  const [phone, setPhone] = useState(currentUser.phone);
  const [cpf, setCpf] = useState(currentUser.cpf || '');
  const [street, setStreet] = useState(currentUser.address?.street || '');
  const [number, setNumber] = useState(currentUser.address?.number || '');
  const [neighborhood, setNeighborhood] = useState(currentUser.address?.neighborhood || '');
  const [city, setCity] = useState(currentUser.address?.city || 'Americana');
  const [cep, setCep] = useState(currentUser.address?.cep || '');
  const [clinicName, setClinicName] = useState(currentUser.clinicName || '');
  const [savedSuccess, setSavedSuccess] = useState(false);

  if (!isOpen) return null;

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    const updated: UserAccount = {
      ...currentUser,
      name,
      phone,
      cpf: cpf.trim() || undefined,
      clinicName: clinicName.trim() || undefined,
      address: {
        street,
        number,
        neighborhood,
        city,
        state: 'SP',
        cep
      }
    };
    onUpdateUser(updated);
    setSavedSuccess(true);
    setTimeout(() => {
      setSavedSuccess(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0b4d3a] px-6 py-4 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=150&q=80'}
              alt={currentUser.name}
              className="w-10 h-10 rounded-full object-cover border-2 border-emerald-300"
            />
            <div>
              <h3 className="font-bold text-base">{currentUser.name}</h3>
              <p className="text-xs text-emerald-200">
                {currentUser.role === 'tutor' 
                  ? 'Tutor de Pet Cadastrado' 
                  : currentUser.role === 'vet' 
                  ? `Médico-Veterinário (${currentUser.crmv})` 
                  : `Equipe Farmacêutica (${currentUser.crf || 'Amor ao Bicho'})`}
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

        <form onSubmit={handleSave} className="p-6 space-y-4">
          {/* Menu de Ações Rápidas: Cadastro e Farmácia */}
          <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <span className="text-[11px] font-bold text-slate-700 block text-left">
              Menu de Acesso & Contas
            </span>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onOpenAuthModal) onOpenAuthModal();
                }}
                className="p-2.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <User className="w-3.5 h-3.5 text-emerald-600" />
                <span>+ Criar Novo Cadastro</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  onClose();
                  if (onSwitchToAdmin) onSwitchToAdmin();
                }}
                className="p-2.5 rounded-xl border border-amber-200 bg-white hover:bg-amber-50 text-amber-950 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs cursor-pointer"
              >
                <Building2 className="w-3.5 h-3.5 text-amber-600" />
                <span>Acesso Farmácia</span>
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nome Completo
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp / Telefone
              </label>
              <input
                type="tel"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                E-mail (Identificador)
              </label>
              <input
                type="email"
                disabled
                value={currentUser.email}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-200 bg-slate-100 text-slate-500 cursor-not-allowed"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                CPF
              </label>
              <input
                type="text"
                value={cpf}
                onChange={(e) => setCpf(e.target.value)}
                placeholder="000.000.000-00"
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
              />
            </div>
          </div>

          {currentUser.role === 'vet' && (
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Clínica / Hospital
              </label>
              <input
                type="text"
                value={clinicName}
                onChange={(e) => setClinicName(e.target.value)}
                className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-teal-500 focus:outline-hidden"
              />
            </div>
          )}

          {/* Endereço de Entrega */}
          <div className="border-t border-slate-200 pt-3 space-y-3">
            <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-700" />
              Endereço Principal para Cálculo de Entrega (RMC)
            </span>

            <div className="grid grid-cols-3 gap-2">
              <div className="col-span-2">
                <input
                  type="text"
                  placeholder="Rua / Avenida"
                  value={street}
                  onChange={(e) => setStreet(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Número"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div>
                <input
                  type="text"
                  placeholder="Bairro"
                  value={neighborhood}
                  onChange={(e) => setNeighborhood(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
              <div>
                <select
                  value={city}
                  onChange={(e) => setCity(e.target.value)}
                  className="w-full px-2 py-1.5 text-xs rounded-xl border border-slate-300 bg-white"
                >
                  <option value="Americana">Americana</option>
                  <option value="Valinhos">Valinhos</option>
                  <option value="Santa Bárbara d'Oeste">Santa Bárbara d'Oeste</option>
                  <option value="Nova Odessa">Nova Odessa</option>
                  <option value="Campinas">Campinas</option>
                  <option value="Vinhedo">Vinhedo</option>
                </select>
              </div>
              <div>
                <input
                  type="text"
                  placeholder="CEP"
                  value={cep}
                  onChange={(e) => setCep(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-xl border border-slate-300 focus:ring-2 focus:ring-emerald-500 focus:outline-hidden"
                />
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
            <button
              type="button"
              onClick={onLogout}
              className="text-xs text-rose-700 hover:text-rose-900 font-semibold flex items-center gap-1.5 px-3 py-1.5 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Encerrar Sessão (Sair)</span>
            </button>

            <button
              type="submit"
              className="px-5 py-2 bg-emerald-800 hover:bg-emerald-900 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs"
            >
              {savedSuccess ? <Check className="w-4 h-4" /> : null}
              <span>{savedSuccess ? 'Salvo!' : 'Salvar Dados'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
