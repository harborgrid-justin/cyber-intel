
export class DesktopNotifier {
  static async requestPermission() {
    if (!('Notification' in window)) return false;
    if (Notification.permission === 'granted') return true;
    if (Notification.permission !== 'denied') {
      const perm = await Notification.requestPermission();
      return perm === 'granted';
    }
    return false;
  }

  static async notify(title: string, options?: NotificationOptions) {
    const hasPerm = await this.requestPermission();
    if (hasPerm) {
      // Don't notify if tab is focused (optional UX choice)
      if (document.hidden) {
          new Notification(title, {
            icon: '/favicon.ico', // assuming standard icon
            badge: '/badge.png',
            ...options
          });
      }
    }
  }
}
