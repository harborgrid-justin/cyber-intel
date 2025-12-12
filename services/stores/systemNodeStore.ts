
import { SystemNode } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result, ok, fail, AppError } from '../../types/result';

export class SystemNodeStore extends BaseStore<SystemNode> {
  constructor(key: string, initialData: SystemNode[], adapter: DatabaseAdapter, mapper?: DataMapper<SystemNode>) {
    super(key, initialData, adapter, mapper);
  }

  updateMetrics(id: string, load: number, latency: number): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const node = res.data;
        // Simple logic to set status based on metrics
        let status: SystemNode['status'] = 'ONLINE';
        if (load > 90 || latency > 500) status = 'DEGRADED';
        if (load === 0 && latency === 0) status = 'OFFLINE';

        // Preserve manual ISOLATED status
        if (node.status === 'ISOLATED') status = 'ISOLATED';

        node.load = load;
        node.latency = latency;
        node.status = status;
        return this.update(node);
      }
      return fail(new AppError('Node not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to update node metrics', 'SYSTEM', { originalError: e }));
    }
  }

  isolateNode(id: string): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const node = res.data;
        node.status = 'ISOLATED';
        return this.update(node);
      }
      return fail(new AppError('Node not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to isolate node', 'SYSTEM', { originalError: e }));
    }
  }

  restoreNode(id: string): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const node = res.data;
        node.status = 'ONLINE'; // Will be corrected by next metric pulse
        return this.update(node);
      }
      return fail(new AppError('Node not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to restore node', 'SYSTEM', { originalError: e }));
    }
  }
}
