
import React from 'react';
import { Case } from '../../types';
import { Card, Badge, Button, CardHeader, ProgressBar, Grid } from '../Shared/UI';
import ResponsiveTable from '../Shared/ResponsiveTable';
import { threatData } from '../../services/dataLayer';
import { IncidentLogic } from '../../services/logic/IncidentLogic';
import NetworkGraph from '../Shared/NetworkGraph';

export const IncidentTimeline = ({ cases }: { cases: Case[] }) => {
  const events = cases.flatMap(c => c.timeline.map(e => ({ ...e, caseTitle: c.title }))).sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  const metrics = IncidentLogic.calculateMetrics(cases);

  return (
    <div className="space-y-6">
        <Grid cols={3}>
            <Card className="p-4 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Mean Time To Detect</div>
                <div className="text-2xl font-bold text-white">{metrics.mttd}</div>
            </Card>
            <Card className="p-4 text-center">
                <div className="text-[10px] uppercase font-bold text-slate-500">Mean Time To Resolve</div>
                <div className="text-2xl font-bold text-cyan-500">{metrics.mttr}</div>
            </Card>
            <Card className="p-4 text-center bg-red-900/10 border-red-900/30">
                <div className="text-[10px] uppercase font-bold text-red-400">Adversary Dwell Time</div>
                <div className="text-2xl font-bold text-red-500">{metrics.dwellTime}</div>
            </Card>
        </Grid>
        
        <Card className="p-0 overflow-hidden max-w-4xl mx-auto">
        <CardHeader title="Combined Incident Chronology" action={<Badge>{events.length} Events</Badge>} />
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
    </div>
  );
};

export const IncidentAssets = () => {
  const nodes = threatData.getSystemNodes();
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {nodes.map(n => {
        const { risk, radius } = IncidentLogic.calculateAssetRisk(n, nodes);
        return (
            <Card key={n.id} className={`p-4 flex flex-col gap-3 hover:border-cyan-500 transition-colors cursor-pointer ${n.type === 'Database' ? 'border-l-4 border-l-purple-500' : ''}`}>
                <div className="flex justify-between items-start">
                    <div>
                        <div className="text-white font-bold font-mono text-sm">{n.name}</div>
                        <div className="text-xs text-slate-500">{n.type}</div>
                    </div>
                    <Badge color={n.status === 'ONLINE' ? 'green' : n.status === 'DEGRADED' ? 'orange' : 'red'}>{n.status}</Badge>
                </div>
                
                <div className="space-y-2 pt-2 border-t border-slate-800">
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-400 mb-1"><span>Risk Score</span><span>{risk}/100</span></div>
                        <ProgressBar value={risk} color={risk > 50 ? 'red' : 'green'} />
                    </div>
                    <div className="flex justify-between text-[10px] text-slate-500 font-bold">
                        <span>BLAST RADIUS: {radius} NODES</span>
                        <span>{n.dataSensitivity}</span>
                    </div>
                </div>
            </Card>
        );
      })}
    </div>
  );
};

