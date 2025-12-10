
import { useState, useEffect } from 'react';

export const useTheme = () => {
  const [theme, setTheme] = useState<'dark' | 'light' | 'cyber'>('dark');

  useEffect(() => {
    const handleToggle = () => {
      setTheme(prev => prev === 'dark' ? 'cyber' : 'dark');
    };
    window.addEventListener('toggle-theme', handleToggle);
    return () => window.removeEventListener('toggle-theme', handleToggle);
  }, []);

  return { theme, setTheme };
};
