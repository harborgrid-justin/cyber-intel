
import React, { useState, useEffect } from 'react';
import { Card, SectionHeader, Grid, DataList } from '../../../Shared/UI';
import { MetricCard } from '../../../Shared/MetricCard';
import { DarkWebLogic } from '../../../../services/logic/dashboard/SecurityLogic';

export const DarkWebView: React.FC = () => {
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
};
