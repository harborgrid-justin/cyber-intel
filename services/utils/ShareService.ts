
export class ShareService {
  static async shareReport(title: string, text: string, url?: string) {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text,
          url: url || window.location.href
        });
        return true;
      } catch (e) {
        console.warn('Share canceled or failed', e);
        return false;
      }
    } else {
      console.warn('Web Share API not supported');
      // Fallback to clipboard
      await navigator.clipboard.writeText(`${title}\n${text}\n${url || ''}`);
      return 'COPIED';
    }
  }
}
