/**
 * Risk Scoring and Aggregation
 *
 * Time Complexity: O(n) for aggregation
 * Space Complexity: O(1)
 *
 * Use Cases:
 * - Calculating overall threat risk scores
 * - Combining multiple risk factors
 * - Risk-based prioritization
 * - Threat actor risk assessment
 */

export interface RiskFactors {
  likelihood: number; // 0-1
  impact: number; // 0-1
  vulnerability: number; // 0-1
  threatLevel: number; // 0-1
  assetValue: number; // 0-1
  exposure: number; // 0-1
}

export interface RiskScore {
  score: number; // 0-100
  level: 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  factors: RiskFactors;
  confidence: number;
}

export class RiskScoring {
  /**
   * Calculate risk score using classic formula: Risk = Likelihood × Impact
   */
  calculateBasicRisk(likelihood: number, impact: number): RiskScore {
    const score = likelihood * impact * 100;
    const level = this.getRiskLevel(score);

    return {
      score,
      level,
      factors: {
        likelihood,
        impact,
        vulnerability: 0,
        threatLevel: 0,
        assetValue: 0,
        exposure: 0
      },
      confidence: 0.8
    };
  }

  /**
   * Calculate comprehensive risk score
   * Risk = (Threat × Vulnerability × Asset Value) × Exposure
   */
  calculateComprehensiveRisk(factors: Partial<RiskFactors>): RiskScore {
    const {
      likelihood = 0.5,
      impact = 0.5,
      vulnerability = 0.5,
      threatLevel = 0.5,
      assetValue = 0.5,
      exposure = 1.0
    } = factors;

    // Combine threat and vulnerability
    const threatVulnerability = threatLevel * vulnerability;

    // Calculate inherent risk
    const inherentRisk = likelihood * impact * assetValue;

    // Apply exposure factor
    const score = (inherentRisk + threatVulnerability) / 2 * exposure * 100;

    return {
      score,
      level: this.getRiskLevel(score),
      factors: {
        likelihood,
        impact,
        vulnerability,
        threatLevel,
        assetValue,
        exposure
      },
      confidence: this.calculateConfidence(factors)
    };
  }

  /**
   * NIST-based risk calculation
   * Risk = Threat × Vulnerability × Impact
   */
  calculateNISTRisk(
    threat: number,
    vulnerability: number,
    impact: number
  ): RiskScore {
    const score = threat * vulnerability * impact * 100;

    return {
      score,
      level: this.getRiskLevel(score),
      factors: {
        likelihood: threat,
        impact,
        vulnerability,
        threatLevel: threat,
        assetValue: impact,
        exposure: 1.0
      },
      confidence: 0.85
    };
  }

  /**
   * FAIR (Factor Analysis of Information Risk) model
   */
  calculateFAIRRisk(
    threatEventFrequency: number,
    vulnerabilityRate: number,
    primaryLossMagnitude: number,
    secondaryLossMagnitude: number = 0
  ): RiskScore {
    const lossEventFrequency = threatEventFrequency * vulnerabilityRate;
    const totalLossMagnitude = primaryLossMagnitude + secondaryLossMagnitude;
    const score = lossEventFrequency * totalLossMagnitude * 100;

    return {
      score,
      level: this.getRiskLevel(score),
      factors: {
        likelihood: lossEventFrequency,
        impact: totalLossMagnitude,
        vulnerability: vulnerabilityRate,
        threatLevel: threatEventFrequency,
        assetValue: primaryLossMagnitude,
        exposure: 1.0
      },
      confidence: 0.9
    };
  }

  /**
   * Aggregate multiple risk scores
   */
  aggregateRisks(
    risks: RiskScore[],
    method: 'max' | 'mean' | 'weighted' = 'weighted',
    weights?: number[]
  ): RiskScore {
    if (risks.length === 0) {
      return this.calculateBasicRisk(0, 0);
    }

    let aggregatedScore: number;

    switch (method) {
      case 'max':
        aggregatedScore = Math.max(...risks.map(r => r.score));
        break;

      case 'mean':
        aggregatedScore = risks.reduce((sum, r) => sum + r.score, 0) / risks.length;
        break;

      case 'weighted':
        if (weights && weights.length === risks.length) {
          const totalWeight = weights.reduce((a, b) => a + b, 0);
          aggregatedScore = risks.reduce(
            (sum, r, i) => sum + r.score * weights[i],
            0
          ) / totalWeight;
        } else {
          aggregatedScore = risks.reduce((sum, r) => sum + r.score, 0) / risks.length;
        }
        break;
    }

    // Aggregate factors (average)
    const aggregatedFactors: RiskFactors = {
      likelihood: 0,
      impact: 0,
      vulnerability: 0,
      threatLevel: 0,
      assetValue: 0,
      exposure: 0
    };

    for (const risk of risks) {
      for (const key of Object.keys(aggregatedFactors) as Array<keyof RiskFactors>) {
        aggregatedFactors[key] += risk.factors[key] / risks.length;
      }
    }

    const avgConfidence = risks.reduce((sum, r) => sum + r.confidence, 0) / risks.length;

    return {
      score: aggregatedScore,
      level: this.getRiskLevel(aggregatedScore),
      factors: aggregatedFactors,
      confidence: avgConfidence
    };
  }

  /**
   * Calculate residual risk after controls
   */
  calculateResidualRisk(
    inherentRisk: RiskScore,
    controlEffectiveness: number // 0-1
  ): RiskScore {
    const residualScore = inherentRisk.score * (1 - controlEffectiveness);

    return {
      score: residualScore,
      level: this.getRiskLevel(residualScore),
      factors: {
        ...inherentRisk.factors,
        vulnerability: inherentRisk.factors.vulnerability * (1 - controlEffectiveness)
      },
      confidence: inherentRisk.confidence * 0.9
    };
  }

  /**
   * Time-based risk adjustment
   * Risk increases over time without remediation
   */
  timeAdjustedRisk(
    baseRisk: RiskScore,
    daysOpen: number,
    decayRate: number = 0.01
  ): RiskScore {
    const timeMultiplier = 1 + (daysOpen * decayRate);
    const adjustedScore = Math.min(baseRisk.score * timeMultiplier, 100);

    return {
      ...baseRisk,
      score: adjustedScore,
      level: this.getRiskLevel(adjustedScore)
    };
  }

  private getRiskLevel(score: number): 'MINIMAL' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score < 10) return 'MINIMAL';
    if (score < 30) return 'LOW';
    if (score < 60) return 'MEDIUM';
    if (score < 85) return 'HIGH';
    return 'CRITICAL';
  }

  private calculateConfidence(factors: Partial<RiskFactors>): number {
    const provided = Object.values(factors).filter(v => v !== undefined).length;
    const total = 6; // Total number of factors
    return 0.5 + (provided / total) * 0.5;
  }
}
