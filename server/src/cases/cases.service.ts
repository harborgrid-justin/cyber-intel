import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Case } from '../models/case.model';
import { Op } from 'sequelize';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';

@Injectable()
export class CasesService {
  constructor(
    @InjectModel(Case)
    private readonly caseModel: typeof Case,
  ) {}

  async findAll(): Promise<Case[]> {
    return this.caseModel.findAll({
      order: [['createdAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<Case> {
    const caseItem = await this.caseModel.findByPk(id);
    if (!caseItem) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    return caseItem;
  }

  async create(caseData: CreateCaseDto): Promise<Case> {
    return this.caseModel.create(caseData as any);
  }

  async update(id: string, caseData: UpdateCaseDto): Promise<Case> {
    const caseItem = await this.caseModel.findByPk(id);
    if (!caseItem) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    await caseItem.update(caseData);
    return caseItem;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const caseItem = await this.caseModel.findByPk(id);
    if (!caseItem) {
      throw new NotFoundException(`Case with ID ${id} not found`);
    }
    const result = await this.caseModel.destroy({ where: { id } });
    return { deleted: result > 0 };
  }

  async findByStatus(status: string): Promise<Case[]> {
    return this.caseModel.findAll({
      where: { status },
    });
  }

  async findByPriority(priority: string): Promise<Case[]> {
    return this.caseModel.findAll({
      where: { priority },
    });
  }

  async findByAssignedTo(assignedTo: string): Promise<Case[]> {
    return this.caseModel.findAll({
      where: { assignee: { [Op.iLike]: `%${assignedTo}%` } },
      include: ['evidence'],
    });
  }
}
