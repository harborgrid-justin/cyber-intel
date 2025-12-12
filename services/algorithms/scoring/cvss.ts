/**
 * CVSS (Common Vulnerability Scoring System) Calculator
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 *
 * Use Cases:
 * - Calculating vulnerability severity scores
 * - Prioritizing patch management
 * - Risk assessment for CVEs
 * - Compliance reporting
 */

export interface CVSSv3Metrics {
  // Base Metrics
  attackVector: 'N' | 'A' | 'L' | 'P'; // Network, Adjacent, Local, Physical
  attackComplexity: 'L' | 'H'; // Low, High
  privilegesRequired: 'N' | 'L' | 'H'; // None, Low, High
  userInteraction: 'N' | 'R'; // None, Required
  scope: 'U' | 'C'; // Unchanged, Changed
  confidentialityImpact: 'N' | 'L' | 'H'; // None, Low, High
  integrityImpact: 'N' | 'L' | 'H';
  availabilityImpact: 'N' | 'L' | 'H';

  // Temporal Metrics (optional)
  exploitCodeMaturity?: 'X' | 'U' | 'P' | 'F' | 'H';
  remediationLevel?: 'X' | 'O' | 'T' | 'W' | 'U';
  reportConfidence?: 'X' | 'U' | 'R' | 'C';

  // Environmental Metrics (optional)
  confidentialityRequirement?: 'X' | 'L' | 'M' | 'H';
  integrityRequirement?: 'X' | 'L' | 'M' | 'H';
  availabilityRequirement?: 'X' | 'L' | 'M' | 'H';
}

export interface CVSSScore {
  baseScore: number;
  temporalScore?: number;
  environmentalScore?: number;
  overallScore: number;
  severity: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  vector: string;
}

export class CVSSCalculator {
  /**
   * Calculate CVSS v3.1 score
   */
  calculateV3(metrics: CVSSv3Metrics): CVSSScore {
    const baseScore = this.calculateBaseScore(metrics);
    const temporalScore = this.calculateTemporalScore(baseScore, metrics);
    const environmentalScore = this.calculateEnvironmentalScore(metrics);

    const overallScore = environmentalScore || temporalScore || baseScore;
    const severity = this.getSeverityRating(overallScore);
    const vector = this.generateVector(metrics);

    return {
      baseScore: this.roundUp(baseScore),
      temporalScore: temporalScore ? this.roundUp(temporalScore) : undefined,
      environmentalScore: environmentalScore ? this.roundUp(environmentalScore) : undefined,
      overallScore: this.roundUp(overallScore),
      severity,
      vector
    };
  }

  private calculateBaseScore(m: CVSSv3Metrics): number {
    // Impact Sub-Score
    const iscBase =
      1 - (1 - this.getImpactValue(m.confidentialityImpact)) *
      (1 - this.getImpactValue(m.integrityImpact)) *
      (1 - this.getImpactValue(m.availabilityImpact));

    let impact: number;
    if (m.scope === 'U') {
      impact = 6.42 * iscBase;
    } else {
      impact = 7.52 * (iscBase - 0.029) - 3.25 * Math.pow(iscBase - 0.02, 15);
    }

    // Exploitability Sub-Score
    const exploitability =
      8.22 *
      this.getAttackVectorValue(m.attackVector) *
      this.getAttackComplexityValue(m.attackComplexity) *
      this.getPrivilegesRequiredValue(m.privilegesRequired, m.scope) *
      this.getUserInteractionValue(m.userInteraction);

    // Base Score
    if (impact <= 0) {
      return 0;
    }

    if (m.scope === 'U') {
      return Math.min(impact + exploitability, 10);
    } else {
      return Math.min(1.08 * (impact + exploitability), 10);
    }
  }

  private calculateTemporalScore(baseScore: number, m: CVSSv3Metrics): number | undefined {
    if (!m.exploitCodeMaturity && !m.remediationLevel && !m.reportConfidence) {
      return undefined;
    }

    const exploitCodeMaturity = this.getExploitCodeMaturityValue(m.exploitCodeMaturity || 'X');
    const remediationLevel = this.getRemediationLevelValue(m.remediationLevel || 'X');
    const reportConfidence = this.getReportConfidenceValue(m.reportConfidence || 'X');

    return baseScore * exploitCodeMaturity * remediationLevel * reportConfidence;
  }

