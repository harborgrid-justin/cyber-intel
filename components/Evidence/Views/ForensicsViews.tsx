
import React from 'react';
import { Card, CardHeader, Badge, Button, Grid } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { ChainEvent, Malware, ForensicJob } from '../../../types';

export const CustodyChain: React.FC<{ data: ChainEvent[] }> = ({ data }) => (
  <Card className="p-0 overflow-hidden h-full flex flex-col">
    <CardHeader title="Chain of Custody Log" />
    <div className="flex-1 overflow-y-auto">
        <ResponsiveTable<ChainEvent> data={data} keyExtractor={c => c.id}
            columns={[
                { header: 'Time', render: c => <span className="text-slate-300 font-mono text-xs">{c.date}</span> }, 
                { header: 'Artifact', render: c => <div><div className="text-white font-bold text-xs">{c.artifactName}</div><div className="text-[10px] text-slate-500 font-mono">ID: {c.artifactId}</div></div> }, 
                { header: 'Action', render: c => <Badge color={c.action === 'CHECK_IN' ? 'green' : c.action === 'CHECK_OUT' ? 'orange' : 'blue'}>{c.action}</Badge> }, 
                { header: 'Custodian', render: c => <span className="text-cyan-500 text-xs">{c.user}</span> }, 
                { header: 'Notes', render: c => <span className="text-slate-500 text-xs italic">{c.notes}</span> }
            ]}
            renderMobileCard={c => <div className="flex flex-col gap-1"><div className="flex justify-between"><span className="text-white font-bold">{c.artifactName}</span><span className="text-slate-500 text-xs">{c.date}</span></div><div className="flex justify-between"><Badge>{c.action}</Badge><span className="text-cyan-500 text-xs">{c.user}</span></div></div>}
        />
    </div>
  </Card>
);

export const MalwareVault: React.FC<{ data: Malware[] }> = ({ data }) => (
  <Grid cols={3}>{data.map(m => (
        <Card key={m.id} className="p-4 border-l-4 border-l-red-600 hover:bg-slate-800/50 transition-colors">
        <div className="flex justify-between mb-2"><h4 className="text-white font-bold truncate pr-2">{m.name}</h4><Badge color={m.score > 80 ? 'red' : m.score > 0 ? 'orange' : 'green'}>{m.verdict}</Badge></div>
        <div className="text-xs text-slate-400 mb-2">Family: <span className="text-white">{m.family}</span></div>
        <div className="text-[10px] bg-slate-950 p-2 rounded font-mono text-slate-600 mb-3 truncate border border-slate-800">{m.hash}</div>
        <div className="flex gap-2"><Button variant="danger" className="flex-1 text-[10px]">DETONATE</Button><Button variant="secondary" className="flex-1 text-[10px]">REVERSE</Button></div>
        </Card>
  ))}</Grid>
);

export const ForensicsLab: React.FC<{ jobs: ForensicJob[]; onQueue: (t: string, type: string) => void }> = ({ jobs, onQueue }) => (
  <div className="space-y-4">
    <div className="flex justify-end"><Button onClick={() => onQueue('Unknown_Device', 'Triage')} variant="primary">+ QUEUE JOB</Button></div>
    <Grid cols={2}>{jobs.map(j => (
        <Card key={j.id} className="p-4 flex items-center gap-4">
            <div className={`w-2 h-16 rounded ${j.status==='COMPLETED'?'bg-green-500':j.status==='PROCESSING'?'bg-cyan-500':j.status==='FAILED'?'bg-red-500':'bg-slate-700'}`}></div>
            <div className="flex-1">
            <div className="flex justify-between"><h4 className="text-white font-bold text-sm">{j.type}</h4><span className="text-[10px] font-mono text-slate-400">{j.id}</span></div>
            <div className="text-xs text-slate-300 font-bold my-1">{j.target} <span className="text-slate-500 font-normal">by {j.technician}</span></div>
            <div className="flex items-center gap-2"><div className="flex-1 bg-slate-800 h-1.5 rounded-full"><div className={`h-full rounded-full ${j.status==='COMPLETED'?'bg-green-500':j.status==='FAILED'?'bg-red-500':'bg-cyan-500'}`} style={{width: `${j.progress}%`}}></div></div><span className="text-[10px] text-slate-400 w-8 text-right">{j.progress}%</span></div>
            </div>
        </Card>
    ))}</Grid>
  </div>
);
