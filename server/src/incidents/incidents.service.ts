import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Incident } from '../models/incident.model';

@Injectable()
export class IncidentsService {
  constructor(
    @InjectModel(Incident)
    private incidentModel: typeof Incident,
  ) {}

  async getIncidents(): Promise<Incident[]> {
    return this.incidentModel.findAll({
      include: ['cases'],
      order: [['detectedAt', 'DESC']],
    });
  }

  async getIncident(id: string): Promise<Incident> {
    return this.incidentModel.findByPk(id, {
      include: ['cases'],
    });
  }

  async updateIncidentStatus(id: string, status: string): Promise<Incident> {
    const incident = await this.incidentModel.findByPk(id);
    if (!incident) {
      throw new Error('Incident not found');
    }
    await incident.update({ status: status as any });
    return incident;
  }

  async createIncident(incidentData: Partial<Incident>): Promise<Incident> {
    return this.incidentModel.create(incidentData);
  }
}