export const IncidentReports = () => {
  const handleGenerate = (type: string) => {
     threatData.addReport({
        id: `RPT-INC-${Date.now()}`, title: `Incident Response: ${type}`, type: 'Technical',
        date: new Date().toLocaleDateString(), author: 'System', status: 'DRAFT',
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
  const logs = threatData.getAuditLogs();

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
       {users.map(u => {
         const { score, level } = IncidentLogic.calculateUserRisk(u, logs);
         return (
            <Card key={u.id} className={`p-4 flex flex-col gap-3 hover:bg-slate-900/80 ${level === 'CRITICAL' ? 'border-red-500/50 bg-red-900/5' : ''}`}>
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-white border border-slate-600">{u.name.substring(0,2).toUpperCase()}</div>
                    <div className="min-w-0"><div className="text-sm font-bold text-white truncate">{u.name}</div><div className="text-[10px] text-slate-500 uppercase">{u.role}</div></div>
                </div>
                <div className="flex justify-between items-center border-t border-slate-800 pt-2">
                    <div className="flex flex-col">
                        <span className="text-[9px] text-slate-500 uppercase">Insider Risk</span>
                        <span className={`text-xs font-bold ${level === 'CRITICAL' ? 'text-red-500' : 'text-green-500'}`}>{score}/100</span>
                    </div>
                    <span className="text-[10px] bg-slate-950 px-2 py-1 rounded">{u.clearance}</span>
                </div>
            </Card>
         );
       })}
    </div>
  );
};

export const IncidentPlaybooks = () => {
   const pbs = threatData.getPlaybooks();
   return (
     <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
       {pbs.map(pb => {
         const efficacy = IncidentLogic.getPlaybookEfficacy(pb);
         return (
            <Card key={pb.id} className="p-4 flex flex-col justify-between hover:border-cyan-500 transition-colors">
                <div>
                    <div className="flex justify-between items-start mb-2"><h4 className="text-white font-bold">{pb.name}</h4><Badge color="blue">{pb.triggerLabel || 'Manual'}</Badge></div>
                    <p className="text-xs text-slate-400 mb-4 line-clamp-2">{pb.description}</p>
                </div>
                <div className="space-y-3">
                    <div>
                        <div className="flex justify-between text-[10px] text-slate-500 mb-1"><span>Historical Efficacy</span><span>{efficacy}% Success</span></div>
                        <ProgressBar value={efficacy} color={efficacy > 80 ? 'green' : 'yellow'} />
                    </div>
                    <div className="flex flex-wrap gap-1 pt-2 border-t border-slate-800">
                        {pb.tasks.slice(0, 3).map((t, i) => <span key={i} className="text-[10px] bg-slate-950 px-2 py-1 rounded text-slate-500 border border-slate-800 truncate max-w-[100px]">{t}</span>)}
                    </div>
                </div>
            </Card>
         );
       })}
     </div>
   );
};

export const IncidentEvidence = ({ cases }: { cases: Case[] }) => {
  const artifacts = cases.flatMap(c => c.artifacts.map(a => ({...a, caseTitle: c.title})));
  const custody = threatData.getChainOfCustody();
  const chainStatus = IncidentLogic.validateChainOfCustody(custody);

  return (
    <div className="space-y-4">
        <Grid cols={3}>
            <Card className="p-4 text-center"><div className="text-[10px] text-slate-500 uppercase font-bold">Total Artifacts</div><div className="text-2xl font-bold text-white">{artifacts.length}</div></Card>
            <Card className="p-4 text-center"><div className="text-[10px] text-slate-500 uppercase font-bold">Chain Integrity</div><div className={`text-2xl font-bold ${chainStatus.valid ? 'text-green-500' : 'text-red-500'}`}>{chainStatus.valid ? 'SECURE' : 'BROKEN'}</div></Card>
            <Card className="p-4 text-center"><div className="text-[10px] text-slate-500 uppercase font-bold">Custody Gaps</div><div className="text-2xl font-bold text-slate-300">{chainStatus.gaps}</div></Card>
        </Grid>

        <Card className="p-0 overflow-hidden">
        <CardHeader title="Evidence Locker & Analysis" action={<Button variant="secondary" className="text-[10px] py-1">GENERATE HASH REPORT</Button>} />
        <ResponsiveTable data={artifacts} keyExtractor={a => a.id}
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

export const IncidentNetwork = ({ threats }: { threats: any[] }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 min-h-[500px] flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-white">Topology & Lateral Movement</h3>
            <div className="flex gap-4 text-xs text-slate-400">
                <span>Nodes: {threats.length}</span>
                <span>Edges: {Math.round(threats.length * 1.5)}</span>
                <span className="text-red-400 font-bold">Infected: {threats.filter(t => t.severity === 'CRITICAL').length}</span>
            </div>
        </div>
        <div className="flex-1 w-full max-w-4xl mx-auto border border-slate-800 rounded bg-slate-950/50">
            <NetworkGraph threats={threats} />
        </div>
    </div>
);
