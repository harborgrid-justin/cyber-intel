
import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Grid, ProgressBar, StatusBadge, DataList } from '../../Shared/UI';
import { MetricCard } from '../../Shared/MetricCard';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { ComplianceLogic, InsiderLogic, DarkWebLogic } from '../../../services/logic/dashboard/SecurityLogic';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { NistControl } from '../../../types';

interface ComplianceStats {
  score: number;
  passing: number;
  total: number;
  gaps: string[];
}

interface InsiderRisk {
  id: string;
  user: { name: string; role: string; id: string };
  score: number;
  anomalies: string[];
}

export const SecurityViews = {
  Compliance: () => {
    const nistControls = useDataStore(() => threatData.getNistControls());
    const [stats, setStats] = useState<ComplianceStats>({ score: 0, passing: 0, total: 0, gaps: [] });

    useEffect(() => {
        ComplianceLogic.calculateComplianceScore(nistControls).then(setStats);
    }, [nistControls]);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard 
                title="NIST 800-53 Score" 
                value={`${stats.score}%`} 
                progress={stats.score} 
                color={stats.score > 90 ? 'green' : 'orange'} 
                icon="Shield"
                subValue={`${stats.passing}/${stats.total} Controls Passed`}
            />
            <Card className="p-0 overflow-hidden flex flex-col">
               <SectionHeader title="Compliance Gap Analysis" subtitle="Critical Failures" />
               <div className="p-4 flex-1 overflow-y-auto">
                  <DataList 
                     items={stats.gaps}
                     renderItem={(g, i) => (
                         <div className="py-2 text-xs text-red-300 flex gap-2 items-start">
                             <span className="text-red-500 font-bold">•</span>
                             {g}
                         </div>
                     )}
                     emptyMessage="No gaps detected."
                  />
               </div>
            </Card>
         </div>
      </div>
    );
  },

  InsiderThreat: () => {
    const [riskUsers, setRiskUsers] = useState<InsiderRisk[]>([]);

    useEffect(() => {
        InsiderLogic.analyzeInsiderThreats().then(data => {
            setRiskUsers(data.map(item => ({ ...item, id: item.user.id })));
        });
    }, []);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         <Card className="p-0 overflow-hidden">
            <SectionHeader title="User Behavior Analytics (UBA)" />
            <ResponsiveTable<InsiderRisk> data={riskUsers} keyExtractor={r => r.id}
               columns={[
                  { header: 'User Identity', render: r => <div><div className="font-bold text-white">{r.user.name}</div><div className="text-[10px] text-slate-500 uppercase">{r.user.role}</div></div> },
                  { header: 'Risk Level', render: r => <div className="w-32"><div className="flex justify-between text-[10px] mb-1"><span>Score</span><span className={r.score > 70 ? 'text-red-500' : 'text-orange-500'}>{r.score}</span></div><ProgressBar value={r.score} color={r.score > 70 ? 'red' : 'orange'} className="h-1.5" /></div> },
                  { header: 'Detected Anomalies', render: r => <div className="flex flex-wrap gap-1">{r.anomalies.map((a, i) => <StatusBadge key={i} status={a} color="red" className="text-[9px]" />)}</div> }
               ]}
               renderMobileCard={r => <div>{r.user.name} - Risk {r.score}</div>}
            />
         </Card>
      </div>
    );
  },

  DarkWeb: () => {
    const [leaks, setLeaks] = useState<{ user: string, leak: string }[]>([]);
    const [chatter, setChatter] = useState<{ volume: string, sentiment: string }>({ volume: '...', sentiment: '...' });

    useEffect(() => {
        DarkWebLogic.correlateCredentialLeaks().then(setLeaks);
        DarkWebLogic.analyzeChatterVolume().then(setChatter);
    }, []);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         <Grid cols={2}>
            <MetricCard title="Chatter Volume" value={chatter.volume} subValue={chatter.sentiment} color="purple" icon="Globe" />
            <MetricCard title="Credential Leaks" value={leaks.length.toString()} subValue="Internal users impacted" color="red" icon="UserX" />
         </Grid>
         
         <Card className="p-0 overflow-hidden">
            <SectionHeader title="Compromised Identities" />
            <div className="p-4">
               <DataList 
                 items={leaks}
                 renderItem={(l, i) => (
                    <div className="flex justify-between items-center py-3">
                         <span className="font-bold text-white text-sm">{l.user}</span>
                         <span className="text-xs text-red-400 bg-red-900/10 px-2 py-1 rounded border border-red-900/50">Found in: {l.leak}</span>
                    </div>
                 )}
                 emptyMessage="No internal credential leaks detected."
               />
            </div>
         </Card>
      </div>
    );
  }
};
