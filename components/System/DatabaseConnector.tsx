
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
         <StatCard title="Connection State" value={stats.status} color={stats.status === 'CONNECTED' ? 'text-green-500' : 'text-slate-300'} icon={<Icons.Database className="w-5 h-5 text-slate-600" />} />
         <StatCard title="Latency" value={`${stats.latency}ms`} color={stats.latency > 100 ? 'text-orange-500' : 'text-cyan-500'} icon={<Icons.Activity className="w-5 h-5 text-slate-600" />} />
         <StatCard title="Active Conn" value={stats.activeConnections} color="text-white" icon={<Icons.Network className="w-5 h-5 text-slate-600" />} />
         <StatCard title="Uptime" value={`${Math.floor(stats.uptime / 3600)}h`} color="text-white" icon={<Icons.Clock className="w-5 h-5 text-slate-600" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-1 p-0 overflow-hidden flex flex-col">
            <CardHeader title="Connection Settings" />
            <div className="p-6 space-y-4 overflow-y-auto">
                <div>
                   <Label>Provider Type</Label>
                   <FilterGroup 
                     value={providerType} 
                     onChange={(v: string) => setProviderType(v as 'MEMORY' | 'SQL')}
                     options={[{ label: 'In-Memory (Dev)', value: 'MEMORY' }, { label: 'PostgreSQL', value: 'SQL' }]} 
                   />
                </div>
                {providerType === 'SQL' && (
                  <div className="space-y-4 animate-in fade-in slide-in-from-top-2">
                     <div><Label>Host</Label><Input value={config.host} onChange={e => setConfig({...config, host: e.target.value})} /></div>
                     <div><Label>Database</Label><Input value={config.dbName} onChange={e => setConfig({...config, dbName: e.target.value})} /></div>
                     <div className="grid grid-cols-2 gap-4">
                        <div><Label>Port</Label><Input value={config.port} onChange={e => setConfig({...config, port: parseInt(e.target.value)})} type="number" /></div>
                        <div><Label>User</Label><Input value={config.user} onChange={e => setConfig({...config, user: e.target.value})} /></div>
                     </div>
                  </div>
                )}
                
                <div className="flex items-center justify-between pt-4 border-t border-slate-800">
                    <div>
                        <div className="text-sm font-bold text-white">Auto-Recovery</div>
                        <div className="text-xs text-slate-500">Reconnect on failure</div>
                    </div>
                    <Switch checked={config.autoRecovery || false} onChange={toggleRecovery} />
                </div>
                
                <div className="pt-4">
                    {stats.status === 'CONNECTED' ? (
                        <Button onClick={handleDisconnect} variant="danger" className="w-full" disabled={isBusy}>DISCONNECT</Button>
                    ) : (
                        <Button onClick={handleConnect} variant="primary" className="w-full" disabled={isBusy}>{isBusy ? 'CONNECTING...' : 'ESTABLISH CONNECTION'}</Button>
                    )}
                </div>
            </div>
        </Card>

        <Card className="lg:col-span-2 p-0 overflow-hidden flex flex-col">
            <CardHeader 
                title="System Console" 
                action={
                    <div className="flex gap-2">
                        <Button onClick={() => handleMaintenance('VACUUM')} variant="secondary" className="text-[10px] h-6" disabled={isBusy || stats.status !== 'CONNECTED'}>VACUUM</Button>
                        <Button onClick={() => handleMaintenance('REINDEX')} variant="secondary" className="text-[10px] h-6" disabled={isBusy || stats.status !== 'CONNECTED'}>REINDEX</Button>
                    </div>
                } 
            />
            <div className="flex-1 bg-black p-4 font-mono text-xs overflow-y-auto custom-scrollbar space-y-1" ref={logContainerRef}>
                {logs.map((l, i) => <LogLine key={i} log={l} />)}
                {logs.length === 0 && <div className="text-slate-700 italic">No activity recorded.</div>}
            </div>
        </Card>
      </div>
    </div>
  );
};

export default DatabaseConnector;
