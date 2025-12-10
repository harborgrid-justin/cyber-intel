
import React from 'react';
import { threatData } from '../../../services/dataLayer';
import { Card, Badge, ProgressBar } from '../../Shared/UI';
import { IncidentLogic } from '../../../services/logic/IncidentLogic';
import { Icons } from '../../Shared/Icons';

export const IncidentAssets: React.FC = () => {
  const nodes = threatData.getSystemNodes();

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 animate-in fade-in zoom-in duration-300">
      {nodes.map(n => {
        const { risk, radius } = IncidentLogic.calculateAssetRisk(n, nodes);
        const isCritical = n.criticality === 'CRITICAL';
        
        return (
            <Card 
              key={n.id} 
              className={`p-4 flex flex-col gap-3 hover:border-cyan-500 transition-colors cursor-pointer ${n.type === 'Database' ? 'border-l-4 border-l-purple-500' : ''}`}
            >
                <div className="flex justify-between items-start">
                    <div className="flex items-center gap-2">
                        {n.type === 'Database' ? <Icons.Database className="w-4 h-4 text-purple-400"/> : <Icons.Server className="w-4 h-4 text-slate-400"/>}
                        <div>
                            <div className="text-white font-bold font-mono text-sm">{n.name}</div>
                            <div className="text-[10px] text-slate-500 uppercase">{n.type}</div>
                        </div>
                    </div>
                    <Badge color={n.status === 'ONLINE' ? 'green' : n.status === 'DEGRADED' ? 'orange' : 'red'}>{n.status}</Badge>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                          <span>Risk Exposure</span>
                          <span className={risk > 75 ? 'text-red-500 font-bold' : 'text-slate-300'}>{risk}/100</span>
                        </div>
                        <ProgressBar value={risk} color={risk > 75 ? 'red' : risk > 40 ? 'orange' : 'green'} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold bg-slate-950 p-2 rounded">
                        <span>BLAST RADIUS: {radius} NODES</span>
                        <span className={isCritical ? 'text-red-400' : 'text-slate-400'}>{n.dataSensitivity}</span>
                    </div>
                </div>
            </Card>
        );
      })}
    </div>
  );
};
