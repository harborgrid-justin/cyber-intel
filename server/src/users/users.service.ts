import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models';
import { Op } from 'sequelize';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private userModel: typeof User,
  ) {}

  async findAll(filters?: { status?: string; role?: string }): Promise<User[]> {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.role) {
      where.role = filters.role;
    }
    return this.userModel.findAll({ where });
  }

  async findOne(id: string): Promise<User | null> {
    return this.userModel.findByPk(id);
  }

  async create(createUserDto: any): Promise<User> {
    if (!createUserDto.id) {
      createUserDto.id = `user-${Date.now()}`;
    }
    return this.userModel.create(createUserDto);
  }

  async update(id: string, updateUserDto: any): Promise<User | null> {
    const [affectedCount] = await this.userModel.update(updateUserDto, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.userModel.findByPk(id);
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.userModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async lockUser(id: string, lockData: { reason: string; duration?: number }): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.update(id, {
      status: 'Suspended',
      // Store lock reason in preferences temporarily
      preferences: { ...user.preferences, locked: { reason: lockData.reason, duration: lockData.duration || 0 } }
    }) as User;
  }

  async unlockUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove lock metadata from preferences
    const updatedPreferences = { ...user.preferences };
    delete updatedPreferences.locked;

    return await this.update(id, {
      status: 'Active',
      preferences: updatedPreferences
    }) as User;
  }

  async getUserStats(): Promise<any> {
    const users = await this.userModel.findAll();
    const total = users.length;
    const active = users.filter(u => u.status === 'Active').length;
    const inactive = users.filter(u => u.status === 'Inactive').length;
    const suspended = users.filter(u => u.status === 'Suspended').length;

    const roles = users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      active,
      inactive,
      suspended,
      roles,
      activeRate: Math.round((active / total) * 100)
    };
  }

  async getActiveUsers(): Promise<User[]> {
    return this.userModel.findAll({
      where: {
        status: 'Active'
      }
    });
  }

  async updateLastLogin(id: string): Promise<User | null> {
    return await this.update(id, {
      lastLogin: new Date(),
      status: 'Active'
    });
  }
}