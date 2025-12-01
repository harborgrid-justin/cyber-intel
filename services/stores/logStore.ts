
import { AuditLog } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class LogStore extends BaseStore<AuditLog> {
  constructor(key: string, initialData: AuditLog[], adapter: DatabaseAdapter, mapper?: DataMapper<AuditLog>) {
    super(key, initialData, adapter, mapper);
  }

  log(action: string, user: string, details: string, location?: string) {
    const entry: AuditLog = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      action,
      user,
      timestamp: new Date().toISOString(),
      details,
      location
    };
    this.add(entry);
  }
}
