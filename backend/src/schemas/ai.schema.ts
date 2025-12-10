
import { z } from 'zod';

export const aiPromptSchema = z.object({
  body: z.object({
    prompt: z.string().min(5).max(2000),
    context: z.string().optional(),
    model: z.enum(['gemini-2.5-flash', 'gemini-3-pro-preview']).optional()
  })
});

export const simulationSchema = z.object({
  body: z.object({
    actorId: z.string(),
    targetNodeId: z.string(),
    entryNodeId: z.string().optional(),
    iterations: z.number().min(1).max(1000).optional()
  })
});
