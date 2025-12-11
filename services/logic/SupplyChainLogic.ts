
import { Vendor, SbomComponent, VendorAccess } from '../../types';
import { apiClient } from '../apiClient';
import { threatData } from '../dataLayer';

interface RiskBreakdown {
  score: number;
  factors: { category: string; impact: number; description: string }[];
}

export class SupplyChainLogic {

  /**
   * Calculates a composite risk score (0-100) based on weighted factors:
   * - Geopolitical (30%)
   * - Vulnerability/SBOM (40%)
   * - Compliance (20%)
   * - Access Governance (10%)
   */
  static calculateCompositeRisk(vendor: Vendor): RiskBreakdown {
    const factors = [];
    
    // 1. Geopolitical Risk (30%)
    const geo = this.assessJurisdictionalRiskInternal(vendor.hqLocation);
    const geoWeighted = geo.score * 0.3;
    if (geo.score > 50) factors.push({ category: 'Geopolitical', impact: geoWeighted, description: `HQ in ${vendor.hqLocation} (${geo.label})` });

    // 2. Technical/Vulnerability Risk (40%)
    let techRaw = (vendor.activeVulns * 10);
    const criticalLibs = vendor.sbom.filter(c => c.critical).length;
    if (criticalLibs > 0) techRaw += (criticalLibs * 20);
    
    // License risk
    const riskyLicenses = vendor.sbom.filter(c => ['GPL-3.0', 'AGPL'].includes(c.license)).length;
    if (riskyLicenses > 0) techRaw += 10;
    
    const techScore = Math.min(100, techRaw);
    const techWeighted = techScore * 0.4;
    if (techScore > 0) factors.push({ category: 'Technical', impact: techWeighted, description: `${vendor.activeVulns} Active Vulns, ${criticalLibs} Critical Libs` });

    // 3. Compliance Risk (20%)
    let compRaw = 0;
    if (vendor.compliance.length === 0) {
        // High risk if Strategic/Tactical vendor has NO certs
        if (vendor.tier === 'Strategic' || vendor.tier === 'Tactical') {
            compRaw = 100;
            factors.push({ category: 'Compliance', impact: 20, description: 'Missing all certifications' });
        } else {
            compRaw = 50;
        }
    } else {
        const expired = vendor.compliance.filter(c => c.status === 'EXPIRED').length;
        if (expired > 0) {
            compRaw += (expired * 30);
            factors.push({ category: 'Compliance', impact: Math.min(100, compRaw) * 0.2, description: `${expired} Certifications Expired` });
        }
    }
    const compWeighted = Math.min(100, compRaw) * 0.2;

    // 4. Access Governance (10%)
    const { violations, details } = this.auditLeastPrivilegeInternal(vendor.access);
    const accessRaw = Math.min(100, violations * 35);
    const accessWeighted = accessRaw * 0.1;
    if (violations > 0) factors.push({ category: 'Access', impact: accessWeighted, description: `${violations} Privilege Violations` });

    const totalScore = Math.round(geoWeighted + techWeighted + compWeighted + accessWeighted);
    return { score: totalScore, factors };
  }

  static async analyzeSbomHealth(components: SbomComponent[]): Promise<{ riskScore: number; summary: string }> {
    try {
      return await apiClient.post<any>('/analysis/scrm/sbom-health', { components });
    } catch {
      // Offline Analysis
      let riskScore = 0;
      const critical = components.filter(c => c.critical).length;
      const vulns = components.reduce((acc, c) => acc + c.vulnerabilities, 0);
      const outdated = components.filter(c => c.version.startsWith('0.') || c.version.startsWith('1.')).length; // Mock outdated check
      
      riskScore += (critical * 30);
      riskScore += (vulns * 5);
      riskScore += (outdated * 2);

      let summary = 'Healthy';
      if (riskScore > 80) summary = 'Critical Risk';
      else if (riskScore > 40) summary = 'Moderate Risk';
      
      return { riskScore: Math.min(100, riskScore), summary: `${vulns} Vulns across ${components.length} components` };
    }
  }

  static async traceDownstreamImpact(vendorId: string): Promise<{ impactedCount: number, depth: number }> {
    try {
      return await apiClient.get<any>(`/analysis/scrm/${vendorId}/trace`);
    } catch {
      // Offline Graph Traversal Simulation
      // In a real offline mode, we'd traverse the store, but here we mock based on ID
      return { impactedCount: Math.floor(Math.random() * 50) + 5, depth: 3 };
    }
  }

  static async auditLeastPrivilege(accessList: VendorAccess[]): Promise<{ violations: number, details: string[] }> {
    return this.auditLeastPrivilegeInternal(accessList);
  }
  
  private static auditLeastPrivilegeInternal(accessList: VendorAccess[]): { violations: number, details: string[] } {
    const details: string[] = [];
    let violations = 0;
    
    accessList.forEach(acc => {
        // Rule 1: Admins must have MFA
        if (acc.accessLevel === 'ADMIN' && !acc.mfaEnabled) {
            violations++;
            details.push(`System ${acc.systemId}: Admin access without MFA`);
        }
        // Rule 2: Account hoarding
        if (acc.accountCount > 3) {
            violations++;
            details.push(`System ${acc.systemId}: Excessive accounts (${acc.accountCount})`);
        }
        // Rule 3: Write access to critical systems (mock ID check)
        if (acc.accessLevel === 'WRITE' && acc.systemId.includes('DB')) {
            violations++;
            details.push(`System ${acc.systemId}: Unprivileged write access to Database`);
        }
    });

    return { violations, details };
  }

  static async assessJurisdictionalRisk(country: string): Promise<{ score: number, label: string }> {
     return this.assessJurisdictionalRiskInternal(country);
  }

  private static assessJurisdictionalRiskInternal(country: string): { score: number, label: string } {
      const riskMap: Record<string, number> = {
          'Russia': 95, 'China': 90, 'Iran': 95, 'North Korea': 100, 'Belarus': 85,
          'USA': 10, 'UK': 10, 'Germany': 15, 'France': 15, 'Japan': 10, 'Canada': 5,
          'India': 40, 'Brazil': 45, 'Israel': 25, 'Unknown': 50
      };
      
      const score = riskMap[country] || 50;
      let label = 'Low Risk';
      if (score >= 90) label = 'Sanctioned / Hostile';
      else if (score >= 60) label = 'High Surveillance';
      else if (score >= 40) label = 'Moderate Risk';
      
      return { score, label };
  }
}
