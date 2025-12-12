
import { Actor } from '../../models/intelligence';
import { Threat } from '../../models/intelligence';

interface AttributionResult {
  actor: Actor;
  score: number;
  confidence: number;
  matches: { type: 'INFRA' | 'TTP' | 'TARGET' | 'ORIGIN' | 'CAMPAIGN' | 'EXPLOIT' | 'EVASION'; value: string; weight: number }[];
  evidenceChain: AttributionEvidence[];
}

interface AttributionEvidence {
  type: string;
  description: string;
  confidence: number;
  timestamp: string;
}

interface ThreatPattern {
  indicators: string[];
  ttps: string[];
  infrastructure: string[];
  behavioralSignatures: string[];
}

export class AttributionEngine {
  // Enhanced: Advanced multi-factor attribution with confidence scoring
  static async calculate(input: string, actors: Actor[]): Promise<AttributionResult[]> {
    const results: AttributionResult[] = [];
    const lowerInput = input.toLowerCase();

    for (const actor of actors) {
      let score = 0;
      const matches: { type: 'INFRA' | 'TTP' | 'TARGET' | 'ORIGIN' | 'CAMPAIGN' | 'EXPLOIT' | 'EVASION'; value: string; weight: number }[] = [];
      const evidenceChain: AttributionEvidence[] = [];

      // 1. Enhanced TTP Analysis with weighting
      if (actor.targets && Array.isArray(actor.targets)) {
        actor.targets.forEach(t => {
            if (lowerInput.includes(t.toLowerCase())) {
                const weight = 15;
                score += weight;
                matches.push({ type: 'TARGET', value: t, weight });
                evidenceChain.push({
                  type: 'Target Match',
                  description: `Target sector '${t}' matches actor profile`,
                  confidence: 0.7,
                  timestamp: new Date().toISOString()
                });
            }
        });
      }

      // 2. Geographic origin correlation
      if (actor.origin && lowerInput.includes(actor.origin.toLowerCase())) {
          const weight = 10;
          score += weight;
          matches.push({ type: 'ORIGIN', value: actor.origin, weight });
          evidenceChain.push({
            type: 'Geographic',
            description: `Activity originates from ${actor.origin}`,
            confidence: 0.65,
            timestamp: new Date().toISOString()
          });
      }

      // 3. Direct actor reference with high confidence
      if (actor.description && lowerInput.includes(actor.name.toLowerCase())) {
          const weight = 50;
          score += weight;
          matches.push({ type: 'TTP', value: 'Direct Reference', weight });
          evidenceChain.push({
            type: 'Direct Attribution',
            description: `Direct reference to ${actor.name} found`,
            confidence: 0.95,
            timestamp: new Date().toISOString()
          });
      }

      // 4. Campaign correlation
      if (actor.campaigns && Array.isArray(actor.campaigns)) {
        actor.campaigns.forEach(campaign => {
          if (lowerInput.includes(campaign.toLowerCase())) {
            const weight = 20;
            score += weight;
            matches.push({ type: 'CAMPAIGN', value: campaign, weight });
            evidenceChain.push({
              type: 'Campaign Match',
              description: `Linked to known campaign '${campaign}'`,
              confidence: 0.8,
              timestamp: new Date().toISOString()
            });
          }
        });
      }

      // 5. Infrastructure pattern matching
      if (actor.infrastructure && Array.isArray(actor.infrastructure)) {
        actor.infrastructure.forEach(infra => {
          const infraValue = typeof infra === 'object' ? infra.value : infra;
          if (infraValue && lowerInput.includes(infraValue.toLowerCase())) {
            const weight = 25;
            score += weight;
            matches.push({ type: 'INFRA', value: infraValue, weight });
            evidenceChain.push({
              type: 'Infrastructure',
              description: `Matches known infrastructure: ${infraValue}`,
              confidence: 0.85,
              timestamp: new Date().toISOString()
            });
          }
        });
      }

      // 6. Exploit correlation
      if (actor.exploits && Array.isArray(actor.exploits)) {
        actor.exploits.forEach(exploit => {
          if (lowerInput.includes(exploit.toLowerCase())) {
            const weight = 18;
            score += weight;
            matches.push({ type: 'EXPLOIT', value: exploit, weight });
            evidenceChain.push({
              type: 'Exploit',
              description: `Uses known exploit: ${exploit}`,
              confidence: 0.75,
              timestamp: new Date().toISOString()
            });
          }
        });
      }

      // 7. Evasion technique fingerprinting
      if (actor.evasionTechniques && Array.isArray(actor.evasionTechniques)) {
        actor.evasionTechniques.forEach(technique => {
          if (lowerInput.includes(technique.toLowerCase())) {
            const weight = 12;
            score += weight;
            matches.push({ type: 'EVASION', value: technique, weight });
            evidenceChain.push({
              type: 'Evasion Technique',
              description: `Employs evasion technique: ${technique}`,
              confidence: 0.7,
              timestamp: new Date().toISOString()
            });
          }
        });
      }

      // 8. Sophistication correlation heuristic
      if (actor.sophistication === 'Advanced' || actor.sophistication === 'Expert') {
        if (lowerInput.includes('apt') || lowerInput.includes('advanced') || lowerInput.includes('targeted')) {
          score += 5;
          evidenceChain.push({
            type: 'Sophistication',
            description: `Attack sophistication matches ${actor.sophistication} actor profile`,
            confidence: 0.6,
            timestamp: new Date().toISOString()
          });
        }
      }

      // Calculate confidence based on evidence diversity and strength
      const confidence = this.calculateConfidence(matches, evidenceChain);

      if (score > 0) {
        results.push({
          actor,
          score: Math.min(100, score),
          confidence,
          matches,
          evidenceChain
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // Advanced confidence calculation based on evidence diversity
  private static calculateConfidence(matches: any[], evidenceChain: AttributionEvidence[]): number {
    if (evidenceChain.length === 0) return 0;

    const avgEvidence = evidenceChain.reduce((sum, e) => sum + e.confidence, 0) / evidenceChain.length;
    const uniqueTypes = new Set(matches.map(m => m.type)).size;
    const diversityBonus = Math.min(uniqueTypes * 0.05, 0.2);

    return Math.min(0.99, avgEvidence + diversityBonus);
  }

  // Behavioral analysis: Analyze attack patterns over time
  static async analyzeBehavioralPatterns(threats: Threat[], actor: Actor): Promise<{
    matchScore: number;
    patterns: string[];
    timeline: { date: string; activity: string }[];
  }> {
    const patterns: string[] = [];
    const timeline: { date: string; activity: string }[] = [];
    let matchScore = 0;

    // Temporal pattern analysis
    const threatsByDate = threats.sort((a, b) =>
      new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime()
    );

    // Check for campaign-like clustering
    if (threatsByDate.length >= 3) {
      patterns.push('Sustained campaign activity detected');
      matchScore += 20;
    }

    // Infrastructure reuse pattern
    const infrastructureSet = new Set(threats.map(t => t.indicator));
    if (actor.infrastructure) {
      const reuseCount = actor.infrastructure.filter(infra =>
        infrastructureSet.has(typeof infra === 'object' ? infra.value : infra)
      ).length;

      if (reuseCount > 0) {
        patterns.push(`Infrastructure reuse: ${reuseCount} matches`);
        matchScore += reuseCount * 10;
      }
    }

    // Target consistency
    const targetRegions = new Set(threats.map(t => t.region).filter(Boolean));
    if (targetRegions.size <= 2 && actor.targets) {
      patterns.push('Consistent targeting pattern');
      matchScore += 15;
    }

    threatsByDate.forEach(threat => {
      timeline.push({
        date: threat.lastSeen,
        activity: `${threat.type}: ${threat.indicator}`
      });
    });

    return { matchScore: Math.min(100, matchScore), patterns, timeline };
  }

  // TTP-based attribution using MITRE ATT&CK mapping
  static async attributeByTTP(ttpCodes: string[], actors: Actor[]): Promise<AttributionResult[]> {
    const results: AttributionResult[] = [];

    for (const actor of actors) {
      const matches: { type: 'TTP'; value: string; weight: number }[] = [];
      const evidenceChain: AttributionEvidence[] = [];
      let score = 0;

      if (!actor.ttps || !Array.isArray(actor.ttps)) continue;

      const actorTTPCodes = actor.ttps.map(t =>
        typeof t === 'object' && t.code ? t.code : String(t)
      );

      ttpCodes.forEach(code => {
        if (actorTTPCodes.includes(code)) {
          const weight = 30; // High weight for TTP matches
          score += weight;
          matches.push({ type: 'TTP', value: code, weight });
          evidenceChain.push({
            type: 'TTP Match',
            description: `Matches TTP ${code}`,
            confidence: 0.9,
            timestamp: new Date().toISOString()
          });
        }
      });

      if (score > 0) {
        const confidence = this.calculateConfidence(matches, evidenceChain);
        results.push({
          actor,
          score: Math.min(100, score),
          confidence,
          matches,
          evidenceChain
        });
      }
    }

    return results.sort((a, b) => b.score - a.score);
  }

  // Probabilistic attribution using Bayesian inference
  static calculateBayesianAttribution(
    priorProbability: number,
    evidenceStrength: number,
    falsePositiveRate: number = 0.1
  ): number {
    // Simplified Bayesian calculation
    // P(Actor|Evidence) = P(Evidence|Actor) * P(Actor) / P(Evidence)
    const likelihood = evidenceStrength;
    const posterior = (likelihood * priorProbability) /
      ((likelihood * priorProbability) + (falsePositiveRate * (1 - priorProbability)));

    return Math.min(0.99, posterior);
  }
}
