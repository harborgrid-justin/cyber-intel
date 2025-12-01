import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ComplianceItem } from '../models';
import {
  CreateComplianceItemDto,
  UpdateComplianceItemDto,
  ComplianceStatsDto,
} from './dto';

@Injectable()
export class ComplianceItemsService {
  constructor(
    @InjectModel(ComplianceItem)
    private readonly complianceItemModel: typeof ComplianceItem,
  ) {}

  async findAll(filters?: { framework?: string; status?: string }): Promise<ComplianceItem[]> {
    const where: Record<string, string> = {};
    if (filters?.framework) {
      where.framework = filters.framework;
    }
    if (filters?.status) {
      where.status = filters.status;
    }
    return this.complianceItemModel.findAll({
      where,
      order: [['updatedAt', 'DESC']],
    });
  }

  async findOne(id: string): Promise<ComplianceItem | null> {
    return this.complianceItemModel.findByPk(id);
  }

  async create(createComplianceItemDto: CreateComplianceItemDto): Promise<ComplianceItem> {
    const itemData = { ...createComplianceItemDto };
    if (!itemData.id) {
      itemData.id = `compliance-${Date.now()}`;
    }
    return this.complianceItemModel.create(itemData as ComplianceItem);
  }

  async update(id: string, updateComplianceItemDto: UpdateComplianceItemDto): Promise<ComplianceItem | null> {
    const [affectedCount] = await this.complianceItemModel.update(updateComplianceItemDto, {
      where: { id },
    });
    if (affectedCount === 0) {
      return null;
    }
    return this.complianceItemModel.findByPk(id);
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.complianceItemModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async getComplianceStats(): Promise<ComplianceStatsDto> {
    const total = await this.complianceItemModel.count();
    const compliant = await this.complianceItemModel.count({
      where: { status: 'Compliant' },
    });
    const nonCompliant = await this.complianceItemModel.count({
      where: { status: 'Non-Compliant' },
    });

    return {
      total,
      compliant,
      nonCompliant,
      complianceRate: total > 0 ? Math.round((compliant / total) * 100) : 0,
    };
  }
}
