/**
 * Severity Assessment Algorithms
 *
 * Time Complexity: O(1)
 * Space Complexity: O(1)
 *
 * Use Cases:
 * - Classifying threat severity
 * - Alert categorization
 * - Incident severity assessment
 * - SLA determination
 */

export interface SeverityFactors {
  scope: number; // 0-1
  impact: number; // 0-1
  exploitability: number; // 0-1
  affectedSystems: number; // 0-1
  dataClassification: number; // 0-1
  businessImpact: number; // 0-1
}

export interface SeverityScore {
  score: number; // 0-100
  level: 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: SeverityFactors;
  description: string;
  slaHours: number;
}

export class SeverityScoring {
  /**
   * Calculate comprehensive severity
   */
  calculate(factors: Partial<SeverityFactors>): SeverityScore {
    const {
      scope = 0.5,
      impact = 0.5,
      exploitability = 0.5,
      affectedSystems = 0.5,
      dataClassification = 0.5,
      businessImpact = 0.5
    } = factors;

    // Weighted calculation
    const score =
      scope * 0.20 +
      impact * 0.25 +
      exploitability * 0.15 +
      affectedSystems * 0.15 +
      dataClassification * 0.15 +
      businessImpact * 0.10;

    const fullFactors = {
      scope,
      impact,
      exploitability,
      affectedSystems,
      dataClassification,
      businessImpact
    };

    const level = this.getSeverityLevel(score * 100);
    const description = this.getDescription(level, fullFactors);
    const slaHours = this.getSLAHours(level);

    return {
      score: score * 100,
      level,
      factors: fullFactors,
      description,
      slaHours
    };
  }

  /**
   * NIST-based severity (800-61)
   */
  calculateNIST(
    functionalImpact: 'NONE' | 'LOW' | 'MEDIUM' | 'HIGH',
    informationImpact: 'NONE' | 'PRIVACY_BREACH' | 'PROPRIETARY' | 'PII',
    recoverability: 'REGULAR' | 'SUPPLEMENTED' | 'EXTENDED' | 'NOT_RECOVERABLE'
  ): SeverityScore {
    const functionalScores = { NONE: 0, LOW: 0.3, MEDIUM: 0.6, HIGH: 0.9 };
    const informationScores = { NONE: 0, PRIVACY_BREACH: 0.5, PROPRIETARY: 0.7, PII: 0.9 };
    const recoverabilityScores = { REGULAR: 0.2, SUPPLEMENTED: 0.4, EXTENDED: 0.7, NOT_RECOVERABLE: 1.0 };

    const funcScore = functionalScores[functionalImpact];
    const infoScore = informationScores[informationImpact];
    const recScore = recoverabilityScores[recoverability];

    const score = (funcScore * 0.4 + infoScore * 0.3 + recScore * 0.3) * 100;

    return {
      score,
      level: this.getSeverityLevel(score),
      factors: {
        scope: funcScore,
        impact: funcScore,
        exploitability: 0.5,
        affectedSystems: funcScore,
        dataClassification: infoScore,
        businessImpact: recScore
      },
      description: `NIST: Functional=${functionalImpact}, Information=${informationImpact}, Recoverability=${recoverability}`,
      slaHours: this.getSLAHours(this.getSeverityLevel(score))
    };
  }

  /**
   * CIA Triad based severity
   */
  calculateCIA(
    confidentiality: number,
    integrity: number,
    availability: number,
    weights: { c: number; i: number; a: number } = { c: 0.33, i: 0.33, a: 0.34 }
  ): SeverityScore {
    const score = (confidentiality * weights.c + integrity * weights.i + availability * weights.a) * 100;

    return {
      score,
      level: this.getSeverityLevel(score),
      factors: {
        scope: Math.max(confidentiality, integrity, availability),
        impact: score / 100,
        exploitability: 0.5,
        affectedSystems: 0.5,
        dataClassification: confidentiality,
        businessImpact: availability
      },
      description: `CIA: C=${(confidentiality * 100).toFixed(0)}%, I=${(integrity * 100).toFixed(0)}%, A=${(availability * 100).toFixed(0)}%`,
      slaHours: this.getSLAHours(this.getSeverityLevel(score))
    };
  }

  /**
   * Alert severity based on detection confidence and threat level
   */
  calculateAlert(
    detectionConfidence: number,
    threatLevel: number,
    falsePositiveRate: number = 0.1
  ): SeverityScore {
    const adjustedConfidence = detectionConfidence * (1 - falsePositiveRate);
    const score = (adjustedConfidence * threatLevel) * 100;

    return {
      score,
      level: this.getSeverityLevel(score),
      factors: {
        scope: threatLevel,
        impact: threatLevel,
        exploitability: threatLevel,
        affectedSystems: 0.5,
        dataClassification: 0.5,
        businessImpact: threatLevel
      },
      description: `Alert: ${(detectionConfidence * 100).toFixed(0)}% confidence, ${(threatLevel * 100).toFixed(0)}% threat level, ${(falsePositiveRate * 100).toFixed(0)}% FP rate`,
      slaHours: this.getSLAHours(this.getSeverityLevel(score))
    };
  }

