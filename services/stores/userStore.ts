
import { SystemUser } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result, ok, fail, AppError } from '../../types/result';
import { bus, EVENTS } from '../eventBus';

export class UserStore extends BaseStore<SystemUser> {
  constructor(key: string, initialData: SystemUser[], adapter: DatabaseAdapter, mapper?: DataMapper<SystemUser>) {
    super(key, initialData, adapter, mapper);
  }

  updateStatus(id: string, status: SystemUser['status']): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const user = res.data;
        user.status = status;
        const result = this.update(user);
        // Emit user update event
        bus.emit(EVENTS.USER_UPDATE, { userId: id, status });
        return result;
      }
      return fail(new AppError('User not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to update user status', 'SYSTEM', { originalError: e }));
    }
  }

  recordLogin(id: string): Result<void> {
    try {
      const res = this.getById(id);
      if (res.success && res.data) {
        const user = res.data;
        user.lastLogin = new Date().toISOString();
        user.status = 'Online';
        const result = this.update(user);
        bus.emit(EVENTS.USER_UPDATE, { userId: id, action: 'login' });
        return result;
      }
      return fail(new AppError('User not found', 'VALIDATION'));
    } catch (e) {
      return fail(new AppError('Failed to record login', 'SYSTEM', { originalError: e }));
    }
  }

  getAdmins(): SystemUser[] {
    return this.items.filter(u => u.roleId === 'ROLE-ADMIN');
  }

  getOnline(): SystemUser[] {
    return this.items.filter(u => u.status === 'Online');
  }
}
