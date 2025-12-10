
import { SystemUser } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';

export class UserStore extends BaseStore<SystemUser> {
  constructor(key: string, initialData: SystemUser[], adapter: DatabaseAdapter, mapper?: DataMapper<SystemUser>) {
    super(key, initialData, adapter, mapper);
  }

  updateStatus(id: string, status: SystemUser['status']) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const user = res.data;
      user.status = status;
      this.update(user);
    }
  }

  recordLogin(id: string) {
    const res = this.getById(id);
    if (res.success && res.data) {
      const user = res.data;
      user.lastLogin = new Date().toISOString();
      user.status = 'Online';
      this.update(user);
    }
  }

  getAdmins(): SystemUser[] {
    return this.items.filter(u => u.roleId === 'ROLE-ADMIN');
  }

  getOnline(): SystemUser[] {
    return this.items.filter(u => u.status === 'Online');
  }
}
