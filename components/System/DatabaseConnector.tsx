
import React, { useRef } from 'react';
import { Button, Card, Badge, Input, FilterGroup, CardHeader, Switch, Label } from '../Shared/UI';
import { useDatabaseConnection } from '../../hooks/modules/useDatabaseConnection';
import { Icons } from '../Shared/Icons';
import { threatData } from '../../services/dataLayer';

const LogLine = React.memo(({ log }: { log: string }) => {
    const isError = log.includes('ERROR') || log.includes('FATAL');
    const isSuccess = log.includes('SUCCESS') || log.includes('READY');
    const color = isError ? 'text-red-400' : isSuccess ? 'text-green-300' : 'text-slate-500';
    return <div className={`border-l-2 pl-2 border-slate-800 ${color}`}>{log}</div>;
});

const DatabaseConnector: React.FC = () => {
  const { providerType, setProviderType, config, setConfig, stats, logs, isBusy, handleConnect, handleDisconnect, handleMaintenance, toggleRecovery } = useDatabaseConnection();
  const logContainerRef = useRef<HTMLDivElement>(null);

  const StatCard = ({ title, value, icon, color }: any) => (
    <Card className="p-4 flex items-center justify-between">
       <div><div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">{title}</div><div className={`text-lg font-bold font-mono ${color}`}>{value}</div></div>
       {icon}
    </Card>
  );

  return (
    <div className="flex flex-col h-full gap-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
         <StatCard title="Connection State" value={stats.status} color={stats.status === 'CONNECTED' ? 'text-green-500' : 'text-slate-300'} icon={<Icons.Server className="w-6 h-6 text-slate-700"/>} />
         <StatCard title="Throughput" value={`${stats.tps} TPS`} color="text-cyan-400" icon={<Icons.Activity className="w-6 h-6 text-cyan-900"/>} />
         <StatCard title="Latency" value={`${stats.latency} ms`} color="text-white" icon={<Icons.Zap className="w-6 h-6 text-yellow-500"/>} />
         <StatCard title="Uptime" value={`${stats.uptime}s`} color="text-slate-300" icon={<Icons.Clock className="w-6 h-6 text-slate-600"/>} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <div className="flex flex-col gap-6 lg:h-full overflow-y-auto">
            <Card className="p-0 overflow-hidden">
                <CardHeader title="Configuration" action={stats.status === 'CONNECTED' ? <Badge color="green">ONLINE</Badge> : <Badge color="slate">OFFLINE</Badge>} />
                <div className="p-6 space-y-4">
                    <div><Label>Persistence Engine</Label><FilterGroup value={providerType} onChange={(v: any) => setProviderType(v)} options={[{ label: 'In-Memory', value: 'MEMORY' }, { label: 'PostgreSQL', value: 'SQL' }]} /></div>
                    {providerType === 'SQL' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Host</Label><Input value={config.host} onChange={e => setConfig({...config, host: e.target.value})} disabled={stats.status === 'CONNECTED'} /></div>
                                <div><Label>Port</Label><Input value={config.port?.toString()} onChange={e => setConfig({...config, port: parseInt(e.target.value)})} disabled={stats.status === 'CONNECTED'} /></div>
                            </div>
                            <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800"><span className="text-xs text-slate-300">Auto Recovery</span><Switch checked={config.autoRecovery || false} onChange={toggleRecovery} /></div>
                        </div>
                    )}
                    <Button onClick={stats.status === 'CONNECTED' ? handleDisconnect : handleConnect} variant={stats.status === 'CONNECTED' ? 'danger' : 'primary'} className="w-full mt-4">{stats.status === 'CONNECTED' ? 'DISCONNECT' : 'CONNECT'}</Button>
                </div>
            </Card>
            {providerType === 'SQL' && stats.status === 'CONNECTED' && (
                <Card className="p-0 overflow-hidden"><CardHeader title="Admin Operations" /><div className="p-6 grid grid-cols-2 gap-3"><Button onClick={() => handleMaintenance('BACKUP')} disabled={isBusy} variant="secondary">BACKUP</Button><Button onClick={() => threatData.adapter.simulateFailure?.()} variant="danger">SIMULATE FAIL</Button></div></Card>
            )}
        </div>

        <div className="lg:col-span-2 flex flex-col gap-6 min-h-[500px]">
            <Card className="flex-1 border-slate-800 flex flex-col p-0 overflow-hidden bg-[#0c0c0c]">
                <CardHeader title="System Output" className="bg-[#1a1a1a] border-[#2a2a2a]" />
                <div className="relative flex-1 p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-hidden">
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 space-y-1">
                        {logs.map((log, i) => <LogLine key={i} log={log} />)}
                        <div ref={logContainerRef} />
                    </div>
                </div>
            </Card>
        </div>
      </div>
    </div>
  );
};
export default DatabaseConnector;
