
import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Grid, ProgressBar, StatusBadge, DataList } from '../../Shared/UI';
import { MetricCard } from '../../Shared/MetricCard';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { HealthLogic, NetworkOpsLogic, CloudSecLogic } from '../../../services/logic/dashboard/InfraLogic';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { Icons } from '../../Shared/Icons';
import { SystemNode, Pcap } from '../../../types';

interface PredictionMap {
  [nodeId: string]: {
    risk: number;
    prediction: string;
  };
}

interface TrafficStat {
  protocol: string;
  volumeMB: number;
  count: number;
}

interface CloudAudit {
  iamRisks: { resource: string; issue: string }[];
  misconfigurations: number;
  monthlySpend: number;
}

export const InfraViews = {
  SystemHealth: () => {
    const liveNodes = useDataStore(() => threatData.getSystemNodes());
    const [predictions, setPredictions] = useState<PredictionMap>({});

    useEffect(() => {
        // Pass live nodes for offline simulation logic
        HealthLogic.getSystemHealth(liveNodes).then(res => {
            const predMap: PredictionMap = {};
            res.nodes.forEach(n => {
              predMap[n.nodeId] = { risk: n.risk, prediction: n.prediction };
            });
            setPredictions(predMap);
        });
    }, [liveNodes]); // Re-run if nodes update
    
    const degradedCount = liveNodes.filter(n => n.status === 'DEGRADED' || n.load > 90).length;
    const uptime = 99.98;

    return (
      <div className="space-y-6 h-full overflow-y-auto">
        <Grid cols={3}>
           <MetricCard title="Grid Uptime" value={`${uptime}%`} color="green" icon="Activity" />
           <MetricCard title="Active Sensors" value={liveNodes.length.toString()} color="slate" icon="Server" />
           <MetricCard title="Degraded Nodes" value={degradedCount.toString()} color={degradedCount > 0 ? 'orange' : 'green'} icon="AlertTriangle" />
        </Grid>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
           {liveNodes.map((n) => {
               const pred = predictions[n.id];
               return (
                   <Card key={n.id} className="p-4 flex flex-col gap-3">
                      <div className="flex justify-between items-center">
                         <div className={`font-bold text-[var(--colors-textPrimary)] text-sm`}>{n.name}</div>
                         <StatusBadge status={n.status} />
                      </div>
                      <div>
                         <div className="flex justify-between text-xs mb-1">
                            <span className={`text-[var(--colors-textSecondary)] font-medium`}>System Load</span>
                            <span className={`font-mono ${n.load > 80 ? 'text-rose-400 font-bold' : 'text-[var(--colors-textTertiary)]'}`}>{n.load}%</span>
                         </div>
                         <ProgressBar value={n.load} color={n.load > 80 ? 'red' : 'blue'} className="h-1.5" />
                      </div>
                      <div className={`p-2 rounded border flex justify-between items-center text-xs bg-[var(--colors-surfaceHighlight)] border-[var(--colors-borderSubtle)]`}>
                         <span className="text-[var(--colors-textSecondary)]">AI Prediction:</span>
                         <span className={`font-bold ${pred && pred.risk > 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                            {pred?.prediction || 'Analyzing...'}
                         </span>
                      </div>
                   </Card>
               );
           })}
        </div>
      </div>
    );
  },

  NetworkOps: () => {
    const pcaps = useDataStore(() => threatData.getNetworkCaptures());
    const [analytics, setAnalytics] = useState<{ traffic: TrafficStat[], ddos: any }>({ traffic: [], ddos: { detected: false } });

    useEffect(() => {
        NetworkOpsLogic.getNetworkAnalytics().then(setAnalytics);
    }, [pcaps]);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         {analytics.ddos.detected && (
            <div className={`bg-[var(--colors-errorDim)] border border-[var(--colors-borderDefault)] p-4 rounded text-[var(--colors-textSecondary)] flex items-center gap-4 animate-pulse`}>
               <Icons.AlertTriangle className="w-8 h-8" />
               <div>
                  <div className="font-bold text-lg uppercase tracking-wide">DDoS Attack Detected</div>
                  <div className="text-xs opacity-90">Signature: {analytics.ddos.signature} • Confidence: {analytics.ddos.confidence}%</div>
               </div>
            </div>
         )}
         
         <Grid cols={2}>
            <Card className="p-0 overflow-hidden flex flex-col h-80">
               <SectionHeader title="Protocol Traffic" />
               <div className="p-4 flex-1 overflow-y-auto">
                  <DataList 
                    items={analytics.traffic}
                    renderItem={(t: any) => (
                        <div className="py-2">
                           <div className={`flex justify-between text-xs text-[var(--colors-textSecondary)] mb-1`}>
                              <span className="font-bold">{t.protocol}</span>
                              <span className="font-mono text-cyan-400">{t.volumeMB.toFixed(1)} MB</span>
                           </div>
                           <ProgressBar value={t.volumeMB} max={Math.max(...analytics.traffic.map((x: any) => x.volumeMB))} color="cyan" className="h-1" />
                        </div>
                    )}
                    emptyMessage="No traffic analyzed"
                  />
               </div>
            </Card>
            <Card className="p-0 overflow-hidden flex flex-col h-80">
               <SectionHeader title="Capture Stream" />
               <ResponsiveTable<Pcap> 
                  data={pcaps} 
                  keyExtractor={p => p.id} 
                  columns={[
                     { header: 'Source', render: p => <span className={`text-xs font-mono text-[var(--colors-textPrimary)]`}>{p.source}</span> }, 
                     { header: 'Proto', render: p => <StatusBadge status={p.protocol} color="slate" /> }
                  ]} 
                  renderMobileCard={p => <div>{p.name}</div>} 
               />
            </Card>
         </Grid>
      </div>
    );
  },

  CloudSecurity: () => {
    const [audit, setAudit] = useState<CloudAudit>({ iamRisks: [], misconfigurations: 0, monthlySpend: 0 });

    useEffect(() => {
        CloudSecLogic.getCloudSecurity().then(setAudit);
    }, []);

    const { iamRisks, misconfigurations, monthlySpend } = audit;

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         <Grid cols={3}>
            <MetricCard title="IAM Risks" value={iamRisks.length.toString()} color="purple" icon="Key" />
            <MetricCard title="Open Buckets" value={misconfigurations.toString()} color="orange" icon="Database" />
            <MetricCard title="Mo. Spend" value={`$${monthlySpend}`} color="green" icon="DollarSign" />
         </Grid>

         <Card className="p-0 overflow-hidden">
            <SectionHeader title="Cloud Compliance Findings" />
            <div className="p-4 space-y-2">
               {iamRisks.length === 0 && <div className={`text-center text-[var(--colors-textTertiary)] py-4 text-xs italic`}>No critical IAM issues found.</div>}
               {iamRisks.map((iss, i) => (
                  <div key={i} className={`flex justify-between items-center p-3 bg-[var(--colors-surfaceDefault)] border border-[var(--colors-borderDefault)] rounded hover:border-[var(--colors-borderFocus)] transition-colors`}>
                     <div className="flex items-center gap-3">
                        <Icons.Server className={`w-4 h-4 text-[var(--colors-textSecondary)]`} />
                        <span className={`text-sm font-bold text-[var(--colors-textPrimary)]`}>{iss.resource}</span>
                     </div>
                     <span className={`text-xs bg-[var(--colors-errorDim)] font-mono font-bold text-red-400 px-2 py-1 rounded border border-[var(--colors-borderDefault)]`}>{iss.issue}</span>
                  </div>
               ))}
            </div>
         </Card>
      </div>
    );
  }
};
