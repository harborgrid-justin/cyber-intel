
import { useState } from 'react';
import { TOKENS, EXECUTIVE_THEME } from '../styles/theme';
import { threatData } from '../services/dataLayer';
import { useIsomorphicLayoutEffect } from './useIsomorphicLayoutEffect';

export type Theme = 'dark' | 'light';

export const useThemeEngine = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  const [revision, setRevision] = useState(0);

  useIsomorphicLayoutEffect(() => {
    const styleId = 'sentinel-theme-styles';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    const activeTheme = TOKENS[theme];
    const themeConfig = threatData.getThemeConfig();
    const overrides = themeConfig?.overrides || {};
    const customCss = themeConfig?.customCss || '';

    // Deep merge helper
    const merge = (target: any, source: any) => {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], merge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    };

    const combinedTokens = merge(JSON.parse(JSON.stringify(activeTheme)), overrides);
    
    let cssVars = ':root {\n';
    
    const flattenObject = (obj: any, prefix = ''): Record<string, string> => {
        return Object.keys(obj).reduce((acc: Record<string, string>, k: string) => {
            const pre = prefix.length ? prefix + '-' : '';
            if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
                Object.assign(acc, flattenObject(obj[k], pre + k));
            } else {
                acc[pre + k] = obj[k];
            }
            return acc;
        }, {});
    };
    
    const flatTokens = flattenObject(combinedTokens);
    for (const [key, value] of Object.entries(flatTokens)) {
        cssVars += `  --${key}: ${value};\n`;
    }
    
    cssVars += '}\n\n';

    const globalStyles = `
      body {
        background-color: var(--colors-appBg);
        color: var(--colors-textPrimary);
        transition: background-color 0.3s ease, color 0.3s ease;
      }
      ${customCss}
    `;
    
    styleTag.innerHTML = cssVars + globalStyles;
    document.body.setAttribute('data-theme', theme);

  }, [theme, revision]);

  useIsomorphicLayoutEffect(() => {
    const handleToggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const handleUpdate = () => setRevision(r => r + 1);
    
    window.addEventListener('toggle-theme', handleToggle);
    window.addEventListener('theme-update', handleUpdate);
    
    return () => {
        window.removeEventListener('toggle-theme', handleToggle);
        window.removeEventListener('theme-update', handleUpdate);
    };
  }, []);

  return { theme, setTheme };
};
