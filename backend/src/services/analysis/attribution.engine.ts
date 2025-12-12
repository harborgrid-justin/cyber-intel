
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

      // 4. Campaign correlation - Actor model doesn't have campaigns property
      // Campaign linking requires separate Campaign model query

      // 5. Infrastructure pattern matching - Actor model doesn't have infrastructure property
      // Infrastructure linking requires separate analysis or extended Actor model

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
      if (actor.evasion_techniques && Array.isArray(actor.evasion_techniques)) {
        actor.evasion_techniques.forEach(technique => {
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
      new Date(a.last_seen).getTime() - new Date(b.last_seen).getTime()
    );

    // Check for campaign-like clustering
    if (threatsByDate.length >= 3) {
      patterns.push('Sustained campaign activity detected');
      matchScore += 20;
    }

    // Infrastructure reuse pattern - Actor model doesn't have infrastructure property
    // Infrastructure analysis requires separate modeling

    // Target consistency
    const targetRegions = new Set(threats.map(t => t.region).filter(Boolean));
    if (targetRegions.size <= 2 && actor.targets) {
      patterns.push('Consistent targeting pattern');
      matchScore += 15;
    }

    threatsByDate.forEach(threat => {
      timeline.push({
        date: threat.last_seen.toISOString(),
        activity: `${threat.type}: ${threat.indicator}`
      });
    });

    return { matchScore: Math.min(100, matchScore), patterns, timeline };
  }

  // TTP-based attribution using MITRE ATT&CK mapping
  // Note: Actor model doesn't have ttps property - requires Campaign model or extended Actor model
  static async attributeByTTP(ttpCodes: string[], actors: Actor[]): Promise<AttributionResult[]> {
    const results: AttributionResult[] = [];

    for (const actor of actors) {
      const matches: { type: 'TTP'; value: string; weight: number }[] = [];
      const evidenceChain: AttributionEvidence[] = [];
      let score = 0;

      // Actor model doesn't have ttps - this would need to be linked via Campaign model
      // For now, returning empty results as this requires schema extension

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
