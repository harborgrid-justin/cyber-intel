/**
 * Priority Scoring Algorithms
 *
 * Time Complexity: O(1) per calculation
 * Space Complexity: O(1)
 *
 * Use Cases:
 * - Prioritizing security alerts
 * - Ranking threats for investigation
 * - Triage automation
 * - Resource allocation
 */

export interface PriorityFactors {
  severity: number; // 0-1
  urgency: number; // 0-1
  impact: number; // 0-1
  confidence: number; // 0-1
  assetCriticality: number; // 0-1
  threatRelevance: number; // 0-1
}

export interface PriorityScore {
  score: number; // 0-100
  level: 'P5' | 'P4' | 'P3' | 'P2' | 'P1' | 'P0'; // P0 highest
  factors: PriorityFactors;
  reasoning: string;
}

export class PriorityScoring {
  /**
   * RICE Priority Model (Reach, Impact, Confidence, Effort)
   * Adapted for security: (Impact × Urgency × Confidence) / Effort
   */
  calculateRICE(
    impact: number,
    urgency: number,
    confidence: number,
    effort: number = 0.5
  ): PriorityScore {
    const score = ((impact * urgency * confidence) / Math.max(effort, 0.1)) * 100;

    return {
      score: Math.min(score, 100),
      level: this.getPriorityLevel(score),
      factors: {
        severity: impact,
        urgency,
        impact,
        confidence,
        assetCriticality: 0.5,
        threatRelevance: 0.5
      },
      reasoning: 'RICE model: High impact and urgency with low effort gets highest priority'
    };
  }

  /**
   * Eisenhower Matrix (Urgent/Important)
   * Quadrants: P0 (urgent+important), P1 (important), P2 (urgent), P3 (neither)
   */
  calculateEisenhower(urgency: number, importance: number): PriorityScore {
    let score: number;
    let level: 'P5' | 'P4' | 'P3' | 'P2' | 'P1' | 'P0';
    let reasoning: string;

    if (urgency > 0.7 && importance > 0.7) {
      score = 90;
      level = 'P0';
      reasoning = 'Critical: Urgent and Important - Do First';
    } else if (importance > 0.7) {
      score = 70;
      level = 'P1';
      reasoning = 'High: Important but not urgent - Schedule';
    } else if (urgency > 0.7) {
      score = 50;
      level = 'P2';
      reasoning = 'Medium: Urgent but not important - Delegate';
    } else {
      score = 30;
      level = 'P3';
      reasoning = 'Low: Neither urgent nor important - Defer';
    }

    return {
      score,
      level,
      factors: {
        severity: importance,
        urgency,
        impact: importance,
        confidence: 0.8,
        assetCriticality: 0.5,
        threatRelevance: 0.5
      },
      reasoning
    };
  }

  /**
   * Weighted Priority Score
   * Customizable weights for different factors
   */
  calculateWeighted(
    factors: PriorityFactors,
    weights: Partial<PriorityFactors> = {}
  ): PriorityScore {
    const defaultWeights: PriorityFactors = {
      severity: 0.25,
      urgency: 0.20,
      impact: 0.20,
      confidence: 0.15,
      assetCriticality: 0.15,
      threatRelevance: 0.05
    };

    const finalWeights = { ...defaultWeights, ...weights };

    const score =
      factors.severity * finalWeights.severity +
      factors.urgency * finalWeights.urgency +
      factors.impact * finalWeights.impact +
      factors.confidence * finalWeights.confidence +
      factors.assetCriticality * finalWeights.assetCriticality +
      factors.threatRelevance * finalWeights.threatRelevance;

    return {
      score: score * 100,
      level: this.getPriorityLevel(score * 100),
      factors,
      reasoning: 'Weighted score based on multiple security factors'
    };
  }

