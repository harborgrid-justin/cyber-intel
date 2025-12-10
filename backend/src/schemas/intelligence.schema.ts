
import { z } from 'zod';

export const threatSchema = z.object({ 
  body: z.object({ 
    indicator: z.string().min(1), 
    type: z.string(),
    severity: z.string().optional(),
    source: z.string().optional(),
    confidence: z.number().min(0).max(100).optional(),
    threatActor: z.string().optional()
  }) 
});

export const caseSchema = z.object({ 
  body: z.object({ 
    title: z.string().min(3),
    description: z.string().optional(),
    priority: z.enum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']).optional(),
    assignee: z.string().optional()
  }) 
});

export const actorSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    origin: z.string().optional(),
    description: z.string().optional(),
    sophistication: z.string().optional(),
    targets: z.array(z.string()).optional(),
    aliases: z.array(z.string()).optional(),
    evasionTechniques: z.array(z.string()).optional(),
    exploits: z.array(z.string()).optional()
  })
});

export const campaignSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    status: z.string().optional(),
    objective: z.string().optional(),
    actors: z.array(z.string()).optional(),
    targetSectors: z.array(z.string()).optional(),
    targetRegions: z.array(z.string()).optional(),
    threatIds: z.array(z.string()).optional(),
    ttps: z.array(z.string()).optional()
  })
});

export const statusUpdateSchema = z.object({ 
  body: z.object({ 
    status: z.string().min(1) 
  }) 
});
