
import { DatabaseAdapter, DatabaseConfig, DatabaseStats } from './dbAdapter';
import { apiClient } from './apiClient';

export class HttpAdapter implements DatabaseAdapter {
  name = 'HTTP API Backend';
  type = 'SQL' as const;
  logs: string[] = [];
  
  private config: DatabaseConfig = {};
  private status: DatabaseStats['status'] = 'DISCONNECTED';
  private startTime = 0;
  private requestCount = 0;
  
  // Mapping of collection names to API endpoints
  private collectionMap: Record<string, any> = {
    'threats': apiClient.threats,
    'cases': apiClient.cases,
    'actors': apiClient.actors,
    'campaigns': apiClient.campaigns,
    'vulns': apiClient.vulnerabilities,
    'vulnerabilities': apiClient.vulnerabilities,
    'nodes': apiClient.system,
    'incidents': apiClient.incidents,
    'users': apiClient.users,
    'tasks': apiClient.tasks,
    'notes': apiClient.notes,
    'artifacts': apiClient.artifacts,
    'evidence': apiClient.evidence,
    'reports': apiClient.reports,
    'channels': apiClient.channels,
    'feeds': apiClient.feeds,
    'osint_domains': apiClient.osint,
    'osint_breaches': apiClient.osint,
    'osint_geo': apiClient.osint,
    'osint_social': apiClient.osint,
    'compliance-items': apiClient.complianceItems,
    'osint-results': apiClient.osintResults,
  };

  async connect(config: DatabaseConfig): Promise<boolean> {
    this.config = config;
    this.status = 'RECONNECTING';
    this.log('INFO', `Connecting to API backend at ${config.host || 'localhost'}...`);
    
    try {
      // Test connection by fetching system health
      await apiClient.system.getHealth();
      this.status = 'CONNECTED';
      this.startTime = Date.now();
      this.log('SUCCESS', 'Connected to API backend');
      return true;
    } catch (error) {
      this.status = 'ERROR';
      this.log('ERROR', `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return false;
    }
  }

  async disconnect(): Promise<void> {
    this.status = 'DISCONNECTED';
    this.startTime = 0;
    this.log('INFO', 'Disconnected from API backend');
  }

  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>): void {
    if (this.status !== 'CONNECTED') {
      this.log('WARN', `Cannot execute ${action} - not connected`);
      return;
    }

    const endpoint = this.collectionMap[collection.toLowerCase()];
    if (!endpoint) {
      this.log('WARN', `No endpoint mapping for collection: ${collection}`);
      return;
    }

    this.requestCount++;
    
    // Execute async but don't wait (fire and forget for sync operations)
    (async () => {
      try {
        switch (action) {
          case 'CREATE':
            if (endpoint.create) {
              await endpoint.create(data);
              this.log('EXEC', `Created ${collection}: ${data.id}`);
            }
            break;
          case 'UPDATE':
            if (endpoint.update) {
              await endpoint.update(data.id, data);
              this.log('EXEC', `Updated ${collection}: ${data.id}`);
            }
            break;
          case 'DELETE':
            if (endpoint.delete) {
              await endpoint.delete(data.id);
              this.log('EXEC', `Deleted ${collection}: ${data.id}`);
            }
            break;
        }
      } catch (error) {
        this.log('ERROR', `${action} failed for ${collection}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    })();
  }

  async query(collection: string, query?: Record<string, any>): Promise<any[]> {
    if (this.status !== 'CONNECTED') {
      this.log('WARN', `Cannot query ${collection} - not connected`);
      return [];
    }

    const endpoint = this.collectionMap[collection.toLowerCase()];
    if (!endpoint) {
      this.log('WARN', `No endpoint mapping for collection: ${collection}`);
      return [];
    }

    try {
      this.requestCount++;
      let result;
      
      // Handle special collection types
      if (collection.toLowerCase() === 'nodes') {
        result = await endpoint.getNodes(query);
      } else if (collection.toLowerCase().startsWith('osint_')) {
        // Handle OSINT collections
        const osintType = collection.toLowerCase().replace('osint_', '');
        switch (osintType) {
          case 'domains':
            result = await endpoint.getDomains();
            break;
          case 'breaches':
            result = await endpoint.getBreaches();
            break;
          case 'geo':
            result = await endpoint.getGeo();
            break;
          case 'social':
            result = await endpoint.getSocial();
            break;
          default:
            result = [];
        }
      } else if (endpoint.getAll) {
        result = await endpoint.getAll(query);
      } else {
        result = [];
      }
      
      this.log('EXEC', `Queried ${collection}: ${Array.isArray(result) ? result.length : 0} items`);
      return Array.isArray(result) ? result : [];
    } catch (error) {
      this.log('ERROR', `Query failed for ${collection}: ${error instanceof Error ? error.message : 'Unknown error'}`);
      return [];
    }
  }

  getStats(): DatabaseStats {
    return {
      status: this.status,
      activeConnections: this.status === 'CONNECTED' ? 1 : 0,
      idleConnections: 0,
      latency: this.status === 'CONNECTED' ? Math.floor(Math.random() * 50) + 10 : 0,
      uptime: this.status === 'CONNECTED' ? Math.floor((Date.now() - this.startTime) / 1000) : 0,
      version: 'HTTP API v1.0',
      tps: this.requestCount,
    };
  }

  async maintenance(task: 'VACUUM' | 'REINDEX' | 'BACKUP' | 'ROTATE_CREDS'): Promise<string> {
    this.log('INFO', `Maintenance task not supported in HTTP mode: ${task}`);
    return `${task} not applicable for HTTP adapter`;
  }

  setAutoRecovery(enabled: boolean): void {
    this.log('INFO', `Auto-recovery ${enabled ? 'enabled' : 'disabled'}`);
  }

  simulateFailure(): void {
    this.status = 'ERROR';
    this.log('ERROR', 'Simulated connection failure');
  }

  private log(level: 'INFO' | 'WARN' | 'EXEC' | 'SUCCESS' | 'ERROR', msg: string): void {
    const entry = `[HTTP] ${new Date().toISOString().split('T')[1]} [${level}] ${msg}`;
    this.logs.unshift(entry);
    if (this.logs.length > 100) {
      this.logs = this.logs.slice(0, 100);
    }
  }
}
