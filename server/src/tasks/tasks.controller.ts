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
import { TasksService } from './tasks.service';
import { Task } from '../models';
import { CreateTaskDto, UpdateTaskDto, UpdateTaskStatusDto, TaskStatsDto } from './dto';

@ApiTags('tasks')
@Controller('tasks')
export class TasksController {
  constructor(private readonly tasksService: TasksService) {}

  @Get()
  @ApiOperation({ summary: 'Get all tasks with optional filters' })
  @ApiQuery({ name: 'status', required: false, description: 'Filter by task status', enum: ['PENDING', 'DONE', 'SKIPPED'] })
  @ApiQuery({ name: 'priority', required: false, description: 'Filter by priority', enum: ['Low', 'Medium', 'High', 'Critical'] })
  @ApiQuery({ name: 'assignee', required: false, description: 'Filter by assignee name' })
  @ApiQuery({ name: 'caseId', required: false, description: 'Filter by case ID' })
  @ApiResponse({ status: 200, description: 'Returns list of tasks' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('status') status?: string,
    @Query('priority') priority?: string,
    @Query('assignee') assignee?: string,
    @Query('caseId') caseId?: string,
  ): Promise<Task[]> {
    try {
      return await this.tasksService.findAll({ status, priority, assignee, caseId });
    } catch (error) {
      throw new HttpException('Failed to retrieve tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get task statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns task statistics', type: TaskStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTaskStats(): Promise<TaskStatsDto> {
    try {
      return await this.tasksService.getTaskStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve task statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('overdue/list')
  @ApiOperation({ summary: 'Get list of overdue tasks' })
  @ApiResponse({ status: 200, description: 'Returns list of overdue tasks' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getOverdueTasks(): Promise<Task[]> {
    try {
      return await this.tasksService.getOverdueTasks();
    } catch (error) {
      throw new HttpException('Failed to retrieve overdue tasks', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get tasks for a specific case' })
  @ApiParam({ name: 'caseId', description: 'Case ID', example: 'case-001' })
  @ApiResponse({ status: 200, description: 'Returns tasks for the case' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTasksByCase(@Param('caseId') caseId: string): Promise<Task[]> {
    try {
      return await this.tasksService.getTasksByCase(caseId);
    } catch (error) {
      throw new HttpException('Failed to retrieve tasks for case', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('assignee/:assignee')
  @ApiOperation({ summary: 'Get tasks assigned to a specific user' })
  @ApiParam({ name: 'assignee', description: 'Assignee name', example: 'John Doe' })
  @ApiResponse({ status: 200, description: 'Returns tasks assigned to the user' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getTasksByAssignee(@Param('assignee') assignee: string): Promise<Task[]> {
    try {
      return await this.tasksService.getTasksByAssignee(assignee);
    } catch (error) {
      throw new HttpException('Failed to retrieve tasks for assignee', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get task by ID' })
  @ApiParam({ name: 'id', description: 'Task ID', example: 'task-001' })
  @ApiResponse({ status: 200, description: 'Returns the task' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new task' })
  @ApiBody({ type: CreateTaskDto })
  @ApiResponse({ status: 201, description: 'Task created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createTaskDto: CreateTaskDto): Promise<Task> {
    try {
      return await this.tasksService.create(createTaskDto);
    } catch (error) {
      throw new HttpException('Failed to create task', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: 'task-001' })
  @ApiBody({ type: UpdateTaskDto })
  @ApiResponse({ status: 200, description: 'Task updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateTaskDto: UpdateTaskDto,
  ): Promise<Task> {
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

  @Put(':id/status')
  @ApiOperation({ summary: 'Update task status' })
  @ApiParam({ name: 'id', description: 'Task ID', example: 'task-001' })
  @ApiBody({ type: UpdateTaskStatusDto })
  @ApiResponse({ status: 200, description: 'Task status updated successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateStatus(
    @Param('id') id: string,
    @Body() body: UpdateTaskStatusDto,
  ): Promise<Task> {
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

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a task' })
  @ApiParam({ name: 'id', description: 'Task ID', example: 'task-001' })
  @ApiResponse({ status: 200, description: 'Task deleted successfully' })
  @ApiResponse({ status: 404, description: 'Task not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
}
