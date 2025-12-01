
import { IoCFeed } from '../src/types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class FeedStore extends BaseStore<IoCFeed> {
  constructor(key: string, initialData: IoCFeed[], adapter: DatabaseAdapter, mapper?: DataMapper<IoCFeed>) {
    super(key, initialData, adapter, mapper);
  }

  toggleStatus(id: string) {
    const feed = this.getById(id);
    if (feed) {
      feed.status = feed.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
      this.update(feed);
    }
  }

  updateSyncTime(id: string, time: string) {
    const feed = this.getById(id);
    if (feed) {
      feed.lastSync = time;
      this.update(feed);
    }
  }

  setError(id: string) {
    const feed = this.getById(id);
    if (feed) {
      feed.status = 'ERROR';
      feed.errorCount = (feed.errorCount || 0) + 1;
      this.update(feed);
    }
  }
}
