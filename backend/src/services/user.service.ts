
import { User } from '../models/system';
import { AuditService } from './audit.service';

interface CreateUserInput {
  username: string;
  role: string;
  clearance: string;
  email?: string;
}

export class UserService {
  static async getAll(): Promise<User[]> {
    return await (User as any).findAll({
      attributes: ['id', 'username', 'role', 'clearance', 'status', 'last_login']
    });
  }

  static async createUser(data: CreateUserInput, adminId: string): Promise<User> {
    const id = `USR-${Date.now()}`;
    const user = await (User as any).create({
      id,
      username: data.username,
      role: data.role,
      clearance: data.clearance,
      status: 'ACTIVE',
      email: data.email
    });

    await AuditService.log(adminId, 'USER_PROVISIONED', `Provisioned user ${data.username}`, id);
    return user;
  }

  static async updateUserStatus(id: string, status: string, adminId: string): Promise<User | null> {
    const user = await (User as any).findByPk(id);
    if (user) {
      user.status = status;
      await user.save();
      await AuditService.log(adminId, 'USER_STATUS_CHANGE', `User ${id} status set to ${status}`, id);
      return user;
    }
    return null;
  }
}
