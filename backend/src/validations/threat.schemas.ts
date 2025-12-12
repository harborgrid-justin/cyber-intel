
import { z } from 'zod';

/**
 * Threat validation schemas
 */

export const createThreatSchema = z.object({
  body: z.object({
    type: z.enum(['MALWARE', 'PHISHING', 'RANSOMWARE', 'APT', 'BOTNET', 'EXPLOIT', 'VULNERABILITY', 'OTHER']),
    name: z.string().min(1, 'Name is required').max(255),
    description: z.string().optional(),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    status: z.enum(['ACTIVE', 'MONITORING', 'CONTAINED', 'RESOLVED']).optional().default('ACTIVE'),
    confidence: z.number().min(0).max(100).optional().default(50),
    reputation: z.number().min(0).max(100).optional().default(50),
    threatActor: z.string().optional(),
    campaign: z.string().optional(),
    tags: z.array(z.string()).optional(),
    indicators: z.array(z.object({
      type: z.string(),
      value: z.string(),
      confidence: z.number().optional(),
    })).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateThreatSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    status: z.enum(['ACTIVE', 'MONITORING', 'CONTAINED', 'RESOLVED']).optional(),
    confidence: z.number().min(0).max(100).optional(),
    reputation: z.number().min(0).max(100).optional(),
    threatActor: z.string().optional(),
    campaign: z.string().optional(),
    tags: z.array(z.string()).optional(),
    indicators: z.array(z.object({
      type: z.string(),
      value: z.string(),
      confidence: z.number().optional(),
    })).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateThreatStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['ACTIVE', 'MONITORING', 'CONTAINED', 'RESOLVED']),
    reason: z.string().optional(),
  }),
});

export const bulkCreateThreatsSchema = z.object({
  body: z.object({
    threats: z.array(createThreatSchema.shape.body).min(1).max(100),
  }),
});

export const bulkUpdateThreatsSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1).max(100),
    updates: z.object({
      status: z.enum(['ACTIVE', 'MONITORING', 'CONTAINED', 'RESOLVED']).optional(),
      severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
      assignedTo: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  }),
});
