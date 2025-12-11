
import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, DataList } from '../../../Shared/UI';
import { MetricCard } from '../../../Shared/MetricCard';
import { threatData } from '../../../../services/dataLayer';
import { useDataStore } from '../../../../hooks/useDataStore';
import { ComplianceLogic } from '../../../../services/logic/dashboard/SecurityLogic';

interface ComplianceStats {
  score: number;
  passing: number;
  total: number;
  gaps: string[];
}

export const ComplianceView: React.FC = () => {
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
};
