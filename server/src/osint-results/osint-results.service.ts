import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { OsintResult } from '../models';

@Injectable()
export class OsintResultsService {
  constructor(
    @InjectModel(OsintResult)
    private osintResultModel: typeof OsintResult,
  ) {}

  async findAll(filters?: { source?: string; type?: string; caseId?: string }): Promise<OsintResult[]> {
    const where: any = {};
    if (filters?.source) {
      where.source = filters.source;
    }
    if (filters?.type) {
      where.type = filters.type;
    }
    if (filters?.caseId) {
      where.caseId = filters.caseId;
    }
    return this.osintResultModel.findAll({
      where,
      include: ['case'],
      order: [['collectedAt', 'DESC']]
    });
  }

  async findOne(id: string): Promise<OsintResult | null> {
    return this.osintResultModel.findByPk(id, {
      include: ['case']
    });
  }

  async create(createOsintResultDto: any): Promise<OsintResult> {
    if (!createOsintResultDto.id) {
      createOsintResultDto.id = `osint-${Date.now()}`;
    }
    return this.osintResultModel.create(createOsintResultDto);
  }

  async update(id: string, updateOsintResultDto: any): Promise<OsintResult | null> {
    const [affectedCount] = await this.osintResultModel.update(updateOsintResultDto, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.osintResultModel.findByPk(id, {
      include: ['case']
    });
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.osintResultModel.destroy({ where: { id } });
    return affectedCount > 0;
  }
}