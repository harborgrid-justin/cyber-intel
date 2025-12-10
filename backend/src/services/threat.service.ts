
import { Threat } from '../models/intelligence';
import { ModelStatic } from 'sequelize';

// Typed interface for the static model to avoid 'as any'
const ThreatModel = Threat as ModelStatic<Threat>;

export class ThreatService {
  
  static async getAll(limit: number = 100, offset: number = 0): Promise<Threat[]> {
    return await ThreatModel.findAll({
      limit,
      offset,
      order: [['last_seen', 'DESC']]
    });
  }

  static async getById(id: string): Promise<Threat | null> {
    return await ThreatModel.findByPk(id);
  }

  static async create(data: Partial<Threat>): Promise<Threat> {
    return await ThreatModel.create({
      id: `threat-${Date.now()}`,
      indicator: data.indicator || 'Unknown',
      type: data.type || 'Generic',
      severity: data.severity || 'MEDIUM',
      source: data.source || 'Manual',
      status: 'NEW',
      score: data.score || 0,
      last_seen: new Date(),
      description: data.description || '',
      confidence: data.confidence || 50,
      region: data.region || 'Global',
      threat_actor: data.threat_actor || 'Unknown',
      reputation: data.reputation || 0,
      tags: data.tags || [],
      tlp: data.tlp || 'AMBER',
      sanctioned: data.sanctioned || false,
      ml_retrain: data.ml_retrain || false,
      origin: data.origin || 'Internal'
    } as Threat);
  }

  static async updateStatus(id: string, status: string): Promise<Threat | null> {
    const threat = await ThreatModel.findByPk(id);
    if (threat) {
      threat.status = status;
      await threat.save();
    }
    return threat;
  }
}
