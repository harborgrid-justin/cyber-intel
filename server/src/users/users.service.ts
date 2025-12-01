import { Injectable, NotFoundException } from '@nestjs/common';
import { SystemUser } from '@/types';

@Injectable()
export class UsersService {
  private users: SystemUser[] = [
    {
      id: 'user-001',
      name: 'Alice Johnson',
      role: 'Senior Analyst',
      clearance: 'TOP_SECRET',
      status: 'Online',
      lastLogin: '2024-12-01T08:30:00Z',
      casesResolved24h: 3,
      email: 'alice.johnson@agency.gov',
      isVIP: false
    },
    {
      id: 'user-002',
      name: 'Bob Smith',
      role: 'Threat Hunter',
      clearance: 'SECRET',
      status: 'Busy',
      lastLogin: '2024-12-01T07:15:00Z',
      casesResolved24h: 5,
      email: 'bob.smith@agency.gov',
      isVIP: true
    },
    {
      id: 'user-003',
      name: 'Carol Williams',
      role: 'SOC Lead',
      clearance: 'TOP_SECRET',
      status: 'LOCKED',
      lastLogin: '2024-11-30T18:45:00Z',
      casesResolved24h: 0,
      email: 'carol.williams@agency.gov',
      isVIP: true
    },
    {
      id: 'user-004',
      name: 'David Brown',
      role: 'Junior Analyst',
      clearance: 'CONFIDENTIAL',
      status: 'FATIGUED',
      lastLogin: '2024-12-01T06:00:00Z',
      casesResolved24h: 12,
      email: 'david.brown@agency.gov',
      isVIP: false
    }
  ];

  async findAll(filters?: { status?: string; role?: string }): Promise<SystemUser[]> {
    let result = [...this.users];

    if (filters?.status) {
      result = result.filter(user => user.status === filters.status);
    }

    if (filters?.role) {
      result = result.filter(user => user.role === filters.role);
    }

    return result.sort((a, b) => {
      const statusOrder = { 'Online': 1, 'Busy': 2, 'Offline': 3, 'LOCKED': 4, 'FATIGUED': 5 };
      return (statusOrder[a.status as keyof typeof statusOrder] || 6) -
             (statusOrder[b.status as keyof typeof statusOrder] || 6);
    });
  }

  async findOne(id: string): Promise<SystemUser | null> {
    return this.users.find(user => user.id === id) || null;
  }

  async create(createUserDto: Omit<SystemUser, 'id'>): Promise<SystemUser> {
    const newUser: SystemUser = {
      ...createUserDto,
      id: `user-${Date.now()}`
    };

    this.users.push(newUser);
    return newUser;
  }

  async update(id: string, updateUserDto: Partial<SystemUser>): Promise<SystemUser | null> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return null;
    }

    this.users[index] = { ...this.users[index], ...updateUserDto };
    return this.users[index];
  }

  async remove(id: string): Promise<boolean> {
    const index = this.users.findIndex(user => user.id === id);
    if (index === -1) {
      return false;
    }

    this.users.splice(index, 1);
    return true;
  }

  async lockUser(id: string, lockData: { reason: string; duration?: number }): Promise<SystemUser> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    return await this.update(id, {
      status: 'LOCKED',
      // Store lock reason in email field temporarily (in real app, use separate field)
      email: `${user.email}|LOCKED:${lockData.reason}:${lockData.duration || 0}`
    }) as SystemUser;
  }

  async unlockUser(id: string): Promise<SystemUser> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove lock metadata from email
    const cleanEmail = user.email?.split('|LOCKED:')[0] || user.email;

    return await this.update(id, {
      status: 'Online',
      email: cleanEmail
    }) as SystemUser;
  }

  async getUserStats(): Promise<any> {
    const total = this.users.length;
    const online = this.users.filter(u => u.status === 'Online').length;
    const busy = this.users.filter(u => u.status === 'Busy').length;
    const locked = this.users.filter(u => u.status === 'LOCKED').length;
    const fatigued = this.users.filter(u => u.status === 'FATIGUED').length;
    const vipUsers = this.users.filter(u => u.isVIP).length;

    const roles = this.users.reduce((acc, user) => {
      acc[user.role] = (acc[user.role] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const clearances = this.users.reduce((acc, user) => {
      acc[user.clearance] = (acc[user.clearance] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgCasesResolved = this.users.reduce((sum, user) => sum + (user.casesResolved24h || 0), 0) / total;

    return {
      total,
      online,
      busy,
      locked,
      fatigued,
      vipUsers,
      roles,
      clearances,
      avgCasesResolved: Math.round(avgCasesResolved * 10) / 10,
      activeRate: Math.round(((online + busy) / total) * 100)
    };
  }

  async getVIPUsers(): Promise<SystemUser[]> {
    return this.users.filter(user => user.isVIP);
  }

  async performFatigueCheck(id: string): Promise<{ fatigueLevel: string; recommendations: string[] }> {
    const user = await this.findOne(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const casesResolved = user.casesResolved24h || 0;
    let fatigueLevel = 'Normal';
    const recommendations: string[] = [];

    if (casesResolved > 10) {
      fatigueLevel = 'High';
      recommendations.push('Consider mandatory break');
      recommendations.push('Reduce case load for next 24 hours');
      recommendations.push('Schedule fatigue assessment');
    } else if (casesResolved > 7) {
      fatigueLevel = 'Moderate';
      recommendations.push('Monitor for signs of fatigue');
      recommendations.push('Ensure adequate rest periods');
    } else if (casesResolved > 4) {
      fatigueLevel = 'Low';
      recommendations.push('Continue monitoring workload');
    }

    // Update user status if highly fatigued
    if (fatigueLevel === 'High' && user.status !== 'FATIGUED') {
      await this.update(id, { status: 'FATIGUED' });
    }

    return { fatigueLevel, recommendations };
  }

  async getActiveUsers(): Promise<SystemUser[]> {
    return this.users.filter(user =>
      user.status === 'Online' || user.status === 'Busy'
    );
  }

  async getUsersByClearance(clearance: string): Promise<SystemUser[]> {
    return this.users.filter(user => user.clearance === clearance);
  }

  async updateLastLogin(id: string): Promise<SystemUser | null> {
    return await this.update(id, {
      lastLogin: new Date().toISOString(),
      status: 'Online'
    });
  }
}