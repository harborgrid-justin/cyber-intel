
import { z } from 'zod';

/**
 * Integration validation schemas
 */

export const createIntegrationSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    type: z.enum([
      'SIEM',
      'SOAR',
      'THREAT_INTEL',
      'VULNERABILITY_SCANNER',
      'EDR',
      'FIREWALL',
      'IDS_IPS',
      'TICKETING',
      'CHAT',
      'EMAIL',
      'CUSTOM',
    ]),
    provider: z.string().min(1, 'Provider is required'),
    configuration: z.object({
      apiUrl: z.string().url().optional(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      customSettings: z.record(z.any()).optional(),
    }),
    enabled: z.boolean().optional().default(true),
    autoSync: z.boolean().optional().default(false),
    syncInterval: z.number().min(60).optional(), // seconds
    features: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateIntegrationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    configuration: z.object({
      apiUrl: z.string().url().optional(),
      apiKey: z.string().optional(),
      apiSecret: z.string().optional(),
      username: z.string().optional(),
      password: z.string().optional(),
      customSettings: z.record(z.any()).optional(),
    }).optional(),
    enabled: z.boolean().optional(),
    autoSync: z.boolean().optional(),
    syncInterval: z.number().min(60).optional(),
    features: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const testIntegrationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
});

export const syncIntegrationSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    fullSync: z.boolean().optional().default(false),
  }),
});
