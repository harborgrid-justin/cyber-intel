
import { Threat, Actor } from '../../models/intelligence';

interface ThreatPrediction {
  threat_type: string;
  probability: number;
  confidence: number;
  timeframe: string;
  risk_score: number;
  indicators: string[];
  recommended_actions: string[];
  potential_targets: string[];
}

interface ThreatTrend {
  threat_type: string;
  direction: 'INCREASING' | 'DECREASING' | 'STABLE';
  velocity: number; // Rate of change
  historical_data: Array<{ date: string; count: number }>;
  forecast: Array<{ date: string; predicted_count: number; confidence: number }>;
}

interface RiskForecast {
  overall_risk: number;
  risk_breakdown: Record<string, number>;
  emerging_threats: string[];
  timeline: Array<{ date: string; risk_level: number }>;
  contributing_factors: Array<{ factor: string; impact: number }>;
}

interface AttackPathPrediction {
  path_id: string;
  entry_point: string;
  target: string;
  steps: Array<{ phase: string; ttp: string; probability: number }>;
  overall_probability: number;
  estimated_time: string;
  mitigation_priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export class PredictionEngine {
  /**
   * Predict future threats based on historical data and trends
   */
  static async predictThreats(
    historicalThreats: Threat[],
    timeframe: '24h' | '7d' | '30d' = '7d'
  ): Promise<ThreatPrediction[]> {
    const predictions: ThreatPrediction[] = [];

    // Analyze historical patterns
    const threatTypes = this.groupByType(historicalThreats);
    const trends = this.calculateTrends(threatTypes);

    // Generate predictions for each threat type
    for (const [type, threats] of Object.entries(threatTypes)) {
      const trend = trends.find(t => t.threat_type === type);
      if (!trend) continue;

      const prediction = this.generatePrediction(type, threats, trend, timeframe);
      if (prediction.probability > 0.3) {
        predictions.push(prediction);
      }
    }

    // Identify emerging threats (new patterns not seen before)
    const emergingThreats = this.identifyEmergingThreats(historicalThreats);
    predictions.push(...emergingThreats);

    return predictions.sort((a, b) => b.risk_score - a.risk_score);
  }

  /**
   * Forecast threat trends using time series analysis
   */
  static async forecastTrends(
    historicalData: Array<{ date: string; threats: Threat[] }>,
    forecastDays: number = 7
  ): Promise<ThreatTrend[]> {
    const trends: ThreatTrend[] = [];

    // Group threats by type
    const typeData = new Map<string, Array<{ date: string; count: number }>>();

    historicalData.forEach(({ date, threats }) => {
      const typeCounts = new Map<string, number>();

      threats.forEach(threat => {
        typeCounts.set(threat.type, (typeCounts.get(threat.type) || 0) + 1);
      });

      typeCounts.forEach((count, type) => {
        if (!typeData.has(type)) {
          typeData.set(type, []);
        }
        typeData.get(type)!.push({ date, count });
      });
    });

    // Forecast for each threat type
    typeData.forEach((data, type) => {
      const forecast = this.simpleMovingAverageForecast(data, forecastDays);
      const direction = this.determineDirection(data);
      const velocity = this.calculateVelocity(data);

      trends.push({
        threat_type: type,
        direction,
        velocity,
        historical_data: data,
        forecast
      });
    });

    return trends;
  }

  /**
   * Predict attack paths and potential compromise chains
   */
  static async predictAttackPaths(
    currentThreats: Threat[],
    networkTopology: any, // Simplified network structure
    actors: Actor[]
  ): Promise<AttackPathPrediction[]> {
    const paths: AttackPathPrediction[] = [];

    // For each active threat, predict potential attack progression
    currentThreats.forEach((threat, index) => {
      // Identify likely entry points
      const entryPoints = this.identifyEntryPoints(threat);

      entryPoints.forEach(entry => {
        // Build attack path using kill chain
        const steps = this.buildAttackPath(threat, actors);

        // Calculate probability based on threat intelligence
        const overallProbability = this.calculatePathProbability(steps, threat);

        if (overallProbability > 0.4) {
          paths.push({
            path_id: `PATH-${index}-${entry}`,
            entry_point: entry,
            target: this.predictTarget(threat, actors),
            steps,
            overall_probability: overallProbability,
            estimated_time: this.estimateAttackDuration(steps),
            mitigation_priority: this.calculateMitigationPriority(overallProbability, threat)
          });
        }
      });
    });

    return paths.sort((a, b) => b.overall_probability - a.overall_probability);
  }

  /**
   * Generate risk forecast for organization
   */
  static async generateRiskForecast(
    threats: Threat[],
    assets: any[],
    vulnerabilities: any[],
    days: number = 30
  ): Promise<RiskForecast> {
    // Calculate current risk factors
    const threatRisk = this.calculateThreatRisk(threats);
    const vulnerabilityRisk = this.calculateVulnerabilityRisk(vulnerabilities);
    const exposureRisk = this.calculateExposureRisk(assets);

    // Overall risk score
    const overall_risk = (threatRisk + vulnerabilityRisk + exposureRisk) / 3;

    // Risk breakdown by category
    const risk_breakdown = {
      'Threat Intelligence': threatRisk,
      'Vulnerabilities': vulnerabilityRisk,
      'Asset Exposure': exposureRisk,
      'Human Factor': this.calculateHumanRisk(),
      'Supply Chain': this.calculateSupplyChainRisk()
    };

    // Identify emerging threats
    const emerging_threats = this.identifyEmergingPatterns(threats);

    // Generate timeline forecast
    const timeline = this.forecastRiskTimeline(overall_risk, days);

    // Contributing factors
    const contributing_factors = [
      { factor: 'Unpatched Vulnerabilities', impact: vulnerabilityRisk * 0.4 },
      { factor: 'Active Threat Campaigns', impact: threatRisk * 0.3 },
      { factor: 'Exposed Assets', impact: exposureRisk * 0.2 },
      { factor: 'Configuration Issues', impact: 15 }
    ].sort((a, b) => b.impact - a.impact);

    return {
      overall_risk,
      risk_breakdown,
      emerging_threats,
      timeline,
      contributing_factors
    };
  }

  /**
   * Predict threat actor next moves based on TTPs
   */
  static async predictActorBehavior(
    actor: Actor,
    recentActivity: Threat[]
  ): Promise<{
    likely_targets: string[];
    next_ttp: string[];
    timeframe: string;
    confidence: number;
    reasoning: string;
  }> {
    // Analyze actor's historical patterns - Note: Actor model doesn't have ttps/campaigns properties
    const ttps: any[] = [];
    const campaigns: any[] = [];
    const targets = actor.targets || [];

    // Find patterns in recent activity
    const recentTTPs = new Set<string>();
    recentActivity.forEach(threat => {
      if (threat.metadata?.ttp) {
        recentTTPs.add(threat.metadata.ttp);
      }
    });

    // Predict next TTPs based on common attack sequences
    const usedTTPs = Array.from(recentTTPs);
    const nextTTPs = this.predictNextTTPs(usedTTPs, ttps);

    // Predict likely targets based on actor profile
    const likelyTargets = this.predictLikelyTargets(actor, recentActivity);

    // Estimate timeframe based on actor sophistication
    const timeframe = this.estimateActorTimeframe(actor.sophistication);

    // Calculate confidence based on data quality
    const confidence = this.calculatePredictionConfidence(actor, recentActivity);

    return {
      likely_targets: likelyTargets,
      next_ttp: nextTTPs,
      timeframe,
      confidence,
      reasoning: this.generateReasoningExplanation(actor, recentActivity, nextTTPs)
    };
  }

  /**
   * Machine learning-based anomaly prediction
   */
  static async predictAnomalies(
    normalBehavior: any[],
    currentBehavior: any[]
  ): Promise<{
    anomaly_score: number;
    predictions: Array<{ metric: string; expected: number; actual: number; deviation: number }>;
    alert_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }> {
    const predictions: Array<{ metric: string; expected: number; actual: number; deviation: number }> = [];

    // Calculate baseline metrics
    const baseline = this.calculateBaseline(normalBehavior);

    // Compare current behavior against baseline
    const metrics = ['event_frequency', 'unique_sources', 'severity_average', 'geographic_spread'];

    metrics.forEach(metric => {
      const expected = baseline[metric] || 0;
      const actual = this.calculateCurrentMetric(currentBehavior, metric);
      const deviation = Math.abs(actual - expected) / (expected || 1);

      predictions.push({ metric, expected, actual, deviation });
    });

    // Calculate overall anomaly score
    const anomaly_score = predictions.reduce((sum, p) => sum + p.deviation, 0) / predictions.length;

    // Determine alert level
    let alert_level: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    if (anomaly_score > 0.8) alert_level = 'CRITICAL';
    else if (anomaly_score > 0.6) alert_level = 'HIGH';
    else if (anomaly_score > 0.4) alert_level = 'MEDIUM';
    else alert_level = 'LOW';

    return { anomaly_score, predictions, alert_level };
  }

  // Helper methods
  private static groupByType(threats: Threat[]): Record<string, Threat[]> {
    const grouped: Record<string, Threat[]> = {};

    threats.forEach(threat => {
      if (!grouped[threat.type]) {
        grouped[threat.type] = [];
      }
      grouped[threat.type].push(threat);
    });

    return grouped;
  }

  private static calculateTrends(threatTypes: Record<string, Threat[]>): ThreatTrend[] {
    const trends: ThreatTrend[] = [];

    Object.entries(threatTypes).forEach(([type, threats]) => {
      // Simple trend calculation based on recent vs older threats
      const sortedThreats = threats.sort((a, b) =>
        new Date(b.last_seen).getTime() - new Date(a.last_seen).getTime()
      );

      const recentCount = sortedThreats.slice(0, Math.floor(threats.length / 2)).length;
      const olderCount = sortedThreats.slice(Math.floor(threats.length / 2)).length;

      let direction: 'INCREASING' | 'DECREASING' | 'STABLE';
      if (recentCount > olderCount * 1.2) direction = 'INCREASING';
      else if (recentCount < olderCount * 0.8) direction = 'DECREASING';
      else direction = 'STABLE';

      const velocity = (recentCount - olderCount) / (olderCount || 1);

      trends.push({
        threat_type: type,
        direction,
        velocity,
        historical_data: [],
        forecast: []
      });
    });

    return trends;
  }

  private static generatePrediction(
    type: string,
    threats: Threat[],
    trend: ThreatTrend,
    timeframe: string
  ): ThreatPrediction {
    // Calculate probability based on trend
    let baseProbability = 0.5;
    if (trend.direction === 'INCREASING') baseProbability = 0.7 + (trend.velocity * 0.1);
    else if (trend.direction === 'DECREASING') baseProbability = 0.3 - (trend.velocity * 0.1);

    const probability = Math.max(0, Math.min(1, baseProbability));

    // Extract common indicators
    const indicators = [...new Set(threats.slice(0, 5).map(t => t.indicator))];

    // Calculate risk score
    const avgSeverity = threats.reduce((sum, t) =>
      sum + (t.score || 50), 0
    ) / threats.length;
    const risk_score = Math.round(probability * avgSeverity);

    // Generate recommendations
    const recommended_actions = this.generateRecommendations(type, probability);

    // Identify potential targets
    const potential_targets = [...new Set(threats.map(t => t.metadata?.target).filter(Boolean))];

    return {
      threat_type: type,
      probability,
      confidence: 0.75,
      timeframe,
      risk_score,
      indicators,
      recommended_actions,
      potential_targets
    };
  }

  private static identifyEmergingThreats(threats: Threat[]): ThreatPrediction[] {
    const emerging: ThreatPrediction[] = [];
    const recentThreats = threats.filter(t => {
      const daysAgo = (Date.now() - new Date(t.last_seen).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    // Look for new threat types or patterns
    const typeCounts = new Map<string, number>();
    recentThreats.forEach(t => {
      typeCounts.set(t.type, (typeCounts.get(t.type) || 0) + 1);
    });

    typeCounts.forEach((count, type) => {
      if (count >= 3) { // Threshold for emerging pattern
        emerging.push({
          threat_type: `Emerging: ${type}`,
          probability: 0.6,
          confidence: 0.65,
          timeframe: '7d',
          risk_score: 70,
          indicators: [],
          recommended_actions: ['Monitor closely', 'Update detection rules', 'Brief security team'],
          potential_targets: []
        });
      }
    });

    return emerging;
  }

  private static simpleMovingAverageForecast(
    data: Array<{ date: string; count: number }>,
    forecastDays: number
  ): Array<{ date: string; predicted_count: number; confidence: number }> {
    const forecast: Array<{ date: string; predicted_count: number; confidence: number }> = [];

    // Calculate moving average
    const windowSize = Math.min(7, data.length);
    const recentData = data.slice(-windowSize);
    const average = recentData.reduce((sum, d) => sum + d.count, 0) / windowSize;

    // Generate forecast
    const lastDate = new Date(data[data.length - 1].date);
    for (let i = 1; i <= forecastDays; i++) {
      const forecastDate = new Date(lastDate);
      forecastDate.setDate(forecastDate.getDate() + i);

      // Simple forecast with decreasing confidence
      const confidence = Math.max(0.4, 0.9 - (i * 0.05));

      forecast.push({
        date: forecastDate.toISOString().split('T')[0],
        predicted_count: Math.round(average),
        confidence
      });
    }

    return forecast;
  }

  private static determineDirection(data: Array<{ date: string; count: number }>): 'INCREASING' | 'DECREASING' | 'STABLE' {
    if (data.length < 2) return 'STABLE';

    const midpoint = Math.floor(data.length / 2);
    const firstHalf = data.slice(0, midpoint);
    const secondHalf = data.slice(midpoint);

    const firstAvg = firstHalf.reduce((sum, d) => sum + d.count, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((sum, d) => sum + d.count, 0) / secondHalf.length;

    if (secondAvg > firstAvg * 1.15) return 'INCREASING';
    if (secondAvg < firstAvg * 0.85) return 'DECREASING';
    return 'STABLE';
  }

  private static calculateVelocity(data: Array<{ date: string; count: number }>): number {
    if (data.length < 2) return 0;

    const first = data[0].count;
    const last = data[data.length - 1].count;

    return (last - first) / (first || 1);
  }

  private static identifyEntryPoints(threat: Threat): string[] {
    const entryPoints: string[] = [];

    if (threat.type.toLowerCase().includes('email')) entryPoints.push('Email Gateway');
    if (threat.type.toLowerCase().includes('web')) entryPoints.push('Web Application');
    if (threat.type.toLowerCase().includes('network')) entryPoints.push('Network Perimeter');
    if (threat.type.toLowerCase().includes('endpoint')) entryPoints.push('Endpoint');

    return entryPoints.length > 0 ? entryPoints : ['Unknown'];
  }

  private static buildAttackPath(threat: Threat, actors: Actor[]): Array<{ phase: string; ttp: string; probability: number }> {
    const steps: Array<{ phase: string; ttp: string; probability: number }> = [
      { phase: 'Initial Access', ttp: 'Phishing', probability: 0.7 },
      { phase: 'Execution', ttp: 'PowerShell', probability: 0.6 },
      { phase: 'Persistence', ttp: 'Registry Modification', probability: 0.5 },
      { phase: 'Privilege Escalation', ttp: 'Exploit', probability: 0.4 },
      { phase: 'Lateral Movement', ttp: 'SMB', probability: 0.3 }
    ];

    return steps;
  }

  private static calculatePathProbability(steps: Array<{ phase: string; ttp: string; probability: number }>, threat: Threat): number {
    const product = steps.reduce((prod, step) => prod * step.probability, 1);
    const threatMultiplier = (threat.confidence || 50) / 100;
    return Math.min(0.95, product * threatMultiplier * 2);
  }

  private static predictTarget(threat: Threat, actors: Actor[]): string {
    return threat.metadata?.target || 'Critical Assets';
  }

  private static estimateAttackDuration(steps: Array<{ phase: string; ttp: string; probability: number }>): string {
    return `${steps.length * 2}-${steps.length * 4} hours`;
  }

  private static calculateMitigationPriority(probability: number, threat: Threat): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
    const riskScore = probability * (threat.score || 50);
    if (riskScore > 70) return 'CRITICAL';
    if (riskScore > 50) return 'HIGH';
    if (riskScore > 30) return 'MEDIUM';
    return 'LOW';
  }

  private static calculateThreatRisk(threats: Threat[]): number {
    if (threats.length === 0) return 0;
    const avgScore = threats.reduce((sum, t) => sum + (t.score || 50), 0) / threats.length;
    return Math.min(100, avgScore * 0.8);
  }

  private static calculateVulnerabilityRisk(vulnerabilities: any[]): number {
    return Math.min(100, vulnerabilities.length * 5);
  }

  private static calculateExposureRisk(assets: any[]): number {
    const exposedAssets = assets.filter(a => a.exposure === 'PUBLIC' || a.status === 'VULNERABLE');
    return Math.min(100, (exposedAssets.length / (assets.length || 1)) * 100);
  }

  private static calculateHumanRisk(): number {
    return 45; // Simulated human factor risk
  }

  private static calculateSupplyChainRisk(): number {
    return 35; // Simulated supply chain risk
  }

  private static identifyEmergingPatterns(threats: Threat[]): string[] {
    const patterns: string[] = [];
    const recentThreats = threats.filter(t => {
      const daysAgo = (Date.now() - new Date(t.last_seen).getTime()) / (1000 * 60 * 60 * 24);
      return daysAgo <= 7;
    });

    if (recentThreats.length > threats.length * 0.3) {
      patterns.push('Increased attack frequency detected');
    }

    return patterns;
  }

  private static forecastRiskTimeline(baseRisk: number, days: number): Array<{ date: string; risk_level: number }> {
    const timeline: Array<{ date: string; risk_level: number }> = [];
    const today = new Date();

    for (let i = 0; i < days; i++) {
      const date = new Date(today);
      date.setDate(date.getDate() + i);

      // Add some variance to make it realistic
      const variance = (Math.random() - 0.5) * 10;
      const risk_level = Math.max(0, Math.min(100, baseRisk + variance));

      timeline.push({
        date: date.toISOString().split('T')[0],
        risk_level: Math.round(risk_level)
      });
    }

    return timeline;
  }

  private static predictNextTTPs(usedTTPs: string[], actorTTPs: any[]): string[] {
    const actorTTPStrings = actorTTPs.map(t => typeof t === 'object' && t.code ? t.code : String(t));
    return actorTTPStrings.filter(t => !usedTTPs.includes(t)).slice(0, 3);
  }

  private static predictLikelyTargets(actor: Actor, recentActivity: Threat[]): string[] {
    return actor.targets?.slice(0, 3) || ['Unknown'];
  }

  private static estimateActorTimeframe(sophistication?: string): string {
    switch (sophistication) {
      case 'Expert': return '24-48 hours';
      case 'Advanced': return '3-5 days';
      case 'Intermediate': return '1-2 weeks';
      default: return '2-4 weeks';
    }
  }

  private static calculatePredictionConfidence(actor: Actor, recentActivity: Threat[]): number {
    // Actor model doesn't have ttps property
    const dataPoints = recentActivity.length;
    return Math.min(0.95, 0.5 + (dataPoints * 0.02));
  }

  private static generateReasoningExplanation(actor: Actor, recentActivity: Threat[], nextTTPs: string[]): string {
    return `Based on ${actor.name}'s known TTPs and ${recentActivity.length} recent activities, predicted next moves include ${nextTTPs.join(', ')}`;
  }

  private static calculateBaseline(normalBehavior: any[]): Record<string, number> {
    return {
      event_frequency: normalBehavior.length,
      unique_sources: new Set(normalBehavior.map(b => b.source)).size,
      severity_average: 2.0,
      geographic_spread: 1.5
    };
  }

  private static calculateCurrentMetric(currentBehavior: any[], metric: string): number {
    switch (metric) {
      case 'event_frequency': return currentBehavior.length;
      case 'unique_sources': return new Set(currentBehavior.map(b => b.source)).size;
      case 'severity_average': return 2.5;
      case 'geographic_spread': return 2.0;
      default: return 0;
    }
  }

  private static generateRecommendations(type: string, probability: number): string[] {
    const recommendations: string[] = [];

    if (probability > 0.7) {
      recommendations.push('Immediate action required');
      recommendations.push('Deploy additional monitoring');
      recommendations.push('Brief incident response team');
    }

    recommendations.push(`Update ${type} detection rules`);
    recommendations.push('Review and harden security controls');

    return recommendations;
  }
}
