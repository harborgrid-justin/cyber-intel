
import React from 'react';
import { Card, CardHeader, Grid, ProgressBar, Badge } from '../../Shared/UI';
import { threatData } from '../../../services-frontend/dataLayer';
import { HealthLogic, NetworkOpsLogic, CloudSecLogic } from '../../../services-frontend/logic/dashboard/InfraLogic';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { Icons } from '../../Shared/Icons';

export const InfraViews = {
  SystemHealth: () => {
    const nodes = threatData.getSystemNodes();
    const uptime = HealthLogic.calculateSystemUptime(nodes);
    
    return (
      <div className="space-y-6 h-full overflow-y-auto">
        <Grid cols={3}>
           <Card className="p-4 text-center"><div className="text-3xl font-bold text-green-500">{uptime.toFixed(2)}%</div><div className="text-xs text-slate-500 uppercase font-bold">Grid Uptime</div></Card>
           <Card className="p-4 text-center"><div className="text-3xl font-bold text-white">{nodes.length}</div><div className="text-xs text-slate-500 uppercase font-bold">Active Sensors</div></Card>
           <Card className="p-4 text-center"><div className="text-3xl font-bold text-orange-500">{nodes.filter(n => n.status === 'DEGRADED').length}</div><div className="text-xs text-slate-500 uppercase font-bold">Degraded Nodes</div></Card>
        </Grid>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {nodes.map(n => {
             const health = HealthLogic.predictNodeFailure(n);
             return (
               <Card key={n.id} className="p-4 flex flex-col gap-3">
                  <div className="flex justify-between">
                     <div className="font-bold text-white">{n.name} <span className="text-slate-500 text-xs">({n.type})</span></div>
                     <Badge color={n.status === 'ONLINE' ? 'green' : 'red'}>{n.status}</Badge>
                  </div>
                  <div>
                     <div className="flex justify-between text-xs mb-1"><span>Load</span><span>{n.load}%</span></div>
                     <ProgressBar value={n.load} color={n.load > 80 ? 'red' : 'blue'} />
                  </div>
                  <div className="p-2 bg-slate-900 rounded border border-slate-800 flex justify-between items-center text-xs">
                     <span className="text-slate-400">Failure Prediction:</span>
                     <span className={`font-bold ${health.risk > 50 ? 'text-red-500' : 'text-green-500'}`}>{health.prediction}</span>
                  </div>
               </Card>
             );
           })}
        </div>
      </div>
    );
  },

  NetworkOps: () => {
    const pcaps = threatData.getNetworkCaptures();
    const traffic = NetworkOpsLogic.analyzeTrafficPatterns(pcaps);
    const ddos = NetworkOpsLogic.detectDdosSignatures(pcaps);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         {ddos && (
            <div className="bg-red-900/20 border border-red-500 p-4 rounded text-red-200 flex items-center gap-4 animate-pulse">
               <Icons.AlertTriangle className="w-8 h-8" />
               <div>
                  <div className="font-bold text-lg">DDOS SIGNATURE DETECTED</div>
                  <div className="text-xs">Unusual UDP/ICMP volume spike detected in ingress buffers.</div>
               </div>
            </div>
         )}
         
         <Grid cols={2}>
            <Card className="p-0 overflow-hidden flex flex-col h-80">
               <CardHeader title="Protocol Distribution" />
               <div className="p-4 flex-1 overflow-y-auto space-y-2">
                  {traffic.map(t => (
                     <div key={t.protocol}>
                        <div className="flex justify-between text-xs text-slate-300 mb-1">
                           <span>{t.protocol}</span>
                           <span>{t.volumeMB.toFixed(1)} MB</span>
                        </div>
                        <ProgressBar value={t.volumeMB} max={Math.max(...traffic.map(x => x.volumeMB))} color="cyan" />
                     </div>
                  ))}
               </div>
            </Card>
            <Card className="p-0 overflow-hidden flex flex-col h-80">
               <CardHeader title="Capture Stream" />
               <ResponsiveTable data={pcaps} keyExtractor={p => p.id} 
                  columns={[{ header: 'Source', render: p => <span className="text-xs font-mono text-white">{p.source}</span> }, { header: 'Proto', render: p => <Badge>{p.protocol}</Badge> }]} 
                  renderMobileCard={p => <div>{p.name}</div>} 
               />
            </Card>
         </Grid>
      </div>
    );
  },

  CloudSecurity: () => {
    const nodes = threatData.getSystemNodes();
    const issues = CloudSecLogic.auditIamRoles(nodes);
    const misconfigs = CloudSecLogic.checkMisconfigurations(nodes);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         <Grid cols={3}>
            <Card className="p-4 text-center border-l-4 border-l-purple-500"><div className="text-3xl font-bold text-white">{issues.length}</div><div className="text-xs text-slate-500 uppercase font-bold">IAM Risks</div></Card>
            <Card className="p-4 text-center border-l-4 border-l-orange-500"><div className="text-3xl font-bold text-white">{misconfigs}</div><div className="text-xs text-slate-500 uppercase font-bold">Open Buckets</div></Card>
            <Card className="p-4 text-center border-l-4 border-l-green-500"><div className="text-3xl font-bold text-white">$4.2k</div><div className="text-xs text-slate-500 uppercase font-bold">Mo. Spend</div></Card>
         </Grid>

         <Card className="p-0 overflow-hidden">
            <CardHeader title="Cloud Compliance Findings" />
            <div className="p-4 space-y-2">
               {issues.length === 0 && <div className="text-center text-slate-500 py-4">No critical IAM issues found.</div>}
               {issues.map((iss, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-slate-900 border border-slate-800 rounded">
                     <div className="flex items-center gap-3">
                        <Icons.Server className="w-4 h-4 text-slate-500" />
                        <span className="text-sm font-bold text-white">{iss.resource}</span>
                     </div>
                     <span className="text-xs text-red-400 font-mono">{iss.issue}</span>
                  </div>
               ))}
            </div>
         </Card>
      </div>
    );
  }
};
