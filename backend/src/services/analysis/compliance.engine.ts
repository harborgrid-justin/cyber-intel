
import { AuditLog } from '../../models/operations';
import { User } from '../../models/system';
import { Op } from 'sequelize';

export class ComplianceEngine {
  
  static async detectImpossibleTravel(limit = 1000): Promise<any[]> {
    const logs = await (AuditLog as any).findAll({
      where: { action: { [Op.like]: '%LOGIN%' } },
      order: [['timestamp', 'DESC']],
      limit
    });

    const anomalies = [];
    const userMoves: Record<string, AuditLog> = {};

    for (const log of logs) {
      if (!log.ip_address) continue;
      
      const lastSeen = userMoves[log.user_id];
      if (lastSeen && lastSeen.ip_address !== log.ip_address) {
        const timeDiff = (new Date(lastSeen.timestamp).getTime() - new Date(log.timestamp).getTime()) / (1000 * 60 * 60);
        if (timeDiff < 1) {
          anomalies.push({
            id: `ALERT-${Date.now()}`,
            action: 'ALERT_IMPOSSIBLE_TRAVEL',
            user: log.user_id,
            timestamp: new Date().toISOString(),
            details: `Impossible travel detected: IP change in ${timeDiff.toFixed(2)}h`,
            location: log.ip_address
          });
        }
      }
      userMoves[log.user_id] = log;
    }
    return anomalies;
  }

  static async checkUserInactivity(): Promise<User[]> {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);

    return await (User as any).findAll({
      where: {
        last_login: { [Op.lt]: ninetyDaysAgo },
        status: 'ACTIVE'
      }
    });
  }

  static async evaluateNistCompliance(controls: any[]): Promise<any> {
    // Perform server-side calculation of compliance scores
    const implemented = controls.filter(c => c.status === 'IMPLEMENTED');
    const gaps = controls.filter(c => c.status !== 'IMPLEMENTED');
    
    const score = Math.round((implemented.length / Math.max(controls.length, 1)) * 100);
    
    // Server-side Gap Analysis
    const criticalGaps = gaps.map((c: any) => `${c.id}: ${c.name} (${c.status})`);

    return {
        score,
        passing: implemented.length,
        total: controls.length,
        criticalGaps
    };
  }
}
