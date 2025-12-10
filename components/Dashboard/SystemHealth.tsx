
import React from 'react';
import { threatData } from '../../services/dataLayer';
// Fix: Import UI components from the barrel file
import { Card, CardHeader } from '../Shared/UI';
import { HealthLogic } from '../../services/logic/dashboard/InfraLogic';

const SystemHealth: React.FC = () => {
  const nodes = threatData.getSystemNodes();

  return (
    <Card className="shadow-sm p-0 overflow-hidden flex flex-col">
      <CardHeader 
        title="Sensor Grid Status" 
      />
      <div className="p-6 space-y-4">
        {nodes.slice(0, 5).map((node) => {
          const health = HealthLogic.predictNodeFailure(node);
          return (
            <div key={node.id} className="group">
              <div className="flex justify-between text-xs font-mono mb-1">
                <span className={`font-bold ${node.status === 'ONLINE' ? 'text-[var(--colors-success)]' : 'text-[var(--colors-error)]'}`}>
                  {node.name}
                </span>
                <span className="text-slate-500">{node.latency}ms</span>
              </div>
              <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-1000 ${
                    node.load > 80 ? 'bg-[var(--colors-error)]' : node.load > 50 ? 'bg-[var(--colors-warning)]' : 'bg-[var(--colors-primary)]'
                  }`} 
                  style={{ width: `${node.load}%` }}
                />
              </div>
              <div className="flex justify-between mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                 <span className="text-[10px] text-slate-600 uppercase">Load: {node.load}%</span>
                 <span className={`text-[10px] font-bold uppercase ${health.risk > 50 ? 'text-[var(--colors-error)]' : 'text-slate-600'}`}>{health.prediction}</span>
              </div>
            </div>
          );
        })}
      </div>
    </Card>
  );
};
export default SystemHealth;