
import { SystemUser } from '@/types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class UserStore extends BaseStore<SystemUser> {
  constructor(key: string, initialData: SystemUser[], adapter: DatabaseAdapter, mapper?: DataMapper<SystemUser>) {
    super(key, initialData, adapter, mapper);
  }

  updateStatus(id: string, status: SystemUser['status']) {
    const user = this.getById(id);
    if (user) {
      user.status = status;
      this.update(user);
    }
  }

  recordLogin(id: string) {
    const user = this.getById(id);
    if (user) {
      user.lastLogin = new Date().toISOString();
      user.status = 'Online';
      this.update(user);
    }
  }

  getAdmins(): SystemUser[] {
    return this.items.filter(u => u.role === 'Admin');
  }

  getOnline(): SystemUser[] {
    return this.items.filter(u => u.status === 'Online');
  }
}
