
import { z } from 'zod';

/**
 * Threat Actor validation schemas
 */

export const createActorSchema = z.object({
  body: z.object({
    name: z.string().min(1, 'Name is required').max(255),
    aliases: z.array(z.string()).optional(),
    description: z.string().optional(),
    type: z.enum(['APT', 'CYBERCRIME', 'HACKTIVIST', 'INSIDER', 'NATION_STATE', 'UNKNOWN']),
    sophistication: z.enum(['NOVICE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'STRATEGIC']).optional(),
    motivation: z.array(z.string()).optional(),
    origin: z.string().optional(),
    firstSeen: z.string().datetime().optional(),
    lastSeen: z.string().datetime().optional(),
    status: z.enum(['ACTIVE', 'DORMANT', 'RETIRED']).optional().default('ACTIVE'),
    targetSectors: z.array(z.string()).optional(),
    targetRegions: z.array(z.string()).optional(),
    ttp: z.array(z.string()).optional(), // Tactics, Techniques, and Procedures
    tools: z.array(z.string()).optional(),
    campaigns: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const updateActorSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    name: z.string().min(1).max(255).optional(),
    aliases: z.array(z.string()).optional(),
    description: z.string().optional(),
    type: z.enum(['APT', 'CYBERCRIME', 'HACKTIVIST', 'INSIDER', 'NATION_STATE', 'UNKNOWN']).optional(),
    sophistication: z.enum(['NOVICE', 'INTERMEDIATE', 'ADVANCED', 'EXPERT', 'STRATEGIC']).optional(),
    motivation: z.array(z.string()).optional(),
    origin: z.string().optional(),
    lastSeen: z.string().datetime().optional(),
    status: z.enum(['ACTIVE', 'DORMANT', 'RETIRED']).optional(),
    targetSectors: z.array(z.string()).optional(),
    targetRegions: z.array(z.string()).optional(),
    ttp: z.array(z.string()).optional(),
    tools: z.array(z.string()).optional(),
    campaigns: z.array(z.string()).optional(),
    metadata: z.record(z.any()).optional(),
  }),
});

export const bulkCreateActorsSchema = z.object({
  body: z.object({
    actors: z.array(createActorSchema.shape.body).min(1).max(100),
  }),
});
