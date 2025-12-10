
import { query } from '../config/database';
import { AuditService } from './audit.service';
import { Asset } from '../models/infrastructure';
import { Actor } from '../models/intelligence';

interface SimulationResult {
  id: string;
  actor: string;
  target: string;
  successProbability: number;
  path: { step: number; node: string; method: string; success: number }[];
}

export class SimulationService {
  static async runBreachSim(actorId: string, targetId: string): Promise<SimulationResult> {
    // 1. Fetch Graph Data
    const nodeResult = await query('SELECT * FROM assets');
    const nodes = nodeResult.rows as Asset[];
    
    const actorResult = await query('SELECT * FROM actors WHERE id = $1', [actorId]);
    const actor = actorResult.rows[0] as Actor;
    
    if (!actor || nodes.length === 0) throw new Error("Invalid Simulation Parameters");

    // 2. Mock Server-Side Pathfinding Logic
    const path = [
        { step: 1, node: 'Internet-Gateway', method: 'External Exploit', success: 0.8 },
        { step: 2, node: 'DMZ-Web-Server', method: 'Reverse Shell', success: 0.6 },
        { step: 3, node: targetId, method: 'Data Exfiltration', success: 0.4 }
    ];

    return {
        id: `SIM-${Date.now()}`,
        actor: actor.name,
        target: targetId,
        successProbability: 0.19, // 0.8 * 0.6 * 0.4
        path
    };
  }

  static async saveResult(data: { id: string; target: string }, userId: string): Promise<{ id: string; status: string }> {
    await AuditService.log(userId, 'SIMULATION_RUN', `Executed war game against ${data.target}`);
    return { id: data.id, status: 'SAVED' };
  }
}
