
import { query } from '../config/database';

interface CountResult {
  count: string; // Postgres COUNT returns string
}

interface TrendResult {
  hour: Date;
  count: string;
}

export class DashboardService {
  static async getOverview() {
    // Parallelize queries for performance
    const [threats, cases, assets, logs] = await Promise.all([
      query("SELECT COUNT(*) as count FROM threats WHERE status != 'CLOSED'"),
      query("SELECT COUNT(*) as count FROM cases WHERE status = 'OPEN'"),
      query("SELECT COUNT(*) as count FROM assets WHERE status = 'ONLINE'"),
      query("SELECT COUNT(*) as count FROM audit_logs WHERE timestamp > NOW() - INTERVAL '24 HOURS'")
    ]);

    const criticalThreats = await query("SELECT COUNT(*) as count FROM threats WHERE severity = 'CRITICAL' AND status != 'CLOSED'");

    const threatCount = parseInt((threats.rows[0] as CountResult).count, 10);
    const caseCount = parseInt((cases.rows[0] as CountResult).count, 10);
    const assetCount = parseInt((assets.rows[0] as CountResult).count, 10);
    const logCount = parseInt((logs.rows[0] as CountResult).count, 10);
    const criticalCount = parseInt((criticalThreats.rows[0] as CountResult).count, 10);

    return {
      activeThreats: threatCount,
      openCases: caseCount,
      activeAssets: assetCount,
      events24h: logCount,
      criticalCount: criticalCount,
      threatLevel: this.calculateThreatLevel(criticalCount)
    };
  }

  static async getTrends() {
    // 24h Trend Analysis
    const sql = `
      SELECT date_trunc('hour', last_seen) as hour, COUNT(*) as count 
      FROM threats 
      WHERE last_seen > NOW() - INTERVAL '24 HOURS' 
      GROUP BY 1 
      ORDER BY 1 ASC
    `;
    const { rows } = await query(sql);
    return (rows as TrendResult[]).map(r => ({ 
      name: new Date(r.hour).getHours() + ':00', 
      value: parseInt(r.count, 10) 
    }));
  }

  private static calculateThreatLevel(criticals: number): string {
    if (criticals > 10) return 'CRITICAL (DEFCON 1)';
    if (criticals > 5) return 'SEVERE (DEFCON 2)';
    if (criticals > 0) return 'ELEVATED (DEFCON 3)';
    return 'GUARDED (DEFCON 4)';
  }
}
