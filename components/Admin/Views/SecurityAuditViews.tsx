
import React, { useMemo } from 'react';
import { Card, CardHeader, Badge, ProgressBar, Grid, Button } from '../../Shared/UI';
import ResponsiveTable from '../../Shared/ResponsiveTable';
import { AuditLogic } from '../../../services/logic/AuditLogic';
import { AuditLog } from '../../../types';

interface ViewProps { logs: AuditLog[]; }

export const AuthLogsView: React.FC<ViewProps> = ({ logs }) => {
  const stats = useMemo(() => AuditLogic.analyzeAuth(logs), [logs]);

  return (
    <div className="space-y-6 h-full flex flex-col">
        <Grid cols={3}>
            <Card className="p-4 border-l-4 border-l-blue-500">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Total Sessions</div>
                <div className="text-2xl font-bold text-white">{stats.total}</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-red-500">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Auth Failures</div>
                <div className="text-2xl font-bold text-red-500">{stats.failureRate}%</div>
                <div className="text-[9px] text-slate-400">Rate (Last Period)</div>
            </Card>
            <Card className="p-4 border-l-4 border-l-orange-500">
                <div className="text-[10px] text-slate-500 uppercase font-bold">Suspect Users</div>
                <div className="text-2xl font-bold text-orange-500">{stats.bruteForceSuspects.length}</div>
                <div className="text-[9px] text-slate-400">{stats.bruteForceSuspects.join(', ') || 'None'}</div>
            </Card>
        </Grid>
        
        <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Authentication Ledger" action={<Badge color="blue">LIVE</Badge>} />
            <div className="flex-1 overflow-y-auto">
                <ResponsiveTable<AuditLog> data={stats.logs} keyExtractor={l => l.id} columns={[
                    { header: 'Time', render: l => <span className="text-xs font-mono text-slate-400">{l.timestamp}</span> },
                    { header: 'User', render: l => <span className="font-bold text-white text-sm">{l.user}</span> },
                    { header: 'Action', render: l => <Badge color={l.action.includes('FAIL') ? 'red' : 'green'}>{l.action}</Badge> },
                    { header: 'Method/Details', render: l => <span className="text-xs text-slate-300">{l.details}</span> },
                    { header: 'Source', render: l => <span className="text-xs font-mono text-cyan-500">{l.location}</span> }
                ]} renderMobileCard={l => <div>{l.user} - {l.action}</div>} />
            </div>
        </Card>
    </div>
  );
};

export const NetworkLogsView: React.FC<ViewProps> = ({ logs }) => {
  const stats = useMemo(() => AuditLogic.analyzeNetwork(logs), [logs]);

  return (
    <div className="space-y-6 h-full flex flex-col">
        <Grid cols={3}>
            <Card className="p-4 bg-slate-900 border-slate-800">
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-white">Traffic Volume</span><span className="text-cyan-500 font-mono">{stats.totalEvents}</span></div>
                <ProgressBar value={70} color="cyan" />
            </Card>
            <Card className="p-4 bg-slate-900 border-slate-800">
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-white">Block Rate</span><span className="text-orange-500 font-mono">{100 - stats.allowRate}%</span></div>
                <ProgressBar value={100 - stats.allowRate} color="orange" />
            </Card>
            <Card className="p-4 bg-red-900/10 border-red-900/50">
                <div className="flex justify-between mb-2"><span className="text-xs font-bold text-red-200">IPS Alerts</span><span className="text-red-500 font-bold font-mono">{stats.ipsAlerts.length}</span></div>
                <div className="text-[9px] text-red-300">Intrusion Prevention Triggers</div>
            </Card>
        </Grid>

        <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Network Defense Logs" />
            <div className="flex-1 overflow-y-auto">
                <ResponsiveTable<AuditLog> data={stats.logs} keyExtractor={l => l.id} columns={[
                    { header: 'Timestamp', render: l => <span className="text-xs font-mono text-slate-400">{l.timestamp}</span> },
                    { header: 'Event', render: l => <span className="font-bold text-white text-xs">{l.action}</span> },
                    { header: 'Details', render: l => <span className="text-xs text-slate-300 font-mono">{l.details}</span> },
                    { header: 'Gateway', render: l => <Badge color="slate">{l.location}</Badge> },
                    { header: 'Status', render: l => <Badge color={l.action.includes('DENY') ? 'red' : 'green'}>{l.action.includes('DENY') ? 'BLOCKED' : 'ALLOWED'}</Badge> }
                ]} renderMobileCard={l => <div>{l.action}</div>} />
            </div>
        </Card>
    </div>
  );
};

export const PolicyLogsView: React.FC<ViewProps> = ({ logs }) => {
  const stats = useMemo(() => AuditLogic.analyzePolicy(logs), [logs]);

  return (
    <div className="space-y-6 h-full flex flex-col">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 shrink-0">
            <Card className="p-4 flex flex-col justify-center">
                <h3 className="text-sm font-bold text-white mb-2">Compliance Health</h3>
                <div className="flex items-end gap-2">
                    <span className="text-3xl font-black text-white">{100 - (stats.totalViolations * 2)}%</span>
                    <span className="text-xs text-slate-500 mb-1">Score</span>
                </div>
                <ProgressBar value={100 - (stats.totalViolations * 2)} color="green" className="mt-2" />
            </Card>
            <Card className="p-4 border-l-4 border-l-red-600 bg-slate-900">
                <h3 className="text-sm font-bold text-white mb-2">Top Offenders</h3>
                <div className="space-y-1">
                    {stats.topOffenders.map(([user, count], i) => (
                        <div key={i} className="flex justify-between text-xs">
                            <span className="text-slate-300">{user}</span>
                            <span className="text-red-400 font-bold">{count} Violations</span>
                        </div>
                    ))}
                    {stats.topOffenders.length === 0 && <span className="text-xs text-slate-500">No violations recorded.</span>}
                </div>
            </Card>
        </div>

        <Card className="flex-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Policy & DLP Violations" />
            <div className="flex-1 overflow-y-auto">
                <ResponsiveTable<AuditLog> data={stats.logs} keyExtractor={l => l.id} columns={[
                    { header: 'Time', render: l => <span className="text-xs font-mono text-slate-400">{l.timestamp}</span> },
                    { header: 'Policy', render: l => <Badge color="orange">{l.action}</Badge> },
                    { header: 'User', render: l => <span className="text-xs text-white font-bold">{l.user}</span> },
                    { header: 'Violation Details', render: l => <span className="text-xs text-red-300">{l.details}</span> },
                    { header: 'Enforcement', render: l => <Button variant="text" className="text-[10px]">REVIEW</Button> }
                ]} renderMobileCard={l => <div>{l.details}</div>} />
            </div>
        </Card>
    </div>
  );
};
