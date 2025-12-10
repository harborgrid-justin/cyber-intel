import { Threat } from '../../models/intelligence';
import { Op } from 'sequelize';

export class ThreatIntelligenceEngine {
  
  static async detectSubnetPatterns(): Promise<string | null> {
    // Simulated analytic query
    const threats = await (Threat as any).findAll({ 
      where: { type: 'IP Address' } 
    });
    
    const subnetCounts = new Map<string, number>();
    threats.forEach((t: any) => {
      const parts = t.indicator.split('.');
      if (parts.length === 4) {
        const subnet = `${parts[0]}.${parts[1]}.${parts[2]}.0/24`;
        subnetCounts.set(subnet, (subnetCounts.get(subnet) || 0) + 1);
      }
    });

    for (const [subnet, count] of subnetCounts.entries()) {
      if (count >= 3) return subnet;
    }
    return null;
  }

  static async checkRansomwareVelocity(): Promise<boolean> {
    const count = await (Threat as any).count({
      where: {
        tags: { [Op.contains]: ['Ransomware'] },
        status: 'NEW'
      }
    });
    return count > 5;
  }

  static async checkShadowIT(threat: Threat): Promise<Threat> {
    if (threat.type === 'Domain' && threat.tags?.includes('Cloud') && !threat.tags.includes('Approved')) {
        threat.tags = [...(threat.tags || []), 'Shadow IT'];
        threat.score = Math.min(100, (threat.score || 0) + 20);
        return threat;
    }
    return threat;
  }
}