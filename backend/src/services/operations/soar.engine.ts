
import { Case, Threat } from '../../models/intelligence';
import { Playbook } from '../../models/operations';
import { Asset } from '../../models/infrastructure';

export class SoarEngine {

  static checkSlaBreach(kase: Case): { breach: boolean, timeLeft: number } {
    if (kase.status === 'CLOSED') return { breach: false, timeLeft: 0 };

    const created = new Date((kase as any).createdAt || new Date()).getTime();
    const now = Date.now();
    const hoursElapsed = (now - created) / (1000 * 60 * 60);
    
    const limits: Record<string, number> = {
      'CRITICAL': 4,
      'HIGH': 24,
      'MEDIUM': 72,
      'LOW': 168
    };

    const limit = limits[kase.priority] || 72;
    return {
      breach: hoursElapsed > limit,
      timeLeft: limit - hoursElapsed
    };
  }

  static suggestPlaybook(kase: Case, playbooks: Playbook[]): Playbook | null {
    const title = kase.title.toLowerCase();
    const desc = kase.description.toLowerCase();
    
    return playbooks.find(pb => {
      const trigger = (pb.trigger_label || '').toLowerCase();
      return title.includes(trigger) || desc.includes(trigger);
    }) || null;
  }

  static calculateCollateralDamage(targetId: string, allAssets: Asset[]): { score: number, impacts: string[] } {
    const target = allAssets.find(a => a.id === targetId);
    if (!target) return { score: 0, impacts: [] };

    let score = 0;
    const impacts: string[] = [];

    if (target.criticality === 'HIGH') {
        score += 50;
        impacts.push(`Critical Asset Impact: ${target.name}`);
    }
    if (target.type === 'Database') {
        score += 30;
        impacts.push(`Data Availability Risk: ${target.name}`);
    }
    
    const dependents = allAssets.filter(a => a.owner === target.id); // Mock dependency via owner
    if (dependents.length > 0) {
        score += dependents.length * 10;
        impacts.push(`Cascading failure to ${dependents.length} dependent nodes`);
    }

    return { score: Math.min(100, score), impacts };
  }

  static async runAutoTriage(threats: Threat[]): Promise<{ archived: string[], promoted: string[] }> {
    const archived: string[] = [];
    const promoted: string[] = [];

    threats.forEach(t => {
      if (t.status === 'NEW') {
        // Auto-Archive Noise
        if (t.confidence < 60 && t.severity === 'LOW') {
          archived.push(t.id);
        }
        // Auto-Escalate Critical Confidence
        if (t.severity === 'CRITICAL' && t.confidence > 90) {
          promoted.push(t.id);
        }
      }
    });
    return { archived, promoted };
  }

  static generateResponsePlan(playbook: Playbook, target: Asset, assets: Asset[]) {
    const { score, impacts } = this.calculateCollateralDamage(target.id, assets);
    
    let type = 'ISOLATION';
    if (playbook.name.includes('Patch')) type = 'PATCH';
    if (playbook.name.includes('Block')) type = 'BLOCK_IP';

    return {
      id: `PLAN-${Date.now()}`,
      name: `Execute: ${playbook.name} on ${target.name}`,
      targetNodes: [target.id],
      type,
      collateralDamageScore: score,
      businessImpact: impacts.length > 0 ? impacts : ['Minimal operational impact expected.'],
      successRate: 85 + (Math.random() * 10),
      status: 'DRAFT',
      requiredAuth: score > 50 ? 'ELEVATION_REQUIRED' : 'Authorized'
    };
  }
}
