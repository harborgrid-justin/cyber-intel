
import { z } from 'zod';

export const userSchema = z.object({
  body: z.object({
    username: z.string().min(3),
    role: z.string(),
    clearance: z.string(),
    email: z.string().email().optional()
  })
});

export const messageSchema = z.object({
  body: z.object({
    channelId: z.string().min(1),
    content: z.string().min(1)
  })
});

export const channelSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.string()
  })
});

export const integrationSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    type: z.string(),
    url: z.string().url(),
    apiKey: z.string().optional()
  })
});

export const maintenanceSchema = z.object({
  body: z.object({
    action: z.string().min(1)
  })
});
