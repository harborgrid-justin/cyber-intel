
// A lightweight localization engine without heavy library overhead
type Locale = 'en' | 'es' | 'fr' | 'jp';

const DICTIONARY: Record<Locale, Record<string, string>> = {
  en: {
    'app.title': 'SENTINEL CORE',
    'status.online': 'ONLINE',
    'status.offline': 'OFFLINE',
    'threat.critical': 'CRITICAL THREAT DETECTED'
  },
  es: {
    'app.title': 'NÚCLEO CENTINELA',
    'status.online': 'EN LÍNEA',
    'status.offline': 'DESCONECTADO',
    'threat.critical': 'AMENAZA CRÍTICA DETECTADA'
  },
  fr: {
    'app.title': 'NOYAU SENTINELLE',
    'status.online': 'EN LIGNE',
    'status.offline': 'HORS LIGNE',
    'threat.critical': 'MENACE CRITIQUE DÉTECTÉE'
  },
  jp: {
    'app.title': 'センチネル・コア',
    'status.online': 'オンライン',
    'status.offline': 'オフライン',
    'threat.critical': '重大な脅威を検出'
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
