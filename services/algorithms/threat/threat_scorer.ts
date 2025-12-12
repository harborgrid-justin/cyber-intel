/**
 * Threat Scorer - Advanced Threat Scoring Engine
 *
 * Multi-dimensional threat scoring combining multiple factors
 *
 * Time Complexity: O(n) where n is number of factors
 * Space Complexity: O(1)
 *
 * Use Cases:
 * - Comprehensive threat assessment
 * - Threat prioritization
 * - Risk-based alert triage
 * - Threat intelligence scoring
 * - Security operations automation
 */

export interface ThreatFactors {
  // Severity factors (0-1)
  exploitability: number;
  impact: number;
  scope: number;

  // Confidence factors (0-1)
  sourceReliability: number;
  dataQuality: number;
  correlationStrength: number;

  // Context factors (0-1)
  assetCriticality: number;
  threatActorCapability: number;
  targetedAttack: number;

  // Temporal factors (0-1)
  recency: number;
  frequency: number;
  velocity: number;

  // Intelligence factors (0-1)
  threatIntelMatch: number;
  knownMalicious: number;
  reputationScore: number;
}

export interface ThreatScore {
  overallScore: number; // 0-100
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  priority: number; // 1-5
  confidence: number; // 0-1
  factors: ThreatFactors;
  breakdown: ScoreBreakdown;
  metadata: {
    scoredAt: Date;
    version: string;
    model: string;
  };
}

export interface ScoreBreakdown {
  severityComponent: number;
  confidenceComponent: number;
  contextComponent: number;
  temporalComponent: number;
  intelligenceComponent: number;
  weights: ComponentWeights;
}

export interface ComponentWeights {
  severity: number;
  confidence: number;
  context: number;
  temporal: number;
  intelligence: number;
}

export interface ScoringOptions {
  weights?: Partial<ComponentWeights>;
  model?: 'standard' | 'conservative' | 'aggressive';
  includeBreakdown?: boolean;
  normalizeScore?: boolean;
}

export interface ThreatEntity {
  id: string;
  type: 'malware' | 'vulnerability' | 'actor' | 'campaign' | 'indicator' | 'incident';
  indicators?: string[];
  attributes?: Record<string, any>;
}

/**
 * Advanced Threat Scoring Engine
 */
export class ThreatScorer {
  private defaultWeights: ComponentWeights = {
    severity: 0.30,
    confidence: 0.20,
    context: 0.25,
    temporal: 0.15,
    intelligence: 0.10
  };

  /**
   * Calculate comprehensive threat score
   */
  score(factors: Partial<ThreatFactors>, options: ScoringOptions = {}): ThreatScore {
    const {
      weights = this.defaultWeights,
      model = 'standard',
      includeBreakdown = true,
      normalizeScore = true
    } = options;

    // Apply model adjustments
    const adjustedWeights = this.applyModelWeights(weights, model);

    // Fill in default factor values
    const completedFactors = this.completeFactors(factors);

    // Calculate component scores
    const severityComponent = this.calculateSeverityComponent(completedFactors);
    const confidenceComponent = this.calculateConfidenceComponent(completedFactors);
    const contextComponent = this.calculateContextComponent(completedFactors);
    const temporalComponent = this.calculateTemporalComponent(completedFactors);
    const intelligenceComponent = this.calculateIntelligenceComponent(completedFactors);

    // Calculate weighted overall score
    let overallScore =
      severityComponent * adjustedWeights.severity +
      confidenceComponent * adjustedWeights.confidence +
      contextComponent * adjustedWeights.context +
      temporalComponent * adjustedWeights.temporal +
      intelligenceComponent * adjustedWeights.intelligence;

    // Normalize to 0-100 scale
    if (normalizeScore) {
      overallScore *= 100;
    }

    // Calculate aggregate confidence
    const confidence = this.calculateAggregateConfidence(completedFactors);

    // Determine severity level
    const severity = this.determineSeverity(overallScore);

    // Calculate priority
    const priority = this.calculatePriority(overallScore, confidence);

    // Build breakdown
    const breakdown: ScoreBreakdown = {
      severityComponent,
      confidenceComponent,
      contextComponent,
      temporalComponent,
      intelligenceComponent,
      weights: adjustedWeights
    };

    return {
      overallScore,
      severity,
      priority,
      confidence,
      factors: completedFactors,
      breakdown: includeBreakdown ? breakdown : {} as ScoreBreakdown,
      metadata: {
        scoredAt: new Date(),
        version: '2.0',
        model
      }
    };
  }

