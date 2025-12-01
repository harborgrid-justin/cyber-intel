
import { NistControl, SystemUser, AuditLog, OsintBreach, Threat } from '@/types';

export class ComplianceLogic {
  static calculateComplianceScore(controls: NistControl[]): { score: number, passing: number, total: number } {
    const implemented = controls.filter(c => c.status === 'IMPLEMENTED').length;
    return {
      score: Math.round((implemented / controls.length) * 100),
      passing: implemented,
      total: controls.length
    };
  }

  static getTopGaps(controls: NistControl[]) {
    return controls.filter(c => c.status !== 'IMPLEMENTED').map(c => `${c.id}: ${c.name} (${c.status})`);
  }
}

export class InsiderLogic {
  static detectBehavioralAnomalies(user: SystemUser, logs: AuditLog[]): string[] {
    const anomalies: string[] = [];
    const userLogs = logs.filter(l => l.user === user.name);
    
    // Check 1: Off-hour activity
    const offHours = userLogs.filter(l => {
        const h = new Date(l.timestamp).getHours();
        return h < 6 || h > 20;
    }).length;
    if (offHours > 5) anomalies.push('Excessive Off-Hour Activity');

    // Check 2: Mass Export
    if (userLogs.some(l => l.action === 'DATA_EXPORT')) anomalies.push('Data Exfiltration Attempt');

    // Check 3: Failed Auth
    const failures = userLogs.filter(l => l.action.includes('FAIL')).length;
    if (failures > 3) anomalies.push('Multiple Auth Failures');

    return anomalies;
  }

  static calculateRiskScore(anomalies: string[], user: SystemUser): number {
    let score = anomalies.length * 20;
    if (user.status === 'LOCKED') score += 50;
    if (user.role === 'Admin') score += 10; // High privilege = higher risk impact
    return Math.min(100, score);
  }
}

export class DarkWebLogic {
  static correlateCredentialLeaks(breaches: OsintBreach[], users: SystemUser[]): { user: string, leak: string }[] {
    const hits: { user: string, leak: string }[] = [];
    users.forEach(u => {
      // Fuzzy match email or username
      const match = breaches.find(b => b.email.includes(u.name.split(' ')[1]?.toLowerCase() || 'xxxxx'));
      if (match) hits.push({ user: u.name, leak: match.source });
    });
    return hits;
  }

  static analyzeChatterVolume(threats: Threat[]): { volume: string, sentiment: string } {
    const darkWebThreats = threats.filter(t => t.source === 'Dark Web' || t.region === 'Dark Web');
    const count = darkWebThreats.length;
    
    let volume = 'Low';
    if (count > 10) volume = 'High';
    else if (count > 5) volume = 'Moderate';

    // Simple sentiment mock based on severity
    const criticals = darkWebThreats.filter(t => t.severity === 'CRITICAL').length;
    const sentiment = criticals > 0 ? 'Hostile / Targeting' : 'General Chatter';

    return { volume, sentiment };
  }
}
