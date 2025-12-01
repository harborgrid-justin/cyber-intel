
import React from 'react';
import { Case } from '../../types';
import { Card, Badge, Button, CardHeader } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { threatData } from '../../services/dataLayer';

export const IncidentTimeline = ({ cases }: { cases: Case[] }) => {
  const events = cases.flatMap(c => c.timeline.map(e => ({ ...e, caseTitle: c.title }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  return (
    <Card className="p-0 overflow-hidden max-w-4xl mx-auto">
      <CardHeader title="Incident Chronology" action={<Badge>{events.length} Events</Badge>} />
      <div className="p-6 space-y-4">
        {events.map((e, i) => (
          <div key={i} className="flex gap-4 group">
            <div className="w-32 text-right text-xs text-slate-500 font-mono py-1">{e.date}</div>
            <div className="relative flex-1 pb-6 border-l border-slate-800 pl-6 before:absolute before:left-[-5px] before:top-1.5 before:w-2.5 before:h-2.5 before:rounded-full before:transition-colors before:bg-slate-700 group-hover:before:bg-cyan-500">
               <div className="text-sm text-white font-bold">{e.title}</div>
               <div className="text-xs text-slate-400">{e.caseTitle} • <span className={`font-bold ${e.type === 'ALERT' ? 'text-red-400' : e.type === 'ACTION' ? 'text-cyan-500' : 'text-slate-500'}`}>{e.type}</span></div>
            </div>
          </div>
        ))}
        {events.length === 0 && <div className="text-slate-500 italic p-4 text-center">No timeline events generated yet.</div>}
      </div>
    </Card>
  );
};

export const IncidentAssets = () => {
  const nodes = threatData.getSystemNodes();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nodes.map(n => (
        <Card key={n.id} className="p-4 flex justify-between items-center hover:border-cyan-500 transition-colors cursor-pointer">
           <div>
              <div className="text-white font-bold font-mono">{n.name}</div>
              <div className="text-xs text-slate-500">{n.type} • Latency: {n.latency}ms</div>
           </div>
           <div className="flex flex-col items-end gap-1">
             <Badge color={n.status === 'ONLINE' ? 'green' : n.status === 'DEGRADED' ? 'orange' : 'red'}>{n.status}</Badge>
             <div className="text-[10px] text-slate-600 font-bold">LOAD: {n.load}%</div>
           </div>
        </Card>
      ))}
    </div>
  );
};

export const IncidentReports = () => {
  const handleGenerate = (type: string) => {
     threatData.addReport({
        id: `RPT-INC-${Date.now()}`,
        title: `Incident Response: ${type}`,
        type: 'Technical',
        date: new Date().toLocaleDateString(),
        author: 'System',
        status: 'DRAFT',
        content: `Generated ${type} report based on active incidents.`
     });
     alert(`Report '${type}' generated. Check Reports Center.`);
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      {['Executive Summary', 'Technical Forensics', 'Compliance Audit', 'IoC Export (STIX)'].map(r => (
        <Card key={r} className="p-6 flex flex-col items-center justify-center gap-4 hover:border-cyan-500 transition-colors cursor-pointer group">
          <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 group-hover:text-white group-hover:bg-cyan-600 transition-all">
             <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
          </div>
          <span className="text-sm font-bold text-slate-300">{r}</span>
          <Button variant="secondary" className="w-full" onClick={() => handleGenerate(r)}>Generate</Button>
        </Card>
      ))}
    </div>
  );
};

export const IncidentUsers = ({ cases }: { cases: Case[] }) => {
  const users = threatData.getSystemUsers();
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
       {users.map(u => (
         <Card key={u.id} className="p-4 flex flex-col gap-3 hover:bg-slate-900/80">
            <div className="flex items-center gap-3">
               <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">{u.name.substring(0,2).toUpperCase()}</div>
               <div className="min-w-0"><div className="text-sm font-bold text-white truncate">{u.name}</div><div className="text-[10px] text-slate-500 uppercase">{u.role}</div></div>
            </div>
            <div className="flex justify-between items-center border-t border-slate-800 pt-2">
               <span className={`text-[10px] font-bold ${u.status === 'Online' ? 'text-green-500' : u.status === 'Busy' ? 'text-orange-500' : 'text-slate-500'}`}>● {u.status}</span>
               <span className="text-[10px] text-slate-600">{u.clearance}</span>
            </div>
         </Card>
       ))}
    </div>
  );
};

export const IncidentPlaybooks = () => {
   const pbs = threatData.getPlaybooks();
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {pbs.map(pb => (
         <Card key={pb.id} className="p-4 flex flex-col justify-between hover:border-cyan-500 transition-colors">
            <div><div className="flex justify-between items-start mb-2"><h4 className="text-white font-bold">{pb.name}</h4><Badge color="blue">{pb.triggerLabel || 'Manual'}</Badge></div><p className="text-xs text-slate-400 mb-4 line-clamp-2">{pb.description}</p></div>
            <div className="flex flex-wrap gap-1 mt-auto pt-2 border-t border-slate-800">{pb.tasks.map((t, i) => <span key={i} className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-500 border border-slate-800">{t}</span>)}</div>
         </Card>
       ))}
     </div>
   );
};

export const IncidentEvidence = ({ cases }: { cases: Case[] }) => {
  const artifacts = cases.flatMap(c => c.artifacts.map(a => ({...a, caseTitle: c.title})));
  return (
    <Card className="p-0 overflow-hidden">
      <CardHeader title="Case Evidence Locker" action={<Badge>{artifacts.length} Items</Badge>} />
      <ResponsiveTable data={artifacts} keyExtractor={a => a.id}
        columns={[
          { header: 'File Name', render: a => <span className="text-white font-mono text-xs font-bold">{a.name}</span> },
          { header: 'Related Case', render: a => <span className="text-slate-400 text-xs truncate max-w-[150px]">{a.caseTitle}</span> },
          { header: 'Hash (MD5)', render: a => <span className="text-cyan-600 font-mono text-[10px] truncate max-w-[100px]">{a.hash}</span> },
          { header: 'Type', render: a => <Badge color={a.type === 'MALWARE' || a.type === 'BINARY' ? 'red' : 'slate'}>{a.type}</Badge> }
        ]}
        renderMobileCard={a => <div><div className="font-bold text-white">{a.name}</div><div className="text-xs text-slate-500">{a.caseTitle}</div></div>}
      />
    </Card>
  );
};
