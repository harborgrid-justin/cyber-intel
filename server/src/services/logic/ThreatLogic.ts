
import { Threat, ThreatActor, IncidentStatus } from '@/types';

interface AttributionResult {
  actor: ThreatActor;
  score: number;
  matches: { type: 'INFRA' | 'TTP' | 'TARGET' | 'ORIGIN'; value: string }[];
}

export class ThreatLogic {
  static deduplicateThreat(newThreat: Threat, existingThreats: Threat[]) { 
      const dup = existingThreats.find(t => t.indicator === newThreat.indicator && t.type === newThreat.type);
      if (dup) {
          const merged = { ...dup, lastSeen: 'Now', confidence: Math.min(100, dup.confidence + 5) };
          return { threat: merged, isDuplicate: true };
      }
      return { threat: newThreat, isDuplicate: false }; 
  }

  static autoAttributedActor(threat: Threat, actors: ThreatActor[]) { 
      for (const actor of actors) {
          if (threat.description.includes(actor.name) || actor.aliases.some(alias => threat.description.includes(alias))) {
              return actor.name;
          }
      }
      return 'Unknown'; 
  }

  static calculateAttribution(input: string, actors: ThreatActor[]): AttributionResult[] {
    const results: AttributionResult[] = [];
    const lowerInput = input.toLowerCase();

    actors.forEach(actor => {
      let score = 0;
      const matches: { type: 'INFRA' | 'TTP' | 'TARGET' | 'ORIGIN'; value: string }[] = [];

      // 1. Infrastructure Analysis (High Weight: 40%)
      actor.infrastructure?.forEach(inf => {
        if (lowerInput.includes(inf.value.toLowerCase())) {
          score += 40;
          matches.push({ type: 'INFRA', value: inf.value });
        }
      });

      // 2. TTP Analysis (Medium Weight: 30% per match, capped)
      actor.ttps?.forEach(ttp => {
        // Match code (T1055) or name (Process Injection)
        if (lowerInput.includes(ttp.code.toLowerCase()) || lowerInput.includes(ttp.name.toLowerCase())) {
          score += 15;
          matches.push({ type: 'TTP', value: `${ttp.code} ${ttp.name}` });
        }
      });

      // 3. Target Sector/Origin Context (Low Weight: 10%)
      // In a real system, we'd check the Victim's sector. Here we simulate via text match.
      actor.targets?.forEach(t => {
        if (lowerInput.includes(t.toLowerCase())) {
          score += 10;
          matches.push({ type: 'TARGET', value: t });
        }
      });

      // 4. Malware Family (High Weight: 30%)
      // If the input mentions malware associated with the actor (simulated check against description)
      if (actor.description && lowerInput.includes("malware")) {
         // Placeholder for deeper malware analysis logic
      }

      if (score > 0) {
        results.push({ actor, score: Math.min(100, score), matches });
      }
    });

    return results.sort((a, b) => b.score - a.score);
  }

  static decayConfidence(threat: Threat) { return threat; }

  static enforceTLP(threat: Threat, userClearance: string) { 
      if (threat.tlp === 'RED' && userClearance !== 'TS/SCI') {
          return { ...threat, indicator: 'REDACTED (TLP:RED)', description: 'REDACTED' };
      }
      return threat; 
  }

  static checkSubnetPattern(threats: Threat[]) { 
      const subnetCounts = new Map<string, number>();
      threats.filter(t => t.type === 'IP Address').forEach(t => {
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

  static checkRansomwareVelocity(threats: Threat[]) { 
      const recent = threats.filter(t => t.tags?.includes('Ransomware') && t.status === 'NEW');
      return recent.length > 5; 
  }

  static applyGeoBlocking(threat: Threat) { 
      const blockedRegions = ['Sanctioned_Region_A', 'Sanctioned_Region_B'];
      if (blockedRegions.includes(threat.region || '')) {
          return { ...threat, sanctioned: true, status: IncidentStatus.CLOSED };
      }
      return threat; 
  }

  static checkShadowIT(t: Threat) { 
      if (t.type === 'Domain' && t.tags?.includes('Cloud') && !t.tags.includes('Approved')) {
          return { ...t, tags: [...(t.tags || []), 'Shadow IT'], score: Math.min(100, t.score + 20) };
      }
      return t; 
  }

  static checkFeedbackLoop(oldThreat: Threat, newThreat: Threat) { 
      if (oldThreat.severity === 'LOW' && (newThreat.severity === 'HIGH' || newThreat.severity === 'CRITICAL')) {
          return { ...newThreat, mlRetrain: true };
      }
      return newThreat; 
  }

  static adjustThresholdsByDefcon(threat: Threat, level: string) {
      if (level.includes('DEFCON 1') || level.includes('DEFCON 2') || level.includes('DEFCON 3') || level.includes('ELEVATED')) {
          return { ...threat, score: Math.min(100, threat.score + 5) };
      }
      return threat;
  }
}
