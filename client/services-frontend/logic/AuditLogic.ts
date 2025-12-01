
import { AuditLog } from '../../types';

export class AuditLogic {
  static filterLogs(logs: AuditLog[], timeFilter: string, search: string) {
    const now = Date.now();
    let filtered = logs;

    if (timeFilter !== 'ALL') {
      const hours = timeFilter === '1H' ? 1 : timeFilter === '24H' ? 24 : 168;
      filtered = filtered.filter(l => (now - new Date(l.timestamp).getTime()) < (hours * 3600 * 1000));
    }

    if (search) {
      const lower = search.toLowerCase();
      filtered = filtered.filter(l => l.user.toLowerCase().includes(lower) || l.details.toLowerCase().includes(lower) || l.action.toLowerCase().includes(lower));
    }
    return filtered;
  }

  static analyzeAuth(logs: AuditLog[]) {
    const authLogs = logs.filter(l => ['LOGIN', 'AUTH', 'MFA', 'LOGOUT'].some(k => l.action.includes(k)));
    const failures = authLogs.filter(l => l.action.includes('FAIL') || l.action.includes('DENY'));
    const uniqueUsers = new Set(authLogs.map(l => l.user)).size;
    const bruteForceSuspects = this.detectHighVolume(failures, 'user', 3);

    return {
      total: authLogs.length,
      failureRate: authLogs.length ? Math.round((failures.length / authLogs.length) * 100) : 0,
      uniqueUsers,
      bruteForceSuspects,
      logs: authLogs
    };
  }

  static analyzeData(logs: AuditLog[]) {
    const dataLogs = logs.filter(l => ['DATA', 'FILE', 'EXPORT'].some(k => l.action.includes(k)));
    const exports = dataLogs.filter(l => l.action === 'DATA_EXPORT');
    const deletions = dataLogs.filter(l => l.action === 'DATA_DELETE');
    
    return {
      totalAccess: dataLogs.length,
      exportCount: exports.length,
      deletionCount: deletions.length,
      highVolumeExports: exports.filter(e => e.details.includes('500') || e.details.includes('1000')),
      logs: dataLogs
    };
  }

  static analyzeNetwork(logs: AuditLog[]) {
    const netLogs = logs.filter(l => ['NETWORK', 'FIREWALL', 'IPS', 'VPN'].some(k => l.action.includes(k)));
    const blocked = netLogs.filter(l => l.action.includes('DENY') || l.action.includes('BLOCK'));
    
    return {
      totalEvents: netLogs.length,
      blockedCount: blocked.length,
      allowRate: netLogs.length ? Math.round(((netLogs.length - blocked.length) / netLogs.length) * 100) : 100,
      ipsAlerts: netLogs.filter(l => l.action === 'IPS_ALERT'),
      logs: netLogs
    };
  }

  static analyzePolicy(logs: AuditLog[]) {
    const polLogs = logs.filter(l => ['POLICY', 'VIOLATION', 'DLP'].some(k => l.action.includes(k)));
    const critical = polLogs.filter(l => l.details.includes('Critical') || l.action.includes('BLOCK'));
    return {
      totalViolations: polLogs.length,
      criticalCount: critical.length,
      topOffenders: this.getTopOffenders(polLogs),
      logs: polLogs
    };
  }

  static analyzeAdmin(logs: AuditLog[]) {
    const admLogs = logs.filter(l => ['ADMIN', 'CONFIG', 'ROLE'].some(k => l.action.includes(k)));
    return {
      totalActions: admLogs.length,
      configChanges: admLogs.filter(l => l.action === 'CONFIG_CHANGE').length,
      userMods: admLogs.filter(l => l.action.includes('USER') || l.action.includes('ROLE')).length,
      logs: admLogs
    };
  }

  static analyzeErrors(logs: AuditLog[]) {
    const errLogs = logs.filter(l => ['ERROR', 'FAIL', 'CRASH', 'TIMEOUT'].some(k => l.action.includes(k)));
    return {
      totalErrors: errLogs.length,
      apiErrors: errLogs.filter(l => l.action === 'ERROR_API').length,
      dbErrors: errLogs.filter(l => l.action === 'ERROR_DB').length,
      logs: errLogs
    };
  }

  private static detectHighVolume(logs: AuditLog[], key: keyof AuditLog, threshold: number) {
    const counts: Record<string, number> = {};
    logs.forEach(l => { counts[l[key] as string] = (counts[l[key] as string] || 0) + 1; });
    return Object.keys(counts).filter(k => counts[k] > threshold);
  }

  private static getTopOffenders(logs: AuditLog[]) {
    const counts: Record<string, number> = {};
    logs.forEach(l => { counts[l.user] = (counts[l.user] || 0) + 1; });
    return Object.entries(counts).sort((a, b) => b[1] - a[1]).slice(0, 3);
  }
}
