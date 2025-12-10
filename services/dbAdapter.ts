
import { apiClient } from './apiClient';
import { InitialDataFactory } from './initialData';

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
  type: 'SQL' | 'NOSQL' | 'MEMORY' | 'REMOTE';
  connect(config: DatabaseConfig): Promise<boolean>;
  disconnect(): Promise<void>;
  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>): void;
  query(collection: string, query?: Record<string, any>): Promise<any[]>;
  logs: string[];
  
  // Production Features
  getStats?(): DatabaseStats;
  maintenance?(task: 'VACUUM' | 'REINDEX' | 'BACKUP' | 'ROTATE_CREDS'): Promise<string>;
  setAutoRecovery?(enabled: boolean): void;
  simulateFailure?(): void;
}

export class MockAdapter implements DatabaseAdapter {
  name = 'Offline Mode (Local)';
  type = 'MEMORY' as const;
  logs: string[] = [];
  
  async connect(_config: DatabaseConfig) { 
    this.logs.unshift('[MOCK] System initialized in Offline Mode.');
    return true; 
  }
  
  async disconnect() { 
    this.logs.unshift('[MOCK] Disconnected.');
  }

  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>) {
    this.logs.unshift(`[MOCK] ${action} on ${collection}: ${JSON.stringify(data).substring(0, 50)}...`);
    // In a real mock, we would update the In-Memory arrays in DataLayer directly, 
    // but BaseStore handles the local state update for us. This is just for logging/persistence simulation.
  }

  async query(collection: string): Promise<any[]> {
    this.logs.unshift(`[MOCK] Querying ${collection}`);
    
    // Map collection names to Initial Data
    switch (collection) {
        case 'THREATS': return InitialDataFactory.getThreats();
        case 'CASES': return InitialDataFactory.getCases();
        case 'ACTORS': return InitialDataFactory.getActors();
        case 'CAMPAIGNS': return InitialDataFactory.getCampaigns();
        case 'FEEDS': return InitialDataFactory.getFeeds();
        case 'LOGS': return InitialDataFactory.getLogs();
        case 'VULNERABILITIES': return InitialDataFactory.getVulns();
        case 'ASSETS': return InitialDataFactory.getNodes();
        case 'REPORTS': return InitialDataFactory.getReports();
        case 'USERS': return InitialDataFactory.getUsers();
        case 'VENDORS': return InitialDataFactory.getVendors();
        case 'PLAYBOOKS': return InitialDataFactory.getPlaybooks();
        case 'CHAIN': return InitialDataFactory.getChain();
        case 'MALWARE': return InitialDataFactory.getMalware();
        case 'JOBS': return InitialDataFactory.getJobs();
        case 'DEVICES': return InitialDataFactory.getDevices();
        case 'PCAPS': return InitialDataFactory.getPcaps();
        case 'VENDOR_FEEDS': return InitialDataFactory.getVendorFeeds();
        case 'SCANNERS': return InitialDataFactory.getScanners();
        case 'MITRE_TACTICS': return InitialDataFactory.getMitreData().tactics;
        case 'MITRE_TECHNIQUES': return InitialDataFactory.getMitreData().techniques;
        case 'MITRE_SUB_TECHNIQUES': return InitialDataFactory.getMitreData().subTechniques;
        case 'MITRE_GROUPS': return InitialDataFactory.getMitreData().groups;
        case 'MITRE_SOFTWARE': return InitialDataFactory.getMitreData().software;
        case 'MITRE_MITIGATIONS': return InitialDataFactory.getMitreData().mitigations;
        case 'OSINT_DOMAINS': return InitialDataFactory.getOsintData().domains;
        case 'OSINT_BREACHES': return InitialDataFactory.getOsintData().breaches;
        case 'OSINT_GEO': return InitialDataFactory.getOsintData().geo;
        case 'OSINT_SOCIAL': return InitialDataFactory.getOsintData().social;
        case 'INTEGRATIONS': return InitialDataFactory.getConfigData().integrations;
        case 'PATCH_STATUS': return InitialDataFactory.getConfigData().patchStatus;
        case 'CHANNELS': return InitialDataFactory.getMessagingData().channels;
        default: return [];
    }
  }

  getStats(): DatabaseStats { 
    return { status: 'CONNECTED', activeConnections: 1, idleConnections: 0, latency: 0, uptime: 9999, version: 'Local-1.0', tps: 0 }; 
  }
}

export class PostgresAdapter implements DatabaseAdapter {
  name = 'PostgreSQL Enterprise Cluster';
  type = 'SQL' as const;
  logs: string[] = [];
  
  async connect(config: DatabaseConfig) { return true; }
  async disconnect() { }
  execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>) { }
  async query(collection: string) { return []; }
}

export class RemoteAdapter implements DatabaseAdapter {
  name = 'Sentinel Core API';
  type = 'REMOTE' as const;
  logs: string[] = [];
  private isConnected = false;

  async connect(_config: DatabaseConfig) {
    try {
      // Health check
      await apiClient.get('/health');
      this.isConnected = true;
      this.logs.unshift(`[API] Connected to Sentinel Core Backend`);
      return true;
    } catch (e) {
      this.isConnected = false;
      this.logs.unshift(`[API] Connection Failed: Backend unreachable`);
      return false;
    }
  }

  async disconnect() {
    this.isConnected = false;
  }

  async execute(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: Record<string, any>) {
    const endpoint = `/${collection.toLowerCase()}`;
    try {
      if (action === 'CREATE') {
        await apiClient.post(endpoint, data);
      } else if (action === 'UPDATE' && data.id) {
        await apiClient.post(`${endpoint}/${data.id}`, data); 
      } else if (action === 'DELETE' && data.id) {
        this.logs.unshift(`[API] DELETE ${endpoint}/${data.id} (Stub)`);
      }
      this.logs.unshift(`[API] ${action} ${collection} - Success`);
    } catch (e: any) {
      this.logs.unshift(`[API] ${action} ${collection} - Failed: ${e.message}`);
    }
  }

  async query(collection: string, _query?: Record<string, any>): Promise<any[]> {
    const endpoint = `/${collection.toLowerCase()}`;
    try {
      const result = await apiClient.get<any>(endpoint);
      return Array.isArray(result) ? result : (result as any).data || [];
    } catch (e: any) {
      this.logs.unshift(`[API] Query ${collection} - Failed: ${e.message}`);
      // Important: Throw error here so DataLayer catches it and switches to MockAdapter
      throw e; 
    }
  }
}
