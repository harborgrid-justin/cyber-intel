/**
 * Advanced Threat Scoring Algorithm
 * Multi-dimensional threat assessment using weighted factors
 */

interface ThreatScoreInput {
  confidence: number; // 0-100
  reputation: number; // 0-100
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  frequency?: number; // How often seen
  age?: number; // Days since first seen
  sources?: number; // Number of intelligence sources
  geographic_risk?: number; // Risk associated with origin country
  actor_sophistication?: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
  impact_scope?: 'LIMITED' | 'MODERATE' | 'SIGNIFICANT' | 'WIDESPREAD';
  exploitability?: number; // 0-100 (for vulnerabilities)
  prevalence?: number; // 0-100 (how common)
}

interface ThreatScore {
  final_score: number; // 0-100
  risk_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  breakdown: {
    base_score: number;
    temporal_factor: number;
    environmental_factor: number;
    intelligence_factor: number;
  };
  confidence_interval: { lower: number; upper: number };
  priority: number; // 1-10
  rationale: string[];
}

export class ThreatScorer {
  /**
   * Calculate comprehensive threat score
   */
  static calculateScore(input: ThreatScoreInput): ThreatScore {
    // Base score from severity, confidence, and reputation
    const base_score = this.calculateBaseScore(input);

    // Temporal factors (age, frequency)
    const temporal_factor = this.calculateTemporalFactor(input);

    // Environmental factors (impact, scope)
    const environmental_factor = this.calculateEnvironmentalFactor(input);

    // Intelligence factors (sources, sophistication)
    const intelligence_factor = this.calculateIntelligenceFactor(input);

    // Weighted combination
    const weights = {
      base: 0.40,
      temporal: 0.20,
      environmental: 0.25,
      intelligence: 0.15
    };

    const final_score = Math.min(100, Math.round(
      base_score * weights.base +
      temporal_factor * weights.temporal +
      environmental_factor * weights.environmental +
      intelligence_factor * weights.intelligence
    ));

    // Determine risk level
    const risk_level = this.determineRiskLevel(final_score);

    // Calculate confidence interval
    const confidence_interval = this.calculateConfidenceInterval(final_score, input.confidence);

    // Calculate priority (1-10)
    const priority = this.calculatePriority(final_score, risk_level, input);

    // Generate rationale
    const rationale = this.generateRationale(input, base_score, final_score);

    return {
      final_score,
      risk_level,
      breakdown: {
        base_score,
        temporal_factor,
        environmental_factor,
        intelligence_factor
      },
      confidence_interval,
      priority,
      rationale
    };
  }

  /**
   * CVSS-like scoring for vulnerabilities
   */
  static calculateCVSScore(vulnerability: {
    attack_vector: 'NETWORK' | 'ADJACENT' | 'LOCAL' | 'PHYSICAL';
    attack_complexity: 'LOW' | 'HIGH';
    privileges_required: 'NONE' | 'LOW' | 'HIGH';
    user_interaction: 'NONE' | 'REQUIRED';
    confidentiality_impact: 'NONE' | 'LOW' | 'HIGH';
    integrity_impact: 'NONE' | 'LOW' | 'HIGH';
    availability_impact: 'NONE' | 'LOW' | 'HIGH';
  }): number {
    // Simplified CVSS v3.1 scoring
    const av_scores = { NETWORK: 0.85, ADJACENT: 0.62, LOCAL: 0.55, PHYSICAL: 0.2 };
    const ac_scores = { LOW: 0.77, HIGH: 0.44 };
    const pr_scores = { NONE: 0.85, LOW: 0.62, HIGH: 0.27 };
    const ui_scores = { NONE: 0.85, REQUIRED: 0.62 };
    const impact_scores = { NONE: 0, LOW: 0.22, HIGH: 0.56 };

    const exploitability =
      8.22 *
      av_scores[vulnerability.attack_vector] *
      ac_scores[vulnerability.attack_complexity] *
      pr_scores[vulnerability.privileges_required] *
      ui_scores[vulnerability.user_interaction];

    const conf_impact = impact_scores[vulnerability.confidentiality_impact];
    const int_impact = impact_scores[vulnerability.integrity_impact];
    const avail_impact = impact_scores[vulnerability.availability_impact];

    const impact = 1 - ((1 - conf_impact) * (1 - int_impact) * (1 - avail_impact));

    const base_score = impact === 0 ? 0 : Math.min(10, ((1 - impact) * exploitability + impact * 10));

    return Math.round(base_score * 10) / 10;
  }