  /**
   * Score a threat entity with contextual analysis
   */
  scoreEntity(entity: ThreatEntity, context: Partial<ThreatFactors> = {}): ThreatScore {
    const factors = this.extractEntityFactors(entity, context);
    return this.score(factors, { model: this.selectModelForEntity(entity) });
  }

  /**
   * Batch score multiple threats
   */
  scoreBatch(threats: Array<{ id: string; factors: Partial<ThreatFactors> }>, options: ScoringOptions = {}): Map<string, ThreatScore> {
    const scores = new Map<string, ThreatScore>();

    for (const threat of threats) {
      scores.set(threat.id, this.score(threat.factors, options));
    }

    return scores;
  }

  /**
   * Calculate severity component
   */
  private calculateSeverityComponent(factors: ThreatFactors): number {
    const { exploitability, impact, scope } = factors;

    // CVSS-inspired calculation
    const impactScore = 1 - ((1 - impact) * (1 - scope));
    const exploitabilityScore = exploitability;

    // Combine with exponential scaling
    let score = impactScore * 0.6 + exploitabilityScore * 0.4;

    // Apply scope multiplier
    score *= (1 + scope * 0.2);

    return Math.min(score, 1.0);
  }

  /**
   * Calculate confidence component
   */
  private calculateConfidenceComponent(factors: ThreatFactors): number {
    const { sourceReliability, dataQuality, correlationStrength } = factors;

    // Weighted geometric mean for confidence
    const weights = [0.4, 0.3, 0.3];
    const values = [sourceReliability, dataQuality, correlationStrength];

    let product = 1;
    for (let i = 0; i < values.length; i++) {
      product *= Math.pow(values[i], weights[i]);
    }

    return product;
  }

