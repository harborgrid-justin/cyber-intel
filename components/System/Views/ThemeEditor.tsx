
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, Button, Input, Label } from '../../Shared/UI';
import { TOKENS } from '../../../styles/theme';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { SyntaxEditor } from '../../Shared/SyntaxEditor';
import { Icons } from '../../Shared/Icons';

interface FlatToken {
  key: string;
  value: string;
  group: string;
}

// Helper: Safely flattens nested token objects into UI-friendly array
const flattenTokens = (obj: any, prefix = ''): FlatToken[] => {
    if (!obj || typeof obj !== 'object') return [];

    return Object.keys(obj).reduce((acc: FlatToken[], k: string) => {
        const pre = prefix.length ? `${prefix}-` : '';
        const group = prefix.split('-')[0] || k; // Use top-level key as group
        
        // Check if current property is a nested object (and not null/array)
        if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
            return acc.concat(flattenTokens(obj[k], pre + k));
        } 
        
        // It's a leaf node (value)
        return acc.concat({ 
            key: pre + k, 
            value: String(obj[k] || ''), // Force string to prevent .startsWith crashes
            group 
        });
    }, []);
};

// Helper: Reconstructs nested object from flat array
const unflattenTokens = (flat: FlatToken[]) => {
    const result: any = {};
    flat.forEach(({ key, value }) => {
        const parts = key.split('-');
        let current = result;
        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            // If last part, assign value
            if (i === parts.length - 1) {
                current[part] = value;
            } else {
                // Ensure intermediate object exists
                current[part] = current[part] || {};
                current = current[part];
            }
        }
    });
    return result;
};

