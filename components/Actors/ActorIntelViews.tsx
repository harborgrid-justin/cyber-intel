
import React from 'react';
import { Threat, Malware, Infrastructure, Pcap } from '../../types';
import { Badge, Card, Button } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import FeedItem from '../Feed/FeedItem';

export const ActorThreatFeeds = ({ actorName }: { actorName: string }) => {
  const feeds = [
    { name: 'Mandiant', status: 'Monitoring', confidence: 'High', lastHit: '2h' },
    { name: 'CrowdStrike', status: 'Active', confidence: 'V. High', lastHit: '15m' },
  ];
  return (
    <div className="space-y-4">
      <div className="bg-slate-900 border border-slate-800 p-4 rounded-lg"><h3 className="text-white font-bold">Intel Sources</h3><p className="text-slate-400 text-sm">Tracking <span className="text-cyan-500">{actorName}</span>.</p></div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {feeds.map((f, i) => (
          <Card key={i} className="p-4 hover:border-cyan-500 transition-colors">
            <div className="flex justify-between items-start mb-2"><h4 className="font-bold text-white">{f.name}</h4><Badge color="blue">{f.status}</Badge></div>
            <div className="text-sm text-slate-400">Conf: {f.confidence} | Hit: {f.lastHit}</div>
          </Card>
        ))}
      </div>
    </div>
  );
};

export const ActorIoCAssociations = ({ threats }: { threats: Threat[] }) => (
  <div className="space-y-4">
    <div className="flex justify-between items-center"><h3 className="text-white font-bold">Indicators</h3><Badge color="red">{threats.length} IoCs</Badge></div>
    <ResponsiveTable<Threat> data={threats} keyExtractor={t => t.id}
      columns={[
        { header: 'Indicator', render: t => <span className="font-mono text-cyan-400 font-bold">{t.indicator}</span> },
        { header: 'Type', render: t => <span className="text-slate-300 text-xs">{t.type}</span> },
        { header: 'Status', render: t => <Badge color={t.status === 'NEW' ? 'red' : 'green'}>{t.status}</Badge> }
      ]}
      renderMobileCard={t => <div className="flex justify-between"><span>{t.indicator}</span><Badge>{t.status}</Badge></div>}
    />
  </div>
);

export const ActorMalwareFamilies = ({ malware }: { malware: Malware[] }) => (
  <div className="space-y-4">
    {malware.length === 0 ? <div className="p-8 text-center border border-dashed border-slate-800 rounded text-slate-500">No malware linked.</div> : 
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">{malware.map(m => (
        <Card key={m.id} className="p-4 border-t-4 border-t-red-600">
          <div className="flex justify-between"><h4 className="text-white font-bold">{m.name}</h4><Badge color="red">MALICIOUS</Badge></div>
          <div className="text-xs text-slate-400 mb-2">Family: <span className="text-red-400">{m.family}</span></div>
          <div className="text-[10px] bg-slate-950 p-2 rounded font-mono text-slate-300 truncate mb-3">{m.hash}</div>
          <Button variant="outline" className="w-full text-[10px]">ANALYSIS</Button>
        </Card>
      ))}</div>}
  </div>
);

export const ActorInfraDetails = ({ infra }: { infra: Infrastructure[] }) => (
  <div className="bg-slate-900 border border-slate-800 rounded-lg overflow-hidden">
    <table className="w-full text-left text-sm text-slate-400">
      <thead className="bg-slate-950 text-xs uppercase font-medium text-slate-500 border-b border-slate-800"><tr><th className="px-6 py-3">Value</th><th className="px-6 py-3">Type</th><th className="px-6 py-3">Status</th></tr></thead>
      <tbody className="divide-y divide-slate-800">{infra.map(i => (
        <tr key={i.id}><td className="px-6 py-4 font-mono text-cyan-400">{i.value}</td><td className="px-6 py-4 text-xs">{i.type}</td><td className="px-6 py-4"><Badge color={i.status === 'ACTIVE' ? 'red' : 'green'}>{i.status}</Badge></td></tr>
      ))}</tbody>
    </table>
  </div>
);

export const ActorNetworkAnalysis = ({ pcaps }: { pcaps: Pcap[] }) => (
  <div className="space-y-4">
    <div className="flex gap-4"><Card className="flex-1 p-4 bg-slate-900/50"><div className="text-2xl font-bold text-white">{pcaps.length}</div><div className="text-xs text-slate-500 uppercase font-bold">Captures</div></Card></div>
    {pcaps.length > 0 ? <div className="space-y-2">{pcaps.map(p => (
      <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded flex justify-between items-center">
         <div className="flex items-center gap-4"><div className="w-10 h-10 rounded bg-slate-800 flex items-center justify-center text-slate-400 font-bold">PCAP</div><div><div className="font-bold text-white font-mono text-sm">{p.name}</div><div className="text-xs text-slate-400">{p.size}</div></div></div>
         <Badge color={p.analysisStatus === 'ANALYZED' ? 'green' : 'orange'}>{p.analysisStatus}</Badge>
      </div>
    ))}</div> : <div className="text-slate-500 text-center py-12 border border-dashed border-slate-800 rounded">No captures linked.</div>}
  </div>
);
