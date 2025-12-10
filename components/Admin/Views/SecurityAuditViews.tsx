
import React, { useState, useEffect } from 'react';
import { Card, CardHeader, Badge, ProgressBar, Grid, Button } from '../../Shared/UI';
import { VirtualList } from '../../Shared/VirtualList';
import { AuditLogic } from '../../../services/logic/AuditLogic';
import { AuditLog } from '../../../types';

interface ViewProps { logs: AuditLog[]; }

export const AuthLogsView: React.FC<ViewProps> = ({ logs }) => {
  const [stats, setStats] = useState<any>({ total: 0, failureRate: 0, uniqueUsers: 0, bruteForceSuspects: [], recentLogs: [] });

  useEffect(() => {
    AuditLogic.analyzeAuth().then(setStats);
  }, []);

  const renderRow = (l: AuditLog) => (
      <div key={l.id} className="flex text-xs p-2 border-b border-slate-800 items-center">
          <div className="w-32 font-mono text-slate-400">{l.timestamp}</div>
          <div className="w-32 font-bold text-white">{l.user}</div>
          <div className="w-24"><Badge color={l.action.includes('FAIL') ? 'red' : 'green'}>{l.action}</Badge></div>
          <div className="flex-1 text-slate-300 truncate">{l.details}</div>
          <div className="w-24 font-mono text-cyan-500 text-right">{l.location}</div>
      </div>
  );

  return (
    <div className="space-y-6 h-full flex flex-col">
        <Grid cols={3}>
            <Card className="p-4 border-l-4 border-l-blue-500"><div className="text-[10px] uppercase font-bold text-slate-500">Total Sessions</div><div className="text-2xl font-bold text-white">{stats.total}</div></Card>
            <Card className="p-4 border-l-4 border-l-red-500"><div className="text-[10px] uppercase font-bold text-slate-500">Failures</div><div className="text-2xl font-bold text-red-500">{stats.failureRate}%</div></Card>
            <Card className="p-4 border-l-4 border-l-orange-500"><div className="text-[10px] uppercase font-bold text-slate-500">Suspects</div><div className="text-2xl font-bold text-orange-500">{stats.bruteForceSuspects.length}</div></Card>
        </Grid>
        <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Authentication Ledger" action={<Badge color="blue">LIVE</Badge>} />
            <div className="flex-1 min-h-0">
                <VirtualList items={stats.recentLogs} rowHeight={40} containerHeight={400} renderRow={renderRow} />
            </div>
        </Card>
    </div>
  );
};

export const NetworkLogsView: React.FC<ViewProps> = () => <div className="p-4 text-slate-500">Network Logs Placeholder</div>;
export const PolicyLogsView: React.FC<ViewProps> = () => <div className="p-4 text-slate-500">Policy Logs Placeholder</div>;
