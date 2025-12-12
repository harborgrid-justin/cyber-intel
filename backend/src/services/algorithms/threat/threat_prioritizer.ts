/**
 * Threat Prioritizer - Advanced algorithm for threat prioritization
 * Considers multiple dimensions: severity, impact, likelihood, urgency, resources
 */

interface ThreatInput {
  id: string;
  name: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  confidence: number; // 0-100
  impact_score: number; // 0-100
  likelihood: number; // 0-100
  asset_criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  exploitability?: number; // 0-100
  prevalence?: number; // 0-100
  age_days?: number;
  actor_sophistication?: 'Novice' | 'Intermediate' | 'Advanced' | 'Expert';
  remediation_effort?: 'LOW' | 'MEDIUM' | 'HIGH';
  business_impact?: number; // 0-100
}

interface PrioritizedThreat extends ThreatInput {
  priority_score: number; // 0-100
  priority_level: 'P1' | 'P2' | 'P3' | 'P4' | 'P5';
  risk_score: number;
  urgency: 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW';
  sla_hours: number;
  recommended_action: string;
  rationale: string[];
}

interface PrioritizationMatrix {
  dimension: string;
  weight: number;
  score: number;
  contribution: number;
}

export class ThreatPrioritizer {
  /**
   * Prioritize a single threat
   */
  static prioritize(threat: ThreatInput): PrioritizedThreat {
    // Calculate multi-dimensional score
    const matrices = this.calculatePrioritizationMatrices(threat);

    // Calculate weighted priority score
    const priority_score = matrices.reduce((sum, m) => sum + m.contribution, 0);

    // Calculate risk score (likelihood × impact)
    const risk_score = (threat.likelihood * threat.impact_score) / 100;

    // Determine priority level
    const priority_level = this.determinePriorityLevel(priority_score);

    // Determine urgency
    const urgency = this.determineUrgency(threat, priority_score);

    // Calculate SLA
    const sla_hours = this.calculateSLA(priority_level, urgency);

    // Generate recommended action
    const recommended_action = this.recommendAction(threat, priority_level, urgency);

    // Generate rationale
    const rationale = this.generateRationale(threat, matrices, priority_score);

    return {
      ...threat,
      priority_score: Math.round(priority_score),
      priority_level,
      risk_score: Math.round(risk_score),
      urgency,
      sla_hours,
      recommended_action,
      rationale
    };
  }

  /**
   * Batch prioritize multiple threats
   */
  static prioritizeBatch(threats: ThreatInput[]): PrioritizedThreat[] {
    const prioritized = threats.map(t => this.prioritize(t));

    // Sort by priority score (descending)
    return prioritized.sort((a, b) => b.priority_score - a.priority_score);
  }

  /**
   * Dynamic prioritization based on current context
   */
  static dynamicPrioritization(
    threats: ThreatInput[],
    context: {
      available_resources?: number; // 0-100
      incident_load?: number; // Current number of incidents
      business_hours?: boolean;
      compliance_pressure?: boolean;
      recent_breaches?: number;
    }
  ): PrioritizedThreat[] {
    const prioritized = threats.map(threat => {
      const base = this.prioritize(threat);

      // Adjust based on context
      let adjusted_score = base.priority_score;

      // Resource constraints
      if (context.available_resources !== undefined && context.available_resources < 30) {
        // Deprioritize lower severity when resources are constrained
        if (threat.severity === 'LOW' || threat.severity === 'MEDIUM') {
          adjusted_score *= 0.8;
        }
      }

      // High incident load - focus on critical only
      if (context.incident_load && context.incident_load > 10) {
        if (threat.severity !== 'CRITICAL') {
          adjusted_score *= 0.7;
        }
      }

      // Off-hours adjustment
      if (!context.business_hours) {
        // Boost critical threats
        if (threat.severity === 'CRITICAL') {
          adjusted_score *= 1.2;
        }
      }

      // Compliance pressure
      if (context.compliance_pressure) {
        // Boost threats affecting compliance
        adjusted_score *= 1.15;
      }

      // Recent breaches - heightened alertness
      if (context.recent_breaches && context.recent_breaches > 0) {
        adjusted_score *= (1 + (context.recent_breaches * 0.05));
      }

      return {
        ...base,
        priority_score: Math.min(100, Math.round(adjusted_score))
      };
    });

    return prioritized.sort((a, b) => b.priority_score - a.priority_score);
  }

  /**
   * Prioritization with resource allocation
   */
  static prioritizeWithResources(
    threats: ThreatInput[],
    available_analyst_hours: number
  ): {
    high_priority: PrioritizedThreat[];
    deferred: PrioritizedThreat[];
    resource_allocation: Record<string, number>;
  } {
    const prioritized = this.prioritizeBatch(threats);

    const high_priority: PrioritizedThreat[] = [];
    const deferred: PrioritizedThreat[] = [];
    const resource_allocation: Record<string, number> = {};

    let hoursUsed = 0;

    prioritized.forEach(threat => {
      const estimatedHours = this.estimateAnalystHours(threat);

      if (hoursUsed + estimatedHours <= available_analyst_hours) {
        high_priority.push(threat);
        resource_allocation[threat.id] = estimatedHours;
        hoursUsed += estimatedHours;
      } else {
        deferred.push(threat);
      }
    });

    return { high_priority, deferred, resource_allocation };
  }

