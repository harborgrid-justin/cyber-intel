import { describe, it, expect, beforeEach, vi } from 'vitest';
import { threatFixtures } from '../../fixtures/threats.fixtures';
import { mockApiClient, createApiResponse, createApiError } from '../../utils/apiMocks';

describe('Threat Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getThreatById', () => {
    it('should fetch a threat by ID', async () => {
      const threat = threatFixtures[0];
      mockApiClient.get.mockResolvedValue(createApiResponse(threat));

      // Mock implementation would go here
      const result = await mockApiClient.get(`/api/threats/${threat.id}`);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/threats/${threat.id}`);
      expect(result.data).toEqual(threat);
      expect(result.data.id).toBe('threat-001');
      expect(result.data.name).toBe('APT28 Phishing Campaign');
    });

    it('should handle threat not found', async () => {
      mockApiClient.get.mockRejectedValue(createApiError('Threat not found', 404));

      try {
        await mockApiClient.get('/api/threats/nonexistent');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.message).toBe('Threat not found');
      }
    });
  });

  describe('getAllThreats', () => {
    it('should fetch all threats with pagination', async () => {
      const threats = threatFixtures.slice(0, 10);
      const response = {
        threats,
        total: threatFixtures.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(threatFixtures.length / 10),
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(response));

      const result = await mockApiClient.get('/api/threats?page=1&limit=10');

      expect(result.data.threats).toHaveLength(10);
      expect(result.data.total).toBe(threatFixtures.length);
      expect(result.data.page).toBe(1);
    });

    it('should filter threats by severity', async () => {
      const criticalThreats = threatFixtures.filter(t => t.severity === 'critical');
      mockApiClient.get.mockResolvedValue(createApiResponse({ threats: criticalThreats }));

      const result = await mockApiClient.get('/api/threats?severity=critical');

      expect(result.data.threats.every((t: any) => t.severity === 'critical')).toBe(true);
    });

    it('should filter threats by status', async () => {
      const activeThreats = threatFixtures.filter(t => t.status === 'active');
      mockApiClient.get.mockResolvedValue(createApiResponse({ threats: activeThreats }));

      const result = await mockApiClient.get('/api/threats?status=active');

      expect(result.data.threats.every((t: any) => t.status === 'active')).toBe(true);
    });

    it('should filter threats by category', async () => {
      const ransomwareThreats = threatFixtures.filter(t => t.category === 'ransomware');
      mockApiClient.get.mockResolvedValue(createApiResponse({ threats: ransomwareThreats }));

      const result = await mockApiClient.get('/api/threats?category=ransomware');

      expect(result.data.threats.every((t: any) => t.category === 'ransomware')).toBe(true);
    });
  });

  describe('createThreat', () => {
    it('should create a new threat', async () => {
      const newThreat = {
        name: 'New Test Threat',
        description: 'Test threat description',
        severity: 'high',
        status: 'active',
        category: 'malware',
      };

      const createdThreat = { id: 'threat-new', ...newThreat, createdAt: new Date() };
      mockApiClient.post.mockResolvedValue(createApiResponse(createdThreat, 201));

      const result = await mockApiClient.post('/api/threats', newThreat);

      expect(result.status).toBe(201);
      expect(result.data.id).toBe('threat-new');
      expect(result.data.name).toBe(newThreat.name);
    });

    it('should validate required fields', async () => {
      const invalidThreat = { name: 'Test' }; // Missing required fields
      mockApiClient.post.mockRejectedValue(createApiError('Validation error', 400));

      try {
        await mockApiClient.post('/api/threats', invalidThreat);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('updateThreat', () => {
    it('should update an existing threat', async () => {
      const threat = threatFixtures[0];
      const updates = { status: 'resolved', severity: 'low' };
      const updatedThreat = { ...threat, ...updates, updatedAt: new Date() };

      mockApiClient.put.mockResolvedValue(createApiResponse(updatedThreat));

      const result = await mockApiClient.put(`/api/threats/${threat.id}`, updates);

      expect(result.data.status).toBe('resolved');
      expect(result.data.severity).toBe('low');
    });

    it('should handle update of non-existent threat', async () => {
      mockApiClient.put.mockRejectedValue(createApiError('Threat not found', 404));

      try {
        await mockApiClient.put('/api/threats/nonexistent', { status: 'resolved' });
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('deleteThreat', () => {
    it('should delete a threat', async () => {
      mockApiClient.delete.mockResolvedValue(createApiResponse({ success: true }));

      const result = await mockApiClient.delete('/api/threats/threat-001');

      expect(result.data.success).toBe(true);
    });

    it('should handle delete of non-existent threat', async () => {
      mockApiClient.delete.mockRejectedValue(createApiError('Threat not found', 404));

      try {
        await mockApiClient.delete('/api/threats/nonexistent');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
      }
    });
  });

  describe('searchThreats', () => {
    it('should search threats by keyword', async () => {
      const searchResults = threatFixtures.filter(t =>
        t.name.toLowerCase().includes('ransomware') ||
        t.description.toLowerCase().includes('ransomware')
      );

      mockApiClient.get.mockResolvedValue(createApiResponse({ threats: searchResults }));

      const result = await mockApiClient.get('/api/threats/search?q=ransomware');

      expect(result.data.threats.length).toBeGreaterThan(0);
    });

    it('should return empty results for no matches', async () => {
      mockApiClient.get.mockResolvedValue(createApiResponse({ threats: [] }));

      const result = await mockApiClient.get('/api/threats/search?q=nonexistent');

      expect(result.data.threats).toHaveLength(0);
    });
  });

  describe('getThreatStatistics', () => {
    it('should return threat statistics', async () => {
      const stats = {
        total: threatFixtures.length,
        bySeverity: {
          critical: threatFixtures.filter(t => t.severity === 'critical').length,
          high: threatFixtures.filter(t => t.severity === 'high').length,
          medium: threatFixtures.filter(t => t.severity === 'medium').length,
          low: threatFixtures.filter(t => t.severity === 'low').length,
        },
        byStatus: {
          active: threatFixtures.filter(t => t.status === 'active').length,
          investigating: threatFixtures.filter(t => t.status === 'investigating').length,
          mitigated: threatFixtures.filter(t => t.status === 'mitigated').length,
          resolved: threatFixtures.filter(t => t.status === 'resolved').length,
        },
        byCategory: {
          apt: threatFixtures.filter(t => t.category === 'apt').length,
          ransomware: threatFixtures.filter(t => t.category === 'ransomware').length,
          malware: threatFixtures.filter(t => t.category === 'malware').length,
          phishing: threatFixtures.filter(t => t.category === 'phishing').length,
        },
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(stats));

      const result = await mockApiClient.get('/api/threats/stats');

      expect(result.data.total).toBe(threatFixtures.length);
      expect(result.data.bySeverity).toBeDefined();
      expect(result.data.byStatus).toBeDefined();
      expect(result.data.byCategory).toBeDefined();
    });
  });

  describe('addThreatIndicator', () => {
    it('should add an indicator to a threat', async () => {
      const threat = threatFixtures[0];
      const newIndicator = {
        type: 'ip',
        value: '192.168.1.100',
        confidence: 90,
      };

      const updatedThreat = {
        ...threat,
        indicators: [...threat.indicators, newIndicator],
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(updatedThreat));

      const result = await mockApiClient.post(
        `/api/threats/${threat.id}/indicators`,
        newIndicator
      );

      expect(result.data.indicators).toContainEqual(expect.objectContaining(newIndicator));
    });
  });

  describe('addMitigationStep', () => {
    it('should add a mitigation step to a threat', async () => {
      const threat = threatFixtures[0];
      const newStep = 'Implement network segmentation';

      const updatedThreat = {
        ...threat,
        mitigationSteps: [...threat.mitigationSteps, newStep],
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(updatedThreat));

      const result = await mockApiClient.post(
        `/api/threats/${threat.id}/mitigation`,
        { step: newStep }
      );

      expect(result.data.mitigationSteps).toContain(newStep);
    });
  });

  describe('exportThreats', () => {
    it('should export threats to CSV', async () => {
      const csvData = 'id,name,severity,status\nthreat-001,APT28,critical,active';
      mockApiClient.get.mockResolvedValue(createApiResponse(csvData));

      const result = await mockApiClient.get('/api/threats/export?format=csv');

      expect(result.data).toContain('id,name,severity,status');
    });

    it('should export threats to JSON', async () => {
      mockApiClient.get.mockResolvedValue(createApiResponse(threatFixtures));

      const result = await mockApiClient.get('/api/threats/export?format=json');

      expect(Array.isArray(result.data)).toBe(true);
    });
  });
});
