
import { Threat, Case } from '../../models/intelligence';
import { Artifact } from '../../models/operations';
import { User } from '../../models/system';
import { Op } from 'sequelize';

interface ThreatInput {
  indicator: string;
  type: string;
  [key: string]: unknown;
}

export class LifecycleEngine {

  // --- Threat Lifecycle ---
  static async deduplicateThreat(newThreat: ThreatInput): Promise<{ threat: Threat | ThreatInput; isDuplicate: boolean }> {
    const existing = await (Threat as any).findOne({
      where: { indicator: newThreat.indicator, type: newThreat.type }
    });

    if (existing) {
      existing.last_seen = new Date();
      existing.confidence = Math.min(100, existing.confidence + 5);
      await existing.save();
      return { threat: existing, isDuplicate: true };
    }
    return { threat: newThreat, isDuplicate: false };
  }

  static async decayConfidence(): Promise<{ processed: number }> {
    const threats = await (Threat as any).findAll({
      where: { status: 'NEW', last_seen: { [Op.lt]: new Date(Date.now() - 86400000) } } // Older than 24h
    });
    
    for (const t of threats) {
      // Decay 5% per day inactive
      t.confidence = Math.max(0, t.confidence - 5);
      if (t.confidence < 20) t.status = 'CLOSED';
      await t.save();
    }
    return { processed: threats.length };
  }

  static async applyGeoBlocking(): Promise<{ blocked: number }> {
    const blockedRegions = ['Sanctioned_Region_A', 'Sanctioned_Region_B'];
    const threats = await (Threat as any).findAll({
      where: { region: { [Op.in]: blockedRegions }, status: { [Op.ne]: 'CLOSED' } }
    });

    for (const t of threats) {
      t.sanctioned = true;
      t.status = 'CLOSED';
      t.description = `[AUTO-BLOCK] Sanctioned Region: ${t.region}`;
      await t.save();
    }
    return { blocked: threats.length };
  }

  // --- Case Governance ---
  static async checkSlaBreaches(): Promise<{ id: string; breach: boolean }[]> {
    const cases = await (Case as any).findAll({ where: { status: { [Op.ne]: 'CLOSED' } } });
    const updates: { id: string; breach: boolean }[] = [];
    
    for (const c of cases) {
      const hours = (Date.now() - new Date(c.createdAt).getTime()) / 36e5;
      const limit = c.priority === 'CRITICAL' ? 4 : c.priority === 'HIGH' ? 24 : 72;
      
      if (hours > limit) {
        updates.push({ id: c.id, breach: true });
        // In real app, trigger alert notification here
      }
    }
    return updates;
  }

  // --- System Hygiene ---
  static async enforceRetentionPolicy(): Promise<{ archived: number }> {
    const yearAgo = new Date();
    yearAgo.setFullYear(yearAgo.getFullYear() - 1);
    
    const artifacts = await (Artifact as any).findAll({
      where: { upload_date: { [Op.lt]: yearAgo }, status: 'SECURE' }
    });

    for (const a of artifacts) {
      a.status = 'ARCHIVED';
      await a.save();
    }
    return { archived: artifacts.length };
  }

  static async monitorAnalystFatigue(): Promise<string[]> {
    // Mock logic: Find users with many closed cases in 24h
    // Real logic would query Case audit logs
    const users = await (User as any).findAll({ where: { status: 'ACTIVE' } });
    const fatigued: string[] = [];
    
    for (const u of users) {
       // Simulation: Random fatigue
       if (Math.random() > 0.9) {
         u.status = 'FATIGUED';
         await u.save();
         fatigued.push(u.username);
       }
    }
    return fatigued;
  }

  static async calculateStorageProjection(): Promise<{ totalGB: number; cost: number; retentionRisk: number }> {
    const artifacts = await (Artifact as any).findAll();
    let totalBytes = 0;
    let oldItems = 0;
    const yearAgo = Date.now() - (365 * 86400000);

    artifacts.forEach((a: any) => {
      const sizeVal = parseFloat(a.size) || 0;
      totalBytes += sizeVal * (a.size.includes('GB') ? 1024 : 1); // MB base
      if (new Date(a.upload_date).getTime() < yearAgo) oldItems++;
    });

    const totalGB = totalBytes / 1024;
    return {
      totalGB: parseFloat(totalGB.toFixed(2)),
      cost: parseFloat((totalGB * 0.23).toFixed(2)),
      retentionRisk: oldItems
    };
  }
}
