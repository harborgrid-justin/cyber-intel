
import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, ProgressBar, StatusBadge } from '../../../Shared/UI';
import { InsiderLogic } from '../../../../services/logic/dashboard/SecurityLogic';
import ResponsiveTable from '../../../Shared/ResponsiveTable';

interface InsiderRisk {
  id: string;
  user: { name: string; role: string; id: string };
  score: number;
  anomalies: string[];
}

export const InsiderThreatView: React.FC = () => {
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
};
