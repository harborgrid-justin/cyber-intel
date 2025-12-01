
export interface DatabaseConfig {
  host?: string;
  user?: string;
  dbName?: string;
  port?: number;
  ssl?: boolean;
  poolSize?: number;
  autoRecovery?: boolean;
}

export interface DatabaseStats {
  status: 'CONNECTED' | 'DISCONNECTED' | 'RECONNECTING' | 'ERROR';
  activeConnections: number;
  idleConnections: number;
  latency: number;
  uptime: number;
  version: string;
  tps: number; // Transactions per second
}

export interface DatabaseAdapter {
  name: string;
  type: 'SQL' | 'NOSQL' | 'MEMORY';
  connect(config: DatabaseConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>): void;
  query(collection: string, query?: Record<string, any>): Promise<any[]>;
  logs: string[];
  
  // Production Features
  getStats(): DatabaseStats;
  maintenance(task: 'VACUUM' | 'REINDEX' | 'BACKUP' | 'ROTATE_CREDS'): Promise<string>;
  setAutoRecovery(enabled: boolean): void;
  simulateFailure(): void;
}

export class MockAdapter implements DatabaseAdapter {
  name = 'In-Memory (Mock)';
  type = 'MEMORY' as const;
  logs: string[] = [];
  
  async connect(_config: DatabaseConfig) { return true; }
  async disconnect() { }
  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>) {
    this.logs.unshift(`[MOCK] ${action} on ${collection}: ${JSON.stringify(data).substring(0, 50)}...`);
  }
  async query(_collection: string) { return []; }
  
  getStats(): DatabaseStats { 
    return { status: 'CONNECTED', activeConnections: 0, idleConnections: 0, latency: 0, uptime: 0, version: 'Mock 1.0', tps: 0 }; 
  }
  async maintenance(task: string) { return `Mock ${task} completed.`; }
  setAutoRecovery(_enabled: boolean) {}
  simulateFailure() {}
}

export class PostgresAdapter implements DatabaseAdapter {
  name = 'PostgreSQL Enterprise Cluster';
  type = 'SQL' as const;
  logs: string[] = [];
  
  private config: DatabaseConfig = {};
  private status: DatabaseStats['status'] = 'DISCONNECTED';
  private autoRecovery = false;
  private startTime = 0;
  private pool = { active: 0, max: 20 };
  private tpsBase = 0;

  constructor() {
    // Background simulation loop
    setInterval(() => this.backgroundSim(), 2000);
  }

  private async logStep(ms: number, level: 'INFO' | 'WARN' | 'EXEC' | 'SUCCESS' | 'ERROR', msg: string) {
    await new Promise(r => setTimeout(r, ms));
    const entry = `[PG] ${new Date().toISOString().split('T')[1]} [${level}] ${msg}`;
    this.logs.unshift(entry);
  }

  async connect(config: DatabaseConfig) {
    this.config = config;
    this.pool.max = config.poolSize || 20;
    this.autoRecovery = !!config.autoRecovery;
    
    if (this.status === 'CONNECTED') return true;

    this.status = 'RECONNECTING';
    this.logs.unshift(`[PG] INIT: Starting connection sequence to ${config.host}:${config.port}...`);
    
    try {
        // 1. Network Layer
        await this.logStep(300, 'INFO', `NET: Resolving hostname '${config.host}'... DNS OK (10.0.4.20)`);
        await this.logStep(300, 'INFO', `TLS: Handshake (TLS v1.3, Cipher: TLS_AES_256_GCM_SHA384)`);
        
        if (Math.random() > 0.95) throw new Error("Connection Timeout"); // Random connect fail

        // 2. Auth
        await this.logStep(400, 'SUCCESS', `AUTH: SCRAM-SHA-256 verified for user '${config.user}'`);

        // 3. Pool Init
        await this.logStep(200, 'INFO', `POOL: Initializing connection pool (Min: 2, Max: ${this.pool.max})...`);
        this.pool.active = 2;

        // 4. Schema Verification (Shortened for re-connects)
        await this.logStep(200, 'EXEC', `SQL: SELECT version(); -- PostgreSQL 15.4`);
        
        this.status = 'CONNECTED';
        this.startTime = this.startTime || Date.now(); // Keep uptime if reconnecting
        this.logStep(0, 'SUCCESS', 'READY: Connection established.');
        return true;
    } catch (e) {
        this.status = 'ERROR';
        this.logStep(0, 'ERROR', `FATAL: ${e instanceof Error ? e.message : 'Unknown Error'}`);
        if (this.autoRecovery) this.triggerRecovery();
        return false;
    }
  }

