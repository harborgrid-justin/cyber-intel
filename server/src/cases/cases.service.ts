import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Case } from '../models/case.model';
import { Op } from 'sequelize';

@Injectable()
export class CasesService {
  constructor(
    @InjectModel(Case)
    private caseModel: typeof Case,
  ) {}

  async findAll(): Promise<Case[]> {
    return this.caseModel.findAll({
      include: ['threat', 'evidence'],
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Case> {
    return this.caseModel.findByPk(id, {
      include: ['threat', 'evidence'],
    });
  }

  async create(caseData: Partial<Case>): Promise<Case> {
    return this.caseModel.create(caseData);
  }

  async update(id: string, caseData: Partial<Case>): Promise<Case> {
    const caseItem = await this.caseModel.findByPk(id);
    if (!caseItem) {
      throw new Error('Case not found');
    }
    await caseItem.update(caseData);
    return caseItem;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const result = await this.caseModel.destroy({ where: { id } });
    return { deleted: result > 0 };
  }

  async findByStatus(status: string): Promise<Case[]> {
    return this.caseModel.findAll({
      where: { status },
      include: ['threat', 'evidence'],
    });
  }

  async findByPriority(priority: string): Promise<Case[]> {
    return this.caseModel.findAll({
      where: { priority },
      include: ['threat', 'evidence'],
    });
  }

  async findByAssignedTo(assignedTo: string): Promise<Case[]> {
    return this.caseModel.findAll({
      where: { assignee: { [Op.iLike]: `%${assignedTo}%` } },
      include: ['evidence'],
    });
  }
}