  /**
   * Dynamic scoring that adjusts based on context
   */
  static calculateContextualScore(
    baseScore: number,
    context: {
      asset_criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
      data_sensitivity?: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'SECRET';
      exposure?: 'INTERNAL' | 'DMZ' | 'PUBLIC';
      defenses?: 'WEAK' | 'MODERATE' | 'STRONG';
    }
  ): number {
    let multiplier = 1.0;

    // Asset criticality multiplier
    const criticalityMultipliers = {
      LOW: 0.8,
      MEDIUM: 1.0,
      HIGH: 1.3,
      CRITICAL: 1.5
    };
    if (context.asset_criticality) {
      multiplier *= criticalityMultipliers[context.asset_criticality];
    }

    // Data sensitivity multiplier
    const sensitivityMultipliers = {
      PUBLIC: 0.7,
      INTERNAL: 1.0,
      CONFIDENTIAL: 1.3,
      SECRET: 1.6
    };
    if (context.data_sensitivity) {
      multiplier *= sensitivityMultipliers[context.data_sensitivity];
    }

    // Exposure multiplier
    const exposureMultipliers = {
      INTERNAL: 0.9,
      DMZ: 1.2,
      PUBLIC: 1.5
    };
    if (context.exposure) {
      multiplier *= exposureMultipliers[context.exposure];
    }

    // Defense strength (inverse)
    const defenseMultipliers = {
      WEAK: 1.4,
      MODERATE: 1.0,
      STRONG: 0.7
    };
    if (context.defenses) {
      multiplier *= defenseMultipliers[context.defenses];
    }

    return Math.min(100, Math.round(baseScore * multiplier));
  }

  /**
   * Batch scoring for multiple threats
   */
  static batchScore(inputs: ThreatScoreInput[]): ThreatScore[] {
    return inputs.map(input => this.calculateScore(input));
  }

  /**
   * Compare and rank threats
   */
  static rankThreats(scores: ThreatScore[]): ThreatScore[] {
    return scores.sort((a, b) => {
      // Primary sort by priority
      if (a.priority !== b.priority) return b.priority - a.priority;
      // Secondary sort by final score
      return b.final_score - a.final_score;
    });
  }

  // Helper methods
  private static calculateBaseScore(input: ThreatScoreInput): number {
    const severityScores = {
      LOW: 20,
      MEDIUM: 50,
      HIGH: 75,
      CRITICAL: 95
    };

    const severityScore = severityScores[input.severity];
    const confidenceScore = input.confidence;
    const reputationScore = 100 - input.reputation; // Lower reputation = higher threat

    // Weighted average
    return (severityScore * 0.5 + reputationScore * 0.3 + confidenceScore * 0.2);
  }

  private static calculateTemporalFactor(input: ThreatScoreInput): number {
    let score = 50; // Base temporal score

    // Frequency boost
    if (input.frequency) {
      score += Math.min(30, input.frequency * 5);
    }

    // Age decay (older threats are less urgent)
    if (input.age !== undefined) {
      if (input.age < 7) score += 20; // Very recent
      else if (input.age < 30) score += 10; // Recent
      else if (input.age > 365) score -= 20; // Old
    }

    return Math.max(0, Math.min(100, score));
  }