  /**
   * Data breach severity
   */
  calculateDataBreach(
    recordsAffected: number,
    dataType: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED',
    regulatoryImpact: boolean,
    estimatedCost: number // USD
  ): SeverityScore {
    const dataTypeScores = {
      PUBLIC: 0.2,
      INTERNAL: 0.5,
      CONFIDENTIAL: 0.8,
      RESTRICTED: 1.0
    };

    const recordsScore = Math.min(Math.log10(recordsAffected) / 6, 1); // Logarithmic scale
    const dataScore = dataTypeScores[dataType];
    const regScore = regulatoryImpact ? 0.3 : 0;
    const costScore = Math.min(Math.log10(estimatedCost) / 6, 0.3); // Up to 30%

    const score = (recordsScore * 0.3 + dataScore * 0.4 + regScore + costScore) * 100;

    return {
      score,
      level: this.getSeverityLevel(score),
      factors: {
        scope: recordsScore,
        impact: dataScore,
        exploitability: 0.7,
        affectedSystems: recordsScore,
        dataClassification: dataScore,
        businessImpact: costScore / 0.3
      },
      description: `Data Breach: ${recordsAffected.toLocaleString()} records, ${dataType} data${regulatoryImpact ? ', regulatory impact' : ''}`,
      slaHours: this.getSLAHours(this.getSeverityLevel(score))
    };
  }

  /**
   * Ransomware severity
   */
  calculateRansomware(
    encryptedSystems: number,
    totalSystems: number,
    criticalSystemsAffected: number,
    backupAvailability: number // 0-1
  ): SeverityScore {
    const encryptionRatio = encryptedSystems / totalSystems;
    const criticalImpact = Math.min(criticalSystemsAffected / 10, 1);
    const backupPenalty = 1 - backupAvailability;

    const score = (encryptionRatio * 0.4 + criticalImpact * 0.4 + backupPenalty * 0.2) * 100;

    return {
      score,
      level: this.getSeverityLevel(score),
      factors: {
        scope: encryptionRatio,
        impact: criticalImpact,
        exploitability: 1.0,
        affectedSystems: encryptionRatio,
        dataClassification: 0.8,
        businessImpact: criticalImpact
      },
      description: `Ransomware: ${encryptedSystems}/${totalSystems} systems encrypted, ${criticalSystemsAffected} critical systems, ${(backupAvailability * 100).toFixed(0)}% backup availability`,
      slaHours: this.getSLAHours(this.getSeverityLevel(score))
    };
  }

  /**
   * APT (Advanced Persistent Threat) severity
   */
  calculateAPT(
    dwellTime: number, // days
    lateralMovement: boolean,
    dataExfiltration: boolean,
    persistence: boolean,
    attribution: number // 0-1 confidence
  ): SeverityScore {
    const dwellTimeScore = Math.min(dwellTime / 365, 1); // Max at 1 year
    const lateralScore = lateralMovement ? 0.25 : 0;
    const exfilScore = dataExfiltration ? 0.3 : 0;
    const persistScore = persistence ? 0.2 : 0;

    const score = (dwellTimeScore * 0.25 + lateralScore + exfilScore + persistScore + attribution * 0.1) * 100;

    return {
      score: Math.min(score, 100),
      level: 'CRITICAL', // APTs are always critical
      factors: {
        scope: lateralMovement ? 0.9 : 0.5,
        impact: dataExfiltration ? 0.9 : 0.6,
        exploitability: 0.9,
        affectedSystems: lateralMovement ? 0.8 : 0.4,
        dataClassification: dataExfiltration ? 0.9 : 0.5,
        businessImpact: persistence ? 0.9 : 0.6
      },
      description: `APT: ${dwellTime} days dwell time${lateralMovement ? ', lateral movement' : ''}${dataExfiltration ? ', data exfiltration' : ''}${persistence ? ', persistent' : ''}`,
      slaHours: 4 // Immediate response
    };
  }

  private getSeverityLevel(score: number): 'INFORMATIONAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 10) return 'INFORMATIONAL';
    if (score < 35) return 'LOW';
    if (score < 60) return 'MEDIUM';
    if (score < 85) return 'HIGH';
    return 'CRITICAL';
  }

  private getSLAHours(level: string): number {
    const slaMap: { [key: string]: number } = {
      INFORMATIONAL: 168, // 7 days
      LOW: 72,           // 3 days
      MEDIUM: 24,        // 1 day
      HIGH: 8,           // 8 hours
      CRITICAL: 4        // 4 hours
    };
    return slaMap[level] || 24;
  }

  private getDescription(level: string, factors: SeverityFactors): string {
    const parts: string[] = [level];

    if (factors.scope > 0.7) parts.push('widespread scope');
    if (factors.impact > 0.7) parts.push('high impact');
    if (factors.exploitability > 0.7) parts.push('easily exploitable');
    if (factors.affectedSystems > 0.7) parts.push('many systems affected');
    if (factors.dataClassification > 0.7) parts.push('sensitive data');
    if (factors.businessImpact > 0.7) parts.push('significant business impact');

    return parts.join(', ');
  }
}
