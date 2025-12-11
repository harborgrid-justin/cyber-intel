
import React from 'react';
import { Card, CardHeader, Badge } from '../../Shared/UI';
import { Icons } from '../../Shared/Icons';
import { Vendor } from '../../../types';

export const VendorIncidents: React.FC<{ vendors: Vendor[] }> = ({ vendors }) => {
    // Mock incidents logic for demo purposes based on vendor names
    const incidents = [
        { id: 'INC-2020-001', title: 'SolarWinds Orion Compromise', date: 'Dec 2020', severity: 'CRITICAL', vendor: 'SolarWinds', type: 'Supply Chain Attack', impact: 'Global' },
        { id: 'INC-2021-042', title: 'Log4Shell Vulnerability', date: 'Dec 2021', severity: 'CRITICAL', vendor: 'Apache / Multiple', type: 'Zero-Day', impact: 'Widespread' },
        { id: 'INC-2023-112', title: 'MOVEit Transfer Exploit', date: 'May 2023', severity: 'HIGH', vendor: 'Progress Software', type: 'Data Exfiltration', impact: 'Finance/Gov' }
    ];

    return (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 h-full">
            <Card className="p-0 overflow-hidden border-l-4 border-l-red-600 bg-slate-950">
                <CardHeader title="Active Supply Chain Alerts" action={<Badge color="red" className="animate-pulse">LIVE</Badge>} />
                <div className="p-6">
                    <div className="relative border-l-2 border-slate-800 ml-4 space-y-8 py-2">
                        {incidents.map((inc, i) => (
                            <div key={i} className="pl-8 relative group">
                                <div className={`absolute left-[-9px] top-1.5 w-4 h-4 rounded-full border-2 ${inc.severity === 'CRITICAL' ? 'bg-red-900 border-red-500' : 'bg-orange-900 border-orange-500'} group-hover:scale-125 transition-transform`}></div>
                                <div className="bg-slate-900 p-4 rounded border border-slate-800 hover:border-slate-600 transition-colors">
                                    <div className="flex justify-between items-start mb-2">
                                        <h4 className="font-bold text-white">{inc.title}</h4>
                                        <Badge color={inc.severity === 'CRITICAL' ? 'red' : 'orange'}>{inc.severity}</Badge>
                                    </div>
                                    <div className="grid grid-cols-2 gap-2 text-xs text-slate-400 mb-2">
                                        <div><span className="text-slate-600 uppercase font-bold">Vendor:</span> <span className="text-cyan-400">{inc.vendor}</span></div>
                                        <div><span className="text-slate-600 uppercase font-bold">Date:</span> {inc.date}</div>
                                        <div><span className="text-slate-600 uppercase font-bold">Type:</span> {inc.type}</div>
                                        <div><span className="text-slate-600 uppercase font-bold">Impact:</span> {inc.impact}</div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </Card>

            <div className="flex flex-col gap-6">
                <Card className="flex-1 p-6">
                    <div className="flex items-center gap-3 mb-4 text-slate-400">
                        <Icons.AlertTriangle className="w-6 h-6" />
                        <h3 className="font-bold uppercase tracking-widest text-sm">Vendor Impact Analysis</h3>
                    </div>
                    <div className="space-y-4">
                        <div className="p-4 bg-slate-900 rounded border border-slate-800">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Internal Assets Affected</div>
                            <div className="text-3xl font-bold text-white mb-1">12</div>
                            <div className="text-[10px] text-red-400">Critical Systems exposed to Log4j</div>
                        </div>
                        <div className="p-4 bg-slate-900 rounded border border-slate-800">
                            <div className="text-xs text-slate-500 uppercase font-bold mb-2">Incident Response Status</div>
                            <div className="flex gap-2 mb-2">
                                <span className="px-3 py-1 bg-green-900/20 text-green-500 border border-green-900/50 rounded text-xs font-bold">SolarWinds: PATCHED</span>
                                <span className="px-3 py-1 bg-yellow-900/20 text-yellow-500 border border-yellow-900/50 rounded text-xs font-bold">Log4j: MITIGATING</span>
                            </div>
                        </div>
                    </div>
                </Card>
            </div>
        </div>
    );
};
