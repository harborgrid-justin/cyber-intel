
import { Threat, ThreatActor, IncidentStatus, Severity } from '../../types';
import { apiClient } from '../apiClient';
import { BloomFilter } from '../algorithms/BloomFilter';
import { threatData } from '../dataLayer';

const threatBloom = new BloomFilter(10000, 0.01);

interface AttributionResult { actor: ThreatActor; score: number; matches: { type: 'INFRA' | 'TTP' | 'TARGET' | 'ORIGIN'; value: string }[]; }
interface DeduplicationResult { threat: Threat; isDuplicate: boolean; }

export class ThreatLogic {
  static async deduplicateThreat(newThreat: Threat, existingThreats: Threat[]): Promise<DeduplicationResult> { 
      if (threatData.isOffline) {
        const dup = existingThreats.find(t => t.indicator === newThreat.indicator && t.type === newThreat.type);
        if (dup) {
            const merged = { ...dup, lastSeen: 'Now', confidence: Math.min(100, dup.confidence + 5) };
            return { threat: merged, isDuplicate: true };
        }
        return { threat: newThreat, isDuplicate: false };
      }

      const key = `${newThreat.indicator}:${newThreat.type}`;
      const possiblyExists = threatBloom.test(key);
      if (!possiblyExists) threatBloom.add(key);

      try {
        return await apiClient.post<DeduplicationResult>('/analysis/lifecycle/threats/deduplicate', { threat: newThreat }, { silent: true });
      } catch {
        // Fallback same as offline logic
        const dup = existingThreats.find(t => t.indicator === newThreat.indicator && t.type === newThreat.type);
        if (dup) {
            const merged = { ...dup, lastSeen: 'Now', confidence: Math.min(100, dup.confidence + 5) };
            return { threat: merged, isDuplicate: true };
        }
        if (!possiblyExists) threatBloom.add(key); 
        return { threat: newThreat, isDuplicate: false }; 
      }
  }

  static autoAttributedActor(threat: Threat, actors: ThreatActor[]): string { 
      for (const actor of actors) {
          if (threat.description.includes(actor.name) || actor.aliases.some(alias => threat.description.includes(alias))) {
              return actor.name;
          }
      }
      return 'Unknown'; 
  }

  static async calculateAttribution(input: string): Promise<AttributionResult[]> {
    if (threatData.isOffline) return [];
    try { return await apiClient.post<AttributionResult[]>('/analysis/attribution', { input }, { silent: true }); } 
    catch (e) { return []; }
  }

  static async decayConfidence(threats: Threat[]): Promise<void> { 
      if (threatData.isOffline) return;
      try { await apiClient.post('/analysis/lifecycle/threats/decay', {}, { silent: true }); } 
      catch { /* Silent fail for background tasks */ }
  }

  static enforceTLP(threat: Threat, userClearance: string): Threat { 
      if (threat.tlp === 'RED' && userClearance !== 'TS/SCI') {
          return { ...threat, indicator: 'REDACTED (TLP:RED)', description: 'REDACTED' };
      }
      return threat; 
  }

  static async checkSubnetPattern(threats: Threat[]): Promise<string | null> { 
      if (threatData.isOffline) return null;
      try { const res = await apiClient.get<{subnet: string | null}>('/analysis/threats/patterns', { silent: true }); return res.subnet; } 
      catch { return null; }
  }

  static async checkRansomwareVelocity(threats: Threat[]): Promise<boolean> { 
      // Local Heuristic
      const recentHigh = threats.filter(t => t.status === IncidentStatus.NEW && t.score > 80).length;
      if (threatData.isOffline) return recentHigh > 5;
      
      try { const res = await apiClient.get<{ransomwareVelocity: boolean}>('/analysis/threats/patterns', { silent: true }); return res.ransomwareVelocity; } 
      catch { return recentHigh > 5; }
  }

  static async applyGeoBlocking(threat: Threat): Promise<void> { 
      if (threatData.isOffline) return;
      try { await apiClient.post('/analysis/lifecycle/threats/geoblock', {}, { silent: true }); } 
      catch { }
  }

  static checkShadowIT(t: Threat): Threat { 
      if (t.type === 'Domain' && t.tags?.includes('Cloud') && !t.tags?.includes('Approved')) {
          return { ...t, tags: [...(t.tags || []), 'Shadow IT'], score: Math.min(100, t.score + 20) };
      }
      return t; 
  }

  static checkFeedbackLoop(oldThreat: Threat, newThreat: Threat): Threat { 
      if (oldThreat.severity === 'LOW' && (newThreat.severity === 'HIGH' || newThreat.severity === 'CRITICAL')) {
          return { ...newThreat, mlRetrain: true };
      }
      return newThreat; 
  }

  static adjustThresholdsByDefcon(threat: Threat, level: string): Threat {
      if (level.includes('DEFCON 1') || level.includes('DEFCON 3') || level.includes('ELEVATED')) {
          return { ...threat, score: Math.min(100, threat.score + 5) };
      }
      return threat;
  }
}
