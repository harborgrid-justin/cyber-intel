
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { Button, Card, Badge, Input, FilterGroup, CardHeader, Switch, Label } from '../Shared/UI';
import { threatData } from '../../services/dataLayer';
import { MockAdapter, PostgresAdapter, DatabaseAdapter, DatabaseStats } from '../../services/dbAdapter';
import { CONFIG } from '../../config';
import { Icons } from '../Shared/Icons';

// Optimization: Memoized Log Item
const LogLine = React.memo(({ log }: { log: string }) => {
    const isError = log.includes('ERROR') || log.includes('FATAL');
    const isWarn = log.includes('WARN');
    const isSuccess = log.includes('SUCCESS') || log.includes('READY');
    const isExec = log.includes('EXEC') || log.includes('SQL');
    
    return (
        <div className={`border-l-2 pl-2 ${isError ? 'border-red-500 text-red-400' : isWarn ? 'border-orange-500 text-orange-300' : isSuccess ? 'border-green-500 text-green-300' : isExec ? 'border-cyan-700 text-cyan-200' : 'border-slate-800 text-slate-500'}`}>
            {log}
        </div>
    );
});

const DatabaseConnector: React.FC = () => {
  const [providerType, setProviderType] = useState<'MEMORY' | 'SQL'>('MEMORY');
  const [config, setConfig] = useState({
    host: CONFIG.DATABASE.POSTGRES.HOST,
    user: CONFIG.DATABASE.POSTGRES.USER,
    dbName: CONFIG.DATABASE.POSTGRES.DB_NAME,
    port: CONFIG.DATABASE.POSTGRES.PORT,
    ssl: true,
    poolSize: 20,
    autoRecovery: true
  });
  
  const [stats, setStats] = useState<DatabaseStats>({ status: 'DISCONNECTED', activeConnections: 0, idleConnections: 0, latency: 0, uptime: 0, version: '-', tps: 0 });
  const [logs, setLogs] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false); // For maintenance tasks
  const logContainerRef = useRef<HTMLDivElement>(null);

  // Sync with global adapter
  useEffect(() => {
    // If global is already PG, sync state
    if (threatData.adapter.type === 'SQL') {
        setProviderType('SQL');
    }
  }, []);

  // Polling for stats and logs
  useEffect(() => {
    const interval = setInterval(() => {
      setLogs([...threatData.adapter.logs]);
      if (threatData.adapter.getStats) {
        setStats(threatData.adapter.getStats());
      }
    }, 500); 
    return () => clearInterval(interval);
  }, []);

  const handleConnect = async () => {
    let adapter: DatabaseAdapter;
    if (providerType === 'SQL') {
      adapter = new PostgresAdapter(); // Create new instance for clean slate
    } else {
      adapter = new MockAdapter();
    }
    
    // Set UI to reflect attempting connection (the adapter will handle async state)
    threatData.setProvider(adapter); // Switch globally first to capture logs
    await adapter.connect(config);
  };

  const handleDisconnect = async () => {
    await threatData.adapter.disconnect();
  };

  const handleMaintenance = async (task: 'VACUUM' | 'REINDEX' | 'BACKUP' | 'ROTATE_CREDS') => {
    setIsBusy(true);
    try {
        await threatData.adapter.maintenance(task);
    } catch(e) {
        console.error(e);
    } finally {
        setIsBusy(false);
    }
  };

  const handleSimulateFailure = () => {
    if (threatData.adapter.simulateFailure) threatData.adapter.simulateFailure();
  };

  const toggleRecovery = (val: boolean) => {
    setConfig({ ...config, autoRecovery: val });
    if (threatData.adapter.setAutoRecovery) threatData.adapter.setAutoRecovery(val);
  };

  return (
    <div className="flex flex-col h-full gap-6">
      {/* Top Stats Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 shrink-0">
         <Card className="p-4 flex items-center justify-between border-l-4 border-l-slate-600">
            <div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Connection State</div>
               <div className={`text-lg font-bold font-mono ${stats.status === 'CONNECTED' ? 'text-green-500' : stats.status === 'ERROR' ? 'text-red-500' : 'text-slate-300'}`}>
                  {stats.status}
               </div>
            </div>
            <Icons.Server className={`w-6 h-6 ${stats.status === 'CONNECTED' ? 'text-green-500' : 'text-slate-700'}`} />
         </Card>
         <Card className="p-4 flex items-center justify-between">
            <div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Throughput</div>
               <div className="text-lg font-bold font-mono text-cyan-400">{stats.tps} TPS</div>
            </div>
            <Icons.Activity className="w-6 h-6 text-cyan-900" />
         </Card>
         <Card className="p-4 flex items-center justify-between">
            <div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Latency</div>
               <div className="text-lg font-bold font-mono text-white">{stats.latency} ms</div>
            </div>
            <Icons.Zap className="w-6 h-6 text-yellow-500" />
         </Card>
         <Card className="p-4 flex items-center justify-between">
            <div>
               <div className="text-[10px] text-slate-500 uppercase font-bold tracking-widest">Session Uptime</div>
               <div className="text-lg font-bold font-mono text-slate-300">{stats.uptime}s</div>
            </div>
            <Icons.Clock className="w-6 h-6 text-slate-600" />
         </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        
        {/* Left Col: Config & Maintenance */}
        <div className="flex flex-col gap-6 lg:h-full overflow-y-auto">
            <Card className="p-0 overflow-hidden">
                <CardHeader title="Configuration" action={stats.status === 'CONNECTED' ? <Badge color="green">ONLINE</Badge> : <Badge color="slate">OFFLINE</Badge>} />
                <div className="p-6 space-y-4">
                    <div>
                        <Label>Persistence Engine</Label>
                        <FilterGroup value={providerType} onChange={(v: any) => setProviderType(v)} options={[{ label: 'In-Memory', value: 'MEMORY' }, { label: 'PostgreSQL', value: 'SQL' }]} />
                    </div>
                    {providerType === 'SQL' && (
                        <div className="space-y-4 animate-in fade-in slide-in-from-left-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>Host</Label><Input value={config.host} onChange={e => setConfig({...config, host: e.target.value})} disabled={stats.status === 'CONNECTED'} /></div>
                                <div><Label>Port</Label><Input value={config.port.toString()} onChange={e => setConfig({...config, port: parseInt(e.target.value)})} disabled={stats.status === 'CONNECTED'} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div><Label>User</Label><Input value={config.user} onChange={e => setConfig({...config, user: e.target.value})} disabled={stats.status === 'CONNECTED'} /></div>
                                <div><Label>Database</Label><Input value={config.dbName} onChange={e => setConfig({...config, dbName: e.target.value})} disabled={stats.status === 'CONNECTED'} /></div>
                            </div>
                            <div className="grid grid-cols-2 gap-4 pt-2">
                                <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                                    <span className="text-xs text-slate-300">SSL / TLS 1.3</span>
                                    <Switch checked={config.ssl} onChange={v => setConfig({...config, ssl: v})} />
                                </div>
                                <div className="flex justify-between items-center bg-slate-900 p-2 rounded border border-slate-800">
                                    <span className="text-xs text-slate-300">Auto Recovery</span>
                                    <Switch checked={config.autoRecovery} onChange={toggleRecovery} />
                                </div>
                            </div>
                        </div>
                    )}
                    <div className="pt-4 flex gap-2">
                        {stats.status !== 'CONNECTED' ? (
                            <Button onClick={handleConnect} disabled={stats.status === 'RECONNECTING'} className="w-full">
                                {stats.status === 'RECONNECTING' ? 'CONNECTING...' : 'CONNECT'}
                            </Button>
                        ) : (
                            <Button onClick={handleDisconnect} variant="danger" className="w-full">DISCONNECT</Button>
                        )}
                    </div>
                </div>
            </Card>

            {providerType === 'SQL' && stats.status === 'CONNECTED' && (
                <Card className="p-0 overflow-hidden">
                    <CardHeader title="Admin Operations" />
                    <div className="p-6 grid grid-cols-2 gap-3">
                        <Button onClick={() => handleMaintenance('BACKUP')} disabled={isBusy} variant="secondary" className="text-[10px]">SNAPSHOT BACKUP</Button>
                        <Button onClick={() => handleMaintenance('VACUUM')} disabled={isBusy} variant="secondary" className="text-[10px]">VACUUM FULL</Button>
                        <Button onClick={() => handleMaintenance('ROTATE_CREDS')} disabled={isBusy} variant="outline" className="text-[10px]">ROTATE CREDS</Button>
                        <Button onClick={handleSimulateFailure} variant="danger" className="text-[10px] border-red-900/50 hover:bg-red-900/30">SIMULATE OUTAGE</Button>
                    </div>
                </Card>
            )}
        </div>

        {/* Right Col: Logs & Pool Monitor */}
        <div className="lg:col-span-2 flex flex-col gap-6 min-h-[500px]">
            {/* Pool Monitor */}
            <Card className="p-6">
                <div className="flex justify-between items-center mb-4">
                    <h3 className="font-bold text-white uppercase tracking-wider text-sm">Connection Pool</h3>
                    <div className="text-xs text-slate-500 font-mono">Max: {config.poolSize}</div>
                </div>
                <div className="flex items-end gap-2 h-24 mb-2">
                    {Array.from({ length: config.poolSize }).map((_, i) => (
                        <div 
                            key={i} 
                            className={`flex-1 rounded-t transition-all duration-300 ${i < stats.activeConnections ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)]' : 'bg-slate-800'}`}
                            style={{ height: i < stats.activeConnections ? '80%' : '20%' }}
                        ></div>
                    ))}
                </div>
                <div className="flex justify-between text-xs font-mono">
                    <span className="text-cyan-400 font-bold">{stats.activeConnections} Active</span>
                    <span className="text-slate-500">{stats.idleConnections} Idle</span>
                </div>
            </Card>

            {/* Terminal Log */}
            <Card className="flex-1 border-slate-800 flex flex-col p-0 overflow-hidden bg-[#0c0c0c]">
                <CardHeader title="System Output" className="bg-[#1a1a1a] border-[#2a2a2a]" action={<Badge color="slate">TAIL -F</Badge>} />
                <div className="relative flex-1 p-4 font-mono text-[11px] leading-relaxed text-slate-300 overflow-hidden">
                    <div className="absolute inset-0 overflow-y-auto custom-scrollbar p-4 space-y-1">
                        {logs.length === 0 && <span className="text-slate-700 italic">Waiting for connection stream...</span>}
                        {logs.map((log, i) => (
                            <LogLine key={i} log={log} />
                        ))}
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
