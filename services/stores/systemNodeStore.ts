
import { SystemNode } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class SystemNodeStore extends BaseStore<SystemNode> {
  constructor(key: string, initialData: SystemNode[], adapter: DatabaseAdapter, mapper?: DataMapper<SystemNode>) {
    super(key, initialData, adapter, mapper);
  }

  updateMetrics(id: string, load: number, latency: number) {
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
      this.update(node);
    }
  }

  isolateNode(id: string) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const node = res.data;
      node.status = 'ISOLATED';
      this.update(node);
    }
  }

  restoreNode(id: string) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const node = res.data;
      node.status = 'ONLINE'; // Will be corrected by next metric pulse
      this.update(node);
    }
  }
}
