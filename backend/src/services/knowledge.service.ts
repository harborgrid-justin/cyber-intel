
import { query } from '../config/database';
import { MitreItem } from '../types/index'; // Assumes type definition is shared or similar

export class KnowledgeService {
  static async getTechniques(tacticId?: string): Promise<MitreItem[]> {
    let sql = 'SELECT * FROM mitre_techniques';
    const params: string[] = [];
    if (tacticId) {
      sql += ' WHERE tactic_id = $1';
      params.push(tacticId);
    }
    const { rows } = await query(sql, params);
    return rows as MitreItem[];
  }

  static async getGroups(): Promise<MitreItem[]> {
    const { rows } = await query('SELECT * FROM mitre_groups');
    return rows as MitreItem[];
  }

  static async syncFramework(): Promise<{ updated: number; timestamp: string }> {
    // Mock sync logic - in prod this would fetch from MITRE TAXII
    return { updated: 14, timestamp: new Date().toISOString() };
  }
}
