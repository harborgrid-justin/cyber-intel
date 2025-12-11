
import React from 'react';
import { Card, CardHeader, Badge, ProgressBar } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { NistControl } from '../../../types';

interface Props {
  compliance: { score: number; criticalGaps: string[] };
  controls: NistControl[];
}

export const ComplianceOps: React.FC<Props> = ({ compliance, controls }) => {
  return (
    <div className="space-y-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <Card className="p-0 overflow-hidden">
                <CardHeader title="ATO Status" />
                <div className="p-6">
                <div className="text-4xl font-bold text-white mb-2">ATO-C</div>
                <div className="text-xs text-slate-500">Authority to Operate (Conditional)</div>
                <div className="mt-4 flex gap-2">
                    <Badge color="green">FedRAMP MOD</Badge>
                    <Badge color="blue">IL-4</Badge>
                </div>
                </div>
            </Card>
            <Card className="p-0 overflow-hidden">
                <CardHeader title="NIST 800-53 Readiness" />
                <div className="p-6">
                <div className="text-4xl font-bold text-cyan-500 mb-2">{compliance.score}%</div>
                <ProgressBar value={compliance.score} color={compliance.score > 90 ? 'green' : 'orange'} />
                <div className="text-xs text-slate-500 mt-2">{controls.length} Controls Monitored</div>
                </div>
            </Card>
            <Card className="p-0 overflow-hidden">
                <CardHeader title="Critical Gaps" />
                <div className="p-6">
                <ul className="space-y-2">
                    {compliance.criticalGaps.length > 0 ? compliance.criticalGaps.map(g => (
                    <li key={g} className="flex items-center gap-2 text-red-400 text-sm font-mono"><span className="w-1.5 h-1.5 bg-red-500 rounded-full"></span>{g}</li>
                    )) : <li className="text-green-500 text-sm">No Critical Gaps</li>}
                </ul>
                </div>
            </Card>
        </div>
        
        <Card className="p-0 overflow-hidden">
            <CardHeader title="Control Implementation Matrix" />
            <ResponsiveTable<NistControl> data={controls} keyExtractor={c => c.id} columns={[
                { header: 'ID', render: c => <span className="font-mono text-cyan-500 font-bold">{c.id}</span> },
                { header: 'Family', render: c => <span className="text-slate-400">{c.family}</span> },
                { header: 'Control Name', render: c => <span className="text-white font-bold">{c.name}</span> },
                { header: 'Status', render: c => <Badge color={c.status === 'IMPLEMENTED' ? 'green' : c.status === 'PLANNED' ? 'blue' : 'red'}>{c.status}</Badge> },
                { header: 'Last Audit', render: c => <span className="text-xs text-slate-500 font-mono">{c.lastAudit}</span> }
            ]} renderMobileCard={c => <div>{c.id}</div>} />
        </Card>
    </div>
  );
};
