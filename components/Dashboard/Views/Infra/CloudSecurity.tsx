
import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Grid } from '../../../Shared/UI';
import { MetricCard } from '../../../Shared/MetricCard';
import { CloudSecLogic } from '../../../../services/logic/dashboard/InfraLogic';
import { Icons } from '../../../Shared/Icons';
import { threatData } from '../../../../services/dataLayer';
import { useDataStore } from '../../../../hooks/useDataStore';

interface CloudAudit {
  iamRisks: { resource: string; issue: string }[];
  misconfigurations: number;
  monthlySpend: number;
}

export const CloudSecurity: React.FC = () => {
    // Ensuring re-render on data store update even if not directly using threatData content here, 
    // often good to subscribe to config or user to trigger re-checks
    useDataStore(() => threatData.getAppConfig());
    
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
};
