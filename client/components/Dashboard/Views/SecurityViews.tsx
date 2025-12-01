
import React from 'react';
import { Card, CardHeader, Grid, ProgressBar, Badge } from '../../Shared/UI';
import { threatData } from '../../services-frontend/dataLayer';
import { MOCK_NIST_CONTROLS } from '../../../constants';
import { ComplianceLogic, InsiderLogic, DarkWebLogic } from '../../services-frontend/logic/dashboard/SecurityLogic';
import ResponsiveTable from '../../Shared/ResponsiveTable';

export const SecurityViews = {
  Compliance: () => {
    const stats = ComplianceLogic.calculateComplianceScore(MOCK_NIST_CONTROLS);
    const gaps = ComplianceLogic.getTopGaps(MOCK_NIST_CONTROLS);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="p-6 flex flex-col items-center justify-center">
               <div className="text-5xl font-black text-cyan-500 mb-2">{stats.score}%</div>
               <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">NIST 800-53 Score</div>
               <div className="mt-4 w-full"><ProgressBar value={stats.score} /></div>
            </Card>
            <Card className="p-0 overflow-hidden flex flex-col">
               <CardHeader title="Gap Analysis" />
               <div className="p-4 flex-1 overflow-y-auto space-y-2">
                  {gaps.map((g, i) => (
                     <div key={i} className="text-xs text-red-300 bg-red-900/10 border-l-2 border-red-500 p-2 pl-3">
                        {g}
                     </div>
                  ))}
               </div>
            </Card>
         </div>
      </div>
    );
  },

  InsiderThreat: () => {
    const users = threatData.getSystemUsers();
    const logs = threatData.getAuditLogs();
    
    // Sort users by risk
    const riskUsers = users.map(u => {
        const anomalies = InsiderLogic.detectBehavioralAnomalies(u, logs);
        const score = InsiderLogic.calculateRiskScore(anomalies, u);
        return { user: u, anomalies, score };
    }).sort((a, b) => b.score - a.score).filter(r => r.score > 0);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         <Card className="p-0 overflow-hidden">
            <CardHeader title="User Behavior Analytics (UBA)" />
            <ResponsiveTable data={riskUsers} keyExtractor={r => r.user.id}
               columns={[
                  { header: 'User', render: r => <span className="font-bold text-white">{r.user.name}</span> },
                  { header: 'Role', render: r => <span className="text-xs text-slate-500">{r.user.role}</span> },
                  { header: 'Risk Score', render: r => <div className="w-24"><ProgressBar value={r.score} color={r.score > 70 ? 'red' : 'orange'} /></div> },
                  { header: 'Anomalies', render: r => <div className="flex flex-col gap-1">{r.anomalies.map((a, i) => <span key={i} className="text-[9px] text-red-400 font-mono">{a}</span>)}</div> }
               ]}
               renderMobileCard={r => <div>{r.user.name} - Risk {r.score}</div>}
            />
         </Card>
      </div>
    );
  },

  DarkWeb: () => {
    const threats = threatData.getThreats();
    const breaches = threatData.getOsintBreaches();
    const users = threatData.getSystemUsers();
    
    const leaks = DarkWebLogic.correlateCredentialLeaks(breaches, users);
    const chatter = DarkWebLogic.analyzeChatterVolume(threats);

    return (
      <div className="space-y-6 h-full overflow-y-auto">
         <Grid cols={2}>
            <Card className="p-4 border-l-4 border-l-purple-500">
               <div className="text-[10px] text-slate-500 uppercase font-bold">Chatter Volume</div>
               <div className="text-2xl font-bold text-white">{chatter.volume}</div>
               <div className="text-xs text-slate-400">{chatter.sentiment}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-red-500">
               <div className="text-[10px] text-slate-500 uppercase font-bold">Credential Leaks</div>
               <div className="text-2xl font-bold text-red-500">{leaks.length}</div>
               <div className="text-xs text-slate-400">Internal users impacted</div>
            </Card>
         </Grid>
         
         <Card className="p-0 overflow-hidden">
            <CardHeader title="Compromised Identities" />
            <div className="p-4 space-y-2">
               {leaks.map((l, i) => (
                  <div key={i} className="flex justify-between items-center bg-slate-900 border border-slate-800 p-3 rounded">
                     <span className="font-bold text-white">{l.user}</span>
                     <span className="text-xs text-red-400">Found in: {l.leak}</span>
                  </div>
               ))}
               {leaks.length === 0 && <div className="text-center text-slate-500 italic py-4">No internal credential leaks detected.</div>}
            </div>
         </Card>
      </div>
    );
  }
};
