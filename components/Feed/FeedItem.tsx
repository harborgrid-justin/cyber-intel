
import React from 'react';
import { Threat, Severity, IncidentStatus, View } from '../../types';
import { getScoreColorClass } from '../../services/scoringEngine';
import { threatData } from '../../services/dataLayer';
import { Card, Button, Badge } from '../Shared/UI';

interface FeedItemProps {
  threat: Threat;
}

const FeedItem: React.FC<FeedItemProps> = ({ threat }) => {
  const updateStatus = (newStatus: IncidentStatus) => {
    threatData.updateStatus(threat.id, newStatus);
  };

  const handleActorClick = () => {
    const actor = threatData.getActors().find(a => a.name === threat.threatActor);
    if (actor) {
        window.dispatchEvent(new CustomEvent('app-navigation', { detail: { view: View.ACTORS, id: actor.id } }));
    } else {
        alert(`No profile found for ${threat.threatActor}`);
    }
  };

  const severityColor = {
    [Severity.LOW]: 'border-blue-500',
    [Severity.MEDIUM]: 'border-yellow-500',
    [Severity.HIGH]: 'border-orange-500',
    [Severity.CRITICAL]: 'border-red-600',
  };

  const scoreClass = getScoreColorClass(threat.score);

  return (
    <Card className={`p-4 border-l-4 ${severityColor[threat.severity]} group relative overflow-hidden`}>
      {threat.sanctioned && <div className="absolute top-0 right-0 bg-red-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-bl shadow-sm">SANCTIONED</div>}
      {threat.mlRetrain && (
        <div 
          className="absolute bottom-0 right-0 bg-purple-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-tl shadow-lg shadow-purple-900/50 cursor-help z-10"
          title="Flagged for ML Model Retraining due to confidence drift or pattern anomaly"
        >
          ML RETRAIN
        </div>
      )}
      
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        {/* Left Section: Info */}
        <div className="flex-1">
          <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-2">
            <span className="font-mono text-[10px] text-slate-500 uppercase tracking-wider">ID: {threat.id}</span>
            <Badge color="slate">{threat.type}</Badge>
            <span 
                className="text-[10px] font-bold text-cyan-500 hover:text-cyan-300 cursor-pointer uppercase tracking-wider" 
                onClick={handleActorClick}
            >
                Actor: {threat.threatActor}
            </span>
          </div>
          
          <h4 className="text-white font-mono text-sm font-bold tracking-tight mb-1 truncate flex items-center gap-2">
            {threat.indicator}
            {threat.tags?.includes('Shadow IT') && <Badge color="orange">SHADOW IT</Badge>}
          </h4>
          <p className="text-slate-400 text-xs font-light truncate">{threat.description} <span className="text-slate-600 mx-1">|</span> {threat.source}</p>
        </div>
        
        {/* Right Section: Score & Actions */}
        <div className="flex items-center gap-6">
           <div className="flex flex-col items-center">
             <div className={`text-2xl font-bold font-mono ${scoreClass.split(' ')[0]}`}>
               {threat.score}
             </div>
             <div className="text-[9px] text-slate-600 uppercase tracking-widest font-bold">Priority</div>
           </div>

           <div className="flex flex-col gap-2 opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity">
              {threat.status !== IncidentStatus.CLOSED && (
                <>
                  <Button 
                    onClick={() => updateStatus(IncidentStatus.INVESTIGATING)}
                    variant="secondary"
                    className="py-1 px-2 text-[10px]"
                  >
                    Investigate
                  </Button>
                  <Button 
                    onClick={() => updateStatus(IncidentStatus.CLOSED)}
                    variant="danger"
                    className="py-1 px-2 text-[10px]"
                  >
                    Block
                  </Button>
                </>
              )}
              {threat.status === IncidentStatus.CLOSED && (
                <Badge color="green">MITIGATED</Badge>
              )}
           </div>
        </div>
      </div>
    </Card>
  );
};
export default FeedItem;
