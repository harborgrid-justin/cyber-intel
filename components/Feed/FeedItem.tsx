
import React, { useCallback } from 'react';
import { IncidentStatus, Threat } from '../../types';
import { getScoreColorClass } from '../../services/scoringEngine';
import { threatData } from '../../services/dataLayer';
import { Badge, Button } from '../Shared/UI';
import { Icons } from '../Shared/Icons';
import { fastDeepEqual } from '../../services/utils/fastDeepEqual';

interface FeedItemProps {
  threat: Threat;
}

const FeedItemComponent: React.FC<FeedItemProps> = ({ threat }) => {
  // Stable handlers using useCallback to prevent re-renders in parent lists
  const handlePromote = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    threatData.updateStatus(threat.id, IncidentStatus.INVESTIGATING);
  }, [threat.id]);

  const handleArchive = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    threatData.updateStatus(threat.id, IncidentStatus.CLOSED);
  }, [threat.id]);

  const scoreColor = getScoreColorClass(threat.score);
  
  // Determine text color class based on score logic
  const scoreTextColor = 
    scoreColor === 'critical' ? 'text-red-500' : 
    scoreColor === 'high' ? 'text-orange-500' : 
    scoreColor === 'medium' ? 'text-yellow-500' : 
    'text-green-500';

  return (
    <div 
        className="p-3 bg-slate-900/50 border border-slate-800 rounded-lg hover:border-cyan-500/50 transition-colors group flex items-center justify-between gap-4"
        role="article"
        aria-label={`Threat ${threat.indicator} - Severity ${threat.severity}`}
    >
      <div className="flex items-center gap-3 overflow-hidden">
         <div className="p-2 rounded bg-slate-950 border border-slate-800 text-slate-400 shrink-0" aria-hidden="true">
            {threat.type === 'IP Address' ? <Icons.Globe className="w-4 h-4" /> : 
             threat.type === 'File Hash' ? <Icons.FileText className="w-4 h-4" /> : 
             <Icons.AlertTriangle className="w-4 h-4" />}
         </div>
         <div className="min-w-0">
            <div className="flex items-center gap-2 mb-1">
                <span className="font-mono text-sm font-bold text-slate-200 truncate">{threat.indicator}</span>
                <Badge color={threat.severity === 'CRITICAL' ? 'red' : threat.severity === 'HIGH' ? 'orange' : 'slate'}>
                    {threat.severity}
                </Badge>
            </div>
            <div className="text-xs text-slate-500 truncate flex gap-2">
                <span>{threat.type}</span>
                <span>•</span>
                <span>{threat.source}</span>
                <span>•</span>
                <span>{threat.lastSeen}</span>
            </div>
         </div>
      </div>

      <div className="flex items-center gap-4 shrink-0">
         <div className="text-right hidden sm:block">
            <div className={`text-sm font-bold ${scoreTextColor}`}>
                {threat.score}
            </div>
            <div className="text-[9px] text-slate-600 uppercase font-bold">Risk Score</div>
         </div>
         
         <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity focus-within:opacity-100">
            <Button 
                onClick={handlePromote} 
                variant="secondary" 
                className="h-8 px-2"
                aria-label="Promote threat to incident"
                title="Promote to Incident"
            >
                <Icons.Zap className="w-4 h-4" />
            </Button>
            <Button 
                onClick={handleArchive} 
                variant="text" 
                className="h-8 px-2 text-slate-500 hover:text-red-400"
                aria-label="Archive threat"
                title="Archive Threat"
            >
                <Icons.UserX className="w-4 h-4" />
            </Button>
         </div>
      </div>
    </div>
  );
};

// Optimized memoization: Only re-render if deep equality check fails on threat prop
export default React.memo(FeedItemComponent, (prev, next) => fastDeepEqual(prev.threat, next.threat));
