import { describe, it, expect, beforeAll, afterAll, beforeEach } from 'vitest';
import { caseFixtures } from '../../fixtures/cases.fixtures';
import { startMockServer, stopMockServer, resetMockServer } from '../../utils/apiMocks';

describe('Case API Integration Tests', () => {
  beforeAll(() => {
    startMockServer();
  });

  afterAll(() => {
    stopMockServer();
  });

  beforeEach(() => {
    resetMockServer();
  });

  describe('GET /api/cases', () => {
    it('should retrieve all cases with pagination', async () => {
      const response = await fetch('http://localhost:3001/api/cases?page=1&limit=10');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cases).toBeDefined();
      expect(Array.isArray(data.cases)).toBe(true);
      expect(data.total).toBeDefined();
      expect(data.page).toBe(1);
      expect(data.limit).toBe(10);
    });

    it('should filter cases by status', async () => {
      const response = await fetch('http://localhost:3001/api/cases?status=investigating');
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.cases && data.cases.length > 0) {
        expect(data.cases.every((c: any) => c.status === 'investigating')).toBe(true);
      }
    });

    it('should filter cases by priority', async () => {
      const response = await fetch('http://localhost:3001/api/cases?priority=critical');
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.cases && data.cases.length > 0) {
        expect(data.cases.every((c: any) => c.priority === 'critical')).toBe(true);
      }
    });

    it('should filter cases by assigned user', async () => {
      const assignee = 'analyst-sarah-chen';
      const response = await fetch(`http://localhost:3001/api/cases?assignedTo=${assignee}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.cases && data.cases.length > 0) {
        expect(data.cases.every((c: any) => c.assignedTo === assignee)).toBe(true);
      }
    });
  });

  describe('GET /api/cases/:id', () => {
    it('should retrieve a specific case by ID', async () => {
      const caseId = 'case-001';
      const response = await fetch(`http://localhost:3001/api/cases/${caseId}`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.id).toBe(caseId);
      expect(data.title).toBeDefined();
      expect(data.status).toBeDefined();
      expect(data.priority).toBeDefined();
    });

    it('should include related threats in case details', async () => {
      const caseId = 'case-001';
      const response = await fetch(`http://localhost:3001/api/cases/${caseId}?include=threats`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.relatedThreats).toBeDefined();
    });
  });

  describe('POST /api/cases', () => {
    it('should create a new case', async () => {
      const newCase = {
        title: 'API Test Case',
        description: 'Created via API integration test',
        priority: 'high',
        status: 'open',
        category: 'incident',
        assignedTo: 'analyst-sarah-chen',
      };

      const response = await fetch('http://localhost:3001/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCase),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.id).toBeDefined();
      expect(data.caseNumber).toBeDefined();
      expect(data.title).toBe(newCase.title);
    });

    it('should auto-generate case number on creation', async () => {
      const newCase = {
        title: 'Auto Number Test',
        description: 'Testing auto case number',
        priority: 'medium',
        status: 'open',
        category: 'alert',
      };

      const response = await fetch('http://localhost:3001/api/cases', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newCase),
      });

      const data = await response.json();

      expect(response.status).toBe(201);
      expect(data.caseNumber).toMatch(/^(INC|INV|ALT)-\d{4}-\d+$/);
    });
  });

  describe('PUT /api/cases/:id', () => {
    it('should update case status', async () => {
      const caseId = 'case-001';
      const updates = {
        status: 'resolved',
      };

      const response = await fetch(`http://localhost:3001/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      expect(response.status).toBeLessThanOrEqual(200);
    });

    it('should update case assignment', async () => {
      const caseId = 'case-001';
      const updates = {
        assignedTo: 'analyst-mike-ross',
      };

      const response = await fetch(`http://localhost:3001/api/cases/${caseId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updates),
      });

      expect(response.status).toBeLessThanOrEqual(200);
    });
  });

  describe('Case Evidence', () => {
    it('should add evidence to a case', async () => {
      const caseId = 'case-001';
      const evidence = {
        type: 'log-file',
        description: 'System logs from affected server',
        file: 'logs.txt',
      };

      const response = await fetch(`http://localhost:3001/api/cases/${caseId}/evidence`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(evidence),
      });

      expect(response.status).toBeLessThanOrEqual(201);
    });

    it('should retrieve case evidence', async () => {
      const caseId = 'case-001';
      const response = await fetch(`http://localhost:3001/api/cases/${caseId}/evidence`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Case Timeline', () => {
    it('should add timeline event to case', async () => {
      const caseId = 'case-001';
      const event = {
        timestamp: new Date().toISOString(),
        event: 'Additional investigation performed',
        user: 'analyst-sarah-chen',
      };

      const response = await fetch(`http://localhost:3001/api/cases/${caseId}/timeline`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(event),
      });

      expect(response.status).toBeLessThanOrEqual(201);
    });

    it('should retrieve case timeline', async () => {
      const caseId = 'case-001';
      const response = await fetch(`http://localhost:3001/api/cases/${caseId}/timeline`);
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(Array.isArray(data)).toBe(true);
    });
  });

  describe('Case Resolution', () => {
    it('should resolve a case with notes', async () => {
      const caseId = 'case-002';
      const resolution = {
        status: 'resolved',
        resolution: 'Threat mitigated, systems restored from backups',
        resolvedBy: 'analyst-john-blake',
      };

      const response = await fetch(`http://localhost:3001/api/cases/${caseId}/resolve`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(resolution),
      });

      expect(response.status).toBeLessThanOrEqual(200);
    });
  });

  describe('Case Statistics', () => {
    it('should retrieve case statistics', async () => {
      const response = await fetch('http://localhost:3001/api/cases/stats');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.total).toBeDefined();
      expect(data.byStatus).toBeDefined();
      expect(data.byPriority).toBeDefined();
    });

    it('should retrieve case metrics', async () => {
      const response = await fetch('http://localhost:3001/api/cases/metrics');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.averageResolutionTime).toBeDefined();
      expect(data.openCases).toBeDefined();
    });
  });

  describe('Case Search and Filters', () => {
    it('should search cases by keyword', async () => {
      const response = await fetch('http://localhost:3001/api/cases/search?q=ransomware');
      const data = await response.json();

      expect(response.status).toBe(200);
      expect(data.cases).toBeDefined();
    });

    it('should search by case number', async () => {
      const response = await fetch('http://localhost:3001/api/cases/search?caseNumber=INC-2024-001');
      const data = await response.json();

      expect(response.status).toBe(200);
      if (data.cases && data.cases.length > 0) {
        expect(data.cases[0].caseNumber).toBe('INC-2024-001');
      }
    });
  });
});
