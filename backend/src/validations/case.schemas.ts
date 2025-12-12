
import { z } from 'zod';

/**
 * Case validation schemas
 */

export const createCaseSchema = z.object({
  body: z.object({
    title: z.string().min(1, 'Title is required').max(255),
    description: z.string().optional(),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']),
    priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']).optional().default('NORMAL'),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional().default('OPEN'),
    assignedTo: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    relatedThreats: z.array(z.string()).optional(),
    relatedAssets: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateCaseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    title: z.string().min(1).max(255).optional(),
    description: z.string().optional(),
    severity: z.enum(['CRITICAL', 'HIGH', 'MEDIUM', 'LOW']).optional(),
    priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']).optional(),
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
    assignedTo: z.string().optional(),
    category: z.string().optional(),
    tags: z.array(z.string()).optional(),
    relatedThreats: z.array(z.string()).optional(),
    relatedAssets: z.array(z.string()).optional(),
    resolution: z.string().optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateCaseStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    resolution: z.string().optional(),
    reason: z.string().optional(),
  }),
});

export const assignCaseSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    assignedTo: z.string().min(1, 'Assignee is required'),
    notes: z.string().optional(),
  }),
});

export const bulkCreateCasesSchema = z.object({
  body: z.object({
    cases: z.array(createCaseSchema.shape.body).min(1).max(100),
  }),
});

export const bulkUpdateCasesSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1).max(100),
    updates: z.object({
      status: z.enum(['OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']).optional(),
      priority: z.enum(['URGENT', 'HIGH', 'NORMAL', 'LOW']).optional(),
      assignedTo: z.string().optional(),
      tags: z.array(z.string()).optional(),
    }),
  }),
});
