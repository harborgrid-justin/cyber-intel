
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardHeader, Badge, Button, Grid } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { AuditLogic } from '../../../services/logic/AuditLogic';
import { AuditLog } from '../../../types';

interface ViewProps { logs: AuditLog[]; }

export const DataLogsView: React.FC<ViewProps> = ({ logs }) => {
  const [stats, setStats] = useState<any>({ totalAccess: 0, exportCount: 0, deletionCount: 0, recentLogs: [] });

  useEffect(() => {
    AuditLogic.analyzeData().then(setStats);
  }, []);

  return (
    <div className="space-y-6 h-full flex flex-col">
        <Grid cols={3}>
            <Card className="p-4"><div className="text-[10px] text-slate-500 uppercase font-bold">Total Access Events</div><div className="text-2xl font-bold text-white">{stats.totalAccess}</div></Card>
            <Card className="p-4"><div className="text-[10px] text-slate-500 uppercase font-bold">Exports</div><div className="text-2xl font-bold text-cyan-500">{stats.exportCount}</div></Card>
            <Card className="p-4"><div className="text-[10px] text-slate-500 uppercase font-bold">Deletions</div><div className="text-2xl font-bold text-red-500">{stats.deletionCount}</div></Card>
        </Grid>
        <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Data Access & Modification Log" />
            <div className="flex-1 overflow-y-auto">
                <ResponsiveTable<AuditLog> data={stats.recentLogs} keyExtractor={l => l.id} columns={[
                    { header: 'Time', render: l => <span className="text-xs font-mono text-slate-400">{l.timestamp}</span> },
                    { header: 'Action', render: l => <Badge color={l.action.includes('DELETE') ? 'red' : l.action.includes('EXPORT') ? 'orange' : 'blue'}>{l.action}</Badge> },
                    { header: 'User', render: l => <span className="text-xs font-bold text-white">{l.user}</span> },
                    { header: 'Resource / Details', render: l => <span className="text-xs text-slate-300">{l.details}</span> }
                ]} renderMobileCard={l => <div>{l.details}</div>} />
            </div>
        </Card>
    </div>
  );
};

export const SystemLogsView: React.FC<ViewProps> = ({ logs }) => {
  // Simple filter for system logic
  const systemLogs = logs.filter(l => ['SYSTEM', 'SERVICE', 'UPDATE'].some(k => l.action.includes(k)));
  return (
    <Card className="h-full p-0 overflow-hidden flex flex-col">
        <CardHeader title="System Events & Kernel Logs" />
        <div className="flex-1 overflow-y-auto p-4 bg-black font-mono text-xs text-green-400 space-y-1">
            {systemLogs.map(l => (
                <div key={l.id} className="border-l-2 border-slate-800 pl-2">
                    <span className="text-slate-500">[{l.timestamp}]</span> <span className="text-yellow-500">{l.location}</span>: {l.action} - {l.details}
                </div>
            ))}
            {systemLogs.length === 0 && <div className="text-slate-600 italic">No system events in current window.</div>}
        </div>
    </Card>
  );
};

export const AdminLogsView: React.FC<ViewProps> = ({ logs }) => {
  const stats = useMemo(() => AuditLogic.analyzeAdmin(logs), [logs]);
  return (
    <div className="space-y-6 h-full flex flex-col">
        <div className="flex gap-4 shrink-0">
            <Card className="flex-1 p-4 bg-purple-900/10 border-purple-900/50">
                <div className="text-xs text-purple-300 uppercase font-bold">Config Changes</div>
                <div className="text-2xl font-bold text-white">{stats.configChanges}</div>
            </Card>
            <Card className="flex-1 p-4 bg-blue-900/10 border-blue-900/50">
                <div className="text-xs text-blue-300 uppercase font-bold">User Modifications</div>
                <div className="text-2xl font-bold text-white">{stats.userMods}</div>
            </Card>
        </div>
        <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Privileged Activity Ledger" />
            <div className="flex-1 overflow-y-auto">
                <ResponsiveTable<AuditLog> data={stats.logs} keyExtractor={l => l.id} columns={[
                    { header: 'Time', render: l => <span className="text-xs font-mono text-slate-400">{l.timestamp}</span> },
                    { header: 'Admin', render: l => <span className="text-xs font-bold text-purple-400">{l.user}</span> },
                    { header: 'Action', render: l => <Badge color="purple">{l.action}</Badge> },
                    { header: 'Change Details', render: l => <span className="text-xs text-slate-300">{l.details}</span> },
                    { header: 'Context', render: l => <span className="text-xs text-slate-500">{l.location}</span> }
                ]} renderMobileCard={l => <div>{l.details}</div>} />
            </div>
        </Card>
    </div>
  );
};

export const ErrorLogsView: React.FC<ViewProps> = ({ logs }) => {
  const stats = useMemo(() => AuditLogic.analyzeErrors(logs), [logs]);
  return (
    <Card className="h-full p-0 overflow-hidden flex flex-col border-red-900/30">
        <CardHeader title="System Faults & Errors" action={<Badge color="red">{stats.totalErrors} Events</Badge>} />
        <div className="flex-1 overflow-y-auto">
            <ResponsiveTable<AuditLog> data={stats.logs} keyExtractor={l => l.id} columns={[
                { header: 'Time', render: l => <span className="text-xs font-mono text-slate-400">{l.timestamp}</span> },
                { header: 'Type', render: l => <span className="text-xs font-bold text-red-500">{l.action}</span> },
                { header: 'Source', render: l => <span className="text-xs text-slate-400">{l.location}</span> },
                { header: 'Message', render: l => <span className="text-xs text-white font-mono bg-red-900/10 px-2 py-1 rounded">{l.details}</span> },
                { header: 'User', render: l => <span className="text-xs text-slate-500">{l.user}</span> }
            ]} renderMobileCard={l => <div>{l.details}</div>} />
        </div>
    </Card>
  );
};
