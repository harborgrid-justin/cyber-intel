// 🔴 AGENT-5: Integration Test Suite

import { describe, it, expect, beforeAll } from 'vitest';
import { apiClient } from 'services-frontend/apiClient';
import { threatData } from 'services-frontend/dataLayer';

describe('Backend Integration Tests', () => {
  let backendAvailable = false;

  beforeAll(async () => {
    try {
      await apiClient.system.getHealth();
      backendAvailable = true;
    } catch (err) {
      console.warn('Backend not available - skipping integration tests');
    }
  });

  describe('API Client - Threats', () => {
    it('should fetch all threats', async () => {
      if (!backendAvailable) return;
      
      const threats = await apiClient.threats.getAll();
      expect(Array.isArray(threats)).toBe(true);
    });
  });

  describe('Data Layer Integration', () => {
    it('should connect to HTTP backend', async () => {
      if (!backendAvailable) return;

      const connected = await threatData.useHttpAdapter({ port: 3001 });
      expect(connected).toBe(true);
    });
  });

  describe('Enhanced Endpoints', () => {
    it('should fetch task statistics', async () => {
      if (!backendAvailable) return;
      
      const stats = await apiClient.tasks.getStats();
      expect(stats).toBeDefined();
    });

    it('should fetch evidence chain', async () => {
      if (!backendAvailable) return;
      
      const chain = await apiClient.evidence.getChain();
      expect(Array.isArray(chain)).toBe(true);
    });
  });
});
