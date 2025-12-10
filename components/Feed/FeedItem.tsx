
import React from 'react';
import { Severity, IncidentStatus, View, Threat } from '../../types';
import { getScoreColorClass } from '../../services/scoringEngine';
import { threatData } from '../../services/dataLayer';
import { Button, Badge } from '../Shared/UI';
import { useOptimistic } from '../../hooks/useOptimistic';
import { Icons } from '../Shared/Icons';

interface FeedItemProps {
  threat: Threat;
}

const FeedItem: React.FC<FeedItemProps> = React.memo(({ threat }) => {
  const { state: status, mutate: updateStatus, isPending } = useOptimistic( threat.status, async (newStatus: IncidentStatus) => { await new Promise(r => setTimeout(r, 800)); threatData.updateStatus(threat.id, newStatus); } );

  const handleActorClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!threat.threatActor) return;
    const actor = threatData.getActors().find(a => a.name === threat.threatActor);
    if (actor) { window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.ACTORS, id: actor.id } })); }
  };

  const severity = threat.severity.toLowerCase();
  const scoreColorName = getScoreColorClass(threat.score);

  const itemStyle = {
    '--item-color': `var(--colors-${severity})`,
    '--item-color-dim': `var(--colors-${severity}Dim)`,
    '--item-glow': `var(--shadows-glow${severity.charAt(0).toUpperCase() + severity.slice(1)})`,
    '--score-color': `var(--colors-${scoreColorName})`,
  } as React.CSSProperties;

  return (
    <div 
      style={itemStyle}
      className={`
        relative group overflow-hidden transition-all duration-300
        bg-[var(--colors-surfaceDefault)] backdrop-blur-sm border border-[var(--colors-borderDefault)] hover:border-[var(--colors-borderHighlight)]
        rounded-r-lg border-l-[3px] border-l-[var(--item-color)] ${isPending ? 'opacity-50' : 'opacity-100'}
        hover:shadow-lg hover:bg-[var(--colors-surfaceHighlight)]
      `}
    >
      <div className="p-3 sm:p-4 flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
        
        {/* Left: Content */}
        <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded bg-[var(--colors-surfaceRaised)] border border-[var(--colors-borderSubtle)] text-[var(--item-color)]`}>
                    {threat.severity}
                </span>
                <span className="text-[10px] text-[var(--colors-textSecondary)] font-mono">
                    {threat.lastSeen}
                </span>
                {threat.threatActor !== 'Unknown' && (
                    <button onClick={handleActorClick} className="flex items-center gap-1 text-[10px] text-[var(--colors-textTertiary)] hover:text-[var(--colors-textPrimary)] transition-colors uppercase tracking-wider font-bold">
                        <Icons.Users className="w-3 h-3" /> {threat.threatActor}
                    </button>
                )}
            </div>
            
            <div className="flex items-center gap-3">
                <h4 className={`text-sm md:text-base font-bold text-[var(--colors-textPrimary)] tracking-tight truncate flex items-center gap-2 font-mono`}>
                    {threat.indicator}
                </h4>
                <Badge color="slate" className="hidden sm:inline-flex opacity-70 scale-90">{threat.type}</Badge>
            </div>
            
            <p className="text-xs text-[var(--colors-textSecondary)] mt-1 line-clamp-1 group-hover:text-[var(--colors-textPrimary)] transition-colors">
                {threat.description} <span className="text-[var(--colors-textTertiary)] mx-1">|</span> <span className="font-mono text-[var(--colors-textTertiary)]">{threat.source}</span>
            </p>
        </div>

        {/* Right: Score & Actions */}
        <div className="flex items-center gap-4 sm:gap-6 w-full sm:w-auto justify-between sm:justify-end">
            {/* Score Dial */}
            <div className="flex flex-col items-center justify-center bg-[var(--colors-surfaceRaised)] p-2 rounded border border-[var(--colors-borderSubtle)]">
                <div className={`text-xl font-black font-mono leading-none text-[var(--score-color)]`}>
                    {threat.score}
                </div>
                <div className="text-[8px] text-[var(--colors-textTertiary)] font-bold uppercase tracking-wider mt-0.5">Risk</div>
            </div>

            {/* Actions */}
            <div className="flex flex-row sm:flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-all sm:translate-x-4 sm:group-hover:translate-x-0">
                {status !== IncidentStatus.CLOSED ? (
                    <>
                        <button 
                            onClick={() => updateStatus(IncidentStatus.INVESTIGATING)} 
                            className="p-1.5 rounded bg-[var(--colors-primaryDim)] text-[var(--colors-primary)] border border-transparent hover:border-[var(--colors-primary)] transition-all"
                            title="Investigate"
                            disabled={status === IncidentStatus.INVESTIGATING}
                        >
                            <Icons.Search className="w-4 h-4" />
                        </button>
                        <button 
                            onClick={() => updateStatus(IncidentStatus.CLOSED)} 
                            className="p-1.5 rounded bg-[var(--colors-criticalDim)] text-[var(--colors-critical)] border border-transparent hover:border-[var(--colors-critical)] transition-all"
                            title="Block / Close"
                        >
                            <Icons.Shield className="w-4 h-4" />
                        </button>
                    </>
                ) : (
                    <span className="text-xs font-bold text-[var(--colors-success)] flex items-center gap-1 bg-[var(--colors-successDim)] px-2 py-1 rounded border border-[var(--colors-success)]/30">
                        <Icons.CheckCircle className="w-3 h-3" /> SAFE
                    </span>
                )}
            </div>
        </div>
      </div>
      
      {/* Background Pulse Animation for Critical */}
      {threat.severity === Severity.CRITICAL && (
          <div className="absolute inset-0 bg-gradient-to-r from-rose-600/5 to-transparent animate-pulse pointer-events-none"></div>
      )}
    </div>
  );
});
export default FeedItem;
