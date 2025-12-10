import { useEffect, useState } from 'react';
import { TOKENS } from '../styles/theme';
import { threatData } from '../services/dataLayer';

export type Theme = 'dark' | 'light';

export const useThemeEngine = () => {
  const [theme, setTheme] = useState<Theme>('dark');
  // Trigger state to force re-render when config updates
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const styleId = 'sentinel-theme-styles';
    let styleTag = document.getElementById(styleId);
    if (!styleTag) {
      styleTag = document.createElement('style');
      styleTag.id = styleId;
      document.head.appendChild(styleTag);
    }

    // 1. Get Base Tokens
    const activeTheme = TOKENS[theme];
    
    // 2. Get Dynamic Overrides from Data Layer
    const themeConfig = threatData.getThemeConfig();
    const overrides = themeConfig?.overrides || {};
    const customCss = themeConfig?.customCss || '';

    // 3. Deep Merge Helper
    const merge = (target: any, source: any) => {
        for (const key in source) {
            if (source[key] instanceof Object && key in target) {
                Object.assign(source[key], merge(target[key], source[key]));
            }
        }
        Object.assign(target || {}, source);
        return target;
    };

    // Merge base with overrides (shallow copy first to avoid mutating constant)
    const combinedTokens = merge(JSON.parse(JSON.stringify(activeTheme)), overrides);
    
    // 4. Generate CSS Variables
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

    // 5. Global Styles & Custom CSS
    const globalStyles = `
      body {
        background-color: var(--colors-appBg);
        color: var(--colors-textPrimary);
        font-family: ${TOKENS.typography.fontFamily.sans};
        font-size: 14px;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
        background-image: var(--app-backgroundImage);
        background-attachment: fixed;
        transition: background-color 0.5s ease, color 0.3s ease;
      }
      
      ::-webkit-scrollbar { width: 6px; height: 6px; }
      ::-webkit-scrollbar-track { background: transparent; }
      ::-webkit-scrollbar-thumb { background: var(--app-scrollbarThumb); border-radius: 3px; }
      ::-webkit-scrollbar-thumb:hover { background: var(--app-scrollbarThumbHover); }

      /* User Injected CSS */
      ${customCss}
    `;
    
    styleTag.innerHTML = cssVars + globalStyles;
    document.body.setAttribute('data-theme', theme);

  }, [theme, revision]);

  useEffect(() => {
    const handleToggle = () => setTheme(prev => prev === 'dark' ? 'light' : 'dark');
    const handleUpdate = () => setRevision(r => r + 1); // Trigger re-calculation
    
    window.addEventListener('toggle-theme', handleToggle);
    window.addEventListener('theme-update', handleUpdate);
    
    return () => {
        window.removeEventListener('toggle-theme', handleToggle);
        window.removeEventListener('theme-update', handleUpdate);
    };
  }, []);

  return { theme, setTheme };
};
