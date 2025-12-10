
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Badge, Button, Input, Select, Label } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { ChainEvent, Artifact } from '../../../types';
import { ForensicsLogic } from '../../../services/logic/ForensicsLogic';
import { threatData } from '../../../services/dataLayer';

interface Props { data: ChainEvent[]; artifacts: Artifact[]; }

export const CustodyChainView: React.FC<Props> = ({ data, artifacts }) => {
  const [handoff, setHandoff] = useState({ artifactId: '', user: '', notes: '' });
  const [status, setStatus] = useState({ intact: true, lastCustodian: 'Checking...' });

  useEffect(() => {
    const validate = async () => {
      const res = await ForensicsLogic.validateCustodyChain(data);
      setStatus(res);
    };
    validate();
  }, [data]);

  const handleTransfer = () => {
    if (!handoff.artifactId || !handoff.user) return;
    const art = artifacts.find(a => a.id === handoff.artifactId);
    threatData.addChainEvent({
        id: `chain-${Date.now()}`, date: new Date().toLocaleString(), artifactId: handoff.artifactId,
        artifactName: art?.name || 'Unknown', action: 'TRANSFER', user: 'Analyst.Me',
        notes: `Transferred to ${handoff.user}: ${handoff.notes}`
    });
    setHandoff({ artifactId: '', user: '', notes: '' });
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-full">
      <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
        <CardHeader title="Secure Custody Ledger" action={<Badge color={status.intact ? 'green' : 'red'}>{status.intact ? 'CHAIN SECURE' : 'GAP DETECTED'}</Badge>} />
        <div className="flex-1 overflow-y-auto">
            <ResponsiveTable<ChainEvent> data={data} keyExtractor={c => c.id} columns={[
                { header: 'Timestamp', render: c => <span className="text-slate-300 font-mono text-xs">{c.date}</span> },
                { header: 'Artifact', render: c => <div><div className="text-white font-bold text-xs">{c.artifactName}</div><div className="text-[10px] text-slate-500 font-mono">{c.artifactId}</div></div> },
                { header: 'Action', render: c => <Badge color={c.action==='CHECK_IN'?'green':c.action==='CHECK_OUT'?'orange':'blue'}>{c.action}</Badge> },
                { header: 'Custodian', render: c => <span className="text-cyan-500 text-xs font-bold">{c.user}</span> },
                { header: 'Notes', render: c => <span className="text-slate-500 text-xs italic">{c.notes}</span> }
            ]} renderMobileCard={c => <div>{c.action}</div>} />
        </div>
      </Card>
      
      <div className="flex flex-col gap-6">
        <Card className="p-6 border-l-4 border-l-blue-500 bg-slate-900">
            <h3 className="font-bold text-white mb-4">Secure Handoff</h3>
            <div className="space-y-4">
                <div><Label>Select Artifact</Label><Select value={handoff.artifactId} onChange={e => setHandoff({...handoff, artifactId: e.target.value})}><option value="">-- Select --</option>{artifacts.map(a => <option key={a.id} value={a.id}>{a.name}</option>)}</Select></div>
                <div><Label>Receiving Custodian</Label><Input value={handoff.user} onChange={e => setHandoff({...handoff, user: e.target.value})} placeholder="User ID / Badge" /></div>
                <div><Label>Transfer Notes</Label><Input value={handoff.notes} onChange={e => setHandoff({...handoff, notes: e.target.value})} placeholder="Reason for transfer..." /></div>
                <Button onClick={handleTransfer} className="w-full">SIGN & TRANSFER</Button>
            </div>
        </Card>
        <Card className="p-6">
            <h3 className="font-bold text-white mb-2">Current Custodian</h3>
            <div className="text-2xl font-mono text-cyan-400">{status.lastCustodian}</div>
            <p className="text-xs text-slate-500 mt-2">Based on latest ledger entry.</p>
        </Card>
      </div>
    </div>
  );
};
