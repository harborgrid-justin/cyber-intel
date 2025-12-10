
import { z } from 'zod';

export const reportSchema = z.object({
  body: z.object({
    title: z.string().min(1),
    type: z.string(),
    content: z.string().optional(),
    relatedCaseId: z.string().optional()
  })
});

export const playbookSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    description: z.string().optional(),
    tasks: z.array(z.string()),
    triggerLabel: z.string().optional()
  })
});

export const evidenceSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.string(),
    hash: z.string().optional(),
    size: z.string().optional(),
    caseId: z.string().min(1)
  })
});
