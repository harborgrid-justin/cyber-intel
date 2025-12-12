
import { IoCFeed } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result, ok, fail, AppError } from '../../types/result';

export class FeedStore extends BaseStore<IoCFeed> {
  constructor(key: string, initialData: IoCFeed[], adapter: DatabaseAdapter, mapper?: DataMapper<IoCFeed>) {
    super(key, initialData, adapter, mapper);
  }

  toggleStatus(id: string): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const feed = res.data;
        feed.status = feed.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE';
        return this.update(feed);
      }
      return fail(new AppError('Feed not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to toggle feed status', 'SYSTEM', { originalError: e }));
    }
  }

  updateSyncTime(id: string, time: string): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const feed = res.data;
        feed.lastSync = time;
        return this.update(feed);
      }
      return fail(new AppError('Feed not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to update sync time', 'SYSTEM', { originalError: e }));
    }
  }

  setError(id: string): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const feed = res.data;
        feed.status = 'ERROR';
        feed.errorCount = (feed.errorCount || 0) + 1;
        return this.update(feed);
      }
      return fail(new AppError('Feed not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to set feed error', 'SYSTEM', { originalError: e }));
    }
  }
}
