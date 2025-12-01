import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import { User } from '../models';
import { CreateUserDto, UpdateUserDto, LockUserDto, UserStatsDto } from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @ApiOperation({ summary: 'Get all users with optional filters' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by user status', enum: ['Active', 'Inactive', 'Suspended'] })
  @ApiQuery({ name: 'role', required: false, description: 'Filter by user role', enum: ['Admin', 'Analyst', 'Operator', 'Viewer'] })
  @ApiResponse({ status: 200, description: 'Returns list of users' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('status') status?: string,
    @Query('role') role?: string,
  ): Promise<User[]> {
    try {
      return await this.usersService.findAll({ status, role });
    } catch (error) {
      throw new HttpException('Failed to retrieve users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get user statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns user statistics', type: UserStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserStats(): Promise<UserStatsDto> {
    try {
      return await this.usersService.getUserStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve user statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('active/list')
  @ApiOperation({ summary: 'Get list of active users' })
  @ApiResponse({ status: 200, description: 'Returns list of active users' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getActiveUsers(): Promise<User[]> {
    try {
      return await this.usersService.getActiveUsers();
    } catch (error) {
      throw new HttpException('Failed to retrieve active users', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get user by ID' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user-001' })
  @ApiResponse({ status: 200, description: 'Returns the user' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new user' })
  @ApiBody({ type: CreateUserDto })
  @ApiResponse({ status: 201, description: 'User created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createUserDto: CreateUserDto): Promise<User> {
    try {
      return await this.usersService.create(createUserDto);
    } catch (error) {
      throw new HttpException('Failed to create user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user-001' })
  @ApiBody({ type: UpdateUserDto })
  @ApiResponse({ status: 200, description: 'User updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<User> {
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a user' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user-001' })
  @ApiResponse({ status: 200, description: 'User deleted successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Lock a user account' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user-001' })
  @ApiBody({ type: LockUserDto })
  @ApiResponse({ status: 200, description: 'User locked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async lockUser(
    @Param('id') id: string,
    @Body() lockData: LockUserDto,
  ): Promise<User> {
    try {
      return await this.usersService.lockUser(id, lockData);
    } catch (error) {
      throw new HttpException('Failed to lock user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/unlock')
  @ApiOperation({ summary: 'Unlock a user account' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user-001' })
  @ApiResponse({ status: 200, description: 'User unlocked successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async unlockUser(@Param('id') id: string): Promise<User> {
    try {
      return await this.usersService.unlockUser(id);
    } catch (error) {
      throw new HttpException('Failed to unlock user', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/last-login')
  @ApiOperation({ summary: 'Update user last login timestamp' })
  @ApiParam({ name: 'id', description: 'User ID', example: 'user-001' })
  @ApiResponse({ status: 200, description: 'Last login updated successfully' })
  @ApiResponse({ status: 404, description: 'User not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateLastLogin(@Param('id') id: string): Promise<User | null> {
    try {
      return await this.usersService.updateLastLogin(id);
    } catch (error) {
      throw new HttpException('Failed to update last login', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
