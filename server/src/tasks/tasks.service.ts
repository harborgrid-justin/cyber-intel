import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Task } from '../models';
import { Op } from 'sequelize';

@Injectable()
export class TasksService {
  constructor(
    @InjectModel(Task)
    private taskModel: typeof Task,
  ) {}

  async findAll(filters?: { status?: string; priority?: string; assignedTo?: string; caseId?: string }): Promise<Task[]> {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.priority) {
      where.priority = filters.priority;
    }
    if (filters?.assignedTo) {
      where.assignedTo = filters.assignedTo;
    }
    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }
    return this.taskModel.findAll({
      where,
      include: ['case', 'assignedUser'],
      order: [['createdAt', 'DESC']]
    });
  }

  async findOne(id: string): Promise<Task | null> {
    return this.taskModel.findByPk(id, {
      include: ['case', 'assignedUser']
    });
  }

  async create(createTaskDto: any): Promise<Task> {
    if (!createTaskDto.id) {
      createTaskDto.id = `task-${Date.now()}`;
    }
    return this.taskModel.create(createTaskDto);
  }

  async update(id: string, updateTaskDto: any): Promise<Task | null> {
    const [affectedCount] = await this.taskModel.update(updateTaskDto, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.taskModel.findByPk(id, {
      include: ['case', 'assignedUser']
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
      order: [['createdAt', 'ASC']]
    });
  }

  async getTasksByAssignee(assignedTo: string): Promise<Task[]> {
    return this.taskModel.findAll({
      where: { assignedTo },
      include: ['case'],
      order: [['dueDate', 'ASC']]
    });
  }

  async updateStatus(id: string, status: string): Promise<Task | null> {
    return this.update(id, { status });
  }

  async getTaskStats(): Promise<any> {
    const total = await this.taskModel.count();
    const pending = await this.taskModel.count({ where: { status: 'Pending' } });
    const inProgress = await this.taskModel.count({ where: { status: 'In Progress' } });
    const completed = await this.taskModel.count({ where: { status: 'Completed' } });
    const overdue = await this.taskModel.count({
      where: {
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'Completed' }
      }
    });

    return {
      total,
      pending,
      inProgress,
      completed,
      overdue,
      completionRate: total > 0 ? Math.round((completed / total) * 100) : 0
    };
  }

  async getOverdueTasks(): Promise<Task[]> {
    return this.taskModel.findAll({
      where: {
        dueDate: { [Op.lt]: new Date() },
        status: { [Op.ne]: 'Completed' }
      },
      include: ['case', 'assignedUser'],
      order: [['dueDate', 'ASC']]
    });
  }
}