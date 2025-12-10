
import { Threat } from '../../types';

interface IVisitor {
  visitThreat(threat: Threat): void;
}

interface IVisitable {
  accept(visitor: IVisitor): void;
}

export class ThreatNode implements IVisitable {
  constructor(public threat: Threat) {}

  accept(visitor: IVisitor) {
    visitor.visitThreat(this.threat);
  }
}

// Concrete Visitor: Score Calculator
export class ScoreSumVisitor implements IVisitor {
  public totalScore = 0;
  
  visitThreat(threat: Threat) {
    this.totalScore += threat.score;
  }
}

// Concrete Visitor: STIX Exporter
export class StixExportVisitor implements IVisitor {
  public stixObjects: any[] = [];

  visitThreat(threat: Threat) {
    this.stixObjects.push({
      type: "indicator",
      id: `indicator--${threat.id}`,
      created: new Date().toISOString(),
      name: threat.indicator,
      description: threat.description,
      pattern: `[file:hashes.'SHA-256' = '${threat.indicator}']` // Simplified
    });
  }
}