  async disconnect() {
    if (this.status === 'DISCONNECTED') return;
    this.logStep(0, 'INFO', 'SIGTERM received. Draining connection pool...');
    await this.logStep(600, 'INFO', 'POOL: Waiting for active transactions to commit...');
    this.pool.active = 0;
    this.status = 'DISCONNECTED';
    this.startTime = 0;
    this.logStep(0, 'WARN', 'Connection closed gracefully.');
  }

  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>) {
    if (this.status !== 'CONNECTED') return;
    const table = collection.toUpperCase();
    // Simulate SQL generation
    const sql = action === 'CREATE' ? `INSERT INTO ${table} VALUES (...)` : `${action} FROM ${table} WHERE id='${data.id}'`;
    this.logs.unshift(`[PG] [EXEC] [${Math.floor(Math.random()*100)}ms] ${sql}`);
    this.tpsBase++;
  }

  async query(collection: string) {
    if (this.status !== 'CONNECTED') return [];
    // Only log heavy queries or occasional ones to avoid spam
    if (Math.random() > 0.8) {
        this.logs.unshift(`[PG] [QUERY] SELECT * FROM ${collection.toUpperCase()} (Index Scan)`);
    }
    return []; 
  }

  // --- Production Features ---

  getStats(): DatabaseStats {
    return {
      status: this.status,
      activeConnections: this.pool.active,
      idleConnections: Math.max(0, this.pool.max - this.pool.active),
      latency: this.status === 'CONNECTED' ? 12 + Math.floor(Math.random() * 10) : 0,
      uptime: this.status === 'CONNECTED' ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
      version: 'PostgreSQL 15.4',
      tps: Math.floor(this.tpsBase + (Math.random() * 5))
    };
  }

  async maintenance(task: 'VACUUM' | 'REINDEX' | 'BACKUP' | 'ROTATE_CREDS'): Promise<string> {
    if (this.status !== 'CONNECTED') throw new Error("Database not connected");
    
    this.logs.unshift(`[MAINT] Starting ${task} job...`);
    
    if (task === 'BACKUP') {
        await this.logStep(1000, 'INFO', 'BACKUP: pg_dump started on public schema...');
        await this.logStep(1500, 'INFO', 'BACKUP: Compressing stream (gzip level 9)...');
        await this.logStep(500, 'SUCCESS', 'BACKUP: Snapshot saved to s3://sentinel-backups/db-full-latest.dump');
        return 'Backup Complete';
    } else if (task === 'VACUUM') {
        await this.logStep(800, 'EXEC', 'VACUUM (ANALYZE, VERBOSE) threats;');
        await this.logStep(600, 'EXEC', 'VACUUM (ANALYZE, VERBOSE) audit_logs;');
        return 'Vacuum Complete';
    } else if (task === 'ROTATE_CREDS') {
        await this.logStep(500, 'INFO', 'IAM: Generating new ephemeral credentials...');
        await this.logStep(300, 'EXEC', 'ALTER USER admin_svc WITH PASSWORD ****;');
        return 'Credentials Rotated';
    }
    return 'Task Complete';
  }

  setAutoRecovery(enabled: boolean) {
    this.autoRecovery = enabled;
    this.logs.unshift(`[SYS] Auto-Recovery Protocol: ${enabled ? 'ENABLED' : 'DISABLED'}`);
  }

  simulateFailure() {
    if (this.status !== 'CONNECTED') return;
    this.logs.unshift(`[FATAL] Connection socket reset by peer (ECONNRESET) - Simulating outage`);
    this.status = 'ERROR';
    this.pool.active = 0;
    if (this.autoRecovery) this.triggerRecovery();
  }

  private triggerRecovery() {
    this.logStep(1000, 'WARN', 'RECOVERY: Detecting connection loss. Initiating retry 1/3 in 3s...');
    setTimeout(() => {
        if (this.status !== 'CONNECTED') this.connect(this.config);
    }, 3000);
  }

  private backgroundSim() {
    if (this.status === 'CONNECTED') {
        // Simulate fluctuating connections
        const fluctuation = Math.random() > 0.5 ? 1 : -1;
        this.pool.active = Math.max(2, Math.min(this.pool.max, this.pool.active + fluctuation));
        this.tpsBase = Math.max(0, this.tpsBase - 1); // Decay TPS
        
        // Very rare random drop
        if (Math.random() > 0.995 && this.autoRecovery) {
            this.simulateFailure();
        }
    }
  }
}
