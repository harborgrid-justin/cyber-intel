
import { Threat, Case, SystemNode, SystemUser, ChainEvent, Playbook, IncidentStatus, Severity } from '@/types';

export class IncidentLogic {

  // --- 1. Triage Logic ---
  static autoTriage(threats: Threat[]): { archived: string[], promoted: string[] } {
    const archived: string[] = [];
    const promoted: string[] = [];

    threats.forEach(t => {
      if (t.status === IncidentStatus.NEW) {
        // Auto-Archive Noise
        if (t.confidence < 60 && t.severity === Severity.LOW) {
          archived.push(t.id);
        }
        // Auto-Escalate Critical Confidence
        if (t.severity === Severity.CRITICAL && t.confidence > 90) {
          promoted.push(t.id);
        }
      }
    });
    return { archived, promoted };
  }

  // --- 2. Kanban / SLA Logic ---
  static getSLAStatus(threat: Threat): { status: 'OK' | 'WARNING' | 'BREACHED', timeLeft: string } {
    if (threat.status === IncidentStatus.CLOSED) return { status: 'OK', timeLeft: 'Closed' };
    
    // SLA: Critical (4h), High (24h), Medium (72h)
    const hoursAllowed = threat.severity === Severity.CRITICAL ? 4 : threat.severity === Severity.HIGH ? 24 : 72;
    // Mocking 'lastSeen' as creation time for calculation simplicity
    const elapsed = 2; // Mock 2 hours elapsed
    const remaining = hoursAllowed - elapsed;

    if (remaining < 0) return { status: 'BREACHED', timeLeft: `${Math.abs(remaining)}h Over` };
    if (remaining < 2) return { status: 'WARNING', timeLeft: `${remaining}h Left` };
    return { status: 'OK', timeLeft: `${remaining}h Left` };
  }

  // --- 3. Timeline / Metrics Logic ---
  static calculateMetrics(cases: Case[]) {
    if (cases.length === 0) {
      return {
        mttd: '0m',
        mttr: '0m',
        dwellTime: '0h',
        activecampaigns: 0,
      };
    }

    const timestamps = cases.map(c => new Date(c.created).getTime());
    const oldest = Math.min(...timestamps);
    const newest = Math.max(...timestamps);
    const dwellHours = Math.max(1, (newest - oldest) / (1000 * 60 * 60));
    const avgTasks = cases.reduce((sum, kase) => sum + (kase.tasks?.length || 0), 0) / cases.length;

    return {
      mttd: `${Math.round(dwellHours / cases.length)}h`,
      mttr: `${Math.max(1, Math.round(dwellHours / 2))}h`,
      dwellTime: `${Math.round(dwellHours)}h`,
      activecampaigns: Math.round(avgTasks),
    };
  }

  // --- 4. Asset / Blast Radius Logic ---
  static calculateAssetRisk(node: SystemNode, allNodes: SystemNode[]): { risk: number, radius: number } {
    let risk = 0;
    if (node.type === 'Database') risk += 50;
    if (node.dataSensitivity === 'RESTRICTED') risk += 40;
    if (node.status === 'DEGRADED') risk += 10;

    // Radius: Count dependencies
    const downstream = allNodes.filter(n => n.dependencies?.includes(node.id));
    return { risk, radius: downstream.length };
  }

  // --- 5. User / Insider Threat Logic ---
  static calculateUserRisk(user: SystemUser, logs: any[]): { score: number, level: string } {
    let score = 0;
    if (user.status === 'LOCKED') score += 90;
    if (user.clearance === 'TS/SCI') score += 20; // High value target
    // Mock behavioral analysis
    if (user.role === 'Admin') score += 10;

    const userLogs = logs.filter(log => log.user === user.name);
    const anomalousLocations = new Set(
      userLogs.filter(log => log.location && log.location !== 'HQ').map(log => log.location)
    );
    score += anomalousLocations.size * 5;
    score += userLogs.filter(log => log.action?.toLowerCase().includes('delete')).length * 5;
    
    return {
      score,
      level: score > 80 ? 'CRITICAL' : score > 50 ? 'HIGH' : 'LOW'
    };
  }

  // --- 6. Evidence Logic ---
  static validateChainOfCustody(events: ChainEvent[]): { valid: boolean, gaps: number } {
    // Check for gap in custody (e.g. Check In without Check Out or vice versa logic)
    // Simplified: Check if every CHECK_OUT has a subsequent CHECK_IN or TRANSFER
    let onLoan = false;
    let gaps = 0;
    
    // Sort chronological
    const sorted = [...events].sort((a,b) => new Date(a.date).getTime() - new Date(b.date).getTime());
    
    sorted.forEach(e => {
        if (e.action === 'CHECK_OUT') onLoan = true;
        if (e.action === 'CHECK_IN') onLoan = false;
    });

    return { valid: !onLoan, gaps }; // Valid if item is currently secured (not on loan)
  }

  // --- 7. Playbook Logic ---
  static getPlaybookEfficacy(pb: Playbook): number {
    if (!pb.usageCount) return 0;
    const skipped = pb.skipCount || 0;
    return Math.round(((pb.usageCount - skipped) / pb.usageCount) * 100);
  }
}
