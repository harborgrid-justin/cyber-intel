
import { z } from 'zod';

/**
 * Notification validation schemas
 */

export const createNotificationSchema = z.object({
  body: z.object({
    type: z.enum(['INFO', 'WARNING', 'ALERT', 'CRITICAL']),
    title: z.string().min(1, 'Title is required').max(255),
    message: z.string().min(1, 'Message is required'),
    recipients: z.array(z.string()).min(1, 'At least one recipient is required'),
    channels: z.array(z.enum(['EMAIL', 'SMS', 'WEBHOOK', 'IN_APP'])).optional().default(['IN_APP']),
    priority: z.enum(['LOW', 'NORMAL', 'HIGH', 'URGENT']).optional().default('NORMAL'),
    category: z.string().optional(),
    relatedEntity: z.object({
      type: z.string(),
      id: z.string(),
    }).optional(),
    metadata: z.record(z.any()).optional(),
    expiresAt: z.string().datetime().optional(),
  }),
});

export const updateNotificationStatusSchema = z.object({
  params: z.object({
    id: z.string().min(1),
  }),
  body: z.object({
    status: z.enum(['SENT', 'READ', 'DISMISSED', 'ARCHIVED']),
  }),
});

export const bulkMarkAsReadSchema = z.object({
  body: z.object({
    ids: z.array(z.string()).min(1).max(100),
  }),
});
