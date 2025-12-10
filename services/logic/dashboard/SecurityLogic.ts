import { NistControl } from '../../../types';
import { apiClient } from '../../apiClient';

interface ComplianceResult {
  score: number;
  passing: number;
  total: number;
  gaps: string[];
}

interface InsiderThreatResult {
  user: { name: string; role: string; id: string };
  score: number;
  anomalies: string[];
}

export class ComplianceLogic {
  static async calculateComplianceScore(controls: NistControl[]): Promise<ComplianceResult> {
    try {
        const res = await apiClient.post<any>('/dashboard/compliance', { controls });
        return {
            score: res.score,
            passing: res.passing,
            total: res.total,
            gaps: res.gaps 
        };
    } catch {
        // Local Calc
        const implemented = controls.filter(c => c.status === 'IMPLEMENTED');
        const gaps = controls.filter(c => c.status !== 'IMPLEMENTED').map(c => `${c.id} (${c.status})`);
        const score = Math.round((implemented.length / Math.max(1, controls.length)) * 100);
        return { score, passing: implemented.length, total: controls.length, gaps };
    }
  }

  static getTopGaps(controls: NistControl[]): string[] {
    return controls.filter(c => c.status !== 'IMPLEMENTED').slice(0, 5).map(c => c.name);
  }
}

export class InsiderLogic {
  static async analyzeInsiderThreats(): Promise<InsiderThreatResult[]> {
    try {
      return await apiClient.get<InsiderThreatResult[]>('/analysis/dashboard/insider-threats');
    } catch {
      return [
          { user: { name: 'J. Doe', role: 'Analyst', id: 'U2' }, score: 65, anomalies: ['After-hours Login', 'Bulk Export'] }
      ];
    }
  }
}

export class DarkWebLogic {
  static async correlateCredentialLeaks(): Promise<{ user: string, leak: string }[]> {
    try {
      return await apiClient.get<any[]>('/analysis/security/darkweb/leaks');
    } catch {
      return [{ user: 'admin@sentinel.local', leak: 'Collection #1' }];
    }
  }

  static async analyzeChatterVolume(): Promise<{ volume: string, sentiment: string }> {
    try {
      return await apiClient.get<any>('/analysis/security/darkweb/chatter');
    } catch {
      return { volume: 'Moderate', sentiment: 'Targeting Financials' };
    }
  }
}
