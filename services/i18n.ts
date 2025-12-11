
type Locale = 'en' | 'es' | 'fr' | 'jp';

const DICTIONARY: Record<Locale, Record<string, string>> = {
  en: {
    'app.title': 'SENTINEL CORE',
    'nav.dashboard': 'Dashboard',
    'nav.feed': 'Threat Feed',
    'nav.analysis': 'Analysis',
    'nav.cases': 'Case Management',
    'nav.settings': 'Settings',
    'status.online': 'ONLINE',
    'status.offline': 'OFFLINE'
  },
  es: {
    'app.title': 'NÚCLEO CENTINELA',
    'nav.dashboard': 'Tablero',
    'nav.feed': 'Amenazas',
    'nav.analysis': 'Análisis',
    'nav.cases': 'Casos',
    'nav.settings': 'Ajustes',
    'status.online': 'EN LÍNEA',
    'status.offline': 'DESCONECTADO'
  },
  fr: {
    'app.title': 'NOYAU SENTINELLE',
    'nav.dashboard': 'Tableau de bord',
    'nav.feed': 'Flux de menaces',
    'nav.analysis': 'Analyse',
    'nav.cases': 'Dossiers',
    'nav.settings': 'Paramètres',
    'status.online': 'EN LIGNE',
    'status.offline': 'HORS LIGNE'
  },
  jp: {
    'app.title': 'センチネル・コア',
    'nav.dashboard': 'ダッシュボード',
    'nav.feed': '脅威フィード',
    'nav.analysis': '分析',
    'nav.cases': '事件管理',
    'nav.settings': '設定',
    'status.online': 'オンライン',
    'status.offline': 'オフライン'
  }
};

class I18nService {
  private locale: Locale = 'en';

  setLocale(l: Locale) {
    this.locale = l;
    window.dispatchEvent(new Event('i18n:change'));
  }

  t(key: string, fallback?: string): string {
    return DICTIONARY[this.locale][key] || fallback || key;
  }

  getLocale() { return this.locale; }
}

export const i18n = new I18nService();
