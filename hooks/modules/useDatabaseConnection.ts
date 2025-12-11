
import { useState, useEffect, useRef } from 'react';
import { threatData } from '../../services/dataLayer';
import { MockAdapter, PostgresAdapter, DatabaseAdapter, DatabaseConfig, DatabaseStats } from '../../services/dbAdapter';
import { CONFIG } from '../../config';

export const useDatabaseConnection = () => {
  const [providerType, setProviderType] = useState<'MEMORY' | 'SQL'>('MEMORY');
  const [config, setConfig] = useState<DatabaseConfig>({
    host: CONFIG.DATABASE.POSTGRES.HOST,
    user: CONFIG.DATABASE.POSTGRES.USER,
    dbName: CONFIG.DATABASE.POSTGRES.DB_NAME,
    port: CONFIG.DATABASE.POSTGRES.PORT,
    ssl: true,
    poolSize: 20,
    autoRecovery: true
  });
  
  const [stats, setStats] = useState<DatabaseStats>({ 
      status: 'DISCONNECTED', activeConnections: 0, idleConnections: 0, 
      latency: 0, uptime: 0, version: '-', tps: 0 
  });
  const [logs, setLogs] = useState<string[]>([]);
  const [isBusy, setIsBusy] = useState(false);

  // Sync initial state
  useEffect(() => {
    if (threatData.adapter.type === 'SQL') setProviderType('SQL');
  }, []);

  // Polling Effect
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
    let adapter: DatabaseAdapter = providerType === 'SQL' ? new PostgresAdapter() : new MockAdapter();
    threatData.setProvider(adapter);
    await adapter.connect(config);
  };

  const handleDisconnect = async () => {
    await threatData.adapter.disconnect();
  };

  const handleMaintenance = async (task: 'VACUUM' | 'REINDEX' | 'BACKUP' | 'ROTATE_CREDS') => {
    setIsBusy(true);
    try {
        if (threatData.adapter.maintenance) await threatData.adapter.maintenance(task);
    } catch(e) {
        console.error(e);
    } finally {
        setIsBusy(false);
    }
  };

  const toggleRecovery = (val: boolean) => {
    setConfig({ ...config, autoRecovery: val });
    if (threatData.adapter.setAutoRecovery) threatData.adapter.setAutoRecovery(val);
  };

  return {
    providerType, setProviderType,
    config, setConfig,
    stats, logs, isBusy,
    handleConnect, handleDisconnect, handleMaintenance, toggleRecovery
  };
};
