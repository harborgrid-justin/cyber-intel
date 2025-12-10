
import React, { useMemo } from 'react';
import { Card, FilterGroup } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { MitreItem } from '../../../types';

interface Props {
  matrixMode: 'STANDARD' | 'HEATMAP';
  setMatrixMode: (m: 'STANDARD' | 'HEATMAP') => void;
  onView: (id: string, type: string) => void;
}

export const MitreMatrix: React.FC<Props> = ({ matrixMode, setMatrixMode, onView }) => {
  const tactics = useDataStore(() => threatData.getMitreTactics());
  const techniques = useDataStore(() => threatData.getMitreTechniques());
  const threats = useDataStore(() => threatData.getThreats());

  const activeTechniqueCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    threats.forEach(t => {
      techniques.forEach(tech => {
        if (t.description.toLowerCase().includes(tech.name.toLowerCase()) || (t.tags && t.tags.includes(tech.id))) {
          counts[tech.id] = (counts[tech.id] || 0) + 1;
        }
      });
    });
    return counts;
  }, [techniques, threats]);

  return (
    <div className="flex flex-col h-full">
      <div className="flex justify-between items-center mb-4 bg-slate-900 p-2 rounded-lg border border-slate-800 shrink-0">
          <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Visualization Mode</span>
          <FilterGroup value={matrixMode} onChange={(v: any) => setMatrixMode(v)} options={[{label:'Standard', value:'STANDARD'}, {label:'Live Heatmap', value:'HEATMAP', color: 'bg-red-500'}]} />
      </div>
      
      <div className="grid grid-cols-[repeat(auto-fill,minmax(240px,1fr))] gap-4">
        {tactics.map(tactic => (
          <div key={tactic.id} className="bg-slate-950/50 border border-slate-800 rounded-lg flex flex-col gap-2">
            <div className="p-3 text-center border-b-2 border-cyan-600">
              <div className="text-xs font-black text-white uppercase tracking-widest">{tactic.name}</div>
              <div className="text-[10px] text-cyan-400 font-mono mt-1 opacity-70">{tactic.id}</div>
            </div>
            
            <div className="space-y-2 p-2">
              {techniques.filter(t => t.tactic === tactic.tactic || t.tactic === tactic.name).map(tech => {
                const hits = activeTechniqueCounts[tech.id] || 0;
                const isHeatmap = matrixMode === 'HEATMAP';
                const hasActivity = isHeatmap && hits > 0;
                
                let cardClass = 'bg-slate-900/80 border-slate-800 text-slate-400 hover:border-cyan-600 hover:bg-slate-800/50 hover:text-white';
                if (hasActivity) {
                  cardClass = hits > 2 
                    ? 'bg-red-900/30 border-red-700/50 text-red-100 shadow-[0_0_15px_rgba(239,68,68,0.2)] animate-pulse z-10' 
                    : 'bg-orange-900/20 border-orange-700/40 text-orange-200';
                }

                return (
                    <div key={tech.id} onClick={() => onView(tech.id, 'Technique')} className={`border p-2 text-[11px] cursor-pointer transition-all duration-200 rounded relative group shadow-sm backdrop-blur-sm ${cardClass}`}>
                        <div className="flex justify-between items-start mb-1">
                          <span className={`font-bold font-mono group-hover:opacity-100 ${hasActivity ? 'text-white/80' : 'text-slate-600'}`}>{tech.id}</span>
                          {hasActivity && <span className="absolute top-1 right-1 bg-black/50 text-white font-bold text-[9px] px-1 rounded-sm">{hits}</span>}
                        </div>
                        <div className="leading-tight font-medium">{tech.name}</div>
                    </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
