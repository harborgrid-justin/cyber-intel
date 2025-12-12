import { describe, it, expect, beforeEach, vi } from 'vitest';
import { caseFixtures } from '../../fixtures/cases.fixtures';
import { mockApiClient, createApiResponse, createApiError } from '../../utils/apiMocks';

describe('Case Service', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('getCaseById', () => {
    it('should fetch a case by ID', async () => {
      const testCase = caseFixtures[0];
      mockApiClient.get.mockResolvedValue(createApiResponse(testCase));

      const result = await mockApiClient.get(`/api/cases/${testCase.id}`);

      expect(mockApiClient.get).toHaveBeenCalledWith(`/api/cases/${testCase.id}`);
      expect(result.data).toEqual(testCase);
      expect(result.data.id).toBe('case-001');
      expect(result.data.caseNumber).toBe('INC-2024-001');
    });

    it('should handle case not found', async () => {
      mockApiClient.get.mockRejectedValue(createApiError('Case not found', 404));

      try {
        await mockApiClient.get('/api/cases/nonexistent');
      } catch (error: any) {
        expect(error.response.status).toBe(404);
        expect(error.message).toBe('Case not found');
      }
    });
  });

  describe('getAllCases', () => {
    it('should fetch all cases with pagination', async () => {
      const cases = caseFixtures.slice(0, 10);
      const response = {
        cases,
        total: caseFixtures.length,
        page: 1,
        limit: 10,
        totalPages: Math.ceil(caseFixtures.length / 10),
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(response));

      const result = await mockApiClient.get('/api/cases?page=1&limit=10');

      expect(result.data.cases).toHaveLength(10);
      expect(result.data.total).toBe(caseFixtures.length);
    });

    it('should filter cases by status', async () => {
      const investigatingCases = caseFixtures.filter(c => c.status === 'investigating');
      mockApiClient.get.mockResolvedValue(createApiResponse({ cases: investigatingCases }));

      const result = await mockApiClient.get('/api/cases?status=investigating');

      expect(result.data.cases.every((c: any) => c.status === 'investigating')).toBe(true);
    });

    it('should filter cases by priority', async () => {
      const criticalCases = caseFixtures.filter(c => c.priority === 'critical');
      mockApiClient.get.mockResolvedValue(createApiResponse({ cases: criticalCases }));

      const result = await mockApiClient.get('/api/cases?priority=critical');

      expect(result.data.cases.every((c: any) => c.priority === 'critical')).toBe(true);
    });

    it('should filter cases by category', async () => {
      const incidentCases = caseFixtures.filter(c => c.category === 'incident');
      mockApiClient.get.mockResolvedValue(createApiResponse({ cases: incidentCases }));

      const result = await mockApiClient.get('/api/cases?category=incident');

      expect(result.data.cases.every((c: any) => c.category === 'incident')).toBe(true);
    });

    it('should filter cases by assigned user', async () => {
      const assignedCases = caseFixtures.filter(c => c.assignedTo === 'analyst-sarah-chen');
      mockApiClient.get.mockResolvedValue(createApiResponse({ cases: assignedCases }));

      const result = await mockApiClient.get('/api/cases?assignedTo=analyst-sarah-chen');

      expect(result.data.cases.every((c: any) => c.assignedTo === 'analyst-sarah-chen')).toBe(true);
    });
  });

  describe('createCase', () => {
    it('should create a new case', async () => {
      const newCase = {
        title: 'New Test Case',
        description: 'Test case description',
        priority: 'high',
        status: 'open',
        category: 'incident',
        assignedTo: 'analyst-sarah-chen',
      };

      const createdCase = {
        id: 'case-new',
        caseNumber: 'INC-2024-999',
        ...newCase,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(createdCase, 201));

      const result = await mockApiClient.post('/api/cases', newCase);

      expect(result.status).toBe(201);
      expect(result.data.id).toBe('case-new');
      expect(result.data.title).toBe(newCase.title);
      expect(result.data.caseNumber).toBe('INC-2024-999');
    });

    it('should validate required fields', async () => {
      const invalidCase = { title: 'Test' }; // Missing required fields
      mockApiClient.post.mockRejectedValue(createApiError('Validation error', 400));

      try {
        await mockApiClient.post('/api/cases', invalidCase);
      } catch (error: any) {
        expect(error.response.status).toBe(400);
      }
    });
  });

  describe('updateCase', () => {
    it('should update an existing case', async () => {
      const testCase = caseFixtures[0];
      const updates = { status: 'resolved', priority: 'low' };
      const updatedCase = { ...testCase, ...updates, updatedAt: new Date() };

      mockApiClient.put.mockResolvedValue(createApiResponse(updatedCase));

      const result = await mockApiClient.put(`/api/cases/${testCase.id}`, updates);

      expect(result.data.status).toBe('resolved');
      expect(result.data.priority).toBe('low');
    });

    it('should update case assignment', async () => {
      const testCase = caseFixtures[0];
      const updates = { assignedTo: 'analyst-mike-ross' };
      const updatedCase = { ...testCase, ...updates };

      mockApiClient.put.mockResolvedValue(createApiResponse(updatedCase));

      const result = await mockApiClient.put(`/api/cases/${testCase.id}`, updates);

      expect(result.data.assignedTo).toBe('analyst-mike-ross');
    });
  });

  describe('resolveCase', () => {
    it('should resolve a case with resolution notes', async () => {
      const testCase = caseFixtures[1];
      const resolution = {
        status: 'resolved',
        resolution: 'Issue resolved by applying patches',
        resolvedAt: new Date(),
      };

      const resolvedCase = { ...testCase, ...resolution };
      mockApiClient.put.mockResolvedValue(createApiResponse(resolvedCase));

      const result = await mockApiClient.put(`/api/cases/${testCase.id}/resolve`, resolution);

      expect(result.data.status).toBe('resolved');
      expect(result.data.resolution).toBeDefined();
      expect(result.data.resolvedAt).toBeDefined();
    });
  });

  describe('addEvidence', () => {
    it('should add evidence to a case', async () => {
      const testCase = caseFixtures[0];
      const newEvidence = {
        type: 'log-file',
        id: 'log-new',
        description: 'System logs showing attack',
      };

      const updatedCase = {
        ...testCase,
        evidence: [...testCase.evidence, newEvidence],
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(updatedCase));

      const result = await mockApiClient.post(
        `/api/cases/${testCase.id}/evidence`,
        newEvidence
      );

      expect(result.data.evidence).toContainEqual(expect.objectContaining(newEvidence));
    });
  });

  describe('addTimelineEvent', () => {
    it('should add an event to case timeline', async () => {
      const testCase = caseFixtures[0];
      const newEvent = {
        timestamp: new Date(),
        event: 'Additional malware discovered',
      };

      const updatedCase = {
        ...testCase,
        timeline: [...testCase.timeline, newEvent],
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(updatedCase));

      const result = await mockApiClient.post(
        `/api/cases/${testCase.id}/timeline`,
        newEvent
      );

      expect(result.data.timeline).toContainEqual(expect.objectContaining(newEvent));
    });
  });

  describe('linkThreat', () => {
    it('should link a threat to a case', async () => {
      const testCase = caseFixtures[0];
      const threatId = 'threat-010';

      const updatedCase = {
        ...testCase,
        relatedThreats: [...testCase.relatedThreats, threatId],
      };

      mockApiClient.post.mockResolvedValue(createApiResponse(updatedCase));

      const result = await mockApiClient.post(
        `/api/cases/${testCase.id}/threats`,
        { threatId }
      );

      expect(result.data.relatedThreats).toContain(threatId);
    });
  });

  describe('getCaseStatistics', () => {
    it('should return case statistics', async () => {
      const stats = {
        total: caseFixtures.length,
        byStatus: {
          open: caseFixtures.filter(c => c.status === 'open').length,
          investigating: caseFixtures.filter(c => c.status === 'investigating').length,
          resolved: caseFixtures.filter(c => c.status === 'resolved').length,
          closed: caseFixtures.filter(c => c.status === 'closed').length,
        },
        byPriority: {
          critical: caseFixtures.filter(c => c.priority === 'critical').length,
          high: caseFixtures.filter(c => c.priority === 'high').length,
          medium: caseFixtures.filter(c => c.priority === 'medium').length,
          low: caseFixtures.filter(c => c.priority === 'low').length,
        },
        byCategory: {
          incident: caseFixtures.filter(c => c.category === 'incident').length,
          investigation: caseFixtures.filter(c => c.category === 'investigation').length,
          alert: caseFixtures.filter(c => c.category === 'alert').length,
        },
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(stats));

      const result = await mockApiClient.get('/api/cases/stats');

      expect(result.data.total).toBe(caseFixtures.length);
      expect(result.data.byStatus).toBeDefined();
      expect(result.data.byPriority).toBeDefined();
      expect(result.data.byCategory).toBeDefined();
    });
  });

  describe('searchCases', () => {
    it('should search cases by keyword', async () => {
      const searchResults = caseFixtures.filter(c =>
        c.title.toLowerCase().includes('ransomware') ||
        c.description.toLowerCase().includes('ransomware')
      );

      mockApiClient.get.mockResolvedValue(createApiResponse({ cases: searchResults }));

      const result = await mockApiClient.get('/api/cases/search?q=ransomware');

      expect(result.data.cases.length).toBeGreaterThan(0);
    });

    it('should search cases by case number', async () => {
      const searchResults = caseFixtures.filter(c => c.caseNumber === 'INC-2024-001');
      mockApiClient.get.mockResolvedValue(createApiResponse({ cases: searchResults }));

      const result = await mockApiClient.get('/api/cases/search?caseNumber=INC-2024-001');

      expect(result.data.cases).toHaveLength(1);
      expect(result.data.cases[0].caseNumber).toBe('INC-2024-001');
    });
  });

  describe('exportCases', () => {
    it('should export cases to CSV', async () => {
      const csvData = 'id,caseNumber,title,status,priority\ncase-001,INC-2024-001,Test,open,high';
      mockApiClient.get.mockResolvedValue(createApiResponse(csvData));

      const result = await mockApiClient.get('/api/cases/export?format=csv');

      expect(result.data).toContain('id,caseNumber,title,status,priority');
    });
  });

  describe('getCaseMetrics', () => {
    it('should return case performance metrics', async () => {
      const metrics = {
        averageResolutionTime: 48.5,
        openCases: caseFixtures.filter(c => c.status === 'investigating' || c.status === 'open').length,
        resolvedToday: 3,
        criticalCases: caseFixtures.filter(c => c.priority === 'critical').length,
      };

      mockApiClient.get.mockResolvedValue(createApiResponse(metrics));

      const result = await mockApiClient.get('/api/cases/metrics');

      expect(result.data.averageResolutionTime).toBeDefined();
      expect(result.data.openCases).toBeGreaterThan(0);
    });
  });
});
