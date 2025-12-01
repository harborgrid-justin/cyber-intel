
import React from 'react';
import { Threat, Malware, Infrastructure, Pcap } from '../../types';
import { Badge, Card, Button, CardHeader } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import FeedItem from '../Feed/FeedItem';

export const ActorThreatFeeds = ({ actorName }: { actorName: string }) => {
  const feeds = [
    { name: 'Mandiant', status: 'Monitoring', confidence: 'High', lastHit: '2h' },
    { name: 'CrowdStrike', status: 'Active', confidence: 'V. High', lastHit: '15m' },
  ];
  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader title="Intelligence Sources" action={<span className="text-[10px] text-slate-500">Tracking: <span className="text-cyan-500 font-bold">{actorName}</span></span>} />
      <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeds.map((f, i) => (
          <div key={i} className="p-4 border border-slate-800 bg-slate-900 rounded hover:border-cyan-500 transition-colors">
            <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-white">{f.name}</h4><Badge color="blue">{f.status}</Badge></div>
            <div className="text-sm text-slate-400">Conf: {f.confidence} | Hit: {f.lastHit}</div>
          </div>
        ))}
      </div>
    </Card>
  );
};

export const ActorIoCAssociations = ({ threats }: { threats: Threat[] }) => (
  <Card className="p-0 overflow-hidden">
    <CardHeader title="Indicators of Compromise" action={<Badge color="red">{threats.length} IoCs</Badge>} />
    <ResponsiveTable<Threat> data={threats} keyExtractor={t => t.id}
      columns={[
        { header: 'Indicator', render: t => <span className="font-mono text-cyan-400 font-bold">{t.indicator}</span> },
        { header: 'Type', render: t => <span className="text-slate-300 text-xs">{t.type}</span> },
        { header: 'Status', render: t => <Badge color={t.status === 'NEW' ? 'red' : 'green'}>{t.status}</Badge> }
      ]}
      renderMobileCard={t => <div className="flex justify-between"><span>{t.indicator}</span><Badge>{t.status}</Badge></div>}
    />
  </Card>
);

export const ActorMalwareFamilies = ({ malware }: { malware: Malware[] }) => (
  <div className="space-y-4">
    <Card className="p-0 overflow-hidden border-l-4 border-l-red-600">
        <CardHeader title="Malware Arsenal" />
        <div className="p-4">
            {malware.length === 0 ? <div className="text-center text-slate-500 italic">No malware linked.</div> : 
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{malware.map(m => (
                <div key={m.id} className="p-4 border border-slate-700 bg-slate-950 rounded">
                <div className="flex justify-between"><h4 className="text-white font-bold">{m.name}</h4><Badge color="red">MALICIOUS</Badge></div>
                <div className="text-xs text-slate-400 mb-2">Family: <span className="text-red-400">{m.family}</span></div>
                <div className="text-[10px] bg-slate-900 p-2 rounded font-mono text-slate-300 truncate mb-3 border border-slate-800">{m.hash}</div>
                <Button variant="outline" className="w-full text-[10px]">ANALYSIS</Button>
                </div>
            ))}</div>}
        </div>
    </Card>
  </div>
);

export const ActorInfraDetails = ({ infra }: { infra: Infrastructure[] }) => (
  <Card className="p-0 overflow-hidden">
    <CardHeader title="Infrastructure Audit" />
    <table className="w-full text-left text-sm text-slate-400">
      <thead className="bg-slate-950 text-xs uppercase font-medium text-slate-500 border-b border-slate-800"><tr><th className="px-6 py-3">Value</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Status</th></tr></thead>
      <tbody className="divide-y divide-slate-800">{infra.map(i => (
        <tr key={i.id}><td className="px-6 py-4 font-mono text-cyan-400">{i.value}</td><td className="px-6 py-4 text-xs">{i.type}</td><td className="px-6 py-4"><Badge color={i.status === 'ACTIVE' ? 'red' : 'green'}>{i.status}</Badge></td></tr>
      ))}</tbody>
    </table>
  </Card>
);

export const ActorNetworkAnalysis = ({ pcaps }: { pcaps: Pcap[] }) => (
  <div className="space-y-4">
    <Card className="p-0 overflow-hidden">
        <CardHeader title="Network Forensics" action={<span className="text-xs font-bold text-slate-500">{pcaps.length} CAPTURES</span>} />
        <div className="p-4 space-y-2">
            {pcaps.length > 0 ? pcaps.map(p => (
            <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded flex justify-between items-center">
                <div className="flex items-center gap-4"><div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 font-bold">PCAP</div><div><div className="font-bold text-white font-mono text-sm">{p.name}</div><div className="text-xs text-slate-400">{p.size}</div></div></div>
                <Badge color={p.analysisStatus === 'ANALYZED' ? 'green' : 'orange'}>{p.analysisStatus}</Badge>
            </div>
            )) : <div className="text-slate-500 text-center py-4 italic">No captures linked.</div>}
        </div>
    </Card>
  </div>
);
