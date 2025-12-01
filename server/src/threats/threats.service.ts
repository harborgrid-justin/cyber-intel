import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Threat } from '../models/threat.model';
import { Op } from 'sequelize';
import { CreateThreatDto, UpdateThreatDto } from './dto/threat.dto';

@Injectable()
export class ThreatsService {
  constructor(
    @InjectModel(Threat)
    private readonly threatModel: typeof Threat,
  ) {}

  async findAll(sort: boolean = true): Promise<Threat[]> {
    if (sort) {
      return this.threatModel.findAll({
        order: [['lastSeen', 'DESC']],
      });
    }
    return this.threatModel.findAll();
  }

  async findOne(id: string): Promise<Threat> {
    const threat = await this.threatModel.findByPk(id);
    if (!threat) {
      throw new NotFoundException(`Threat with ID ${id} not found`);
    }
    return threat;
  }

  async create(threatData: CreateThreatDto): Promise<Threat> {
    return this.threatModel.create(threatData as any);
  }

  async update(id: string, threatData: UpdateThreatDto): Promise<Threat> {
    const threat = await this.threatModel.findByPk(id);
    if (!threat) {
      throw new NotFoundException(`Threat with ID ${id} not found`);
    }
    await threat.update(threatData);
    return threat;
  }

  async remove(id: string): Promise<{ deleted: boolean }> {
    const threat = await this.threatModel.findByPk(id);
    if (!threat) {
      throw new NotFoundException(`Threat with ID ${id} not found`);
    }
    const result = await this.threatModel.destroy({ where: { id } });
    return { deleted: result > 0 };
  }

  async updateStatus(id: string, status: string): Promise<Threat> {
    const threat = await this.threatModel.findByPk(id);
    if (!threat) {
      throw new NotFoundException(`Threat with ID ${id} not found`);
    }
    await threat.update({ status: status as any });
    return threat;
  }

  async findByActor(threatActor: string): Promise<Threat[]> {
    return this.threatModel.findAll({
      where: { threatActor: { [Op.iLike]: `%${threatActor}%` } },
    });
  }

  async findBySeverity(severity: string): Promise<Threat[]> {
    return this.threatModel.findAll({ where: { severity } });
  }

  async findByType(type: string): Promise<Threat[]> {
    return this.threatModel.findAll({ where: { type } });
  }
}
