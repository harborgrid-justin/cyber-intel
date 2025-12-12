
import { AuditLog } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result } from '../../types/result';

export class LogStore extends BaseStore<AuditLog> {
  constructor(key: string, initialData: AuditLog[], adapter: DatabaseAdapter, mapper?: DataMapper<AuditLog>) {
    super(key, initialData, adapter, mapper);
  }

  log(action: string, user: string, details: string, location?: string): Result<void> {
    const entry: AuditLog = {
      id: `LOG-${Date.now()}-${Math.floor(Math.random() * 10000)}`,
      action,
      user,
      timestamp: new Date().toISOString(),
      details,
      location
    };
    return this.add(entry);
  }

  generateExport(): { url: string, filename: string } {
    const csvContent = "data:text/csv;charset=utf-8," 
      + "ID,Action,User,Timestamp,Details,Location\n"
      + this.items.map(l => `${l.id},${l.action},${l.user},${l.timestamp},${l.details.replace(/,/g, '')},${l.location}`).join("\n");
    
    return {
      url: encodeURI(csvContent),
      filename: `audit_export_${new Date().toISOString().split('T')[0]}.csv`
    };
  }

  getArchivedLogs(): { id: string, date: string, size: string, status: string }[] {
    // Simulate retrieving list of cold storage logs
    return [
      { id: 'ARC-2023-09', date: '2023-09-30', size: '1.2 GB', status: 'FROZEN' },
      { id: 'ARC-2023-08', date: '2023-08-31', size: '1.1 GB', status: 'FROZEN' },
      { id: 'ARC-2023-07', date: '2023-07-31', size: '0.9 GB', status: 'GLACIER' },
    ];
  }
}
