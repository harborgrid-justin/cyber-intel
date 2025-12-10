import React from 'react';
import { Card, Badge, ProgressBar } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { IncidentLogic } from '../../../services/logic/IncidentLogic';
import { useDataStore } from '../../../hooks/useDataStore';

export const IncidentPlaybooks: React.FC = () => {
   const pbs = useDataStore(() => threatData.getPlaybooks());
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {pbs.map(pb => {
         const efficacy = IncidentLogic.getPlaybookEfficacy(pb);
         return (
            <Card key={pb.id} className="p-4 flex flex-col justify-between hover:border-cyan-500 transition-colors">
                <div>
                    <div className="flex justify-between items-start mb-2">
                        <h4 className="text-white font-bold">{pb.name}</h4>
                        <Badge color="blue">{pb.triggerLabel || 'Manual'}</Badge>
                    </div>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{pb.description}</p>
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                            <span>Historical Efficacy</span>
                            <span>{efficacy}% Success</span>
                        </div>
                        <ProgressBar value={efficacy} color={efficacy > 80 ? 'green' : 'yellow'} />
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800">
                        {pb.tasks.slice(0, 3).map((t, i) => 
                            <span key={i} className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-500 border border-slate-800 truncate max-w-[100px]">{t}</span>
                        )}
                    </div>
                </div>
            </Card>
         );
       })}
     </div>
   );
};

export default IncidentPlaybooks;