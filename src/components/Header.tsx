import React from 'react';
import { 
  Heart, 
  MapPin, 
  MessageSquare, 
  User, 
  Building2,
  ExternalLink,
  LogIn,
  Sparkles,
  Phone,
  Menu
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
  onOpenMenu?: (tab?: 'auth' | 'profile' | 'staff') => void;
}

export const Header: React.FC<HeaderProps> = ({
  currentRole,
  onRoleChange,
  selectedUnit,
  onUnitChange,
  onOpenNewPrescription,
  currentUser,
  onOpenAuthModal,
  onOpenProfileModal,
  onOpenMenu
}) => {
  const unit = PHARMACY_UNITS[selectedUnit];

  return (
    <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-emerald-950/10 shadow-xs">
      {/* Top Banner: Localidades & Responsáveis Técnicas */}
      <div className="bg-[#0b4d3a] text-emerald-50 text-xs py-1.5 px-3 sm:px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          {/* Unidades & Farmacêuticas */}
          <div className="flex items-center gap-2 sm:gap-4 min-w-0">
            <span className="flex items-center gap-1.5 font-medium truncate text-[11px] sm:text-xs">
              <MapPin className="w-3.5 h-3.5 text-emerald-300 shrink-0" />
              <span className="truncate">Americana e Valinhos - SP</span>
            </span>
            <span className="hidden sm:inline text-emerald-300/60">•</span>
            <span className="hidden lg:inline text-emerald-200 text-[11px]">
              Dra. Flávia Semeghini & Dra. Carolina Giordano
            </span>
          </div>

          {/* Seletor de Unidade Ativa */}
          <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0">
            <span className="text-emerald-200/90 text-[11px] hidden xs:inline">Unidade:</span>
            <div className="inline-flex rounded-lg p-0.5 bg-emerald-900/80 border border-emerald-700/50">
              <button
                type="button"
                onClick={() => onUnitChange('americana')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  selectedUnit === 'americana'
                    ? 'bg-emerald-500 text-white shadow-xs'
                    : 'text-emerald-200 hover:text-white'
                }`}
              >
                Americana
              </button>
              <button
                type="button"
                onClick={() => onUnitChange('valinhos')}
                className={`px-2 py-0.5 rounded-md text-[11px] font-semibold transition-all ${
                  selectedUnit === 'valinhos'
                    ? 'bg-emerald-500 text-white shadow-xs'
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
              title="Acessar site institucional"
            >
              <span>Site</span>
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-3.5 sm:px-6 py-2.5 sm:py-3 flex flex-col md:flex-row md:items-center justify-between gap-2.5 sm:gap-4">
        {/* Brand identity & Mobile Quick Actions */}
        <div className="flex items-center justify-between gap-2">
          {/* Brand Logo & Name */}
          <div 
            className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group min-w-0" 
            onClick={() => onRoleChange('tutor')}
            title="Ir para tela inicial"
          >
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-emerald-600 via-emerald-700 to-teal-800 flex items-center justify-center text-white shadow-md shadow-emerald-900/20 shrink-0 group-hover:scale-105 transition-transform">
              <div className="relative flex items-center justify-center">
                <Heart className="w-5 h-5 fill-rose-300/50 text-white" />
                <span className="absolute -bottom-1 -right-1 text-xs select-none">🐾</span>
              </div>
            </div>

            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-lg sm:text-xl font-extrabold tracking-tight text-slate-900 font-sans leading-none">
                  Amor ao Bicho
                </span>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200/70 shrink-0">
                  Manipulação Vet
                </span>
              </div>
              <p className="text-[11px] text-slate-500 truncate mt-0.5">
                {unit.name} • Resp. {unit.technicalResponsible.split(' ')[0]} {unit.technicalResponsible.split(' ')[1] || ''} ({unit.crf})
              </p>
            </div>
          </div>

          {/* Quick Mobile Actions (WhatsApp Direto + Menu) */}
          <div className="flex md:hidden items-center gap-1.5 shrink-0">
            {/* Atalho WhatsApp Celular */}
            <a
              href={`https://wa.me/55${unit.whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20atendimento%20da%20Amor%20ao%20Bicho%20(${unit.name})`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-8 h-8 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center transition-all active:scale-95 shadow-xs"
              title="Falar no WhatsApp"
            >
              <MessageSquare className="w-4 h-4 text-emerald-700" />
            </a>

            {/* Botão Menu / Cadastro no Celular */}
            <button
              onClick={() => {
                if (onOpenMenu) {
                  onOpenMenu();
                } else if (currentUser) {
                  onOpenProfileModal();
                } else {
                  onOpenAuthModal('register');
                }
              }}
              className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl border border-emerald-200 bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs shadow-xs transition-all active:scale-95 cursor-pointer"
              title="Menu, Cadastro e Minha Conta"
            >
              <Menu className="w-4 h-4 text-emerald-700 shrink-0" />
              <span>Menu</span>
              {currentUser && (
                <img
                  src={currentUser.avatarUrl || 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?auto=format&fit=crop&w=80&q=80'}
                  alt={currentUser.name}
                  className="w-4 h-4 rounded-full object-cover ml-0.5"
                />
              )}
            </button>
          </div>
        </div>

        {/* Status de Acesso: Apenas exibido se for Admin da Farmácia */}
        {currentRole === 'admin' && (
          <div className="flex items-center gap-2 p-1.5 px-3.5 bg-amber-50 rounded-2xl border border-amber-200/90 text-xs shadow-xs">
            <Building2 className="w-4 h-4 text-amber-700 shrink-0" />
            <div className="text-left">
              <span className="font-bold text-amber-950 block leading-tight">Painel Farmácia (Admin)</span>
              <span className="text-[10px] text-amber-800 font-semibold leading-none">Equipe Laboratório & Gestão</span>
            </div>
          </div>
        )}

        {/* Desktop Actions: Menu / Cadastro + WhatsApp da Unidade */}
        <div className="hidden lg:flex items-center gap-2.5">
          {/* Botão Menu / Minha Conta no Desktop */}
          <button
            onClick={() => {
              if (onOpenMenu) {
                onOpenMenu();
              } else if (currentUser) {
                onOpenProfileModal();
              } else {
                onOpenAuthModal('register');
              }
            }}
            className="flex items-center gap-2.5 bg-white hover:bg-emerald-50/80 border border-slate-200 hover:border-emerald-300 px-3.5 py-1.5 rounded-xl transition-all shadow-xs cursor-pointer group"
            title="Abrir Menu: Cadastro, Conta e Farmácia"
          >
            <div className="w-8 h-8 rounded-lg bg-emerald-50 border border-emerald-200 flex items-center justify-center text-emerald-700 group-hover:scale-105 transition-transform">
              <Menu className="w-4 h-4" />
            </div>
            <div className="text-left">
              <p className="text-xs font-bold text-slate-900 leading-tight">
                Menu & Cadastro
              </p>
              <p className="text-[10px] text-emerald-800 font-medium leading-none">
                {currentUser ? `Olá, ${currentUser.name.split(' ')[0]}` : 'Cadastre-se / Entrar'}
              </p>
            </div>
          </button>

          {/* Atalho WhatsApp Desktop */}
          <a
            href={`https://wa.me/55${unit.whatsapp.replace(/\D/g, '')}?text=Olá,%20gostaria%20de%20atendimento%20da%20Amor%20ao%20Bicho%20(${unit.name})`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-xs font-bold text-white bg-[#0b4d3a] hover:bg-[#083b2c] px-3.5 py-2 rounded-xl shadow-xs transition-all hover:shadow"
          >
            <MessageSquare className="w-3.5 h-3.5 text-emerald-300" />
            <span>WhatsApp {selectedUnit === 'americana' ? 'Americana' : 'Valinhos'}</span>
          </a>
        </div>
      </div>
    </header>
  );
};

