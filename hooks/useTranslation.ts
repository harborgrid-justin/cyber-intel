
import { useState, useEffect } from 'react';
import { i18n } from '../services/i18n';

export const useTranslation = () => {
  // Trigger re-render on locale change
  const [locale, setLocale] = useState(i18n.getLocale());

  useEffect(() => {
    const handleLocaleChange = () => setLocale(i18n.getLocale());
    window.addEventListener('i18n:change', handleLocaleChange);
    return () => window.removeEventListener('i18n:change', handleLocaleChange);
  }, []);

  return { 
    t: (key: string, fallback?: string) => i18n.t(key, fallback),
    locale 
  };
};
