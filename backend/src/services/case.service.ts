
import { Case } from '../models/intelligence';
import { AuditService } from './audit.service';
import { ModelStatic, WhereOptions } from 'sequelize';

const CaseModel = Case as ModelStatic<Case>;

interface CaseFilter {
  status?: string;
  assignee?: string;
}

interface CreateCaseInput {
  title: string;
  description?: string;
  priority?: string;
  assignee?: string;
}

interface UpdateCaseInput extends Partial<CreateCaseInput> {
  status?: string;
}

export class CaseService {
  
  static async getAll(filters: CaseFilter, limit: number = 50): Promise<Case[]> {
    const whereClause: WhereOptions<Case> = {};
    if (filters.status) whereClause.status = filters.status;
    if (filters.assignee) whereClause.assignee = filters.assignee;

    return await CaseModel.findAll({
      where: whereClause,
      limit,
      order: [['createdAt', 'DESC']]
    });
  }

  static async create(data: CreateCaseInput, userId: string): Promise<Case> {
    const id = `CASE-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`;
    
    const newCase = await CaseModel.create({
      id,
      title: data.title,
      description: data.description || '',
      priority: data.priority || 'MEDIUM',
      status: 'OPEN',
      assignee: data.assignee || 'Unassigned',
      created_by: userId,
      related_threat_ids: [],
      shared_with: [],
      timeline: [],
      tasks: [],
      sla_breach: false
    } as Case);

    await AuditService.log(userId, 'CASE_CREATED', `Created case ${id}`, id);
    return newCase;
  }

  static async update(id: string, data: UpdateCaseInput, userId: string): Promise<Case | null> {
    const kase = await CaseModel.findByPk(id);
    if (kase) {
      await kase.update(data);
      await AuditService.log(userId, 'CASE_UPDATE', `Updated case ${id}`, id);
      return kase;
    }
    return null;
  }
}
