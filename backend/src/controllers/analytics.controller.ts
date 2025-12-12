
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import { Threat, ThreatActor, Case } from '../models/intelligence';
import { Op } from 'sequelize';

/**
 * Analytics Controller
 * Provides advanced analytics and insights for the platform
 */

/**
 * GET /api/v1/analytics/overview
 * Get platform overview analytics
 */
export const getOverview = async (req: Request, res: Response) => {
  try {
    const [threatCount, actorCount, caseCount] = await Promise.all([
      (Threat as any).count(),
      (ThreatActor as any).count(),
      (Case as any).count(),
    ]);

    const overview = {
      threats: {
        total: threatCount,
        active: await (Threat as any).count({ where: { status: 'ACTIVE' } }),
        critical: await (Threat as any).count({ where: { severity: 'CRITICAL' } }),
      },
      actors: {
        total: actorCount,
        active: await (ThreatActor as any).count({ where: { status: 'ACTIVE' } }),
      },
      cases: {
        total: caseCount,
        open: await (Case as any).count({ where: { status: 'OPEN' } }),
        inProgress: await (Case as any).count({ where: { status: 'IN_PROGRESS' } }),
      },
    };

    res.json({ data: overview });
  } catch (err) {
    logger.error('Failed to get overview analytics', err);
    res.status(500).json({ error: 'Failed to retrieve analytics' });
  }
};

/**
 * GET /api/v1/analytics/trends
 * Get trend analytics over time
 */
export const getTrends = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 30;
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const threats = await (Threat as any).findAll({
      where: {
        created_at: {
          [Op.gte]: startDate,
        },
      },
      attributes: ['created_at', 'severity', 'type'],
      raw: true,
    });

    // Group by day
    const trendsByDay = threats.reduce((acc: any, threat: any) => {
      const day = new Date(threat.created_at).toISOString().split('T')[0];
      if (!acc[day]) {
        acc[day] = { date: day, count: 0, critical: 0, high: 0, medium: 0, low: 0 };
      }
      acc[day].count++;
      acc[day][threat.severity.toLowerCase()]++;
      return acc;
    }, {});

    const trends = Object.values(trendsByDay).sort((a: any, b: any) =>
      a.date.localeCompare(b.date)
    );

    res.json({ data: trends, period: { days, startDate } });
  } catch (err) {
    logger.error('Failed to get trend analytics', err);
    res.status(500).json({ error: 'Failed to retrieve trends' });
  }
};

/**
 * GET /api/v1/analytics/threat-landscape
 * Get threat landscape analytics
 */
export const getThreatLandscape = async (req: Request, res: Response) => {
  try {
    const threats = await (Threat as any).findAll({ raw: true });

    const landscape = {
      bySeverity: countBy(threats, 'severity'),
      byType: countBy(threats, 'type'),
      byStatus: countBy(threats, 'status'),
      byRegion: countBy(threats, 'region'),
      byTLP: countBy(threats, 'tlp'),
      topActors: await getTopThreatActors(10),
      riskScore: calculateOverallRiskScore(threats),
    };

    res.json({ data: landscape });
  } catch (err) {
    logger.error('Failed to get threat landscape', err);
    res.status(500).json({ error: 'Failed to retrieve threat landscape' });
  }
};

/**
 * GET /api/v1/analytics/performance
 * Get platform performance metrics
 */
export const getPerformance = async (req: Request, res: Response) => {
  try {
    const cases = await (Case as any).findAll({
      where: { status: { [Op.in]: ['RESOLVED', 'CLOSED'] } },
      attributes: ['created_at', 'updated_at', 'status'],
      raw: true,
    });

    // Calculate resolution times
    const resolutionTimes = cases.map((c: any) => {
      const created = new Date(c.created_at).getTime();
      const resolved = new Date(c.updated_at).getTime();
      return (resolved - created) / (1000 * 60 * 60); // hours
    });

    const avgResolutionTime = resolutionTimes.length > 0
      ? resolutionTimes.reduce((a: number, b: number) => a + b, 0) / resolutionTimes.length
      : 0;

    const performance = {
      averageResolutionTime: `${avgResolutionTime.toFixed(2)} hours`,
      casesResolved: cases.length,
      medianResolutionTime: calculateMedian(resolutionTimes),
      fastestResolution: Math.min(...resolutionTimes),
      slowestResolution: Math.max(...resolutionTimes),
    };

    res.json({ data: performance });
  } catch (err) {
    logger.error('Failed to get performance metrics', err);
    res.status(500).json({ error: 'Failed to retrieve performance metrics' });
  }
};

/**
 * GET /api/v1/analytics/threat-actors
 * Get threat actor analytics
 */
export const getThreatActorAnalytics = async (req: Request, res: Response) => {
  try {
    const actors = await (ThreatActor as any).findAll({ raw: true });

    const analytics = {
      total: actors.length,
      byType: countBy(actors, 'type'),
      bySophistication: countBy(actors, 'sophistication'),
      byStatus: countBy(actors, 'status'),
      mostActive: await getMostActiveActors(10),
      byMotivation: aggregateArrayField(actors, 'motivation'),
      targetedSectors: aggregateArrayField(actors, 'target_sectors'),
    };

    res.json({ data: analytics });
  } catch (err) {
    logger.error('Failed to get threat actor analytics', err);
    res.status(500).json({ error: 'Failed to retrieve actor analytics' });
  }
};

/**
 * POST /api/v1/analytics/custom-query
 * Execute custom analytics query
 */
export const executeCustomQuery = async (req: Request, res: Response) => {
  try {
    const { entity, filters, aggregations } = req.body;

    // This is a placeholder - in production, you'd want to sanitize and validate queries
    logger.warn('Custom query executed', { entity, filters, user: req.user?.username });

    res.json({
      message: 'Custom queries not fully implemented',
      note: 'This endpoint requires additional security validation',
    });
  } catch (err) {
    logger.error('Failed to execute custom query', err);
    res.status(500).json({ error: 'Query execution failed' });
  }
};

// Helper functions
function countBy(array: any[], key: string): Record<string, number> {
  return array.reduce((acc, item) => {
    const value = item[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}

async function getTopThreatActors(limit: number) {
  const threats = await (Threat as any).findAll({
    attributes: ['threat_actor'],
    raw: true,
  });

  const actorCounts = countBy(threats, 'threat_actor');
  return Object.entries(actorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([actor, count]) => ({ actor, count }));
}

async function getMostActiveActors(limit: number) {
  const threats = await (Threat as any).findAll({
    attributes: ['threat_actor'],
    where: { status: 'ACTIVE' },
    raw: true,
  });

  const actorCounts = countBy(threats, 'threat_actor');
  return Object.entries(actorCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([actor, activeThreats]) => ({ actor, activeThreats }));
}

function calculateOverallRiskScore(threats: any[]): number {
  if (threats.length === 0) return 0;
  const totalScore = threats.reduce((sum, t) => sum + (t.score || 0), 0);
  return Math.round(totalScore / threats.length);
}

function calculateMedian(numbers: number[]): string {
  if (numbers.length === 0) return '0';
  const sorted = numbers.slice().sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  const median = sorted.length % 2 === 0
    ? (sorted[mid - 1] + sorted[mid]) / 2
    : sorted[mid];
  return `${median.toFixed(2)} hours`;
}

function aggregateArrayField(array: any[], field: string): Record<string, number> {
  const result: Record<string, number> = {};
  array.forEach(item => {
    const values = item[field] || [];
    values.forEach((value: string) => {
      result[value] = (result[value] || 0) + 1;
    });
  });
  return result;
}
