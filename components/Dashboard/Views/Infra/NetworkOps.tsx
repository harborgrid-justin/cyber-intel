
import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Grid, ProgressBar, StatusBadge, DataList } from '../../../Shared/UI';
import { threatData } from '../../../../services/dataLayer';
import { useDataStore } from '../../../../hooks/useDataStore';
import { NetworkOpsLogic } from '../../../../services/logic/dashboard/InfraLogic';
import ResponsiveTable from '../../../Shared/ResponsiveTable';
import { Icons } from '../../../Shared/Icons';
import { Pcap } from '../../../../types';

interface TrafficStat {
  protocol: string;
  volumeMB: number;
  count: number;
}

export const NetworkOps: React.FC = () => {
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
};
