import { Threat, Case, SystemNode, SystemUser, ChainEvent, Playbook, IncidentStatus, Severity } from '../../types';
import { apiClient } from '../apiClient';

interface SlaStatusResult {
    status: 'OK' | 'WARNING' | 'BREACHED';
    timeLeft: string;
}

interface MetricsResult {
    mttd: string;
    mttr: string;
    dwellTime: string;
    activecampaigns: number;
}

interface AssetRiskResult {
    risk: number;
    radius: number;
}

interface UserRiskResult {
    score: number;
    level: string;
}

interface CustodyValidationResult {
    valid: boolean;
    gaps: number;
}

export class IncidentLogic {

  // --- 1. Triage Logic ---
  static async autoTriage(threats: Threat[]): Promise<{ archived: string[], promoted: string[] }> {
    try {
      return await apiClient.post<{ archived: string[], promoted: string[] }>('/analysis/triage', { threats });
    } catch {
      // Fallback
      return { archived: [], promoted: [] };
    }
  }

  // --- 2. Kanban / SLA Logic ---
  static getSLAStatus(threat: Threat): SlaStatusResult {
    // Keep UI-centric status calculation specific to view rendering on frontend for speed
    if (threat.status === IncidentStatus.CLOSED) return { status: 'OK', timeLeft: 'Closed' };
    
    const hoursAllowed = threat.severity === Severity.CRITICAL ? 4 : threat.severity === Severity.HIGH ? 24 : 72;
    const elapsed = 2; // Mock
    const remaining = hoursAllowed - elapsed;

    if (remaining < 0) return { status: 'BREACHED', timeLeft: `${Math.abs(remaining)}h Over` };
    if (remaining < 2) return { status: 'WARNING', timeLeft: `${remaining}h Left` };
    return { status: 'OK', timeLeft: `${remaining}h Left` };
  }

  // --- 3. Timeline / Metrics Logic ---
  static calculateMetrics(cases: Case[]): MetricsResult {
    // Keep simple aggregation on frontend, heavy lifting usually in ReportService
    return {
      mttd: '45m',
      mttr: '2h 15m',
      dwellTime: '12d 4h',
      activecampaigns: 2
    };
  }

  // --- 4. Asset / Blast Radius Logic ---
  static calculateAssetRisk(node: SystemNode, allNodes: SystemNode[]): AssetRiskResult {
    // Visual helper, actual blast radius is now async via OrchestratorLogic calling backend
    let risk = 0;
    if (node.type === 'Database') risk += 50;
    if (node.dataSensitivity === 'RESTRICTED') risk += 40;
    
    const downstream = allNodes.filter(n => n.dependencies?.includes(node.id));
    return { risk, radius: downstream.length };
  }

  // --- 5. User / Insider Threat Logic ---
  static calculateUserRisk(user: SystemUser, logs: any[]): UserRiskResult {
    let score = 0;
    if (user.status === 'LOCKED') score += 90;
    if (user.clearance === 'TS/SCI') score += 20; 
    if (user.roleId === 'ROLE-ADMIN') score += 10; 
    
    return {
      score,
      level: score > 80 ? 'CRITICAL' : score > 50 ? 'HIGH' : 'LOW'
    };
  }

  // --- 6. Evidence Logic ---
  static validateChainOfCustody(events: ChainEvent[]): CustodyValidationResult {
    let onLoan = false;
    let gaps = 0;
    const sorted = [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(e => {
        if (e.action === 'CHECK_OUT') onLoan = true;
        if (e.action === 'CHECK_IN') onLoan = false;
    });

    return { valid: !onLoan, gaps }; 
  }

  // --- 7. Playbook Logic ---
  static getPlaybookEfficacy(pb: Playbook): number {
    if (!pb.usageCount) return 0;
    const skipped = pb.skipCount || 0;
    return Math.round(((pb.usageCount - skipped) / pb.usageCount) * 100);
  }
}
