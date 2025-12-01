
import React, { useMemo } from 'react';
import { Threat, IncidentStatus } from '../../../types';
import { RiskLogic } from '../../../services/logic/RiskLogic';
import { Card, Badge } from '../../Shared/UI';

interface KillChainViewProps {
  threats: Threat[];
}

const KillChainView: React.FC<KillChainViewProps> = ({ threats }) => {
  const chain = useMemo(() => RiskLogic.mapToKillChain(threats), [threats]);
  const stages = Object.keys(chain);

  return (
    <div className="flex flex-col h-full space-y-4">
      <div className="flex justify-between items-center bg-slate-900 p-4 rounded border border-slate-800">
         <div>
            <h3 className="text-white font-bold uppercase tracking-widest">Cyber Kill Chain Reconstruction</h3>
            <p className="text-xs text-slate-500">Mapping tactical indicators to attack lifecycle stages.</p>
         </div>
         <div className="flex gap-4">
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-red-500"></span><span className="text-xs text-slate-400">Active</span></div>
            <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-green-500"></span><span className="text-xs text-slate-400">Blocked</span></div>
         </div>
      </div>

      <div className="flex-1 overflow-x-auto pb-4 custom-scrollbar">
        <div className="flex gap-4 min-w-[1200px] h-full">
          {stages.map((stage, i) => {
            const items = chain[stage as keyof typeof chain];
            const isActive = items.some(t => t.status !== IncidentStatus.CLOSED && t.status !== IncidentStatus.CONTAINED);
            
            return (
              <div key={stage} className="flex-1 flex flex-col min-w-[160px] group">
                {/* Stage Header (Chevron Style) */}
                <div className={`
                  relative p-3 mb-2 font-bold text-xs uppercase tracking-wider text-center select-none
                  ${isActive ? 'bg-red-900/20 text-red-400 border-red-900/50' : 'bg-slate-800 text-slate-400 border-slate-700'}
                  border-y border-l clip-chevron-container
                `}>
                  {i + 1}. {stage}
                  {/* CSS Triangle Hack for Chevron effect would go here, simplified with border for now */}
                </div>

                {/* Drop Zone / List */}
                <div className={`flex-1 bg-slate-900/30 border border-slate-800 rounded p-2 space-y-2 ${isActive ? 'bg-red-900/5 border-red-900/20' : ''}`}>
                   {items.length === 0 && (
                     <div className="h-full flex items-center justify-center opacity-20">
                       <span className="text-4xl text-slate-700 font-black">{i + 1}</span>
                     </div>
                   )}
                   {items.map(t => (
                     <Card key={t.id} className={`p-2 cursor-pointer hover:border-cyan-500 transition-all ${t.status === IncidentStatus.CLOSED ? 'opacity-60 grayscale' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                           <Badge color={t.severity === 'CRITICAL' ? 'red' : 'slate'}>{t.type}</Badge>
                           {t.status === IncidentStatus.CLOSED && <span className="text-[8px] text-green-500 font-bold border border-green-900 px-1 rounded">BLOCKED</span>}
                        </div>
                        <div className="text-[10px] text-white font-mono truncate" title={t.indicator}>{t.indicator}</div>
                     </Card>
                   ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
export default KillChainView;