  /**
   * Prioritize based on NIST framework
   */
  static nistPrioritization(threat: ThreatInput): {
    identify: number;
    protect: number;
    detect: number;
    respond: number;
    recover: number;
  } {
    // Map threat to NIST CSF functions
    return {
      identify: Math.min(100, threat.confidence + threat.prevalence || 50),
      protect: Math.min(100, (threat.exploitability || 50) + (threat.asset_criticality ? this.criticalityToNumeric(threat.asset_criticality) * 10 : 20)),
      detect: Math.min(100, threat.confidence + (threat.age_days ? Math.max(0, 100 - threat.age_days) : 50)),
      respond: Math.min(100, this.severityToNumeric(threat.severity) * 25 + threat.impact_score),
      recover: Math.min(100, threat.business_impact || 50)
    };
  }

  /**
   * Generate prioritization report
   */
  static generatePrioritizationReport(threats: PrioritizedThreat[]): {
    summary: {
      total_threats: number;
      by_priority: Record<string, number>;
      by_urgency: Record<string, number>;
      average_score: number;
    };
    top_threats: PrioritizedThreat[];
    recommendations: string[];
  } {
    const by_priority: Record<string, number> = {};
    const by_urgency: Record<string, number> = {};

    threats.forEach(t => {
      by_priority[t.priority_level] = (by_priority[t.priority_level] || 0) + 1;
      by_urgency[t.urgency] = (by_urgency[t.urgency] || 0) + 1;
    });

    const average_score = threats.reduce((sum, t) => sum + t.priority_score, 0) / threats.length;

    const top_threats = threats.slice(0, 10);

    const recommendations = this.generateGlobalRecommendations(threats);

    return {
      summary: {
        total_threats: threats.length,
        by_priority,
        by_urgency,
        average_score: Math.round(average_score)
      },
      top_threats,
      recommendations
    };
  }

  // Helper methods
  private static calculatePrioritizationMatrices(threat: ThreatInput): PrioritizationMatrix[] {
    const matrices: PrioritizationMatrix[] = [];

    // Severity dimension (25% weight)
    matrices.push({
      dimension: 'Severity',
      weight: 0.25,
      score: this.severityToNumeric(threat.severity) * 25,
      contribution: this.severityToNumeric(threat.severity) * 25 * 0.25
    });

    // Impact dimension (20% weight)
    matrices.push({
      dimension: 'Impact',
      weight: 0.20,
      score: threat.impact_score,
      contribution: threat.impact_score * 0.20
    });

    // Likelihood dimension (20% weight)
    matrices.push({
      dimension: 'Likelihood',
      weight: 0.20,
      score: threat.likelihood,
      contribution: threat.likelihood * 0.20
    });

    // Confidence dimension (15% weight)
    matrices.push({
      dimension: 'Confidence',
      weight: 0.15,
      score: threat.confidence,
      contribution: threat.confidence * 0.15
    });

    // Asset criticality dimension (10% weight)
    if (threat.asset_criticality) {
      const criticalityScore = this.criticalityToNumeric(threat.asset_criticality) * 25;
      matrices.push({
        dimension: 'Asset Criticality',
        weight: 0.10,
        score: criticalityScore,
        contribution: criticalityScore * 0.10
      });
    }

    // Exploitability dimension (10% weight)
    if (threat.exploitability !== undefined) {
      matrices.push({
        dimension: 'Exploitability',
        weight: 0.10,
        score: threat.exploitability,
        contribution: threat.exploitability * 0.10
      });
    }

    return matrices;
  }

  private static determinePriorityLevel(score: number): 'P1' | 'P2' | 'P3' | 'P4' | 'P5' {
    if (score >= 80) return 'P1'; // Critical
    if (score >= 65) return 'P2'; // High
    if (score >= 45) return 'P3'; // Medium
    if (score >= 25) return 'P4'; // Low
    return 'P5'; // Very Low
  }

  private static determineUrgency(threat: ThreatInput, priority_score: number): 'IMMEDIATE' | 'HIGH' | 'MEDIUM' | 'LOW' {
    // Consider multiple factors
    let urgency_score = priority_score;

    // Age factor (newer threats are more urgent)
    if (threat.age_days !== undefined) {
      if (threat.age_days < 1) urgency_score += 10;
      else if (threat.age_days < 7) urgency_score += 5;
    }

    // Exploitability factor
    if (threat.exploitability && threat.exploitability > 80) {
      urgency_score += 10;
    }

    // Actor sophistication factor
    if (threat.actor_sophistication === 'Expert') {
      urgency_score += 5;
    }

    if (urgency_score >= 85) return 'IMMEDIATE';
    if (urgency_score >= 65) return 'HIGH';
    if (urgency_score >= 40) return 'MEDIUM';
    return 'LOW';
  }

