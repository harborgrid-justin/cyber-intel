
import { Vendor, SbomComponent, VendorAccess } from '../../types';

export class SupplyChainLogic {

  // --- 1. Risk Modeling ---
  static calculateHolisticRiskScore(vendor: Vendor): number {
    let score = 0;
    
    // Technical Risk (40%)
    const vulnScore = Math.min(100, vendor.activeVulns * 15);
    const sbomRisk = this.analyzeSbomHealth(vendor.sbom).riskScore;
    const techScore = (vulnScore + sbomRisk) / 2;
    score += techScore * 0.4;

    // Geopolitical Risk (30%)
    const geoRisk = this.assessJurisdictionalRisk(vendor.hqLocation).score;
    score += geoRisk * 0.3;

    // Operational/Compliance Risk (30%)
    const complianceGaps = vendor.compliance.filter(c => c.status !== 'VALID').length;
    const accessRisk = vendor.access.filter(a => a.accessLevel === 'ADMIN' && !a.mfaEnabled).length * 20;
    const opsScore = Math.min(100, (complianceGaps * 25) + accessRisk);
    score += opsScore * 0.3;

    return Math.round(score);
  }

  // --- 2. SBOM Analysis ---
  static analyzeSbomHealth(components: SbomComponent[]) {
    let riskScore = 0;
    const criticalDeps = components.filter(c => c.critical).length;
    const vulnerable = components.filter(c => c.vulnerabilities > 0).length;
    const restrictiveLicenses = components.filter(c => ['GPL', 'AGPL'].includes(c.license)).length;

    // Weighted scoring
    riskScore += vulnerable * 20;
    riskScore += criticalDeps * 10;
    riskScore += restrictiveLicenses * 5;

    return {
      riskScore: Math.min(100, riskScore),
      summary: `${vulnerable} Vulnerable Components, ${criticalDeps} Critical Dependencies`
    };
  }

  // --- 3. N-Tier Graph Theory ---
  // Simulate recursive dependency tracing
  static traceDownstreamImpact(vendorId: string, allVendors: Vendor[]): { impactedCount: number, depth: number } {
    const impacted = new Set<string>();
    const queue = [{ id: vendorId, depth: 0 }];
    let maxDepth = 0;

    while (queue.length > 0) {
      const current = queue.shift()!;
      maxDepth = Math.max(maxDepth, current.depth);
      
      // Find vendors who use this vendor as a subcontractor
      const upstream = allVendors.filter(v => v.subcontractors.includes(current.id) || v.subcontractors.includes(allVendors.find(x => x.id === current.id)?.name || ''));
      
      upstream.forEach(up => {
        if (!impacted.has(up.id)) {
          impacted.add(up.id);
          queue.push({ id: up.id, depth: current.depth + 1 });
        }
      });
    }

    return { impactedCount: impacted.size, depth: maxDepth };
  }

  // --- 4. Governance Logic ---
  static auditLeastPrivilege(accessList: VendorAccess[]): { violations: number, details: string[] } {
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

  // --- 5. Geopolitics ---
  static assessJurisdictionalRisk(country: string): { score: number, label: string } {
    const riskMap: Record<string, number> = {
      'Russia': 95, 'China': 90, 'Iran': 95, 'North Korea': 100,
      'USA': 10, 'UK': 10, 'Germany': 15, 'France': 15, 'Japan': 10,
      'India': 40, 'Brazil': 45, 'Israel': 20
    };
    const score = riskMap[country] || 50; // Default medium risk
    
    let label = 'Low Risk';
    if (score > 80) label = 'Sanctioned / Hostile';
    else if (score > 60) label = 'High Surveillance Risk';
    else if (score > 30) label = 'Moderate Risk';

    return { score, label };
  }
}