export const ThemeEditor: React.FC = () => {
  const themeConfig = useDataStore(() => threatData.getThemeConfig());
  
  // Local state for the editor form
  const [flatTokens, setFlatTokens] = useState<FlatToken[]>([]);
  const [customCss, setCustomCss] = useState('');
  const [search, setSearch] = useState('');
  const [activeGroup, setActiveGroup] = useState<string>('colors');

  // Initialization Effect
  useEffect(() => {
    try {
        // 1. Start with base tokens
        const base = TOKENS.dark;
        // 2. Get saved overrides, ensuring object exists
        const currentOverrides = themeConfig?.overrides || {};
        
        // 3. Create flat view
        const baseFlat = flattenTokens(base);
        
        // 4. Merge overrides into base flat structure
        const mergedFlat = baseFlat.map(t => {
           const parts = t.key.split('-');
           let overrideVal: any = currentOverrides;
           
           // Traverse overrides to see if this key exists
           for (const p of parts) {
               if (overrideVal) overrideVal = overrideVal[p];
           }

           // If found a string override, use it; otherwise use base default
           const finalValue = (typeof overrideVal === 'string') ? overrideVal : t.value;
           
           return { ...t, value: finalValue };
        });

        setFlatTokens(mergedFlat);
        setCustomCss(themeConfig?.customCss || '');
    } catch (error) {
        console.error("Theme Initialization Failed:", error);
        // Fallback to safe defaults to prevent white screen
        setFlatTokens([]);
    }
  }, [themeConfig]);

  const handleTokenChange = (key: string, newVal: string) => {
    // 1. Update local UI state immediately for responsiveness
    const updatedTokens = flatTokens.map(t => 
        t.key === key ? { ...t, value: newVal } : t
    );
    setFlatTokens(updatedTokens);
    
    // 2. Debounce or push to store (doing directly here for demo responsiveness)
    const newOverrides = unflattenTokens(updatedTokens);
    
    threatData.updateThemeConfig({
        ...themeConfig,
        overrides: newOverrides,
        customCss
    });
  };

  const handleCssChange = (val: string) => {
      setCustomCss(val);
      threatData.updateThemeConfig({
          ...themeConfig,
          overrides: unflattenTokens(flatTokens),
          customCss: val
      });
  };

  const handleReset = () => {
      if(window.confirm("Reset all design customizations to default?")) {
          threatData.updateThemeConfig({
              ...themeConfig,
              overrides: {},
              customCss: ''
          });
          setFlatTokens(flattenTokens(TOKENS.dark));
          setCustomCss('');
      }
  };

  // Filter logic
  const filteredTokens = useMemo(() => {
    return flatTokens.filter(t => 
        t.key.toLowerCase().includes(search.toLowerCase()) && 
        (search ? true : t.group === activeGroup)
    );
  }, [flatTokens, search, activeGroup]);

  // Group extraction
  const groups = useMemo(() => 
    Array.from(new Set(flatTokens.map(t => t.group))), 
  [flatTokens]);

  const isColor = (val: string) => val && (val.startsWith('#') || val.startsWith('rgb'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-0">
        {/* Token Editor Panel */}
        <Card className="flex flex-col p-0 overflow-hidden border-r border-slate-800">
            <CardHeader 
                title="Design System Registry" 
                action={
                    <Input 
                        placeholder="Search tokens..." 
                        value={search} 
                        onChange={e => setSearch(e.target.value)} 
                        className="w-40 text-xs py-1 h-8" 
                    />
                } 
            />
            
            {/* Category Tabs */}
            {!search && (
                <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950 p-1 gap-1 custom-scrollbar shrink-0">
                    {groups.map(g => (
                        <button
                            key={g}
                            onClick={() => setActiveGroup(g)}
                            className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase whitespace-nowrap transition-colors ${
                                activeGroup === g ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-900/50' : 'text-slate-500 hover:text-slate-300'
                            }`}
                        >
                            {g}
                        </button>
                    ))}
                </div>
            )}

            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredTokens.length === 0 && (
                    <div className="text-center text-slate-500 py-8 text-xs">
                        No tokens found matching criteria.
                    </div>
                )}
                
                {filteredTokens.map((t) => (
                    <div key={t.key} className="flex flex-col gap-1 border-b border-slate-800/50 pb-2 last:border-0 group">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">
                                {t.key}
                            </span>
                            {isColor(t.value) && (
                                <div 
                                    className="w-4 h-4 rounded border border-slate-700 shadow-sm" 
                                    style={{ backgroundColor: t.value }}
                                ></div>
                            )}
                        </div>
                        <div className="flex gap-2">
                             <Input 
                                value={t.value} 
                                onChange={e => handleTokenChange(t.key, e.target.value)} 
                                className="text-xs font-mono h-8 bg-slate-900 border-slate-700 text-cyan-400 focus:border-cyan-500" 
                             />
                             {/* Color Picker Helper */}
                             {(isColor(t.value) || t.group === 'colors') && (
                                 <div className="relative w-8 h-8 rounded border border-slate-700 overflow-hidden shrink-0">
                                     <input 
                                        type="color" 
                                        value={t.value.length === 7 ? t.value : '#000000'} 
                                        onChange={e => handleTokenChange(t.key, e.target.value)}
                                        className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150"
                                        disabled={!t.value.startsWith('#')}
                                     />
                                 </div>
                             )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="p-4 border-t border-slate-800 flex justify-between bg-slate-900/50 shrink-0">
                <Button onClick={handleReset} variant="danger" className="text-[10px] py-1">RESET DEFAULTS</Button>
                <div className="text-[10px] text-slate-500 self-center flex items-center gap-1">
                    <Icons.CheckCircle className="w-3 h-3 text-green-500" />
                    Auto-saved
                </div>
            </div>
        </Card>

        {/* CSS Injector Panel */}
        <Card className="flex flex-col p-0 overflow-hidden">
            <CardHeader title="Global CSS Injection" />
            <div className="flex-1 p-0 relative min-h-[300px]">
                <SyntaxEditor 
                    value={customCss} 
                    onChange={handleCssChange} 
                    language="json" 
                    className="h-full border-0 rounded-none bg-[#0d1117]" 
                />
            </div>
            <div className="p-4 bg-slate-950 text-[10px] text-slate-400 border-t border-slate-800 leading-relaxed shrink-0">
                <span className="text-yellow-500 font-bold block mb-1">⚠ DEVELOPER MODE</span>
                Styles entered here are injected directly into the document head. 
                Use <code>!important</code> to override atomic utility classes.
                <br/>
                Target specific components via <code>data-testid</code> or internal classes.
            </div>
        </Card>
    </div>
  );
};
