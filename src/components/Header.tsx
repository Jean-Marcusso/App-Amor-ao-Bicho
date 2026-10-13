import React from 'react';
import { 
  Heart, 
  MapPin, 
  MessageSquare, 
  User, 
  Stethoscope, 
  Building2,
  ExternalLink,
  LogIn
} from 'lucide-react';
import { UserRole, PharmacyUnit, UserAccount } from '../types';
import { PHARMACY_UNITS } from '../data/mockData';

interface HeaderProps {
  currentRole: UserRole;
  onRoleChange: (role: UserRole) => void;
  selectedUnit: PharmacyUnit;
  onUnitChange: (unit: PharmacyUnit) => void;
  onOpenNewPrescription: () => void;
  currentUser: UserAccount | null;
  onOpenAuthModal: (mode?: 'login' | 'register') => void;
  onOpenProfileModal: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedUnit,
  onUnitChange,
  onOpenNewPrescription,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal
}) => {
  const unit = PHARMACY_UNITS[selectedUnit];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs">
      {/* Top Banner: Localidades & Responsáveis Técnicas */}
      <div className="bg-[#0b4d3a] text-emerald-50 text-xs py-1.5 px-4">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1.5 font-medium">
              <MapPin className="w-3.5 h-3.5 text-emerald-300" />
              Unidades em Americana e Valinhos - SP
            </span>
            <span className="hidden sm:inline text-emerald-300/60">•</span>
            <span className="hidden sm:inline text-emerald-200">
              Farmacêuticas Responsáveis: Dra. Flávia Semeghini & Dra. Carolina Giordano
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-emerald-200/90 text-[11px]">Unidade Ativa:</span>
            <div className="inline-flex rounded-md p-0.5 bg-emerald-900/60">
              <button
                type="button"
                onClick={() => onUnitChange('americana')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedUnit === 'americana'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Americana
              </button>
              <button
                type="button"
                onClick={() => onUnitChange('valinhos')}
                className={`px-2.5 py-0.5 rounded text-[11px] font-medium transition-colors ${
                  selectedUnit === 'valinhos'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Valinhos
              </button>
            </div>
            <a
              href="https://amoraobicho.com.br/"
              target="_blank"
              rel="noopener noreferrer"
              className="hidden md:flex items-center gap-1 text-[11px] text-emerald-200 hover:text-white transition-colors ml-1"
            >
              <span>Site Oficial</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => onRoleChange('tutor')}>
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-600 to-teal-700 flex items-center justify-center text-white shadow-md shadow-emerald-700/20">
              <div className="relative">
                <Heart className="w-5 h-5 fill-rose-300/40 text-white" />
                <span className="absolute -bottom-1 -right-1 text-xs">🐾</span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xl font-bold tracking-tight text-slate-900 font-sans">
                  Amor ao Bicho
                </span>
                <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                  Manipulação Veterinária
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {unit.name} • Resp. Técnica: {unit.technicalResponsible} ({unit.crf})
              </p>
            </div>
          </div>

          {/* Quick Mobile Action */}
          <div className="flex md:hidden items-center gap-2">
            {currentUser ? (
              <button
                onClick={onOpenProfileModal}
                className="p-1.5 rounded-lg border border-slate-200 bg-slate-50 text-xs font-semibold flex items-center gap-1 text-slate-800"
              >
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80'}
                  alt={currentUser.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="truncate max-w-[70px]">{currentUser.name.split(' ')[0]}</span>
              </button>
            ) : (
              <button
                onClick={() => onOpenAuthModal('login')}
                className="px-2.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-semibold"
              >
                Entrar
              </button>
            )}
          </div>
        </div>

        {/* B2B2C Perspective Switcher Tabs */}
        <div className="flex items-center flex-wrap gap-1 p-1 bg-slate-100/90 rounded-xl border border-slate-200/80">
          <button
            onClick={() => onRoleChange('tutor')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentRole === 'tutor'
                ? 'bg-white text-emerald-900 shadow-sm border border-slate-200/50 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <User className="w-3.5 h-3.5 text-emerald-600" />
            <span>Área do Tutor</span>
          </button>

          <button
            onClick={() => onRoleChange('vet')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentRole === 'vet'
                ? 'bg-white text-teal-900 shadow-sm border border-slate-200/50 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Stethoscope className="w-3.5 h-3.5 text-teal-600" />
            <span>Médico-Veterinário</span>
          </button>

          <button
            onClick={() => onRoleChange('admin')}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
              currentRole === 'admin'
                ? 'bg-white text-amber-900 shadow-sm border border-slate-200/50 font-semibold'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Building2 className="w-3.5 h-3.5 text-amber-600" />
            <span>Farmácia (Laboratório)</span>
          </button>
        </div>

        {/* Right Action buttons: Auth Status + WhatsApp */}
        <div className="hidden lg:flex items-center gap-3">
          {currentUser ? (
            <div
              onClick={onOpenProfileModal}
              className="cursor-pointer flex items-center gap-2.5 bg-slate-50 hover:bg-emerald-50/70 border border-slate-200 hover:border-emerald-300 px-3 py-1.5 rounded-xl transition-all"
              title="Clique para gerenciar seu perfil ou sair"
            >
              <img
                src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=100&q=80'}
                alt={currentUser.name}
                className="w-7 h-7 rounded-full object-cover border border-emerald-600/40"
              />
              <div className="text-left">
                <p className="text-xs font-bold text-slate-900 leading-tight">
                  {currentUser.name}
                </p>
                <p className="text-[10px] text-emerald-800 font-medium leading-none">
                  {currentUser.role === 'tutor'
                    ? 'Tutor Conectado'
                    : currentUser.role === 'vet'
                    ? `${currentUser.crmv || 'CRMV-SP'}`
                    : 'Equipe Farmacêutica'}
                </p>
              </div>
            </div>
          ) : (
            <button
              onClick={() => onOpenAuthModal('login')}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold border border-slate-200 transition-colors"
            >
              <LogIn className="w-3.5 h-3.5 text-emerald-700" />
              <span>Entrar / Cadastrar</span>
            </button>
          )}

          <a
            href={`https://wa.me/55${unit.whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20atendimento%20da%20Amor%20ao%20Bicho`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100/80 px-3 py-2 rounded-lg border border-emerald-200/60 transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
            <span>WhatsApp {selectedUnit === 'americana' ? 'Americana' : 'Valinhos'}</span>
          </a>

          {currentRole === 'tutor' && (
            <button
              onClick={onOpenNewPrescription}
              className="flex items-center gap-2 bg-[#0b4d3a] hover:bg-[#093e2f] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow"
            >
              <span>+ Enviar Receita</span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};
