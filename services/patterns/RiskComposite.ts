
export abstract class RiskComponent {
  abstract getRiskScore(): number;
  abstract getName(): string;
  
  // Optional methods for composite management
  add(component: RiskComponent): void {}
  remove(component: RiskComponent): void {}
  getChild(index: number): RiskComponent | null { return null; }
}

export class RiskLeaf extends RiskComponent {
  constructor(private name: string, private risk: number) { super(); }
  getRiskScore(): number { return this.risk; }
  getName(): string { return this.name; }
}

export class RiskComposite extends RiskComponent {
  private children: RiskComponent[] = [];

  constructor(private name: string) { super(); }

  add(component: RiskComponent): void {
    this.children.push(component);
  }

  remove(component: RiskComponent): void {
    this.children = this.children.filter(c => c !== component);
  }

  getRiskScore(): number {
    if (this.children.length === 0) return 0;
    // Example logic: Average risk of children
    const total = this.children.reduce((acc, c) => acc + c.getRiskScore(), 0);
    return Math.round(total / this.children.length);
  }

  getName(): string { return this.name; }
}
