
import React from 'react';
import { Card, CardHeader, Badge, Button } from '../../Shared/UI';
import { PatchPrioritization } from '../../../types';

interface Props {
  prioritizedPatches: PatchPrioritization[];
}

export const PatchStrategy: React.FC<Props> = ({ prioritizedPatches }) => {
  return (
    <Card className="lg:h-full h-[500px] p-0 overflow-hidden flex flex-col">
        <CardHeader 
            title="Risk-Based Prioritization"
            action={<Badge color="red">{prioritizedPatches.length} Critical Actions</Badge>}
        />
        <div className="overflow-y-auto flex-1 p-4 space-y-3 custom-scrollbar">
            {prioritizedPatches.map((p, i) => (
                <div key={i} className="flex items-center gap-4 p-4 bg-slate-900 border border-slate-800 rounded hover:border-cyan-500 transition-colors">
                    <div className="text-2xl font-bold text-slate-700">{i + 1}</div>
                    <div className="flex-1 min-w-0">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center mb-1">
                        <span className="font-bold text-white truncate pr-2">{p.vulnId}</span>
                        <span className="text-[10px] text-slate-500 uppercase">Asset: {p.assetId}</span>
                    </div>
                    <div className="text-xs text-slate-400 truncate">{p.reason}</div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                    <Badge color={p.businessCriticality === 'CRITICAL' ? 'red' : p.businessCriticality === 'HIGH' ? 'orange' : 'yellow'}>{p.businessCriticality} IMPACT</Badge>
                    <span className="text-[10px] font-bold text-slate-500">Risk Score: {p.score}</span>
                    </div>
                    <Button variant="primary" className="text-[10px] py-1 h-8 shrink-0">PATCH</Button>
                </div>
            ))}
        </div>
    </Card>
  );
};
