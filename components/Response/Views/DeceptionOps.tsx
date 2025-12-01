
import React from 'react';
import { Card, CardHeader, Badge, ProgressBar } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { Honeytoken } from '../../../types';

interface Props {
  honeytokens: Honeytoken[];
}

export const DeceptionOps: React.FC<Props> = ({ honeytokens }) => {
  return (
    <div className="lg:h-full grid grid-cols-1 lg:grid-cols-2 gap-6 pb-6 lg:pb-0">
        <Card className="p-0 overflow-hidden flex flex-col max-h-[500px] lg:max-h-full">
            <CardHeader title="Active Honeytokens" />
            <div className="divide-y divide-slate-800 overflow-y-auto flex-1 custom-scrollbar">
                {honeytokens.map(h => (
                    <div key={h.id} className="p-4 flex items-center justify-between hover:bg-slate-900/50">
                    <div>
                        <div className="font-bold text-white flex items-center gap-2">
                            {h.status === 'TRIGGERED' && <span className="animate-ping w-2 h-2 bg-red-500 rounded-full"></span>}
                            {h.name}
                        </div>
                        <div className="text-xs text-slate-500">{h.type} on {h.location}</div>
                    </div>
                    <div className="text-right">
                        <Badge color={h.status === 'ACTIVE' ? 'green' : h.status === 'TRIGGERED' ? 'red' : 'slate'}>{h.status}</Badge>
                        {h.lastTriggered && <div className="text-[10px] text-red-400 mt-1 font-bold">HIT: {h.lastTriggered}</div>}
                    </div>
                    </div>
                ))}
            </div>
        </Card>
        <div className="flex flex-col gap-4 h-fit">
            <Card className="p-6 bg-slate-900/50 border-dashed border-2 flex items-center justify-center cursor-pointer hover:border-cyan-500 hover:bg-slate-900 transition-all">
                <div className="text-center flex flex-col items-center">
                    <Icons.Target className="w-10 h-10 text-slate-600 mb-2" />
                    <div className="font-bold text-white">Deploy New Canary</div>
                    <div className="text-xs text-slate-500">Files, Database Rows, AWS Keys</div>
                </div>
            </Card>
            <Card className="p-0 overflow-hidden">
                <CardHeader title="Honeytoken Effectiveness" />
                <div className="p-6 space-y-4">
                    <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>Trigger Rate</span><span>12%</span></div><ProgressBar value={12} /></div>
                    <div><div className="flex justify-between text-xs text-slate-400 mb-1"><span>False Positives</span><span>0.5%</span></div><ProgressBar value={1} color="green" /></div>
                </div>
            </Card>
        </div>
    </div>
  );
};