  /**
   * MoSCoW Priority (Must, Should, Could, Won't)
   */
  calculateMoSCoW(
    criticality: number,
    impact: number,
    feasibility: number
  ): PriorityScore {
    let score: number;
    let level: 'P5' | 'P4' | 'P3' | 'P2' | 'P1' | 'P0';
    let reasoning: string;

    if (criticality > 0.8 && impact > 0.7) {
      score = 95;
      level = 'P0';
      reasoning = 'MUST: Critical requirement, high impact';
    } else if (criticality > 0.6 || impact > 0.6) {
      score = 75;
      level = 'P1';
      reasoning = 'SHOULD: Important but not critical';
    } else if (feasibility > 0.7) {
      score = 50;
      level = 'P2';
      reasoning = 'COULD: Desired but not essential, feasible';
    } else {
      score = 25;
      level = 'P3';
      reasoning = 'WON\'T: Low priority, defer or won\'t do';
    }

    return {
      score,
      level,
      factors: {
        severity: criticality,
        urgency: criticality,
        impact,
        confidence: feasibility,
        assetCriticality: criticality,
        threatRelevance: impact
      },
      reasoning
    };
  }

  /**
   * Threat-based Priority
   * Prioritizes based on threat characteristics
   */
  calculateThreatPriority(
    cvssScore: number, // 0-10
    exploitAvailable: boolean,
    activeExploitation: boolean,
    assetExposure: number, // 0-1
    patchAvailable: boolean
  ): PriorityScore {
    let score = (cvssScore / 10) * 40; // Base from CVSS

    // Exploit factors
    if (activeExploitation) score += 30;
    else if (exploitAvailable) score += 15;

    // Exposure
    score += assetExposure * 20;

    // Patch availability (inverse)
    if (!patchAvailable) score += 10;

    const level = this.getPriorityLevel(score);

    return {
      score: Math.min(score, 100),
      level,
      factors: {
        severity: cvssScore / 10,
        urgency: activeExploitation ? 1 : exploitAvailable ? 0.7 : 0.3,
        impact: cvssScore / 10,
        confidence: 0.9,
        assetCriticality: assetExposure,
        threatRelevance: activeExploitation ? 1 : 0.5
      },
      reasoning: `${activeExploitation ? 'Active exploitation detected' : exploitAvailable ? 'Exploit available' : 'No known exploit'}, ${patchAvailable ? 'patch available' : 'no patch'}`
    };
  }

  /**
   * SLA-based Priority
   * Uses service level agreements
   */
  calculateSLAPriority(
    severityLevel: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW',
    timeRemaining: number, // hours
    slaTarget: number // hours
  ): PriorityScore {
    const severityScores = { CRITICAL: 1.0, HIGH: 0.7, MEDIUM: 0.4, LOW: 0.2 };
    const baseSeverity = severityScores[severityLevel];

    // Urgency based on SLA breach risk
    const slaRatio = timeRemaining / slaTarget;
    let urgency: number;

    if (slaRatio < 0) {
      urgency = 1.0; // Breached
    } else if (slaRatio < 0.25) {
      urgency = 0.9; // Critical - less than 25% time remaining
    } else if (slaRatio < 0.5) {
      urgency = 0.7; // High - less than 50% time remaining
    } else if (slaRatio < 0.75) {
      urgency = 0.5; // Medium
    } else {
      urgency = 0.3; // Low
    }

    const score = (baseSeverity * 0.6 + urgency * 0.4) * 100;

    return {
      score,
      level: this.getPriorityLevel(score),
      factors: {
        severity: baseSeverity,
        urgency,
        impact: baseSeverity,
        confidence: 1.0,
        assetCriticality: baseSeverity,
        threatRelevance: 0.8
      },
      reasoning: `${severityLevel} severity, ${slaRatio < 0 ? 'SLA BREACHED' : `${Math.round(slaRatio * 100)}% SLA time remaining`}`
    };
  }

  /**
   * Compare two priorities
   */
  compare(p1: PriorityScore, p2: PriorityScore): number {
    if (p1.score > p2.score) return 1;
    if (p1.score < p2.score) return -1;
    return 0;
  }

  /**
   * Sort items by priority
   */
  sort<T>(
    items: T[],
    getPriority: (item: T) => PriorityScore
  ): T[] {
    return items.sort((a, b) => {
      const p1 = getPriority(a);
      const p2 = getPriority(b);
      return -this.compare(p1, p2); // Descending order
    });
  }

  private getPriorityLevel(score: number): 'P5' | 'P4' | 'P3' | 'P2' | 'P1' | 'P0' {
    if (score >= 90) return 'P0';
    if (score >= 75) return 'P1';
    if (score >= 55) return 'P2';
    if (score >= 35) return 'P3';
    if (score >= 15) return 'P4';
    return 'P5';
  }
}
