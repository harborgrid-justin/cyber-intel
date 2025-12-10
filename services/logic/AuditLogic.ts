
import { AuditLog } from '../../types';
import { apiClient } from '../apiClient';

export class AuditLogic {
  static filterLogs(logs: AuditLog[], timeFilter: string, search: string) {
    // Client-side filtering of loaded logs for responsiveness
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

  static async analyzeAuth() {
    try {
      return await apiClient.get<any>('/analysis/audit/analytics/auth');
    } catch {
      return { total: 0, failureRate: 0, uniqueUsers: 0, bruteForceSuspects: [], logs: [] };
    }
  }

  static async analyzeNetwork() {
    try {
      return await apiClient.get<any>('/analysis/audit/analytics/network');
    } catch {
      return { totalEvents: 0, blockedCount: 0, allowRate: 0, ipsAlerts: [], logs: [] };
    }
  }

  static async analyzeData() {
    try {
      return await apiClient.get<any>('/analysis/audit/analytics/data');
    } catch {
      return { totalAccess: 0, exportCount: 0, deletionCount: 0, highVolumeExports: [], logs: [] };
    }
  }

  static analyzePolicy(logs: AuditLog[]) {
    // Fallback for simple tabs not yet migrated or needed instantly
    const polLogs = logs.filter(l => ['POLICY', 'VIOLATION', 'DLP'].some(k => l.action.includes(k)));
    const critical = polLogs.filter(l => l.details.includes('Critical') || l.action.includes('BLOCK'));
    return {
      totalViolations: polLogs.length,
      criticalCount: critical.length,
      topOffenders: [],
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
}
