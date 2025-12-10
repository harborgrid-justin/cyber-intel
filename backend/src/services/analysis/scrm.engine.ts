
import { Vendor } from '../../models/infrastructure';

interface SbomComponent {
  name: string;
  version: string;
  license: string;
  critical: boolean;
  vulnerabilities: number;
}

interface ComplianceCert {
  standard: string;
  status: 'VALID' | 'EXPIRED' | 'PENDING';
  expiry: string;
}

interface VendorAccess {
  systemId: string;
  accessLevel: 'ADMIN' | 'READ' | 'WRITE';
  accountCount: number;
  mfaEnabled: boolean;
}

interface VendorRiskInput {
  active_vulns?: number;
  sbom?: SbomComponent[];
  hq_location: string;
  compliance?: ComplianceCert[];
  access?: VendorAccess[];
}

export class ScrmEngine {
  
  static calculateHolisticRiskScore(vendor: VendorRiskInput): number {
    let score = 0;
    
    // Technical Risk (40%)
    const vulnScore = Math.min(100, (vendor.active_vulns || 0) * 15);
    const sbomRisk = (vendor.sbom || []).some((c) => c.critical) ? 80 : 20;
    const techScore = (vulnScore + sbomRisk) / 2;
    score += techScore * 0.4;

    // Geopolitical Risk (30%)
    const geoRisk = this.assessJurisdictionalRisk(vendor.hq_location).score;
    score += geoRisk * 0.3;

    // Operational/Compliance Risk (30%)
    const complianceGaps = (vendor.compliance || []).filter((c) => c.status !== 'VALID').length;
    const accessRisk = (vendor.access || []).some((a) => a.accessLevel === 'ADMIN' && !a.mfaEnabled) ? 100 : 0;
    const opsScore = Math.min(100, (complianceGaps * 25) + accessRisk);
    score += opsScore * 0.3;

    return Math.round(score);
  }

  static async traceDownstreamImpact(vendorId: string): Promise<{ impactedCount: number; depth: number }> {
    // In a real DB, use recursive CTEs. Here we simulate BFS on the Vendor table.
    const allVendors = await (Vendor as any).findAll();
    
    const impactedIds = new Set<string>();
    const queue = [{ id: vendorId, depth: 0 }];
    let maxDepth = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      maxDepth = Math.max(maxDepth, current.depth);
      
      // Find vendors where current ID is in their subcontractors list
      const upstream = allVendors.filter((v: Vendor) => {
          const subs: string[] = v.subcontractors || [];
          return subs.includes(current.id);
      });
      
      upstream.forEach((up: Vendor) => {
        if (!impactedIds.has(up.id)) {
          impactedIds.add(up.id);
          queue.push({ id: up.id, depth: current.depth + 1 });
        }
      });
    }

    return { impactedCount: impactedIds.size, depth: maxDepth };
  }

  static auditLeastPrivilege(accessList: VendorAccess[]): { violations: number; details: string[] } {
    const details: string[] = [];
    let violations = 0;

    accessList.forEach(acc => {
      if (acc.accessLevel === 'ADMIN' && acc.accountCount > 2) {
        violations++;
        details.push(`System ${acc.systemId}: Too many Admin accounts (${acc.accountCount})`);
      }
      if (acc.accessLevel !== 'READ' && !acc.mfaEnabled) {
        violations++;
        details.push(`System ${acc.systemId}: Write/Admin access without MFA`);
      }
    });

    return { violations, details };
  }

  static assessJurisdictionalRisk(country: string): { score: number, label: string } {
    const riskMap: Record<string, number> = {
      'Russia': 95, 'China': 90, 'Iran': 95, 'North Korea': 100,
      'USA': 10, 'UK': 10, 'Germany': 15, 'France': 15, 'Japan': 10,
      'India': 40, 'Brazil': 45, 'Israel': 20
    };
    const score = riskMap[country] || 50;
    let label = 'Low Risk';
    if (score > 80) label = 'Sanctioned / Hostile';
    else if (score > 60) label = 'High Surveillance Risk';
    else if (score > 30) label = 'Moderate Risk';

    return { score, label };
  }

  static analyzeSbomHealth(components: SbomComponent[]): { riskScore: number; summary: string } {
    let riskScore = 0;
    const criticalDeps = components.filter(c => c.critical).length;
    const vulnerable = components.filter(c => c.vulnerabilities > 0).length;
    const restrictiveLicenses = components.filter(c => ['GPL', 'AGPL'].includes(c.license)).length;

    riskScore += vulnerable * 20;
    riskScore += criticalDeps * 10;
    riskScore += restrictiveLicenses * 5;

    return {
      riskScore: Math.min(100, riskScore),
      summary: `${vulnerable} Vulnerable Components, ${criticalDeps} Critical Dependencies`
    };
  }
}
