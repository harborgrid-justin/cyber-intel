
import React, { useState, useEffect } from 'react';
import { Card, ProgressBar, Grid } from '../../Shared/UI';
import { threatData } from '../../../services/dataLayer';
import { useDataStore } from '../../../hooks/useDataStore';
import { DetectionLogic } from '../../../services/logic/DetectionLogic';

export const UserBehavior: React.FC = () => {
    const users = useDataStore(() => threatData.getSystemUsers());
    const logs = useDataStore(() => threatData.getAuditLogs());
    const [scores, setScores] = useState<Record<string, number>>({});

    useEffect(() => {
        const run = async () => {
            const results: Record<string, number> = {};
            for(const u of users) {
                results[u.id] = await DetectionLogic.runUEBA(u, logs);
            }
            setScores(results);
        };
        run();
    }, [users, logs]);
    
    return (
      <Grid cols={3}>
        {users.map(u => {
          const score = scores[u.id] || 0;
          return (
            <Card key={u.id} className="p-4 border-l-4 border-slate-700">
              <div className="flex justify-between mb-2">
                <span className="font-bold text-white">{u.name}</span>
                <span className={`font-bold ${score > 50 ? 'text-red-500' : 'text-green-500'}`}>{score}/100</span>
              </div>
              <ProgressBar value={score} color={score > 50 ? 'red' : 'green'} />
              <div className="mt-3 text-xs text-slate-500">
                {score > 50 ? 'Anomalous login times & failures detected.' : 'Behavior within normal baseline.'}
              </div>
            </Card>
          );
        })}
      </Grid>
    );
};
