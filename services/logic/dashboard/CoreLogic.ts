
import { Threat, Case, SystemNode, Severity, IncidentStatus } from '../../../types';

export class OverviewLogic {
  static calculateDefconLevel(threats: Threat[], cases: Case[]): { level: number, label: string, color: string } {
    const activeThreats = threats.filter(t => t.status !== IncidentStatus.CLOSED);
    const criticals = activeThreats.filter(t => t.severity === Severity.CRITICAL).length;
    const activeCases = cases.filter(c => c.status !== 'CLOSED').length;
    
    // Heuristic Score (0-100)
    const score = Math.min(100, (criticals * 10) + (activeCases * 5) + (activeThreats.length));

    if (score > 80) return { level: 1, label: 'CRITICAL (DEFCON 1)', color: 'text-red-500' };
    if (score > 60) return { level: 2, label: 'SEVERE (DEFCON 2)', color: 'text-orange-500' };
    if (score > 40) return { level: 3, label: 'ELEVATED (DEFCON 3)', color: 'text-yellow-500' };
    return { level: 4, label: 'GUARDED (DEFCON 4)', color: 'text-green-500' };
  }

  static getTrendMetrics(threats: Threat[]) {
    // Simulated 24h trend
    const now = Date.now();
    const last24h = threats.filter(t => t.lastSeen && (now - new Date(t.lastSeen).getTime()) < 86400000).length;
    const prev24h = Math.floor(last24h * (0.8 + Math.random() * 0.4)); // Mock fluctuation
    const delta = last24h - prev24h;
    return { count: last24h, delta, trend: delta > 0 ? 'UP' : 'DOWN' };
  }
}

export class GeoLogic {
  static generateAttackVectors(threats: Threat[]): { source: {x:number,y:number}, target: {x:number,y:number}, color: string }[] {
    // Generate visual lines from threat regions to "Headquarters" (approx lat/long mapped to 0-100 canvas)
    const HQ = { x: 25, y: 15 }; // Approx US East
    
    return threats.filter(t => t.status !== IncidentStatus.CLOSED).map(t => {
      // Mock coordinates based on Region string
      let src = { x: 50, y: 50 };
      if (t.region === 'APAC') src = { x: 85, y: 32 };
      if (t.region === 'EU') src = { x: 52, y: 12 };
      if (t.region === 'LATAM') src = { x: 28, y: 35 };
      if (t.region === 'Dark Web') src = { x: 10, y: 45 };

      return {
        source: src,
        target: HQ,
        color: t.severity === Severity.CRITICAL ? '#ef4444' : t.severity === Severity.HIGH ? '#f97316' : '#eab308'
      };
    });
  }

  static getRegionalRisk(threats: Threat[]) {
    const risks: Record<string, number> = {};
    threats.forEach(t => {
      const r = t.region || 'Unknown';
      risks[r] = (risks[r] || 0) + (t.score / 10);
    });
    return Object.entries(risks).sort((a, b) => b[1] - a[1]);
  }
}
