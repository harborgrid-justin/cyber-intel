
import React, { useMemo } from 'react';
import { Card, FilterGroup } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { MitreItem } from '../../../types';
import { IntersectionPruner } from '../../Shared/IntersectionPruner';

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
      <div className="flex justify-between items-center mb-4 bg-slate-900 p-2 rounded border border-slate-800 shrink-0">
          <span className="text-xs font-bold text-slate-400 px-2 uppercase tracking-wider">Visualization Mode</span>
          <FilterGroup value={matrixMode} onChange={(v: any) => setMatrixMode(v)} options={[{label:'Standard', value:'STANDARD'}, {label:'Live Heatmap', value:'HEATMAP', color: 'bg-red-500'}]} />
      </div>
      
      <div className="overflow-x-auto pb-4 custom-scrollbar flex-1 bg-slate-900 border border-slate-800 rounded-xl p-4">
        <div className="flex gap-4 min-w-[1400px] h-full">
        {tactics.map(tactic => (
          <div key={tactic.id} className="flex-1 min-w-[180px] flex flex-col gap-2">
            <div className="bg-slate-800 p-3 text-center border-b-4 border-cyan-600 rounded-t sticky top-0 z-10 shadow-lg">
              <div className="text-xs font-bold text-white uppercase tracking-tight">{tactic.name}</div>
              <div className="text-[10px] text-slate-400 font-mono mt-1">{tactic.id}</div>
            </div>
            <div className="space-y-2 overflow-y-auto custom-scrollbar pr-1 pb-2">
              {techniques.filter(t => t.tactic === tactic.tactic || t.tactic === tactic.name).map(tech => {
                const hits = activeTechniqueCounts[tech.id] || 0;
                const isHeatmap = matrixMode === 'HEATMAP';
                const hasActivity = isHeatmap && hits > 0;
                let cardClass = 'bg-slate-900 border-slate-700 text-slate-300 hover:border-cyan-500 hover:text-white';
                if (hasActivity) {
                  cardClass = hits > 2 ? 'bg-red-900/80 border-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.4)] z-10' : 'bg-orange-900/40 border-orange-500 text-orange-100';
                }

                return (
                  <IntersectionPruner key={tech.id} height="60px" threshold={0}>
                    <div onClick={() => onView(tech.id, 'Technique')} className={`${cardClass} border p-3 text-[10px] cursor-pointer transition-all duration-200 rounded relative group shadow-sm`}>
                        <div className="flex justify-between items-start mb-1">
                        <span className={`font-bold font-mono opacity-70 group-hover:opacity-100 ${hasActivity ? 'text-white' : 'text-slate-500'}`}>{tech.id}</span>
                        {hasActivity && <span className="bg-black/40 px-1.5 rounded text-white font-bold animate-pulse">{hits}</span>}
                        </div>
                        <div className="leading-tight">{tech.name}</div>
                    </div>
                  </IntersectionPruner>
                );
              })}
            </div>
          </div>
        ))}
        </div>
      </div>
    </div>
  );
};
