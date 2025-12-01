
import React, { useMemo } from 'react';
import { Card, Grid, CardHeader, ProgressBar } from '../Shared/UI';
import { Vulnerability, PatchStatus } from '../../types';
import VulnTable from './VulnTable';
import { VulnerabilityLogic } from '../../services/logic/VulnerabilityLogic';

interface VulnOverviewProps {
  vulns: Vulnerability[];
  patchStatus: PatchStatus[];
  criticalCves: Vulnerability[];
  zeroDays: Vulnerability[];
  handlePatch: (id: string) => void;
}

const VulnOverview: React.FC<VulnOverviewProps> = ({ vulns, patchStatus, criticalCves, zeroDays, handlePatch }) => {
  const complianceScore = useMemo(() => {
    const total = patchStatus.reduce((acc, curr) => acc + curr.total, 0);
    const patched = patchStatus.reduce((acc, curr) => acc + curr.patched, 0);
    return total ? Math.round((patched / total) * 100) : 100;
  }, [patchStatus]);

  const slaBreaches = vulns.filter(v => VulnerabilityLogic.calculateRemediationSLA(v).status === 'BREACHED').length;

  return (
    <div className="space-y-6">
      <Grid cols={4}>
         <Card className="p-4 bg-red-900/10 border-red-900/30 flex flex-col justify-center">
           <div className="flex justify-between items-start">
             <div>
                <div className="text-2xl font-bold text-red-500">{criticalCves.filter(c => c.status !== 'PATCHED').length}</div>
                <div className="text-xs text-red-400 uppercase font-bold">Critical Unpatched</div>
             </div>
             <div className="text-[10px] text-red-300/50 font-mono">CVSS 9.0+</div>
           </div>
         </Card>
         <Card className="p-4 flex flex-col justify-center">
           <div className="flex justify-between items-start">
             <div>
                <div className="text-2xl font-bold text-white">{vulns.length}</div>
                <div className="text-xs text-slate-500 uppercase font-bold">Total Vulnerabilities</div>
             </div>
             <div className="text-[10px] text-slate-500 font-mono">Active</div>
           </div>
         </Card>
         <Card className="p-4 flex flex-col justify-center">
           <div className="flex justify-between items-center mb-1">
              <span className="text-2xl font-bold text-cyan-400">{complianceScore}%</span>
              <span className="text-[10px] text-slate-500">Goal: 95%</span>
           </div>
           <ProgressBar value={complianceScore} color={complianceScore > 90 ? 'green' : 'orange'} />
           <div className="text-xs text-cyan-600 uppercase font-bold mt-1">Patch Compliance</div>
         </Card>
         <Card className="p-4 flex flex-col justify-center border-l-4 border-l-orange-500">
           <div className="text-2xl font-bold text-orange-400">{slaBreaches}</div>
           <div className="text-xs text-orange-600 uppercase font-bold">SLA Breaches</div>
           <div className="text-[10px] text-slate-500 mt-1">Overdue Patches</div>
         </Card>
      </Grid>
      <Card className="p-0 overflow-hidden">
        <CardHeader title="Recent Vulnerabilities" />
        <VulnTable data={vulns.slice(0, 10)} onPatch={handlePatch} showSla={true} />
      </Card>
    </div>
  );
};
export default VulnOverview;
