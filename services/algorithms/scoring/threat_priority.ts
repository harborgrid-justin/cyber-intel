/**
 * Threat Priority Scoring
 *
 * Multi-factor threat prioritization for security operations
 *
 * Time Complexity: O(1) for single threat
 * Space Complexity: O(1)
 *
 * Use Cases:
 * - Alert triage and prioritization
 * - Incident response queue management
 * - Resource allocation optimization
 * - SLA-based threat handling
 */

export interface PriorityFactors {
  // Technical severity (0-1)
  technicalSeverity: number;
  exploitability: number;
  impact: number;

  // Business context (0-1)
  assetValue: number;
  businessCriticality: number;
  dataClassification: number;

  // Operational (0-1)
  detectability: number;
  responseComplexity: number;
  remediationCost: number;

  // Temporal (0-1)
  urgency: number;
  trendingThreat: number;
  activeCampaign: number;

  // Intelligence (0-1)
  threatActorSophistication: number;
  targetedAttack: number;
  zeroDay: number;
}

export interface PriorityScore {
  priority: number; // 0-100
  level: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  sla: {
    responseTime: number; // minutes
    resolutionTime: number; // hours
    escalationThreshold: number; // minutes
  };
  factors: PriorityFactors;
  recommendations: string[];
  metadata: {
    scoredAt: Date;
    model: string;
  };
}

export interface ThreatContext {
  type: 'malware' | 'vulnerability' | 'intrusion' | 'data_leak' | 'dos' | 'phishing' | 'insider';
  severity: 'INFO' | 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number;
  environment: 'production' | 'staging' | 'development';
  affectedAssets: Array<{ name: string; criticality: number }>;
}

export class ThreatPriority {
  /**
   * Calculate comprehensive threat priority
   */
  calculatePriority(
    factors: Partial<PriorityFactors>,
    context?: Partial<ThreatContext>
  ): PriorityScore {
    // Complete factors with defaults
    const completedFactors = this.completeFactors(factors);

    // Apply context-based adjustments
    if (context) {
      this.applyContextAdjustments(completedFactors, context);
    }

    // Calculate component scores
    const technicalScore = this.calculateTechnicalScore(completedFactors);
    const businessScore = this.calculateBusinessScore(completedFactors);
    const operationalScore = this.calculateOperationalScore(completedFactors);
    const temporalScore = this.calculateTemporalScore(completedFactors);
    const intelligenceScore = this.calculateIntelligenceScore(completedFactors);

    // Weighted priority calculation
    const priority =
      technicalScore * 0.25 +
      businessScore * 0.30 +
      operationalScore * 0.15 +
      temporalScore * 0.20 +
      intelligenceScore * 0.10;

    const scaledPriority = priority * 100;

    // Determine priority level
    const level = this.determinePriorityLevel(scaledPriority);

    // Calculate SLA
    const sla = this.calculateSLA(level, completedFactors);

    // Generate recommendations
    const recommendations = this.generateRecommendations(level, completedFactors, context);

    return {
      priority: scaledPriority,
      level,
      sla,
      factors: completedFactors,
      recommendations,
      metadata: {
        scoredAt: new Date(),
        model: 'threat-priority-v2'
      }
    };
  }

  /**
   * Batch prioritize multiple threats
   */
  prioritizeBatch(
    threats: Array<{ id: string; factors: Partial<PriorityFactors>; context?: Partial<ThreatContext> }>
  ): Array<{ id: string; score: PriorityScore }> {
    const results = threats.map(threat => ({
      id: threat.id,
      score: this.calculatePriority(threat.factors, threat.context)
    }));

    // Sort by priority descending
    results.sort((a, b) => b.score.priority - a.score.priority);

    return results;
  }

  /**
   * Calculate technical severity score
   */
  private calculateTechnicalScore(factors: PriorityFactors): number {
    return (
      factors.technicalSeverity * 0.5 +
      factors.exploitability * 0.3 +
      factors.impact * 0.2
    );
  }

