
import { z } from 'zod';

/**
 * Webhook validation schemas
 */

export const createWebhookSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    url: z.string().url('Invalid URL format'),
    events: z.array(z.enum([
      'threat.created',
      'threat.updated',
      'threat.resolved',
      'case.created',
      'case.updated',
      'case.closed',
      'alert.triggered',
      'vulnerability.discovered',
      'actor.identified',
    ])).min(1, 'At least one event is required'),
    headers: z.record(z.string()).optional(),
    secret: z.string().min(16, 'Secret must be at least 16 characters').optional(),
    active: z.boolean().optional().default(true),
    retryOnFailure: z.boolean().optional().default(true),
    maxRetries: z.number().min(0).max(10).optional().default(3),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateWebhookSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    url: z.string().url('Invalid URL format').optional(),
    events: z.array(z.enum([
      'threat.created',
      'threat.updated',
      'threat.resolved',
      'case.created',
      'case.updated',
      'case.closed',
      'alert.triggered',
      'vulnerability.discovered',
      'actor.identified',
    ])).optional(),
    headers: z.record(z.string()).optional(),
    secret: z.string().min(16).optional(),
    active: z.boolean().optional(),
    retryOnFailure: z.boolean().optional(),
    maxRetries: z.number().min(0).max(10).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const testWebhookSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    payload: z.record(z.any()).optional(),
  }),
});
