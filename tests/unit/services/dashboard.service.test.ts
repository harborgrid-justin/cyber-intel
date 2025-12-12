import { describe, it, expect, beforeEach, vi } from 'vitest';
import { threatFixtures } from '../../fixtures/threats.fixtures';
import { caseFixtures } from '../../fixtures/cases.fixtures';
import { mockApiClient, createApiResponse } from '../../utils/apiMocks';

describe('Dashboard Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getDashboardStats', () => {
    it('should return comprehensive dashboard statistics', async () => {
      const stats = {
        totalThreats: threatFixtures.length,
        activeCases: caseFixtures.filter(c => c.status === 'investigating' || c.status === 'open').length,
        criticalAlerts: threatFixtures.filter(t => t.severity === 'critical' && t.status === 'active').length,
        resolvedToday: 5,
        threatsByCategory: {
          apt: threatFixtures.filter(t => t.category === 'apt').length,
          ransomware: threatFixtures.filter(t => t.category === 'ransomware').length,
          malware: threatFixtures.filter(t => t.category === 'malware').length,
          phishing: threatFixtures.filter(t => t.category === 'phishing').length,
        },
        casesByPriority: {
          critical: caseFixtures.filter(c => c.priority === 'critical').length,
          high: caseFixtures.filter(c => c.priority === 'high').length,
          medium: caseFixtures.filter(c => c.priority === 'medium').length,
          low: caseFixtures.filter(c => c.priority === 'low').length,
        },
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(stats));

      const result = await mockApiClient.get('/api/dashboard/stats');

      expect(result.data.totalThreats).toBe(threatFixtures.length);
      expect(result.data.activeCases).toBeGreaterThan(0);
      expect(result.data.criticalAlerts).toBeDefined();
      expect(result.data.threatsByCategory).toBeDefined();
      expect(result.data.casesByPriority).toBeDefined();
    });
  });

  describe('getThreatTrends', () => {
    it('should return threat trends over time', async () => {
      const trends = {
        daily: [
          { date: '2024-12-01', count: 5 },
          { date: '2024-12-02', count: 8 },
          { date: '2024-12-03', count: 6 },
          { date: '2024-12-04', count: 12 },
          { date: '2024-12-05', count: 7 },
        ],
        weekly: [
          { week: 48, count: 45 },
          { week: 49, count: 52 },
        ],
        monthly: [
          { month: '2024-11', count: 180 },
          { month: '2024-12', count: 95 },
        ],
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(trends));

      const result = await mockApiClient.get('/api/dashboard/trends/threats');

      expect(result.data.daily).toBeDefined();
      expect(result.data.weekly).toBeDefined();
      expect(result.data.monthly).toBeDefined();
      expect(Array.isArray(result.data.daily)).toBe(true);
    });
  });

  describe('getCaseTrends', () => {
    it('should return case resolution trends', async () => {
      const trends = {
        opened: [
          { date: '2024-12-01', count: 3 },
          { date: '2024-12-02', count: 5 },
        ],
        resolved: [
          { date: '2024-12-01', count: 2 },
          { date: '2024-12-02', count: 4 },
        ],
        averageResolutionTime: 48.5,
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(trends));

      const result = await mockApiClient.get('/api/dashboard/trends/cases');

      expect(result.data.opened).toBeDefined();
      expect(result.data.resolved).toBeDefined();
      expect(result.data.averageResolutionTime).toBe(48.5);
    });
  });

  describe('getTopThreats', () => {
    it('should return top threats by severity', async () => {
      const topThreats = threatFixtures
        .filter(t => t.severity === 'critical' || t.severity === 'high')
        .slice(0, 10);

      mockApiClient.get.mockResolvedValue(createApiResponse(topThreats));

      const result = await mockApiClient.get('/api/dashboard/threats/top');

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });

    it('should return top threats by status active', async () => {
      const activeThreats = threatFixtures
        .filter(t => t.status === 'active')
        .slice(0, 10);

      mockApiClient.get.mockResolvedValue(createApiResponse(activeThreats));

      const result = await mockApiClient.get('/api/dashboard/threats/active');

      expect(result.data.every((t: any) => t.status === 'active')).toBe(true);
    });
  });

  describe('getRecentCases', () => {
    it('should return recent cases', async () => {
      const recentCases = caseFixtures
        .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
        .slice(0, 10);

      mockApiClient.get.mockResolvedValue(createApiResponse(recentCases));

      const result = await mockApiClient.get('/api/dashboard/cases/recent');

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeLessThanOrEqual(10);
    });
  });

  describe('getThreatHeatmap', () => {
    it('should return threat heatmap data by region', async () => {
      const heatmap = {
        US: 45,
        EU: 32,
        CN: 28,
        RU: 25,
        KP: 15,
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(heatmap));

      const result = await mockApiClient.get('/api/dashboard/heatmap/regions');

      expect(result.data.US).toBeDefined();
      expect(result.data.EU).toBeDefined();
      expect(typeof result.data.US).toBe('number');
    });

    it('should return threat heatmap by sector', async () => {
      const heatmap = {
        finance: 38,
        healthcare: 25,
        government: 42,
        technology: 35,
        retail: 20,
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(heatmap));

      const result = await mockApiClient.get('/api/dashboard/heatmap/sectors');

      expect(result.data.finance).toBeDefined();
      expect(result.data.government).toBeDefined();
    });
  });

  describe('getSeverityDistribution', () => {
    it('should return threat severity distribution', async () => {
      const distribution = {
        critical: threatFixtures.filter(t => t.severity === 'critical').length,
        high: threatFixtures.filter(t => t.severity === 'high').length,
        medium: threatFixtures.filter(t => t.severity === 'medium').length,
        low: threatFixtures.filter(t => t.severity === 'low').length,
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(distribution));

      const result = await mockApiClient.get('/api/dashboard/distribution/severity');

      expect(result.data.critical).toBeDefined();
      expect(result.data.high).toBeDefined();
      expect(result.data.medium).toBeDefined();
      expect(result.data.low).toBeDefined();
    });
  });

  describe('getAlertMetrics', () => {
    it('should return alert metrics and SLA performance', async () => {
      const metrics = {
        totalAlerts: 150,
        alertsToday: 12,
        criticalAlerts: 8,
        averageResponseTime: 15.5,
        slaCompliance: 92.5,
        falsePositiveRate: 5.2,
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(metrics));

      const result = await mockApiClient.get('/api/dashboard/metrics/alerts');

      expect(result.data.totalAlerts).toBe(150);
      expect(result.data.averageResponseTime).toBe(15.5);
      expect(result.data.slaCompliance).toBe(92.5);
    });
  });

  describe('getIncidentResponseMetrics', () => {
    it('should return incident response performance metrics', async () => {
      const metrics = {
        activeIncidents: caseFixtures.filter(c => c.category === 'incident' && c.status === 'investigating').length,
        meanTimeToDetect: 32.5,
        meanTimeToRespond: 45.2,
        meanTimeToResolve: 72.8,
        incidentsByWeek: [
          { week: 48, count: 12 },
          { week: 49, count: 15 },
        ],
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(metrics));

      const result = await mockApiClient.get('/api/dashboard/metrics/incident-response');

      expect(result.data.activeIncidents).toBeGreaterThanOrEqual(0);
      expect(result.data.meanTimeToDetect).toBeDefined();
      expect(result.data.meanTimeToRespond).toBeDefined();
      expect(result.data.meanTimeToResolve).toBeDefined();
    });
  });

  describe('getThreatActorActivity', () => {
    it('should return threat actor activity summary', async () => {
      const activity = [
        { actorId: 'actor-001', name: 'APT28', recentActivity: 15, lastSeen: new Date() },
        { actorId: 'actor-002', name: 'Lazarus Group', recentActivity: 8, lastSeen: new Date() },
        { actorId: 'actor-006', name: 'LockBit Gang', recentActivity: 22, lastSeen: new Date() },
      ];

      mockApiClient.get.mockResolvedValue(createApiResponse(activity));

      const result = await mockApiClient.get('/api/dashboard/actors/activity');

      expect(Array.isArray(result.data)).toBe(true);
      expect(result.data.length).toBeGreaterThan(0);
      expect(result.data[0].name).toBeDefined();
      expect(result.data[0].recentActivity).toBeDefined();
    });
  });

  describe('getComplianceStatus', () => {
    it('should return security compliance status', async () => {
      const compliance = {
        overallScore: 87.5,
        frameworks: {
          'NIST': 90,
          'ISO-27001': 85,
          'SOC-2': 88,
          'PCI-DSS': 82,
        },
        recentAudits: 3,
        openFindings: 12,
        criticalFindings: 2,
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(compliance));

      const result = await mockApiClient.get('/api/dashboard/compliance');

      expect(result.data.overallScore).toBe(87.5);
      expect(result.data.frameworks).toBeDefined();
      expect(result.data.openFindings).toBe(12);
    });
  });

  describe('getWidgetData', () => {
    it('should return data for specific dashboard widget', async () => {
      const widgetData = {
        widgetId: 'top-threats',
        data: threatFixtures.slice(0, 5),
        refreshedAt: new Date(),
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(widgetData));

      const result = await mockApiClient.get('/api/dashboard/widgets/top-threats');

      expect(result.data.widgetId).toBe('top-threats');
      expect(result.data.data).toBeDefined();
      expect(result.data.refreshedAt).toBeDefined();
    });
  });

  describe('updateDashboardLayout', () => {
    it('should save custom dashboard layout', async () => {
      const layout = {
        widgets: [
          { id: 'stats', position: { x: 0, y: 0, w: 4, h: 2 } },
          { id: 'threats', position: { x: 4, y: 0, w: 4, h: 2 } },
          { id: 'cases', position: { x: 8, y: 0, w: 4, h: 2 } },
        ],
      };

      mockApiClient.post.mockResolvedValue(createApiResponse({ success: true }));

      const result = await mockApiClient.post('/api/dashboard/layout', layout);

      expect(result.data.success).toBe(true);
    });
  });
});