  /**
   * Calculate context component
   */
  private calculateContextComponent(factors: ThreatFactors): number {
    const { assetCriticality, threatActorCapability, targetedAttack } = factors;

    // Context amplifies threat significance
    let score = assetCriticality * 0.5;
    score += threatActorCapability * 0.3;
    score += targetedAttack * 0.2;

    // Targeted attacks on critical assets are especially significant
    if (assetCriticality > 0.8 && targetedAttack > 0.7) {
      score *= 1.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate temporal component
   */
  private calculateTemporalComponent(factors: ThreatFactors): number {
    const { recency, frequency, velocity } = factors;

    // Recent, frequent, and accelerating threats score higher
    let score = recency * 0.5; // Recency is most important
    score += frequency * 0.3;
    score += velocity * 0.2;

    // Boost for high velocity threats
    if (velocity > 0.8) {
      score *= 1.15;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate intelligence component
   */
  private calculateIntelligenceComponent(factors: ThreatFactors): number {
    const { threatIntelMatch, knownMalicious, reputationScore } = factors;

    // Higher weight on known malicious indicators
    let score = knownMalicious * 0.5;
    score += threatIntelMatch * 0.3;
    score += (1 - reputationScore) * 0.2; // Invert reputation (low rep = high threat)

    return Math.min(score, 1.0);
  }

  /**
   * Calculate aggregate confidence
   */
  private calculateAggregateConfidence(factors: ThreatFactors): number {
    const { sourceReliability, dataQuality, correlationStrength } = factors;
    return (sourceReliability + dataQuality + correlationStrength) / 3;
  }

  /**
   * Determine severity level
   */
  private determineSeverity(score: number): ThreatScore['severity'] {
    if (score >= 90) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 40) return 'MEDIUM';
    if (score >= 10) return 'LOW';
    return 'INFO';
  }

  /**
   * Calculate priority (1-5 scale)
   */
  private calculatePriority(score: number, confidence: number): number {
    // Combine score and confidence
    const adjustedScore = score * confidence;

    if (adjustedScore >= 80) return 5; // Critical priority
    if (adjustedScore >= 60) return 4; // High priority
    if (adjustedScore >= 40) return 3; // Medium priority
    if (adjustedScore >= 20) return 2; // Low priority
    return 1; // Info priority
  }

  /**
   * Complete partial factors with defaults
   */
  private completeFactors(partial: Partial<ThreatFactors>): ThreatFactors {
    return {
      exploitability: partial.exploitability ?? 0.5,
      impact: partial.impact ?? 0.5,
      scope: partial.scope ?? 0.5,
      sourceReliability: partial.sourceReliability ?? 0.5,
      dataQuality: partial.dataQuality ?? 0.5,
      correlationStrength: partial.correlationStrength ?? 0.5,
      assetCriticality: partial.assetCriticality ?? 0.5,
      threatActorCapability: partial.threatActorCapability ?? 0.5,
      targetedAttack: partial.targetedAttack ?? 0.3,
      recency: partial.recency ?? 0.5,
      frequency: partial.frequency ?? 0.5,
      velocity: partial.velocity ?? 0.5,
      threatIntelMatch: partial.threatIntelMatch ?? 0.0,
      knownMalicious: partial.knownMalicious ?? 0.0,
      reputationScore: partial.reputationScore ?? 0.5
    };
  }

  /**
   * Apply model-specific weight adjustments
   */
  private applyModelWeights(
    weights: Partial<ComponentWeights>,
    model: ScoringOptions['model']
  ): ComponentWeights {
    let baseWeights = { ...this.defaultWeights, ...weights };

    switch (model) {
      case 'conservative':
        // Increase confidence weight, decrease severity
        baseWeights.confidence *= 1.3;
        baseWeights.severity *= 0.8;
        break;

      case 'aggressive':
        // Increase severity and intelligence weights
        baseWeights.severity *= 1.2;
        baseWeights.intelligence *= 1.3;
        baseWeights.confidence *= 0.8;
        break;

      case 'standard':
      default:
        // Use base weights
        break;
    }

    // Normalize weights to sum to 1
    const total = Object.values(baseWeights).reduce((a, b) => a + b, 0);
    return {
      severity: baseWeights.severity / total,
      confidence: baseWeights.confidence / total,
      context: baseWeights.context / total,
      temporal: baseWeights.temporal / total,
      intelligence: baseWeights.intelligence / total
    };
  }

  /**
   * Extract factors from threat entity
   */
  private extractEntityFactors(entity: ThreatEntity, context: Partial<ThreatFactors>): Partial<ThreatFactors> {
    const factors: Partial<ThreatFactors> = { ...context };

    switch (entity.type) {
      case 'malware':
        factors.knownMalicious = 0.9;
        factors.impact = 0.8;
        factors.exploitability = 0.7;
        break;

      case 'vulnerability':
        factors.exploitability = entity.attributes?.cvssScore ? entity.attributes.cvssScore / 10 : 0.5;
        factors.impact = entity.attributes?.impact === 'HIGH' ? 0.9 : 0.5;
        break;

      case 'actor':
        factors.threatActorCapability = entity.attributes?.sophistication === 'advanced' ? 0.9 : 0.6;
        factors.targetedAttack = 0.8;
        break;

      case 'indicator':
        factors.threatIntelMatch = 0.8;
        factors.sourceReliability = entity.attributes?.source === 'verified' ? 0.9 : 0.6;
        break;

      case 'incident':
        factors.recency = 0.9;
        factors.dataQuality = 0.8;
        break;
    }

    return factors;
  }

  /**
   * Select appropriate scoring model for entity type
   */
  private selectModelForEntity(entity: ThreatEntity): ScoringOptions['model'] {
    switch (entity.type) {
      case 'malware':
      case 'actor':
        return 'aggressive';

      case 'vulnerability':
        return 'standard';

      case 'indicator':
        return 'conservative';

      default:
        return 'standard';
    }
  }

  /**
   * Compare two threat scores
   */
  compareScores(score1: ThreatScore, score2: ThreatScore): {
    comparison: 'higher' | 'lower' | 'equal';
    difference: number;
    recommendation: string;
  } {
    const diff = score1.overallScore - score2.overallScore;
    const absDiff = Math.abs(diff);

    let comparison: 'higher' | 'lower' | 'equal';
    if (absDiff < 5) {
      comparison = 'equal';
    } else if (diff > 0) {
      comparison = 'higher';
    } else {
      comparison = 'lower';
    }

    let recommendation = '';
    if (comparison === 'higher') {
      recommendation = 'Prioritize threat 1 for immediate action';
    } else if (comparison === 'lower') {
      recommendation = 'Prioritize threat 2 for immediate action';
    } else {
      recommendation = 'Both threats require similar priority';
    }

    return {
      comparison,
      difference: diff,
      recommendation
    };
  }

  /**
   * Calculate score trend over time
   */
  calculateTrend(scores: ThreatScore[]): {
    trend: 'increasing' | 'decreasing' | 'stable';
    velocity: number;
    recommendation: string;
  } {
    if (scores.length < 2) {
      return { trend: 'stable', velocity: 0, recommendation: 'Insufficient data for trend analysis' };
    }

    // Calculate linear regression
    const xValues = scores.map((_, i) => i);
    const yValues = scores.map(s => s.overallScore);

    const n = scores.length;
    const sumX = xValues.reduce((a, b) => a + b, 0);
    const sumY = yValues.reduce((a, b) => a + b, 0);
    const sumXY = xValues.reduce((sum, x, i) => sum + x * yValues[i], 0);
    const sumX2 = xValues.reduce((sum, x) => sum + x * x, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);

    let trend: 'increasing' | 'decreasing' | 'stable';
    if (Math.abs(slope) < 1) {
      trend = 'stable';
    } else if (slope > 0) {
      trend = 'increasing';
    } else {
      trend = 'decreasing';
    }

    let recommendation = '';
    if (trend === 'increasing') {
      recommendation = 'Threat is escalating - immediate investigation recommended';
    } else if (trend === 'decreasing') {
      recommendation = 'Threat is diminishing - continue monitoring';
    } else {
      recommendation = 'Threat level is stable - maintain current posture';
    }

    return {
      trend,
      velocity: slope,
      recommendation
    };
  }

  /**
   * Generate scoring report
   */
  generateReport(score: ThreatScore): string {
    const lines: string[] = [];

    lines.push('=== THREAT SCORE REPORT ===');
    lines.push('');
    lines.push(`Overall Score: ${score.overallScore.toFixed(2)}/100`);
    lines.push(`Severity: ${score.severity}`);
    lines.push(`Priority: P${score.priority}`);
    lines.push(`Confidence: ${(score.confidence * 100).toFixed(1)}%`);
    lines.push('');

    if (score.breakdown && Object.keys(score.breakdown).length > 0) {
      lines.push('=== SCORE BREAKDOWN ===');
      lines.push(`Severity Component: ${(score.breakdown.severityComponent * 100).toFixed(1)}`);
      lines.push(`Confidence Component: ${(score.breakdown.confidenceComponent * 100).toFixed(1)}`);
      lines.push(`Context Component: ${(score.breakdown.contextComponent * 100).toFixed(1)}`);
      lines.push(`Temporal Component: ${(score.breakdown.temporalComponent * 100).toFixed(1)}`);
      lines.push(`Intelligence Component: ${(score.breakdown.intelligenceComponent * 100).toFixed(1)}`);
      lines.push('');
    }

    lines.push('=== KEY FACTORS ===');
    lines.push(`Exploitability: ${(score.factors.exploitability * 100).toFixed(1)}%`);
    lines.push(`Impact: ${(score.factors.impact * 100).toFixed(1)}%`);
    lines.push(`Asset Criticality: ${(score.factors.assetCriticality * 100).toFixed(1)}%`);
    lines.push(`Known Malicious: ${(score.factors.knownMalicious * 100).toFixed(1)}%`);

    return lines.join('\n');
  }
}
