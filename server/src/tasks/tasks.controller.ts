import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { TasksService } from './tasks.service';
import { Task } from '../models';

@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignedTo') assignedTo?: string,
    @Query('caseId') caseId?: string
  ): Promise<Task[]> {
    try {
      return await this.tasksService.findAll({ status, priority, assignedTo, caseId });
    } catch (error) {
      throw new HttpException('Failed to retrieve tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Task> {
    try {
      const task = await this.tasksService.findOne(id);
      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      return task;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createTaskDto: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    try {
      return await this.tasksService.create(createTaskDto);
    } catch (error) {
      throw new HttpException('Failed to create task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateTaskDto: Partial<Task>): Promise<Task> {
    try {
      const task = await this.tasksService.update(id, updateTaskDto);
      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      return task;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.tasksService.remove(id);
      if (!result) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Task deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('case/:caseId')
  async getTasksByCase(@Param('caseId') caseId: string): Promise<Task[]> {
    try {
      return await this.tasksService.getTasksByCase(caseId);
    } catch (error) {
      throw new HttpException('Failed to retrieve tasks for case', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('assignee/:assignedTo')
  async getTasksByAssignee(@Param('assignedTo') assignedTo: string): Promise<Task[]> {
    try {
      return await this.tasksService.getTasksByAssignee(assignedTo);
    } catch (error) {
      throw new HttpException('Failed to retrieve tasks for assignee', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/status')
  async updateStatus(@Param('id') id: string, @Body() body: { status: string }): Promise<Task> {
    try {
      const task = await this.tasksService.updateStatus(id, body.status);
      if (!task) {
        throw new HttpException('Task not found', HttpStatus.NOT_FOUND);
      }
      return task;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update task status', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  async getTaskStats(): Promise<any> {
    try {
      return await this.tasksService.getTaskStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve task statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('overdue/list')
  async getOverdueTasks(): Promise<Task[]> {
    try {
      return await this.tasksService.getOverdueTasks();
    } catch (error) {
      throw new HttpException('Failed to retrieve overdue tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}