  private static calculateEnvironmentalFactor(input: ThreatScoreInput): number {
    let score = 50;

    // Geographic risk
    if (input.geographic_risk !== undefined) {
      score += input.geographic_risk * 0.3;
    }

    // Impact scope
    if (input.impact_scope) {
      const scopeScores = {
        LIMITED: 20,
        MODERATE: 40,
        SIGNIFICANT: 70,
        WIDESPREAD: 95
      };
      score = (score + scopeScores[input.impact_scope]) / 2;
    }

    // Exploitability
    if (input.exploitability !== undefined) {
      score = (score + input.exploitability) / 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  private static calculateIntelligenceFactor(input: ThreatScoreInput): number {
    let score = 50;

    // Multiple sources increase confidence
    if (input.sources) {
      score += Math.min(30, input.sources * 10);
    }

    // Actor sophistication
    if (input.actor_sophistication) {
      const sophisticationScores = {
        Novice: 20,
        Intermediate: 40,
        Advanced: 70,
        Expert: 90
      };
      score = (score + sophisticationScores[input.actor_sophistication]) / 2;
    }

    // Prevalence (inverse - rare threats are more concerning)
    if (input.prevalence !== undefined) {
      score = (score + (100 - input.prevalence)) / 2;
    }

    return Math.max(0, Math.min(100, score));
  }

  private static determineRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    if (score >= 80) return 'CRITICAL';
    if (score >= 60) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private static calculateConfidenceInterval(score: number, confidence: number): { lower: number; upper: number } {
    // Calculate margin of error based on confidence
    const margin = (100 - confidence) / 100 * 20;

    return {
      lower: Math.max(0, Math.round(score - margin)),
      upper: Math.min(100, Math.round(score + margin))
    };
  }

  private static calculatePriority(
    score: number,
    riskLevel: string,
    input: ThreatScoreInput
  ): number {
    let priority = Math.ceil(score / 10);

    // Boost priority for critical severity
    if (input.severity === 'CRITICAL') priority = Math.min(10, priority + 2);

    // Boost for high exploitability
    if (input.exploitability && input.exploitability > 80) priority = Math.min(10, priority + 1);

    // Boost for expert adversaries
    if (input.actor_sophistication === 'Expert') priority = Math.min(10, priority + 1);

    return Math.max(1, Math.min(10, priority));
  }

  private static generateRationale(
    input: ThreatScoreInput,
    baseScore: number,
    finalScore: number
  ): string[] {
    const rationale: string[] = [];

    // Severity rationale
    rationale.push(`Severity level: ${input.severity} (base impact: ${this.severityToNumeric(input.severity)}/4)`);

    // Confidence rationale
    if (input.confidence < 50) {
      rationale.push(`Low confidence (${input.confidence}%) - treat with caution`);
    } else if (input.confidence > 80) {
      rationale.push(`High confidence (${input.confidence}%) - reliable intelligence`);
    }

    // Reputation rationale
    if (input.reputation < 30) {
      rationale.push(`Poor reputation score (${input.reputation}) - known malicious`);
    }

    // Frequency rationale
    if (input.frequency && input.frequency > 5) {
      rationale.push(`High frequency (${input.frequency} occurrences) - active threat`);
    }

    // Age rationale
    if (input.age !== undefined && input.age < 7) {
      rationale.push(`Recent threat (${input.age} days old) - immediate attention needed`);
    }

    // Sources rationale
    if (input.sources && input.sources >= 3) {
      rationale.push(`Confirmed by ${input.sources} intelligence sources`);
    }

    // Actor sophistication rationale
    if (input.actor_sophistication === 'Expert' || input.actor_sophistication === 'Advanced') {
      rationale.push(`${input.actor_sophistication} adversary - elevated threat`);
    }

    // Score adjustment rationale
    const adjustment = finalScore - baseScore;
    if (Math.abs(adjustment) > 10) {
      rationale.push(`Score adjusted by ${adjustment > 0 ? '+' : ''}${Math.round(adjustment)} points due to contextual factors`);
    }

    return rationale;
  }

  private static severityToNumeric(severity: string): number {
    const map: Record<string, number> = {
      LOW: 1,
      MEDIUM: 2,
      HIGH: 3,
      CRITICAL: 4
    };
    return map[severity] || 2;
  }
}