  /**
   * Calculate business impact score
   */
  private calculateBusinessScore(factors: PriorityFactors): number {
    let score =
      factors.assetValue * 0.4 +
      factors.businessCriticality * 0.4 +
      factors.dataClassification * 0.2;

    // Critical assets get a boost
    if (factors.assetValue > 0.8 && factors.businessCriticality > 0.8) {
      score *= 1.2;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate operational score
   */
  private calculateOperationalScore(factors: PriorityFactors): number {
    // Lower complexity and cost = higher priority (inverted)
    const complexityFactor = 1 - factors.responseComplexity;
    const costFactor = 1 - factors.remediationCost;

    return (
      factors.detectability * 0.3 +
      complexityFactor * 0.35 +
      costFactor * 0.35
    );
  }

  /**
   * Calculate temporal urgency score
   */
  private calculateTemporalScore(factors: PriorityFactors): number {
    let score =
      factors.urgency * 0.5 +
      factors.trendingThreat * 0.3 +
      factors.activeCampaign * 0.2;

    // Active campaigns with urgency get boosted
    if (factors.activeCampaign > 0.7 && factors.urgency > 0.7) {
      score *= 1.3;
    }

    return Math.min(score, 1.0);
  }

  /**
   * Calculate threat intelligence score
   */
  private calculateIntelligenceScore(factors: PriorityFactors): number {
    let score =
      factors.threatActorSophistication * 0.3 +
      factors.targetedAttack * 0.4 +
      factors.zeroDay * 0.3;

    // Zero-day targeted attacks get maximum priority
    if (factors.zeroDay > 0.8 && factors.targetedAttack > 0.7) {
      score = 1.0;
    }

    return score;
  }

  /**
   * Determine priority level
   */
  private determinePriorityLevel(priority: number): PriorityScore['level'] {
    if (priority >= 85) return 'P1'; // Critical
    if (priority >= 70) return 'P2'; // High
    if (priority >= 50) return 'P3'; // Medium
    if (priority >= 30) return 'P4'; // Low
    return 'P5'; // Informational
  }

  /**
   * Calculate SLA based on priority
   */
  private calculateSLA(
    level: PriorityScore['level'],
    factors: PriorityFactors
  ): PriorityScore['sla'] {
    const baseSLA = {
      P1: { responseTime: 15, resolutionTime: 4, escalationThreshold: 30 },
      P2: { responseTime: 60, resolutionTime: 24, escalationThreshold: 120 },
      P3: { responseTime: 240, resolutionTime: 72, escalationThreshold: 480 },
      P4: { responseTime: 1440, resolutionTime: 168, escalationThreshold: 2880 },
      P5: { responseTime: 10080, resolutionTime: 720, escalationThreshold: 20160 }
    };

    const sla = { ...baseSLA[level] };

    // Adjust for zero-day
    if (factors.zeroDay > 0.8) {
      sla.responseTime = Math.floor(sla.responseTime * 0.5);
      sla.resolutionTime = Math.floor(sla.resolutionTime * 0.7);
    }

    // Adjust for active campaign
    if (factors.activeCampaign > 0.7) {
      sla.responseTime = Math.floor(sla.responseTime * 0.75);
    }

    return sla;
  }

  /**
   * Generate action recommendations
   */
  private generateRecommendations(
    level: PriorityScore['level'],
    factors: PriorityFactors,
    context?: Partial<ThreatContext>
  ): string[] {
    const recommendations: string[] = [];

    // Priority-based recommendations
    switch (level) {
      case 'P1':
        recommendations.push('Immediate escalation to incident response team required');
        recommendations.push('Activate emergency response procedures');
        recommendations.push('Notify stakeholders and management');
        break;
      case 'P2':
        recommendations.push('Assign to senior analyst for investigation');
        recommendations.push('Prepare containment and remediation plan');
        break;
      case 'P3':
        recommendations.push('Queue for standard investigation workflow');
        recommendations.push('Document findings and patterns');
        break;
      case 'P4':
        recommendations.push('Add to backlog for periodic review');
        break;
      case 'P5':
        recommendations.push('Log for trend analysis');
        break;
    }

    // Factor-based recommendations
    if (factors.zeroDay > 0.7) {
      recommendations.push('Zero-day exploit detected - prioritize patching');
      recommendations.push('Implement temporary mitigations immediately');
    }

    if (factors.targetedAttack > 0.7) {
      recommendations.push('Targeted attack indicators present - enhance monitoring');
      recommendations.push('Review access logs and privilege escalation attempts');
    }

    if (factors.activeCampaign > 0.7) {
      recommendations.push('Active threat campaign - coordinate with threat intel team');
      recommendations.push('Deploy campaign-specific detection rules');
    }

    if (factors.businessCriticality > 0.8) {
      recommendations.push('Critical business asset affected - involve business stakeholders');
    }

    if (factors.dataClassification > 0.8) {
      recommendations.push('Sensitive data at risk - consider data breach protocols');
      recommendations.push('Engage legal and compliance teams');
    }

    // Context-based recommendations
    if (context?.environment === 'production') {
      recommendations.push('Production environment affected - minimize disruption');
    }

    if (context?.type === 'data_leak') {
      recommendations.push('Data exfiltration suspected - review egress traffic');
      recommendations.push('Initiate data loss prevention measures');
    }

    if (context?.type === 'intrusion') {
      recommendations.push('Potential intrusion - perform full system forensics');
      recommendations.push('Review authentication logs and lateral movement');
    }

    // Deduplicate and limit
    return Array.from(new Set(recommendations)).slice(0, 10);
  }

  /**
   * Apply context adjustments to factors
   */
  private applyContextAdjustments(
    factors: PriorityFactors,
    context: Partial<ThreatContext>
  ): void {
    // Severity adjustments
    if (context.severity === 'CRITICAL') {
      factors.technicalSeverity = Math.max(factors.technicalSeverity, 0.9);
      factors.urgency = Math.max(factors.urgency, 0.9);
    }

    // Environment adjustments
    if (context.environment === 'production') {
      factors.businessCriticality = Math.max(factors.businessCriticality, 0.8);
      factors.assetValue = Math.max(factors.assetValue, 0.7);
    }

    // Type-specific adjustments
    if (context.type === 'data_leak') {
      factors.dataClassification = Math.max(factors.dataClassification, 0.8);
      factors.impact = Math.max(factors.impact, 0.8);
    }

    if (context.type === 'intrusion') {
      factors.targetedAttack = Math.max(factors.targetedAttack, 0.7);
      factors.urgency = Math.max(factors.urgency, 0.8);
    }

    // Confidence adjustments
    if (context.confidence && context.confidence < 0.5) {
      // Lower all scores slightly for low confidence
      Object.keys(factors).forEach(key => {
        factors[key as keyof PriorityFactors] *= 0.9;
      });
    }

    // Affected assets adjustments
    if (context.affectedAssets && context.affectedAssets.length > 0) {
      const maxCriticality = Math.max(...context.affectedAssets.map(a => a.criticality));
      factors.assetValue = Math.max(factors.assetValue, maxCriticality);
    }
  }

  /**
   * Complete partial factors with defaults
   */
  private completeFactors(partial: Partial<PriorityFactors>): PriorityFactors {
    return {
      technicalSeverity: partial.technicalSeverity ?? 0.5,
      exploitability: partial.exploitability ?? 0.5,
      impact: partial.impact ?? 0.5,
      assetValue: partial.assetValue ?? 0.5,
      businessCriticality: partial.businessCriticality ?? 0.5,
      dataClassification: partial.dataClassification ?? 0.5,
      detectability: partial.detectability ?? 0.5,
      responseComplexity: partial.responseComplexity ?? 0.5,
      remediationCost: partial.remediationCost ?? 0.5,
      urgency: partial.urgency ?? 0.5,
      trendingThreat: partial.trendingThreat ?? 0.0,
      activeCampaign: partial.activeCampaign ?? 0.0,
      threatActorSophistication: partial.threatActorSophistication ?? 0.3,
      targetedAttack: partial.targetedAttack ?? 0.0,
      zeroDay: partial.zeroDay ?? 0.0
    };
  }

  /**
   * Compare two priority scores
   */
  compare(
    score1: PriorityScore,
    score2: PriorityScore
  ): {
    comparison: 'higher' | 'lower' | 'equal';
    difference: number;
    recommendation: string;
  } {
    const diff = score1.priority - score2.priority;
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
      recommendation = `Threat 1 (${score1.level}) should be prioritized over Threat 2 (${score2.level})`;
    } else if (comparison === 'lower') {
      recommendation = `Threat 2 (${score2.level}) should be prioritized over Threat 1 (${score1.level})`;
    } else {
      recommendation = `Both threats have similar priority (${score1.level}/${score2.level}) - use secondary factors`;
    }

    return {
      comparison,
      difference: diff,
      recommendation
    };
  }
}
