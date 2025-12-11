
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, Button, Input } from '../../Shared/UI';
import { TOKENS } from '../../../styles/theme';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { SyntaxEditor } from '../../Shared/SyntaxEditor';
import { Icons } from '../../Shared/Icons';
import { flattenTokens, unflattenTokens, FlatToken } from '../../../services/utils/themeUtils';

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
        const base = TOKENS.dark;
        const currentOverrides = themeConfig?.overrides || {};
        const baseFlat = flattenTokens(base);
        
        const mergedFlat = baseFlat.map(t => {
           const parts = t.key.split('-');
           let overrideVal: any = currentOverrides;
           
           for (const p of parts) {
               if (overrideVal) overrideVal = overrideVal[p];
           }

           const finalValue = (typeof overrideVal === 'string') ? overrideVal : t.value;
           return { ...t, value: finalValue };
        });

        setFlatTokens(mergedFlat);
        setCustomCss(themeConfig?.customCss || '');
    } catch (error) {
        console.error("Theme Initialization Failed:", error);
        setFlatTokens([]);
    }
  }, [themeConfig]);

  const handleTokenChange = (key: string, newVal: string) => {
    const updatedTokens = flatTokens.map(t => 
        t.key === key ? { ...t, value: newVal } : t
    );
    setFlatTokens(updatedTokens);
    
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

  const filteredTokens = useMemo(() => {
    return flatTokens.filter(t => 
        t.key.toLowerCase().includes(search.toLowerCase()) && 
        (search ? true : t.group === activeGroup)
    );
  }, [flatTokens, search, activeGroup]);

  const groups = useMemo(() => 
    Array.from(new Set(flatTokens.map(t => t.group))), 
  [flatTokens]);

  const isColor = (val: string) => val && (val.startsWith('#') || val.startsWith('rgb'));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full p-0">
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
            {!search && (
                <div className="flex overflow-x-auto border-b border-slate-800 bg-slate-950 p-1 gap-1 custom-scrollbar shrink-0">
                    {groups.map(g => (
                        <button key={g} onClick={() => setActiveGroup(g)} className={`px-3 py-1.5 rounded text-[10px] font-bold uppercase whitespace-nowrap transition-colors ${activeGroup === g ? 'bg-cyan-900/30 text-cyan-400 border border-cyan-900/50' : 'text-slate-500 hover:text-slate-300'}`}>
                            {g}
                        </button>
                    ))}
                </div>
            )}
            <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
                {filteredTokens.map((t) => (
                    <div key={t.key} className="flex flex-col gap-1 border-b border-slate-800/50 pb-2 last:border-0 group">
                        <div className="flex justify-between items-center">
                            <span className="text-[10px] font-mono text-slate-500 group-hover:text-slate-300 transition-colors">{t.key}</span>
                            {isColor(t.value) && (<div className="w-4 h-4 rounded border border-slate-700 shadow-sm" style={{ backgroundColor: t.value }}></div>)}
                        </div>
                        <div className="flex gap-2">
                             <Input value={t.value} onChange={e => handleTokenChange(t.key, e.target.value)} className="text-xs font-mono h-8 bg-slate-900 border-slate-700 text-cyan-400 focus:border-cyan-500" />
                             {(isColor(t.value) || t.group === 'colors') && (
                                 <div className="relative w-8 h-8 rounded border border-slate-700 overflow-hidden shrink-0">
                                     <input type="color" value={t.value.length === 7 ? t.value : '#000000'} onChange={e => handleTokenChange(t.key, e.target.value)} className="absolute inset-0 w-full h-full p-0 border-0 cursor-pointer scale-150" disabled={!t.value.startsWith('#')} />
                                 </div>
                             )}
                        </div>
                    </div>
                ))}
            </div>
            <div className="p-4 border-t border-slate-800 flex justify-between bg-slate-900/50 shrink-0">
                <Button onClick={handleReset} variant="danger" className="text-[10px] py-1">RESET DEFAULTS</Button>
                <div className="text-[10px] text-slate-500 self-center flex items-center gap-1"><Icons.CheckCircle className="w-3 h-3 text-green-500" /> Auto-saved</div>
            </div>
        </Card>
        <Card className="flex flex-col p-0 overflow-hidden">
            <CardHeader title="Global CSS Injection" />
            <div className="flex-1 p-0 relative min-h-[300px]">
                <SyntaxEditor value={customCss} onChange={handleCssChange} language="json" className="h-full border-0 rounded-none bg-[#0d1117]" />
            </div>
        </Card>
    </div>
  );
};
