
export interface DatabaseConfig {
  host?: string;
  user?: string;
  dbName?: string;
  port?: number;
}

export interface DatabaseAdapter {
  name: string;
  type: 'SQL' | 'NOSQL' | 'MEMORY';
  connect(config: DatabaseConfig): Promise<boolean>;
  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>): void;
  query(collection: string, query?: Record<string, any>): Promise<any[]>;
  logs: string[];
}

export class MockAdapter implements DatabaseAdapter {
  name = 'In-Memory (Mock)';
  type = 'MEMORY' as const;
  logs: string[] = [];
  
  async connect(_config: DatabaseConfig) { return true; }
  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>) {
    this.logs.unshift(`[MOCK] ${action} on ${collection}: ${JSON.stringify(data).substring(0, 50)}...`);
  }
  async query(_collection: string) { return []; }
}

export class PostgresAdapter implements DatabaseAdapter {
  name = 'PostgreSQL';
  type = 'SQL' as const;
  logs: string[] = [];
  private connected = false;

  async connect(config: DatabaseConfig) {
    await new Promise(r => setTimeout(r, 1500)); // Simulate latency
    if (!config.host) throw new Error("Invalid Host");
    this.connected = true;
    this.logs.unshift(`[PG] Connected to ${config.user}@${config.host}:${config.port}/${config.dbName}`);
    return true;
  }

  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>) {
    if (!this.connected) return;
    const table = collection.toUpperCase();
    let sql = '';
    if (action === 'CREATE') {
      const cols = Object.keys(data).join(', ');
      const vals = Object.values(data).map(v => typeof v === 'string' ? `'${v}'` : String(v)).join(', ');
      sql = `INSERT INTO ${table} (${cols}) VALUES (${vals});`;
    } else if (action === 'UPDATE') {
      sql = `UPDATE ${table} SET ... WHERE id = '${data.id}';`;
    } else {
      sql = `DELETE FROM ${table} WHERE id = '${data.id || data}';`;
    }
    this.logs.unshift(`[PG] EXEC: ${sql}`);
  }

  async query(collection: string) {
    this.logs.unshift(`[PG] QUERY: SELECT * FROM ${collection.toUpperCase()} LIMIT 100;`);
    return []; // In a real app, this would return remote data
  }
}
