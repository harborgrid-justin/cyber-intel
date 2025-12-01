import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { User } from '../models';
import { CreateUserDto, UpdateUserDto, LockUserDto, UserStatsDto } from './dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User)
    private readonly userModel: typeof User,
  ) {}

  async findAll(filters?: { status?: string; role?: string }): Promise<User[]> {
    const where: Record<string, string> = {};
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

  async create(createUserDto: CreateUserDto): Promise<User> {
    const userData = {
      username: createUserDto.name,
      email: createUserDto.email,
      role: createUserDto.role,
      status: createUserDto.status || 'Active',
      preferences: createUserDto.preferences,
      id: `user-${Date.now()}`,
    };
    return this.userModel.create(userData as any);
  }

  async update(id: string, updateUserDto: UpdateUserDto): Promise<User | null> {
    const [affectedCount] = await this.userModel.update(updateUserDto as any, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.userModel.findByPk(id);
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.userModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async lockUser(id: string, lockData: LockUserDto): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    // Store lock reason and duration for audit purposes
    const lockMetadata = {
      reason: lockData.reason,
      duration: lockData.duration,
      lockedAt: new Date().toISOString(),
    };

    const updatedUser = await this.update(id, {
      status: 'Suspended',
      preferences: { ...((user.preferences as object) || {}), lockMetadata },
    } as UpdateUserDto);

    return updatedUser as User;
  }

  async unlockUser(id: string): Promise<User> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const updatedUser = await this.update(id, {
      status: 'Active',
    } as UpdateUserDto);

    return updatedUser as User;
  }

  async getUserStats(): Promise<UserStatsDto> {
    const users = await this.userModel.findAll();
    const total = users.length;
    const active = users.filter((u) => u.status === 'Active').length;
    const inactive = users.filter((u) => u.status === 'Inactive').length;
    const suspended = users.filter((u) => u.status === 'Suspended').length;

    const roles = users.reduce(
      (acc, user) => {
        acc[user.role] = (acc[user.role] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    return {
      total,
      active,
      inactive,
      suspended,
      roles,
      activeRate: total > 0 ? Math.round((active / total) * 100) : 0,
    };
  }

  async getActiveUsers(): Promise<User[]> {
    return this.userModel.findAll({
      where: {
        status: 'Active',
      },
    });
  }

  async updateLastLogin(id: string): Promise<User | null> {
    const [affectedCount] = await this.userModel.update(
      {
        lastLogin: new Date(),
        status: 'Active',
      },
      { where: { id } },
    );
    if (affectedCount === 0) {
      return null;
    }
    return this.userModel.findByPk(id);
  }
}
