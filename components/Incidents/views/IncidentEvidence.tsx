
import React from 'react';
import { Case, Artifact } from '../../../types';
import { Card, Badge, Button, CardHeader, Grid } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { threatData } from '../../../services/dataLayer';
import { IncidentLogic } from '../../../services/logic/IncidentLogic';

type EvidenceItem = Artifact & { caseTitle: string };

export const IncidentEvidence: React.FC<{ cases: Case[] }> = ({ cases }) => {
  const artifacts: EvidenceItem[] = cases.flatMap(c => c.artifacts.map(a => ({...a, caseTitle: c.title})));
  const custody = threatData.getChainOfCustody();
  const chainStatus = IncidentLogic.validateChainOfCustody(custody);

  return (
    <div className="space-y-4">
        <Grid cols={3}>
            <Card className="p-4 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Total Artifacts</div>
                <div className="text-2xl font-bold text-white">{artifacts.length}</div>
            </Card>
            <Card className="p-4 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Chain Integrity</div>
                <div className={`text-2xl font-bold ${chainStatus.valid ? 'text-green-500' : 'text-red-500'}`}>{chainStatus.valid ? 'SECURE' : 'BROKEN'}</div>
            </Card>
            <Card className="p-4 text-center">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Custody Gaps</div>
                <div className="text-2xl font-bold text-slate-300">{chainStatus.gaps}</div>
            </Card>
        </Grid>

        <Card className="p-0 overflow-hidden">
            <CardHeader title="Evidence Locker & Analysis" action={<Button variant="secondary" className="text-[10px] py-1">GENERATE HASH REPORT</Button>} />
            <ResponsiveTable<EvidenceItem> data={artifacts} keyExtractor={a => a.id}
                columns={[
                { header: 'File Name', render: a => <span className="text-white font-mono text-xs font-bold">{a.name}</span> },
                { header: 'Related Case', render: a => <span className="text-slate-400 text-xs truncate max-w-[150px]">{a.caseTitle}</span> },
                { header: 'Hash (MD5)', render: a => <span className="text-cyan-600 font-mono text-[10px] truncate max-w-[100px]">{a.hash}</span> },
                { header: 'Status', render: a => <Badge color={a.status === 'COMPROMISED' ? 'red' : 'green'}>{a.status || 'SECURE'}</Badge> }
                ]}
                renderMobileCard={a => <div><div className="font-bold text-white">{a.name}</div><div className="text-xs text-slate-500">{a.caseTitle}</div></div>}
            />
        </Card>
    </div>
  );
};

export default IncidentEvidence;