  private calculateEnvironmentalScore(m: CVSSv3Metrics): number | undefined {
    if (
      !m.confidentialityRequirement &&
      !m.integrityRequirement &&
      !m.availabilityRequirement
    ) {
      return undefined;
    }

    // Modified Impact calculation with environmental requirements
    const cr = this.getRequirementValue(m.confidentialityRequirement || 'X');
    const ir = this.getRequirementValue(m.integrityRequirement || 'X');
    const ar = this.getRequirementValue(m.availabilityRequirement || 'X');

    const iscModified =
      Math.min(
        1 - (1 - this.getImpactValue(m.confidentialityImpact) * cr) *
        (1 - this.getImpactValue(m.integrityImpact) * ir) *
        (1 - this.getImpactValue(m.availabilityImpact) * ar),
        0.915
      );

    let impactModified: number;
    if (m.scope === 'U') {
      impactModified = 6.42 * iscModified;
    } else {
      impactModified = 7.52 * (iscModified - 0.029) - 3.25 * Math.pow(iscModified - 0.02, 15);
    }

    const exploitability =
      8.22 *
      this.getAttackVectorValue(m.attackVector) *
      this.getAttackComplexityValue(m.attackComplexity) *
      this.getPrivilegesRequiredValue(m.privilegesRequired, m.scope) *
      this.getUserInteractionValue(m.userInteraction);

    if (impactModified <= 0) {
      return 0;
    }

    let envScore: number;
    if (m.scope === 'U') {
      envScore = Math.min(impactModified + exploitability, 10);
    } else {
      envScore = Math.min(1.08 * (impactModified + exploitability), 10);
    }

    // Apply temporal metrics if present
    if (m.exploitCodeMaturity || m.remediationLevel || m.reportConfidence) {
      const ecm = this.getExploitCodeMaturityValue(m.exploitCodeMaturity || 'X');
      const rl = this.getRemediationLevelValue(m.remediationLevel || 'X');
      const rc = this.getReportConfidenceValue(m.reportConfidence || 'X');
      envScore = envScore * ecm * rl * rc;
    }

    return envScore;
  }

  private getSeverityRating(score: number): 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score === 0) return 'NONE';
    if (score < 4.0) return 'LOW';
    if (score < 7.0) return 'MEDIUM';
    if (score < 9.0) return 'HIGH';
    return 'CRITICAL';
  }

  private generateVector(m: CVSSv3Metrics): string {
    let vector = `CVSS:3.1/AV:${m.attackVector}/AC:${m.attackComplexity}/PR:${m.privilegesRequired}`;
    vector += `/UI:${m.userInteraction}/S:${m.scope}`;
    vector += `/C:${m.confidentialityImpact}/I:${m.integrityImpact}/A:${m.availabilityImpact}`;

    if (m.exploitCodeMaturity) vector += `/E:${m.exploitCodeMaturity}`;
    if (m.remediationLevel) vector += `/RL:${m.remediationLevel}`;
    if (m.reportConfidence) vector += `/RC:${m.reportConfidence}`;

    if (m.confidentialityRequirement) vector += `/CR:${m.confidentialityRequirement}`;
    if (m.integrityRequirement) vector += `/IR:${m.integrityRequirement}`;
    if (m.availabilityRequirement) vector += `/AR:${m.availabilityRequirement}`;

    return vector;
  }

  private getAttackVectorValue(av: string): number {
    const values: { [key: string]: number } = { N: 0.85, A: 0.62, L: 0.55, P: 0.2 };
    return values[av] || 0;
  }

  private getAttackComplexityValue(ac: string): number {
    return ac === 'L' ? 0.77 : 0.44;
  }

  private getPrivilegesRequiredValue(pr: string, scope: string): number {
    if (scope === 'U') {
      const values: { [key: string]: number } = { N: 0.85, L: 0.62, H: 0.27 };
      return values[pr] || 0;
    } else {
      const values: { [key: string]: number } = { N: 0.85, L: 0.68, H: 0.5 };
      return values[pr] || 0;
    }
  }

  private getUserInteractionValue(ui: string): number {
    return ui === 'N' ? 0.85 : 0.62;
  }

  private getImpactValue(impact: string): number {
    const values: { [key: string]: number } = { N: 0, L: 0.22, H: 0.56 };
    return values[impact] || 0;
  }

  private getExploitCodeMaturityValue(e: string): number {
    const values: { [key: string]: number } = { X: 1, U: 0.91, P: 0.94, F: 0.97, H: 1 };
    return values[e] || 1;
  }

  private getRemediationLevelValue(rl: string): number {
    const values: { [key: string]: number } = { X: 1, O: 0.95, T: 0.96, W: 0.97, U: 1 };
    return values[rl] || 1;
  }

  private getReportConfidenceValue(rc: string): number {
    const values: { [key: string]: number } = { X: 1, U: 0.92, R: 0.96, C: 1 };
    return values[rc] || 1;
  }

  private getRequirementValue(req: string): number {
    const values: { [key: string]: number } = { X: 1, L: 0.5, M: 1, H: 1.5 };
    return values[req] || 1;
  }

  private roundUp(value: number): number {
    return Math.ceil(value * 10) / 10;
  }
}
