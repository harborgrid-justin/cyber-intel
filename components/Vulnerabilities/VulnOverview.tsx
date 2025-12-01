
import React from 'react';
import { Card, Grid, CardHeader } from '../Shared/UI';
import { Vulnerability } from '../../types';
import VulnTable from './VulnTable';

interface VulnOverviewProps {
  vulns: Vulnerability[];
  criticalCves: Vulnerability[];
  zeroDays: Vulnerability[];
  handlePatch: (id: string) => void;
}

const VulnOverview: React.FC<VulnOverviewProps> = ({ vulns, criticalCves, zeroDays, handlePatch }) => {
  return (
    <div className="space-y-6">
      <Grid cols={4}>
         <Card className="p-4 bg-red-900/10 border-red-900/30">
           <div className="text-2xl font-bold text-red-500">{criticalCves.filter(c => c.status !== 'PATCHED').length}</div>
           <div className="text-xs text-red-400 uppercase font-bold">Critical Unpatched</div>
         </Card>
         <Card className="p-4">
           <div className="text-2xl font-bold text-white">{vulns.length}</div>
           <div className="text-xs text-slate-500 uppercase font-bold">Tracked Vulns</div>
         </Card>
         <Card className="p-4">
           <div className="text-2xl font-bold text-cyan-400">92%</div>
           <div className="text-xs text-cyan-600 uppercase font-bold">Global Patch Rate</div>
         </Card>
         <Card className="p-4">
           <div className="text-2xl font-bold text-orange-400">{zeroDays.length}</div>
           <div className="text-xs text-orange-600 uppercase font-bold">Active Zero-Days</div>
         </Card>
      </Grid>
      <Card className="p-0 overflow-hidden">
        <CardHeader title="Recent Vulnerabilities" />
        <VulnTable data={vulns} onPatch={handlePatch} />
      </Card>
    </div>
  );
};
export default VulnOverview;
