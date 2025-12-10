
import { Threat, Actor } from '../../models/intelligence';

export class ScoringEngine {
  
  static calculateThreatScore(
    confidence: number,
    reputation: number,
    severity: string
  ): number {
    const sevMap: Record<string, number> = {
      'LOW': 20, 'MEDIUM': 50, 'HIGH': 80, 'CRITICAL': 100
    };
    
    // Proprietary weighting logic hidden from client
    const weighted = 
      (sevMap[severity] || 0) * 0.4 + 
      confidence * 0.3 + 
      reputation * 0.3;
    
    return Math.min(100, Math.round(weighted));
  }

  static async autoAttribute(threat: Partial<Threat>, actors: Actor[]): Promise<string> {
    const desc = (threat.description || '').toLowerCase();
    const indicator = (threat.indicator || '').toLowerCase();

    for (const actor of actors) {
      // 1. Check Aliases (Direct string match)
      if (actor.aliases && actor.aliases.some(a => desc.includes(a.toLowerCase()))) {
        return actor.name;
      }
      
      // 2. TTP Pattern Matching (Simplified for demo)
      // In prod, this would query a TTP database (e.g., STIX Patterning)
      if (actor.targets && actor.targets.some(t => desc.includes(t.toLowerCase()))) {
         // Heuristic: If target matches known actor target profile
      }
    }
    return 'Unknown';
  }

  static enrichThreat(threat: Threat): Threat {
    // TLP Enforcement
    if (!threat.tlp) threat.tlp = 'AMBER';
    
    // Shadow IT Heuristic
    if (threat.type === 'Domain' && threat.tags?.includes('Cloud')) {
       if (!threat.tags.includes('Approved')) {
         threat.tags = [...(threat.tags || []), 'Shadow IT'];
         threat.score = Math.min(100, threat.score + 20);
       }
    }
    return threat;
  }
}