  private static calculateSLA(priority_level: string, urgency: string): number {
    const baseSLA: Record<string, number> = {
      'P1': 4,   // 4 hours
      'P2': 24,  // 1 day
      'P3': 72,  // 3 days
      'P4': 168, // 1 week
      'P5': 336  // 2 weeks
    };

    let sla = baseSLA[priority_level] || 168;

    // Adjust based on urgency
    if (urgency === 'IMMEDIATE') sla = Math.min(sla, 2);
    else if (urgency === 'HIGH') sla = Math.min(sla, sla * 0.5);

    return sla;
  }

  private static recommendAction(
    threat: ThreatInput,
    priority_level: string,
    urgency: string
  ): string {
    if (priority_level === 'P1' || urgency === 'IMMEDIATE') {
      return 'IMMEDIATE: Assign to senior analyst, activate incident response';
    }

    if (priority_level === 'P2' || urgency === 'HIGH') {
      return 'HIGH: Assign to analyst team, investigate within 24 hours';
    }

    if (priority_level === 'P3') {
      return 'MEDIUM: Add to investigation queue, review within 3 days';
    }

    if (threat.remediation_effort === 'LOW') {
      return 'LOW: Quick remediation recommended, automated response if possible';
    }

    return 'STANDARD: Monitor and investigate as resources allow';
  }

  private static generateRationale(
    threat: ThreatInput,
    matrices: PrioritizationMatrix[],
    final_score: number
  ): string[] {
    const rationale: string[] = [];

    // Add severity rationale
    rationale.push(`Severity: ${threat.severity} (${this.severityToNumeric(threat.severity)}/4)`);

    // Add top contributing factors
    const topFactors = matrices
      .sort((a, b) => b.contribution - a.contribution)
      .slice(0, 3);

    topFactors.forEach(factor => {
      rationale.push(
        `${factor.dimension}: ${Math.round(factor.score)}/100 (${Math.round(factor.weight * 100)}% weight)`
      );
    });

    // Add confidence context
    if (threat.confidence < 50) {
      rationale.push(`⚠ Low confidence (${threat.confidence}%) - verify before action`);
    } else if (threat.confidence > 85) {
      rationale.push(`✓ High confidence (${threat.confidence}%) - reliable intelligence`);
    }

    // Add urgency context
    if (threat.age_days !== undefined && threat.age_days < 2) {
      rationale.push(`⚠ Recent threat (${threat.age_days} days) - requires immediate attention`);
    }

    // Add exploitability context
    if (threat.exploitability && threat.exploitability > 75) {
      rationale.push(`⚠ Highly exploitable (${threat.exploitability}%) - attackers have advantage`);
    }

    return rationale;
  }

  private static estimateAnalystHours(threat: PrioritizedThreat): number {
    let hours = 2; // Base investigation time

    // Adjust based on priority
    switch (threat.priority_level) {
      case 'P1': hours = 8; break;
      case 'P2': hours = 4; break;
      case 'P3': hours = 2; break;
      case 'P4': hours = 1; break;
      case 'P5': hours = 0.5; break;
    }

    // Adjust based on remediation effort
    if (threat.remediation_effort === 'HIGH') hours *= 1.5;
    else if (threat.remediation_effort === 'LOW') hours *= 0.75;

    return Math.ceil(hours);
  }

  private static generateGlobalRecommendations(threats: PrioritizedThreat[]): string[] {
    const recommendations: string[] = [];

    const p1Count = threats.filter(t => t.priority_level === 'P1').length;
    const immediateCount = threats.filter(t => t.urgency === 'IMMEDIATE').length;

    if (p1Count > 5) {
      recommendations.push('HIGH ALERT: Multiple P1 threats detected - consider escalating to incident response team');
    }

    if (immediateCount > 0) {
      recommendations.push(`${immediateCount} threats require immediate attention - allocate resources accordingly`);
    }

    const avgScore = threats.reduce((sum, t) => sum + t.priority_score, 0) / threats.length;
    if (avgScore > 70) {
      recommendations.push('Overall threat landscape is elevated - increase security monitoring');
    }

    // Check for pattern
    const criticalThreats = threats.filter(t => t.severity === 'CRITICAL');
    if (criticalThreats.length > threats.length * 0.3) {
      recommendations.push('30%+ of threats are CRITICAL severity - review security posture');
    }

    return recommendations;
  }

  private static severityToNumeric(severity: string): number {
    const map: Record<string, number> = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    return map[severity] || 2;
  }

  private static criticalityToNumeric(criticality: string): number {
    const map: Record<string, number> = { 'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4 };
    return map[criticality] || 2;
  }
}
