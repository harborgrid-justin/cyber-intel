import { Threat, Severity } from '../../../types';
import { apiClient } from '../../apiClient';

interface DefconStatus {
  level: number;
  label: string;
  color: string;
}

interface TrendMetrics {
  count: number;
  delta: number;
  trend: 'UP' | 'DOWN';
}

export class OverviewLogic {
  static async calculateDefconLevel(): Promise<DefconStatus> {
    try {
      return await apiClient.get<DefconStatus>('/analysis/dashboard/defcon');
    } catch {
      return { level: 4, label: 'GUARDED (OFFLINE)', color: 'text-green-500' };
    }
  }

  static async getTrendMetrics(): Promise<TrendMetrics> {
    try {
      return await apiClient.get<TrendMetrics>('/analysis/dashboard/trends');
    } catch {
      // Offline fallback
      return { count: 0, delta: 0, trend: 'DOWN' };
    }
  }
}

export class GeoLogic {
  // FIX: Change return type to include severity so the caller can use theme tokens for color.
  static generateAttackVectors(threats: Threat[]): { source: {x:number,y:number}, target: {x:number,y:number}, severity: Severity }[] {
    // Visual-only logic can remain on client
    const HQ = { x: 25, y: 15 };
    
    return threats.filter(t => t.status !== 'CLOSED').map(t => {
      let src = { x: 50, y: 50 };
      if (t.region === 'APAC') src = { x: 85, y: 32 };
      if (t.region === 'EU') src = { x: 52, y: 12 };
      if (t.region === 'LATAM') src = { x: 28, y: 35 };
      if (t.region === 'Dark Web') src = { x: 10, y: 45 };

      return {
        source: src,
        target: HQ,
        severity: t.severity
      };
    });
  }

  static async getRegionalRisk(): Promise<[string, number][]> {
    try {
      return await apiClient.get<[string, number][]>('/analysis/dashboard/regional-risk');
    } catch {
      return [];
    }
  }
}
