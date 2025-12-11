
import React, { useState, useEffect } from 'react';
import { Card, Grid, ProgressBar, StatusBadge } from '../../../Shared/UI';
import { MetricCard } from '../../../Shared/MetricCard';
import { threatData } from '../../../../services/dataLayer';
import { useDataStore } from '../../../../hooks/useDataStore';
import { HealthLogic } from '../../../../services/logic/dashboard/InfraLogic';

interface PredictionMap {
  [nodeId: string]: {
    risk: number;
    prediction: string;
  };
}

export const SystemHealth: React.FC = () => {
    const liveNodes = useDataStore(() => threatData.getSystemNodes());
    const [predictions, setPredictions] = useState<PredictionMap>({});

    useEffect(() => {
        HealthLogic.getSystemHealth(liveNodes).then(res => {
            const predMap: PredictionMap = {};
            res.nodes.forEach(n => {
              predMap[n.nodeId] = { risk: n.risk, prediction: n.prediction };
            });
            setPredictions(predMap);
        });
    }, [liveNodes]); 
    
    const degradedCount = liveNodes.filter(n => n.status === 'DEGRADED' || n.load > 90).length;
    const uptime = 99.98;

    return (
      <div className="space-y-6 h-full overflow-y-auto">
        <Grid cols={3}>
           <MetricCard title="Grid Uptime" value={`${uptime}%`} color="green" icon="Activity" />
           <MetricCard title="Active Sensors" value={liveNodes.length.toString()} color="slate" icon="Server" />
           <MetricCard title="Degraded Nodes" value={degradedCount.toString()} color={degradedCount > 0 ? 'orange' : 'green'} icon="AlertTriangle" />
        </Grid>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {liveNodes.map((n) => {
               const pred = predictions[n.id];
               return (
                   <Card key={n.id} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                         <div className={`font-bold text-[var(--colors-textPrimary)] text-sm`}>{n.name}</div>
                         <StatusBadge status={n.status} />
                      </div>
                      <div>
                         <div className="flex justify-between text-xs mb-1">
                            <span className={`text-[var(--colors-textSecondary)] font-medium`}>System Load</span>
                            <span className={`font-mono ${n.load > 80 ? 'text-rose-400 font-bold' : 'text-[var(--colors-textTertiary)]'}`}>{n.load}%</span>
                         </div>
                         <ProgressBar value={n.load} color={n.load > 80 ? 'red' : 'blue'} className="h-1.5" />
                      </div>
                      <div className={`p-2 rounded border flex justify-between items-center text-xs bg-[var(--colors-surfaceHighlight)] border-[var(--colors-borderSubtle)]`}>
                         <span className="text-[var(--colors-textSecondary)]">AI Prediction:</span>
                         <span className={`font-bold ${pred && pred.risk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {pred?.prediction || 'Analyzing...'}
                         </span>
                      </div>
                   </Card>
               );
           })}
        </div>
      </div>
    );
};
