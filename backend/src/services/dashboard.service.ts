
import { query } from '../config/database';

interface CountResult {
  count: string; // Postgres COUNT returns string
}

interface TrendResult {
  hour: Date;
  count: string;
}

interface DateRangeParams {
  startDate?: Date;
  endDate?: Date;
}

interface ComparisonMetrics {
  current: number;
  previous: number;
  change: number;
  changePercent: number;
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

  /**
   * Get threat timeline data with date range filtering
   */
  static async getTimelineData(range: '24h' | '7d' | '30d' | '90d' = '24h') {
    const intervals: Record<string, string> = {
      '24h': '1 DAY',
      '7d': '7 DAYS',
      '30d': '30 DAYS',
      '90d': '90 DAYS'
    };

    const sql = `
      SELECT
        date_trunc('hour', last_seen) as timestamp,
        COUNT(*) FILTER (WHERE severity = 'CRITICAL') as critical,
        COUNT(*) FILTER (WHERE severity = 'HIGH') as high,
        COUNT(*) FILTER (WHERE severity = 'MEDIUM') as medium,
        COUNT(*) FILTER (WHERE severity = 'LOW') as low
      FROM threats
      WHERE last_seen > NOW() - INTERVAL '${intervals[range]}'
      GROUP BY 1
      ORDER BY 1 ASC
    `;

    const { rows } = await query(sql);
    return rows;
  }

  /**
   * Get geographic threat distribution
   */
  static async getGeoThreatData() {
    const sql = `
      SELECT
        origin_country as country,
        COUNT(*) as count,
        MAX(severity) as severity
      FROM threats
      WHERE origin_country IS NOT NULL
      GROUP BY origin_country
      ORDER BY count DESC
      LIMIT 50
    `;

    const { rows } = await query(sql);
    return rows;
  }

  /**
   * Get MITRE ATT&CK technique statistics
   */
  static async getMitreTechniques() {
    const sql = `
      SELECT
        mitre_tactic,
        mitre_technique,
        COUNT(*) as count,
        MAX(severity) as severity
      FROM threat_techniques
      WHERE detected_at > NOW() - INTERVAL '30 DAYS'
      GROUP BY mitre_tactic, mitre_technique
      ORDER BY count DESC
    `;

    const { rows } = await query(sql);
    return rows;
  }

  /**
   * Get compliance metrics
   */
  static async getComplianceMetrics() {
    const sql = `
      SELECT
        category,
        framework,
        SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END) as compliant_count,
        COUNT(*) as total_count,
        ROUND(
          (SUM(CASE WHEN status = 'compliant' THEN 1 ELSE 0 END)::numeric / COUNT(*)::numeric) * 100,
          2
        ) as compliance_percentage
      FROM compliance_controls
      GROUP BY category, framework
      ORDER BY category, framework
    `;

    const { rows } = await query(sql);
    return rows;
  }

  /**
   * Get risk score calculation
   */
  static async getRiskScore() {
    const sql = `
      SELECT
        AVG(risk_score) as average_score,
        MAX(risk_score) as max_score,
        MIN(risk_score) as min_score
      FROM (
        SELECT
          CASE
            WHEN severity = 'CRITICAL' THEN 95
            WHEN severity = 'HIGH' THEN 75
            WHEN severity = 'MEDIUM' THEN 50
            ELSE 25
          END * (1 + (age_days / 30.0)) as risk_score
        FROM (
          SELECT
            severity,
            EXTRACT(DAY FROM (NOW() - first_seen)) as age_days
          FROM threats
          WHERE status != 'CLOSED'
        ) threat_ages
      ) scores
    `;

    const { rows } = await query(sql);
    const avgScore = rows[0]?.average_score || 50;
    return Math.min(Math.round(avgScore), 100);
  }

  /**
   * Get week-over-week comparison metrics
   */
  static async getWeekOverWeekComparison(): Promise<ComparisonMetrics> {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '7 DAYS') as current_week,
        COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '14 DAYS' AND last_seen <= NOW() - INTERVAL '7 DAYS') as previous_week
      FROM threats
    `;

    const { rows } = await query(sql);
    const current = parseInt(rows[0]?.current_week || '0', 10);
    const previous = parseInt(rows[0]?.previous_week || '0', 10);
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;

    return { current, previous, change, changePercent };
  }

  /**
   * Get month-over-month comparison metrics
   */
  static async getMonthOverMonthComparison(): Promise<ComparisonMetrics> {
    const sql = `
      SELECT
        COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '30 DAYS') as current_month,
        COUNT(*) FILTER (WHERE last_seen > NOW() - INTERVAL '60 DAYS' AND last_seen <= NOW() - INTERVAL '30 DAYS') as previous_month
      FROM threats
    `;

    const { rows } = await query(sql);
    const current = parseInt(rows[0]?.current_month || '0', 10);
    const previous = parseInt(rows[0]?.previous_month || '0', 10);
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : 0;

    return { current, previous, change, changePercent };
  }

  /**
   * Calculate threat forecast using linear regression
   */
  static async getForecast(days: number = 7) {
    const sql = `
      SELECT
        DATE(last_seen) as date,
        COUNT(*) as count
      FROM threats
      WHERE last_seen > NOW() - INTERVAL '30 DAYS'
      GROUP BY DATE(last_seen)
      ORDER BY date ASC
    `;

    const { rows } = await query(sql);
    const historicalData = rows.map((r: any) => parseInt(r.count, 10));

    // Simple linear regression for forecasting
    const n = historicalData.length;
    let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;

    historicalData.forEach((y, x) => {
      sumX += x;
      sumY += y;
      sumXY += x * y;
      sumXX += x * x;
    });

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;

    const forecast = [];
    for (let i = 0; i < days; i++) {
      const x = n + i;
      const predictedValue = Math.round(slope * x + intercept);
      forecast.push({
        day: i + 1,
        predicted: Math.max(0, predictedValue)
      });
    }

    return forecast;
  }

  /**
   * Get incident timeline events
   */
  static async getIncidentTimeline(incidentId?: string) {
    const sql = incidentId
      ? `
        SELECT * FROM incident_events
        WHERE incident_id = $1
        ORDER BY timestamp DESC
      `
      : `
        SELECT * FROM incident_events
        WHERE timestamp > NOW() - INTERVAL '24 HOURS'
        ORDER BY timestamp DESC
        LIMIT 50
      `;

    const params = incidentId ? [incidentId] : [];
    const { rows } = await query(sql, params);
    return rows;
  }

  /**
   * Get threat actor profile data
   */
  static async getThreatActorProfile(actorId: string) {
    const sql = `
      SELECT
        a.*,
        COUNT(DISTINCT t.id) as attack_count,
        MAX(t.last_seen) as last_activity
      FROM threat_actors a
      LEFT JOIN threats t ON t.actor_id = a.id
      WHERE a.id = $1
      GROUP BY a.id
    `;

    const { rows } = await query(sql, [actorId]);
    return rows[0] || null;
  }

  private static calculateThreatLevel(criticals: number): string {
    if (criticals > 10) return 'CRITICAL (DEFCON 1)';
    if (criticals > 5) return 'SEVERE (DEFCON 2)';
    if (criticals > 0) return 'ELEVATED (DEFCON 3)';
    return 'GUARDED (DEFCON 4)';
  }
}
