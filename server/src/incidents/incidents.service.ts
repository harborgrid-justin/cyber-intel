import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Incident } from '../models/incident.model';
import { CreateIncidentDto, UpdateIncidentDto } from './dto';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident)
    private readonly incidentModel: typeof Incident,
  ) {}

  async getIncidents(): Promise<Incident[]> {
    return this.incidentModel.findAll({
      include: ['cases'],
      order: [['detectedAt', 'DESC']],
    });
  }

  async getIncident(id: string): Promise<Incident> {
    const incident = await this.incidentModel.findByPk(id, {
      include: ['cases'],
    });
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    return incident;
  }

  async createIncident(createIncidentDto: CreateIncidentDto): Promise<Incident> {
    return this.incidentModel.create(createIncidentDto as any);
  }

  async updateIncident(id: string, updateIncidentDto: UpdateIncidentDto): Promise<Incident> {
    const incident = await this.incidentModel.findByPk(id);
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }
    await incident.update(updateIncidentDto);
    return incident;
  }

  async updateIncidentStatus(id: string, status: string): Promise<Incident> {
    const incident = await this.incidentModel.findByPk(id);
    if (!incident) {
      throw new NotFoundException(`Incident with ID ${id} not found`);
    }

    const updateData: any = { status: status as any };

    // If status is CLOSED, set resolvedAt timestamp
    if (status === 'CLOSED') {
      updateData.resolvedAt = new Date();
    }

    await incident.update(updateData);
    return incident;
  }
}
