/**
 * Confidence Score Calculation
 *
 * Time Complexity: O(n) for multi-source
 * Space Complexity: O(1)
 *
 * Use Cases:
 * - Assessing reliability of threat intelligence
 * - Weighting detection rule matches
 * - Evaluating data source credibility
 * - Attribution confidence scoring
 */

export interface ConfidenceFactors {
  sourceReliability: number; // 0-1
  dataQuality: number; // 0-1
  corroboration: number; // 0-1
  recency: number; // 0-1
  completeness: number; // 0-1
  consistency: number; // 0-1
}

export interface ConfidenceScore {
  score: number; // 0-100
  level: 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH';
  factors: ConfidenceFactors;
  explanation: string;
}

export class ConfidenceScoring {
  /**
   * Calculate confidence using Admiralty Code
   * Source Reliability (A-F) + Information Credibility (1-6)
   */
  calculateAdmiralty(
    sourceReliability: 'A' | 'B' | 'C' | 'D' | 'E' | 'F',
    infoCred: 1 | 2 | 3 | 4 | 5 | 6
  ): ConfidenceScore {
    const reliabilityScores = {
      A: 1.0,   // Completely reliable
      B: 0.83,  // Usually reliable
      C: 0.67,  // Fairly reliable
      D: 0.5,   // Not usually reliable
      E: 0.33,  // Unreliable
      F: 0.17   // Reliability cannot be judged
    };

    const credScores = {
      1: 1.0,   // Confirmed
      2: 0.83,  // Probably true
      3: 0.67,  // Possibly true
      4: 0.5,   // Doubtful
      5: 0.33,  // Improbable
      6: 0.17   // Truth cannot be judged
    };

    const relScore = reliabilityScores[sourceReliability];
    const credScore = credScores[infoCred];
    const score = ((relScore + credScore) / 2) * 100;

    return {
      score,
      level: this.getConfidenceLevel(score),
      factors: {
        sourceReliability: relScore,
        dataQuality: credScore,
        corroboration: 0.5,
        recency: 0.5,
        completeness: 0.5,
        consistency: 0.5
      },
      explanation: `Admiralty ${sourceReliability}${infoCred}: Source ${sourceReliability}, Info credibility ${infoCred}`
    };
  }

  /**
   * Traffic Light Protocol (TLP) based confidence
   */
  calculateTLP(
    tlp: 'RED' | 'AMBER' | 'GREEN' | 'WHITE',
    sharing: boolean,
    verification: boolean
  ): ConfidenceScore {
    const tlpBase = {
      RED: 0.9,     // Not for disclosure, highly sensitive
      AMBER: 0.75,  // Limited disclosure
      GREEN: 0.6,   // Community wide
      WHITE: 0.5    // Unlimited disclosure
    };

    let score = tlpBase[tlp] * 100;
    if (verification) score = Math.min(score + 10, 100);
    if (!sharing) score = Math.max(score - 10, 0);

    return {
      score,
      level: this.getConfidenceLevel(score),
      factors: {
        sourceReliability: tlpBase[tlp],
        dataQuality: verification ? 0.9 : 0.6,
        corroboration: sharing ? 0.7 : 0.4,
        recency: 0.7,
        completeness: 0.7,
        consistency: 0.7
      },
      explanation: `TLP:${tlp}, ${verification ? 'verified' : 'unverified'}, ${sharing ? 'shared intel' : 'single source'}`
    };
  }

  /**
   * Multi-factor confidence calculation
   */
  calculateComprehensive(factors: Partial<ConfidenceFactors>): ConfidenceScore {
    const {
      sourceReliability = 0.5,
      dataQuality = 0.5,
      corroboration = 0.5,
      recency = 0.5,
      completeness = 0.5,
      consistency = 0.5
    } = factors;

    // Weighted average
    const weights = {
      sourceReliability: 0.25,
      dataQuality: 0.20,
      corroboration: 0.20,
      completeness: 0.15,
      consistency: 0.15,
      recency: 0.05
    };

    const score =
      sourceReliability * weights.sourceReliability +
      dataQuality * weights.dataQuality +
      corroboration * weights.corroboration +
      completeness * weights.completeness +
      consistency * weights.consistency +
      recency * weights.recency;

    const fullFactors = {
      sourceReliability,
      dataQuality,
      corroboration,
      recency,
      completeness,
      consistency
    };

    return {
      score: score * 100,
      level: this.getConfidenceLevel(score * 100),
      factors: fullFactors,
      explanation: this.generateExplanation(fullFactors)
    };
  }

  /**
   * Bayesian confidence update
   * Updates prior confidence with new evidence
   */
  bayesianUpdate(
    priorConfidence: number,
    evidenceConfidence: number,
    evidenceWeight: number = 0.5
  ): ConfidenceScore {
    // Bayesian update formula
    const posterior =
      (priorConfidence * (1 - evidenceWeight)) +
      (evidenceConfidence * evidenceWeight);

    return {
      score: posterior * 100,
      level: this.getConfidenceLevel(posterior * 100),
      factors: {
        sourceReliability: posterior,
        dataQuality: evidenceConfidence,
        corroboration: evidenceWeight,
        recency: 0.8,
        completeness: 0.7,
        consistency: posterior
      },
      explanation: `Bayesian update: Prior ${(priorConfidence * 100).toFixed(1)}% + Evidence ${(evidenceConfidence * 100).toFixed(1)}% = ${(posterior * 100).toFixed(1)}%`
    };
  }

