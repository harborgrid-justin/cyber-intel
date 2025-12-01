import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Vulnerability } from '../models';
import { Op } from 'sequelize';

@Injectable()
export class VulnerabilitiesService {
  constructor(
    @InjectModel(Vulnerability)
    private vulnerabilityModel: typeof Vulnerability,
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

  async findOne(id: string): Promise<Vulnerability | null> {
    return this.vulnerabilityModel.findByPk(id);
  }

  async create(createVulnerabilityDto: any): Promise<Vulnerability> {
    if (!createVulnerabilityDto.id) {
      createVulnerabilityDto.id = `vuln-${Date.now()}`;
    }
    return this.vulnerabilityModel.create(createVulnerabilityDto);
  }

  async update(id: string, updateVulnerabilityDto: any): Promise<Vulnerability | null> {
    const [affectedCount] = await this.vulnerabilityModel.update(updateVulnerabilityDto, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.vulnerabilityModel.findByPk(id);
  }

  async remove(id: string): Promise<boolean> {
    const affectedCount = await this.vulnerabilityModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async getAffectedProducts(id: string): Promise<string[]> {
    const vulnerability = await this.findOne(id);
    if (!vulnerability) {
      throw new NotFoundException('Vulnerability not found');
    }
    return vulnerability.affectedProducts || [];
  }

  async mitigate(id: string, mitigationData: { action: string; notes?: string }): Promise<Vulnerability> {
    const vulnerability = await this.findOne(id);
    if (!vulnerability) {
      throw new NotFoundException('Vulnerability not found');
    }

    // Update status based on mitigation action
    let newStatus: string = vulnerability.status;
    if (mitigationData.action === 'PATCH') {
      newStatus = 'Mitigated';
    } else if (mitigationData.action === 'MITIGATE') {
      newStatus = 'Mitigated';
    }

    return await this.update(id, {
      status: newStatus,
      mitigation: mitigationData.notes || 'Mitigated'
    }) as Vulnerability;
  }

  async getVulnerabilityStats(): Promise<any> {
    const total = await this.vulnerabilityModel.count();
    const mitigated = await this.vulnerabilityModel.count({ where: { status: 'Mitigated' } });
    const open = await this.vulnerabilityModel.count({ where: { status: 'Open' } });
    const critical = await this.vulnerabilityModel.count({ where: { severity: 'Critical' } });

    return {
      total,
      mitigated,
      open,
      critical,
      complianceRate: total > 0 ? Math.round((mitigated / total) * 100) : 0
    };
  }

  async getHighRiskVulnerabilities(): Promise<Vulnerability[]> {
    return this.vulnerabilityModel.findAll({
      where: {
        [Op.or]: [
          { severity: 'Critical' },
          { severity: 'High' }
        ],
        status: 'Open'
      }
    });
  }

  async getVulnerabilitiesByCveId(cveId: string): Promise<Vulnerability[]> {
    return this.vulnerabilityModel.findAll({ where: { cveId } });
  }
}