import { AuditLog } from '../../models/operations';
import { Op } from 'sequelize';

export class AuditAnalysisEngine {

  static async analyzeAuth() {
    const authLogs = await (AuditLog as any).findAll({
        where: { action: { [Op.or]: [{ [Op.like]: '%LOGIN%' }, { [Op.like]: '%AUTH%' }] } }
    });
    
    const failures = authLogs.filter((l: any) => l.action.includes('FAIL') || l.action.includes('DENY'));
    const uniqueUsers = new Set(authLogs.map((l: any) => l.user_id)).size;
    
    // Brute force detection
    const counts: Record<string, number> = {};
    failures.forEach((l: any) => counts[l.user_id] = (counts[l.user_id] || 0) + 1);
    const suspects = Object.keys(counts).filter(k => counts[k] > 3);

    return {
      total: authLogs.length,
      failureRate: authLogs.length ? Math.round((failures.length / authLogs.length) * 100) : 0,
      uniqueUsers,
      bruteForceSuspects: suspects,
      recentLogs: authLogs.slice(0, 50)
    };
  }

  static async analyzeNetwork() {
    const netLogs = await (AuditLog as any).findAll({
        where: { action: { [Op.or]: [{ [Op.like]: '%FIREWALL%' }, { [Op.like]: '%IPS%' }, { [Op.like]: '%NETWORK%' }] } }
    });
    const blocked = netLogs.filter((l: any) => l.action.includes('DENY') || l.action.includes('BLOCK'));
    
    return {
      totalEvents: netLogs.length,
      blockedCount: blocked.length,
      allowRate: netLogs.length ? Math.round(((netLogs.length - blocked.length) / netLogs.length) * 100) : 100,
      ipsAlerts: netLogs.filter((l: any) => l.action === 'IPS_ALERT'),
      recentLogs: netLogs.slice(0, 50)
    };
  }

  static async analyzeData() {
    const dataLogs = await (AuditLog as any).findAll({
        where: { action: { [Op.or]: [{ [Op.like]: '%DATA%' }, { [Op.like]: '%FILE%' }] } }
    });
    
    return {
        totalAccess: dataLogs.length,
        exportCount: dataLogs.filter((l: any) => l.action === 'DATA_EXPORT').length,
        deletionCount: dataLogs.filter((l: any) => l.action === 'DATA_DELETE').length,
        recentLogs: dataLogs.slice(0, 50)
    };
  }
}