  /**
   * Source corroboration confidence
   * Higher confidence with multiple independent sources
   */
  calculateCorroboration(
    sources: Array<{ reliability: number; agrees: boolean }>
  ): ConfidenceScore {
    if (sources.length === 0) {
      return this.calculateComprehensive({ sourceReliability: 0 });
    }

    const agreeingSources = sources.filter(s => s.agrees);
    const totalReliability = sources.reduce((sum, s) => sum + s.reliability, 0);
    const agreeingReliability = agreeingSources.reduce((sum, s) => sum + s.reliability, 0);

    const agreementRatio = agreeingSources.length / sources.length;
    const weightedAgreement = agreeingReliability / totalReliability;

    // Confidence increases with more sources and higher agreement
    const diversityBonus = Math.min(sources.length / 10, 0.3);
    const score = (weightedAgreement * 0.7 + agreementRatio * 0.3 + diversityBonus) * 100;

    return {
      score: Math.min(score, 100),
      level: this.getConfidenceLevel(score),
      factors: {
        sourceReliability: totalReliability / sources.length,
        dataQuality: weightedAgreement,
        corroboration: agreementRatio,
        recency: 0.7,
        completeness: diversityBonus / 0.3,
        consistency: agreementRatio
      },
      explanation: `${agreeingSources.length}/${sources.length} sources agree (${(agreementRatio * 100).toFixed(0)}% agreement)`
    };
  }

  /**
   * Time-decay confidence
   * Confidence decreases with age of intelligence
   */
  timeDecayConfidence(
    baseConfidence: number,
    ageInDays: number,
    halfLife: number = 30
  ): ConfidenceScore {
    // Exponential decay
    const decayFactor = Math.pow(0.5, ageInDays / halfLife);
    const adjustedConfidence = baseConfidence * decayFactor;

    return {
      score: adjustedConfidence * 100,
      level: this.getConfidenceLevel(adjustedConfidence * 100),
      factors: {
        sourceReliability: baseConfidence,
        dataQuality: baseConfidence,
        corroboration: 0.5,
        recency: decayFactor,
        completeness: 0.7,
        consistency: 0.7
      },
      explanation: `Base confidence ${(baseConfidence * 100).toFixed(1)}% decayed over ${ageInDays} days to ${(adjustedConfidence * 100).toFixed(1)}%`
    };
  }

  /**
   * Data completeness confidence
   */
  calculateCompleteness(
    requiredFields: string[],
    providedFields: string[],
    qualityScores?: Map<string, number>
  ): ConfidenceScore {
    const providedSet = new Set(providedFields);
    const presentFields = requiredFields.filter(f => providedSet.has(f));

    const completenessRatio = presentFields.length / requiredFields.length;

    let qualityScore = completenessRatio;
    if (qualityScores) {
      const avgQuality = presentFields.reduce(
        (sum, field) => sum + (qualityScores.get(field) || 0),
        0
      ) / presentFields.length;
      qualityScore = (completenessRatio * 0.6 + avgQuality * 0.4);
    }

    const score = qualityScore * 100;

    return {
      score,
      level: this.getConfidenceLevel(score),
      factors: {
        sourceReliability: 0.7,
        dataQuality: qualityScore,
        corroboration: 0.5,
        recency: 0.7,
        completeness: completenessRatio,
        consistency: 0.7
      },
      explanation: `${presentFields.length}/${requiredFields.length} required fields present (${(completenessRatio * 100).toFixed(0)}%)`
    };
  }

  /**
   * Statistical confidence interval
   * For aggregated scores
   */
  calculateStatistical(
    samples: number[],
    confidenceLevel: number = 0.95
  ): ConfidenceScore {
    if (samples.length === 0) {
      return this.calculateComprehensive({});
    }

    const mean = samples.reduce((a, b) => a + b, 0) / samples.length;
    const variance = samples.reduce((sum, x) => sum + Math.pow(x - mean, 2), 0) / samples.length;
    const stdDev = Math.sqrt(variance);

    // Z-score for confidence level (approximation)
    const zScore = confidenceLevel === 0.95 ? 1.96 : 2.58;
    const marginOfError = zScore * (stdDev / Math.sqrt(samples.length));

    // Higher confidence with more samples and lower variance
    const sampleConfidence = Math.min(samples.length / 100, 1);
    const varianceConfidence = 1 - Math.min(stdDev / mean, 1);

    const score = (mean * 0.6 + sampleConfidence * 0.2 + varianceConfidence * 0.2) * 100;

    return {
      score,
      level: this.getConfidenceLevel(score),
      factors: {
        sourceReliability: sampleConfidence,
        dataQuality: mean,
        corroboration: sampleConfidence,
        recency: 0.7,
        completeness: sampleConfidence,
        consistency: varianceConfidence
      },
      explanation: `Mean ${mean.toFixed(2)} ± ${marginOfError.toFixed(2)} (${samples.length} samples, σ=${stdDev.toFixed(2)})`
    };
  }

  private getConfidenceLevel(score: number): 'VERY_LOW' | 'LOW' | 'MEDIUM' | 'HIGH' | 'VERY_HIGH' {
    if (score < 20) return 'VERY_LOW';
    if (score < 40) return 'LOW';
    if (score < 60) return 'MEDIUM';
    if (score < 80) return 'HIGH';
    return 'VERY_HIGH';
  }

  private generateExplanation(factors: ConfidenceFactors): string {
    const parts: string[] = [];

    if (factors.sourceReliability > 0.8) parts.push('highly reliable source');
    else if (factors.sourceReliability < 0.3) parts.push('low source reliability');

    if (factors.corroboration > 0.7) parts.push('well corroborated');
    else if (factors.corroboration < 0.3) parts.push('single source');

    if (factors.dataQuality > 0.8) parts.push('high quality data');
    else if (factors.dataQuality < 0.3) parts.push('low quality data');

    if (factors.completeness < 0.5) parts.push('incomplete information');

    return parts.length > 0 ? parts.join(', ') : 'moderate confidence';
  }
}
