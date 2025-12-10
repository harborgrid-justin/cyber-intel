
import React from 'react';
import { Card, CardHeader, StatusIndicator } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { Vendor } from '../../../types';

interface Props {
  riskData: Vendor[];
  onSelect: (id: string) => void;
}

export const RiskRadar: React.FC<Props> = ({ riskData, onSelect }) => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2 p-0 overflow-hidden">
        <CardHeader 
            title="Critical Vendor Watchlist" 
            action={
            <div className="flex gap-2">
                <span className="text-[10px] text-red-500 font-bold flex items-center gap-1">
                    <StatusIndicator color="red" pulse /> High Risk
                </span>
                <span className="text-[10px] text-green-500 font-bold flex items-center gap-1">
                    <StatusIndicator color="green" /> Stable
                </span>
            </div>
            }
        />
        <div className="divide-y divide-slate-800">
            {riskData.map((v, i) => (
                <div key={v.id} className="p-4 flex items-center gap-4 hover:bg-slate-900/50 transition-colors group cursor-pointer" onClick={() => onSelect(v.id)}>
                <div className="text-sm font-mono text-slate-600 w-6">0{i+1}</div>
                <div className="flex-1">
                    <div className="flex justify-between mb-1">
                        <span className="font-bold text-white text-base">{v.name}</span>
                        <span className={`font-mono font-bold ${v.riskScore > 80 ? 'text-red-500' : 'text-green-500'}`}>{v.riskScore}/100</span>
                    </div>
                    <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mb-2">
                        <div className={`h-full ${v.riskScore > 80 ? 'bg-red-500' : 'bg-green-500'}`} style={{ width: `${v.riskScore}%` }}></div>
                    </div>
                    <div className="flex gap-4 text-[10px] text-slate-500 uppercase font-bold">
                        <span>{v.tier}</span>
                        <span>{v.category}</span>
                        <span className={v.hqLocation === 'Russia' ? 'text-red-400' : ''}>{v.hqLocation}</span>
                    </div>
                </div>
                </div>
            ))}
        </div>
        </Card>
        <div className="space-y-4">
        <Card className="p-6 border-l-4 border-l-red-600">
            <div className="flex justify-between items-start mb-4">
                <h3 className="text-xs font-bold text-red-400 uppercase tracking-widest">Aggregate Exposure</h3>
                <Icons.Activity className="w-5 h-5 text-red-500" />
            </div>
            <div className="text-4xl font-mono font-bold text-white mb-2">CRITICAL</div>
            <p className="text-xs text-slate-400">3 Strategic vendors have active zero-day vulnerabilities affecting internal systems.</p>
        </Card>
        <Card className="p-4">
            <h3 className="text-xs font-bold text-slate-500 uppercase mb-3">Top Vulnerable Software</h3>
            <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-300"><span>Log4j (SolarWinds)</span><span className="text-red-500 font-bold">CVE-2021-44228</span></div>
                <div className="flex justify-between text-xs text-slate-300"><span>OpenSSL (Azure)</span><span className="text-orange-500 font-bold">CVE-2023-0286</span></div>
            </div>
        </Card>
        </div>
    </div>
  );
};
