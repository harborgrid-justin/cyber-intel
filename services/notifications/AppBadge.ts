
export class AppBadge {
  static set(count: number) {
    if ('setAppBadge' in navigator) {
      if (count > 0) {
        (navigator as any).setAppBadge(count).catch((e: any) => console.debug('Badge failed', e));
      } else {
        (navigator as any).clearAppBadge().catch(() => {});
      }
    }
  }

  static clear() {
    if ('clearAppBadge' in navigator) {
      (navigator as any).clearAppBadge().catch(() => {});
    }
  }
}
