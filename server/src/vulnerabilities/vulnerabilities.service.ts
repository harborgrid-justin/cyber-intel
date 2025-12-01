import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vulnerability } from '../models';
import { Op } from 'sequelize';
import {
  CreateVulnerabilityDto,
  UpdateVulnerabilityDto,
  MitigateVulnerabilityDto,
  VulnerabilityStatsDto,
} from './dto';

@Injectable()
export class VulnerabilitiesService {
  constructor(
    @InjectModel(Vulnerability)
    private readonly vulnerabilityModel: typeof Vulnerability,
  ) {}

  async findAll(filters?: { status?: string; severity?: string }): Promise<Vulnerability[]> {
    const where: any = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.severity) {
      where.severity = filters.severity;
    }
    return this.vulnerabilityModel.findAll({ where, order: [['cvssScore', 'DESC']] });
  }

  async findOne(id: string): Promise<Vulnerability> {
    const vulnerability = await this.vulnerabilityModel.findByPk(id);
    if (!vulnerability) {
      throw new NotFoundException(`Vulnerability with ID ${id} not found`);
    }
    return vulnerability;
  }

  async create(createVulnerabilityDto: CreateVulnerabilityDto): Promise<Vulnerability> {
    const vulnerabilityData = {
      ...createVulnerabilityDto,
      id: createVulnerabilityDto.id || `vuln-${Date.now()}`,
      status: createVulnerabilityDto.status || 'Open',
    };
    return this.vulnerabilityModel.create(vulnerabilityData as any);
  }

  async update(id: string, updateVulnerabilityDto: UpdateVulnerabilityDto): Promise<Vulnerability> {
    const vulnerability = await this.vulnerabilityModel.findByPk(id);
    if (!vulnerability) {
      throw new NotFoundException(`Vulnerability with ID ${id} not found`);
    }
    await vulnerability.update(updateVulnerabilityDto);
    return vulnerability;
  }

  async remove(id: string): Promise<void> {
    const affectedCount = await this.vulnerabilityModel.destroy({ where: { id } });
    if (affectedCount === 0) {
      throw new NotFoundException(`Vulnerability with ID ${id} not found`);
    }
  }

  async getAffectedProducts(id: string): Promise<string[]> {
    const vulnerability = await this.findOne(id);
    return vulnerability.affectedProducts || [];
  }

  async mitigate(id: string, mitigateVulnerabilityDto: MitigateVulnerabilityDto): Promise<Vulnerability> {
    const vulnerability = await this.findOne(id);

    // Update status based on mitigation action
    let newStatus: string = vulnerability.status;
    if (mitigateVulnerabilityDto.action === 'PATCH' || mitigateVulnerabilityDto.action === 'MITIGATE') {
      newStatus = 'Mitigated';
    } else if (mitigateVulnerabilityDto.action === 'WORKAROUND') {
      newStatus = 'Investigating';
    }

    await vulnerability.update({
      status: newStatus as 'Open' | 'Investigating' | 'Mitigated' | 'Closed',
      mitigation: mitigateVulnerabilityDto.notes || `Mitigated via ${mitigateVulnerabilityDto.action}`,
      lastModifiedDate: new Date(),
    });

    return vulnerability;
  }

  async getVulnerabilityStats(): Promise<VulnerabilityStatsDto> {
    const total = await this.vulnerabilityModel.count();
    const mitigated = await this.vulnerabilityModel.count({ where: { status: 'Mitigated' } });
    const open = await this.vulnerabilityModel.count({ where: { status: 'Open' } });
    const critical = await this.vulnerabilityModel.count({ where: { severity: 'Critical' } });

    return {
      total,
      mitigated,
      open,
      critical,
      complianceRate: total > 0 ? Math.round((mitigated / total) * 100) : 0,
    };
  }

  async getHighRiskVulnerabilities(): Promise<Vulnerability[]> {
    return this.vulnerabilityModel.findAll({
      where: {
        [Op.or]: [{ severity: 'Critical' }, { severity: 'High' }],
        status: 'Open',
      },
      order: [['cvssScore', 'DESC']],
    });
  }

  async getVulnerabilitiesByCveId(cveId: string): Promise<Vulnerability[]> {
    return this.vulnerabilityModel.findAll({ where: { cveId } });
  }
}
