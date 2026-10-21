// Serviço de Notificações Nativas do Navegador & Alarme Contínuo até Confirmação

class NotificationService {
  private audioCtx: AudioContext | null = null;
  private persistentAudioInterval: number | null = null;

  // Inicializa com segurança o contexto de áudio
  private getAudioContext(): AudioContext | null {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch {
      return null;
    }
  }

  // Toca um bipe duplo suave ou teste rápido
  playAlertSound() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(659.25, ctx.currentTime); // E5
      osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + 0.35);

      // Vibração no celular se suportado
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([200, 100, 200]);
      }
    } catch {
      // Falha silenciosa se áudio não for permitido
    }
  }

  // Toca um tom de despertador sonoro mais marcante para lembrete insistente
  playAlarmChime() {
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      // Três bipes sonoros de despertador
      [0, 0.2, 0.4].forEach((delay, idx) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(idx % 2 === 0 ? 880 : 1046.5, ctx.currentTime + delay);

        gain.gain.setValueAtTime(0.25, ctx.currentTime + delay);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + delay + 0.15);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(ctx.currentTime + delay);
        osc.stop(ctx.currentTime + delay + 0.15);
      });

      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        navigator.vibrate([300, 150, 300, 150, 400]);
      }
    } catch {
      // Ignorar caso bloqueado
    }
  }

  // Inicia um alarme sonoro insistente se houver remédios atrasados não tomados
  startPersistentChime(intervalMs: number = 20000) {
    if (this.persistentAudioInterval !== null) return;
    this.playAlarmChime();
    this.persistentAudioInterval = window.setInterval(() => {
      this.playAlarmChime();
    }, intervalMs);
  }

  // Para o alarme sonoro insistente quando todas as doses forem tomadas
  stopPersistentChime() {
    if (this.persistentAudioInterval !== null) {
      clearInterval(this.persistentAudioInterval);
      this.persistentAudioInterval = null;
    }
  }

  // Verifica se o navegador suporta notificações
  isSupported(): boolean {
    return typeof window !== 'undefined' && 'Notification' in window;
  }

  // Permissão atual
  getPermission(): NotificationPermission {
    if (!this.isSupported()) return 'denied';
    return Notification.permission;
  }

  // Solicita permissão ao usuário
  async requestPermission(): Promise<boolean> {
    if (!this.isSupported()) return false;
    try {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    } catch {
      return false;
    }
  }

  // Dispara uma notificação nativa no celular ou desktop
  sendNotification(title: string, options?: NotificationOptions): boolean {
    this.playAlarmChime();

    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      const defaultIcon = 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=128&q=80';
      const notification = new Notification(title, {
        icon: defaultIcon,
        badge: defaultIcon,
        requireInteraction: true, // Força a notificação a persistir no Android/Windows até interação do usuário
        vibrate: [300, 150, 300, 150, 400] as unknown as number[],
        ...options
      });

      // Se clicar na notificação, foca na janela
      notification.onclick = () => {
        window.focus();
        notification.close();
      };

      return true;
    } catch {
      return false;
    }
  }

  // Gera URL do WhatsApp para envio automático com texto codificado
  buildWhatsAppUrl(phone: string, text: string): string {
    const cleanPhone = phone.replace(/\D/g, '');
    const fullPhone = cleanPhone.startsWith('55') ? cleanPhone : `55${cleanPhone}`;
    return `https://api.whatsapp.com/send?phone=${fullPhone}&text=${encodeURIComponent(text)}`;
  }
}

export const notificationService = new NotificationService();
