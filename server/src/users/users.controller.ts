import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { UsersService } from './users.service';
import { User } from '../models';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('role') role?: string): Promise<User[]> {
    try {
      return await this.usersService.findAll({ status, role });
    } catch (error) {
      throw new HttpException('Failed to retrieve users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<User> {
    try {
      const user = await this.usersService.findOne(id);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createUserDto: Omit<User, 'id' | 'createdAt' | 'updatedAt'>): Promise<User> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateUserDto: Partial<User>): Promise<User> {
    try {
      const user = await this.usersService.update(id, updateUserDto);
      if (!user) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return user;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.usersService.remove(id);
      if (!result) {
        throw new HttpException('User not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'User deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/lock')
  async lockUser(@Param('id') id: string, @Body() lockData: { reason: string; duration?: number }): Promise<User> {
    try {
      return await this.usersService.lockUser(id, lockData);
    } catch (error) {
      throw new HttpException('Failed to lock user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/unlock')
  async unlockUser(@Param('id') id: string): Promise<User> {
    try {
      return await this.usersService.unlockUser(id);
    } catch (error) {
      throw new HttpException('Failed to unlock user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  async getUserStats(): Promise<any> {
    try {
      return await this.usersService.getUserStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve user statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('active/list')
  async getActiveUsers(): Promise<User[]> {
    try {
      return await this.usersService.getActiveUsers();
    } catch (error) {
      throw new HttpException('Failed to retrieve active users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/last-login')
  async updateLastLogin(@Param('id') id: string): Promise<User | null> {
    try {
      return await this.usersService.updateLastLogin(id);
    } catch (error) {
      throw new HttpException('Failed to update last login', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}