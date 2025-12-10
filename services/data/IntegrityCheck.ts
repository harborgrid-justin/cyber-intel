
export class IntegrityCheck {
  static checkReferences(source: any[], sourceKey: string, target: any[], targetKey: string): string[] {
    const targetIds = new Set(target.map(t => t[targetKey]));
    const orphans: string[] = [];

    source.forEach(item => {
      const ref = item[sourceKey];
      if (Array.isArray(ref)) {
        if (ref.some(r => !targetIds.has(r))) orphans.push(item.id);
      } else {
        if (ref && !targetIds.has(ref)) orphans.push(item.id);
      }
    });

    return orphans;
  }
}
