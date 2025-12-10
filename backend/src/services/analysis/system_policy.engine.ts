import { Asset, Vulnerability } from '../../models/infrastructure';
import { Actor } from '../../models/intelligence';
import { Op } from 'sequelize';

interface RiskAssessment {
  riskScore: number;
  factors: string[];
}

export class SystemPolicyEngine {

  static async assessAssetRisk(assetId: string): Promise<RiskAssessment> {
    const asset = await (Asset as any).findByPk(assetId);
    if (!asset) throw new Error("Asset not found");

    // Fetch related vulns (mock association via affected_assets containing assetId)
    // Note: In Sequelize, JSONB array operations are dialect specific. 
    // This assumes PG dialect logic or application-side filtering if complex.
    const vulns = await (Vulnerability as any).findAll({
        where: { affected_assets: { [Op.contains]: [assetId] } } 
    });

    let risk = 0;
    if (asset.type === 'Database') risk += 50;
    if (asset.criticality === 'CRITICAL') risk += 40;
    
    // Add vuln scores
    vulns.forEach((v: any) => risk += v.score * 5);

    return { 
        riskScore: Math.min(100, risk),
        factors: [`Base Type Risk: ${asset.type}`, `Vulnerabilities: ${vulns.length}`]
    };
  }

  static async escalateVIPTargets(actorId: string): Promise<{ escalated: boolean, actor: Actor | null }> {
    const actor = await (Actor as any).findByPk(actorId);
    if (!actor) return { escalated: false, actor: null };

    if (actor.targets && (actor.targets.includes('Executive') || actor.targets.includes('C-Suite'))) {
        actor.sophistication = 'Advanced';
        await actor.save();
        return { escalated: true, actor };
    }
    return { escalated: false, actor };
  }
}