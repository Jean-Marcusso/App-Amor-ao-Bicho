// Serviço de Notificações Nativas do Navegador & Gerador de Links WhatsApp

class NotificationService {
  private audioCtx: AudioContext | null = null;

  // Toca um bipe suave usando a Web Audio API (sem precisar de arquivos externos de áudio)
  playAlertSound() {
    try {
      const AudioCtxClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!this.audioCtx) {
        this.audioCtx = new AudioCtxClass();
      }
      if (this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }

      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(587.33, this.audioCtx.currentTime); // D5
      osc.frequency.exponentialRampToValueAtTime(880, this.audioCtx.currentTime + 0.15); // A5

      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.35);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.35);
    } catch {
      // AudioContext não permitido ou silencioso
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

  // Dispara uma notificação nativa com som
  sendNotification(title: string, options?: NotificationOptions): boolean {
    this.playAlertSound();

    if (!this.isSupported() || Notification.permission !== 'granted') {
      return false;
    }

    try {
      new Notification(title, {
        icon: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=128&q=80',
        badge: 'https://images.unsplash.com/photo-1548767797-d8c844163c4c?auto=format&fit=crop&w=64&q=80',
        ...options
      });
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
