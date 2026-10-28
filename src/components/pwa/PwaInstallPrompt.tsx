import React, { useState, useEffect } from 'react';
import { Download, X, Smartphone, Check } from 'lucide-react';

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export const PwaInstallPrompt: React.FC = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [isInstallable, setIsInstallable] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [showIOSPrompt, setShowIOSPrompt] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [isInstalled, setIsInstalled] = useState(false);

  useEffect(() => {
    // Verifica se já está rodando em modo standalone (já instalado)
    const isStandalone = window.matchMedia('(display-mode: standalone)').matches || 
      (window.navigator as any).standalone === true;

    if (isStandalone) {
      setIsInstalled(true);
      return;
    }

    // Detecta iOS / Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    const isSafari = /safari/.test(userAgent) && !/chrome|crios|fxios/.test(userAgent);

    if (isIosDevice && isSafari) {
      setIsIOS(true);
    }

    // Captura o evento nativo de instalação do Chrome / Android / Edge / Windows / Mac
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e as BeforeInstallPromptEvent);
      setIsInstallable(true);
    };

    const handleAppInstalled = () => {
      setIsInstalled(true);
      setIsInstallable(false);
      setDeferredPrompt(null);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      await deferredPrompt.prompt();
      const choice = await deferredPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsInstalled(true);
        setIsInstallable(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIOSPrompt(true);
    }
  };

  if (isInstalled || isDismissed) {
    return null;
  }

  if (!isInstallable && !isIOS) {
    return null;
  }

  return (
    <>
      {/* Banner / Card Flutuante de Instalação */}
      <div className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:max-w-sm z-50 animate-in fade-in slide-in-from-bottom-5 duration-300">
        <div className="bg-gradient-to-r from-[#0b4d3a] via-[#0d5c46] to-[#083b2c] text-white p-3.5 sm:p-4 rounded-2xl shadow-2xl border border-emerald-400/40 backdrop-blur-md flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <img 
              src="/icon-192.png" 
              alt="Logo Amor ao Bicho" 
              className="w-11 h-11 rounded-xl object-contain bg-white/10 p-0.5 border border-white/20 shrink-0 shadow-xs"
            />
            <div className="min-w-0">
              <span className="font-extrabold text-xs sm:text-sm text-white block truncate leading-tight">
                Instalar App Amor ao Bicho
              </span>
              <p className="text-[11px] text-emerald-200/90 truncate leading-tight mt-0.5">
                Acesse mais rápido direto na sua tela inicial!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            <button
              onClick={handleInstallClick}
              className="px-3 py-1.5 rounded-xl bg-white hover:bg-emerald-50 text-emerald-950 font-bold text-xs shadow-md active:scale-95 transition-all cursor-pointer flex items-center gap-1.5"
            >
              <Download className="w-3.5 h-3.5 text-emerald-800" />
              <span>Instalar</span>
            </button>

            <button
              onClick={() => setIsDismissed(true)}
              className="p-1.5 rounded-xl text-emerald-300 hover:text-white transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Modal / Tooltip de Instruções para iPhone / iOS */}
      {showIOSPrompt && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-end sm:items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-slate-800 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <img 
                  src="/icon-192.png" 
                  alt="Logo Amor ao Bicho" 
                  className="w-10 h-10 rounded-xl object-contain bg-emerald-50 border border-emerald-200 p-0.5"
                />
                <div>
                  <h3 className="font-bold text-sm text-slate-900 leading-tight">Como instalar no iPhone</h3>
                  <p className="text-xs text-slate-500">Amor ao Bicho na Tela de Início</p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSPrompt(false)}
                className="w-7 h-7 rounded-full bg-slate-100 hover:bg-slate-200 flex items-center justify-center text-slate-500 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <ol className="space-y-2.5 text-xs text-slate-600 bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">1</span>
                <span>Toque no botão de <strong>Compartilhar</strong> (ícone de um quadrado com uma seta para cima) na barra inferior do Safari.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">2</span>
                <span>Role para baixo e selecione a opção <strong>"Adicionar à Tela de Início"</strong>.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="font-bold text-emerald-700 bg-emerald-100 w-5 h-5 rounded-full flex items-center justify-center shrink-0 text-[11px]">3</span>
                <span>Toque em <strong>Adicionar</strong> no canto superior direito.</span>
              </li>
            </ol>

            <button
              onClick={() => setShowIOSPrompt(false)}
              className="w-full py-2.5 px-4 rounded-xl bg-emerald-700 text-white font-bold text-xs shadow-md transition-all active:scale-95 cursor-pointer"
            >
              Entendido!
            </button>
          </div>
        </div>
      )}
    </>
  );
};
