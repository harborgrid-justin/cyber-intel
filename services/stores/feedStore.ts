
import { IoCFeed } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class FeedStore extends BaseStore<IoCFeed> {
  constructor(key: string, initialData: IoCFeed[], adapter: DatabaseAdapter, mapper?: DataMapper<IoCFeed>) {
    super(key, initialData, adapter, mapper);
  }

  toggleStatus(id: string) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const feed = res.data;
      feed.status = feed.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      this.update(feed);
    }
  }

  updateSyncTime(id: string, time: string) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const feed = res.data;
      feed.lastSync = time;
      this.update(feed);
    }
  }

  setError(id: string) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const feed = res.data;
      feed.status = 'ERROR';
      feed.errorCount = (feed.errorCount || 0) + 1;
      this.update(feed);
    }
  }
}
