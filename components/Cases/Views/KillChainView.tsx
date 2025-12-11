
import React, { useMemo } from 'react';
import { Threat, IncidentStatus } from '../../../types';
import { RiskLogic } from '../../../services/logic/RiskLogic';
import { Card, Badge, CardHeader } from '../../Shared/UI';

interface KillChainViewProps {
  threats: Threat[];
}

const KillChainView: React.FC<KillChainViewProps> = ({ threats }) => {
  const chain = useMemo(() => RiskLogic.mapToKillChain(threats), [threats]);
  const stages = Object.keys(chain);

  return (
    <div className="flex flex-col h-full space-y-4">
      <Card className="p-0">
         <CardHeader 
           title="Cyber Kill Chain Reconstruction" 
           action={
             <div className="flex gap-4">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--colors-error)]"></span><span className="text-[10px] text-[var(--colors-textSecondary)] font-bold uppercase">Active</span></div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-[var(--colors-success)]"></span><span className="text-[10px] text-[var(--colors-textSecondary)] font-bold uppercase">Blocked</span></div>
             </div>
           }
         />
         <div className="p-4 text-xs text-[var(--colors-textSecondary)]">
            Mapping tactical indicators to attack lifecycle stages.
         </div>
      </Card>

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
                  ${isActive ? 'bg-[var(--colors-errorDim)] text-[var(--colors-error)] border-[var(--colors-error)]/50' : 'bg-[var(--colors-surfaceRaised)] text-[var(--colors-textSecondary)] border-[var(--colors-borderDefault)]'}
                  border-y border-l clip-chevron-container
                `}>
                  {i + 1}. {stage}
                </div>

                {/* Drop Zone / List */}
                <div className={`flex-1 bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded p-2 space-y-2 ${isActive ? 'bg-[var(--colors-errorDim)]/50 border-[var(--colors-error)]/20' : ''}`}>
                   {items.length === 0 && (
                     <div className="h-full flex items-center justify-center opacity-20">
                       <span className="text-4xl text-[var(--colors-textTertiary)] font-black">{i + 1}</span>
                     </div>
                   )}
                   {items.map(t => (
                     <Card key={t.id} className={`p-2 cursor-pointer hover:border-[var(--colors-primary)] transition-all ${t.status === IncidentStatus.CLOSED ? 'opacity-60 grayscale' : ''}`}>
                        <div className="flex justify-between items-start mb-1">
                           <Badge color={t.severity === 'CRITICAL' ? 'critical' : 'slate'}>{t.type}</Badge>
                           {t.status === IncidentStatus.CLOSED && <span className="text-[8px] text-[var(--colors-success)] font-bold border border-[var(--colors-success)]/50 px-1 rounded">BLOCKED</span>}
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
