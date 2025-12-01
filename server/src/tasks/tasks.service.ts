import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from '../models';
import { Op } from 'sequelize';
import { CreateTaskDto, UpdateTaskDto, TaskStatsDto } from './dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task)
    private readonly taskModel: typeof Task,
  ) {}

  async findAll(filters?: {
    status?: string;
    priority?: string;
    assignee?: string;
    caseId?: string;
  }): Promise<Task[]> {
    const where: Record<string, string> = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.assignee) {
      where.assignee = filters.assignee;
    }
    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }
    return this.taskModel.findAll({
      where,
      include: ['case'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Task | null> {
    return this.taskModel.findByPk(id, {
      include: ['case', 'assignedUser'],
    });
  }

  async create(createTaskDto: CreateTaskDto): Promise<Task> {
    const taskData = {
      ...createTaskDto,
      id: `task-${Date.now()}`,
    };
    return this.taskModel.create(taskData as any);
  }

  async update(id: string, updateTaskDto: UpdateTaskDto): Promise<Task | null> {
    const [affectedCount] = await this.taskModel.update(updateTaskDto as any, {
      where: { id },
    });
    if (affectedCount === 0) {
      return null;
    }
    return this.taskModel.findByPk(id, {
      include: ['case', 'assignedUser'],
    });
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.taskModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async getTasksByCase(caseId: string): Promise<Task[]> {
    return this.taskModel.findAll({
      where: { caseId },
      include: ['assignedUser'],
      order: [['createdAt', 'ASC']],
    });
  }

  async getTasksByAssignee(assignee: string): Promise<Task[]> {
    return this.taskModel.findAll({
      where: { assignee },
      include: ['case'],
      order: [['dueDate', 'ASC']],
    });
  }

  async updateStatus(id: string, status: string): Promise<Task | null> {
    return this.update(id, { status } as UpdateTaskDto);
  }

  async getTaskStats(): Promise<TaskStatsDto> {
    const total = await this.taskModel.count();
    const pending = await this.taskModel.count({ where: { status: 'Pending' } });
    const inProgress = await this.taskModel.count({
      where: { status: 'In Progress' },
    });
    const completed = await this.taskModel.count({
      where: { status: 'Completed' },
    });
    const overdue = await this.taskModel.count({
      where: {
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'Completed' },
      },
    });

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0,
    };
  }

  async getOverdueTasks(): Promise<Task[]> {
    return this.taskModel.findAll({
      where: {
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'Completed' },
      },
      include: ['case', 'assignedUser'],
      order: [['dueDate', 'ASC']],
    });
  }
}
