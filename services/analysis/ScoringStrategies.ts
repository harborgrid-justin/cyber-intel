
import { Threat, Severity } from '../../types';

export interface IScoringStrategy {
  calculate(threat: Threat): number;
}

export class StandardScoring implements IScoringStrategy {
  calculate(threat: Threat): number {
    const sevScore = threat.severity === 'CRITICAL' ? 90 : 
                     threat.severity === 'HIGH' ? 70 : 
                     threat.severity === 'MEDIUM' ? 40 : 10;
    return (sevScore + threat.confidence) / 2;
  }
}

export class AggressiveScoring implements IScoringStrategy {
  calculate(threat: Threat): number {
    if (threat.severity === 'CRITICAL') return 100;
    if (threat.severity === 'HIGH') return 90;
    return 50 + (threat.confidence * 0.5);
  }
}

export class ContextAwareScoring implements IScoringStrategy {
  calculate(threat: Threat): number {
    let base = new StandardScoring().calculate(threat);
    // Boost if internal or ransomware
    if (threat.origin === 'Internal') base += 20;
    if (threat.tags?.includes('Ransomware')) base += 15;
    return Math.min(100, base);
  }
}

export class ScoringContext {
  private strategy: IScoringStrategy;

  constructor(strategy: IScoringStrategy = new StandardScoring()) {
    this.strategy = strategy;
  }

  setStrategy(strategy: IScoringStrategy) {
    this.strategy = strategy;
  }

  executeStrategy(threat: Threat): number {
    return this.strategy.calculate(threat);
  }
}
