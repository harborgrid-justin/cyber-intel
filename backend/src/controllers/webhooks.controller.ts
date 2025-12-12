
import { Request, Response } from 'express';
import { logger } from '../utils/logger';
import crypto from 'crypto';

/**
 * Webhooks Controller
 * Manages webhook configurations for external integrations
 */

interface Webhook {
  id: string;
  name: string;
  url: string;
  events: string[];
  headers?: Record<string, string>;
  secret?: string;
  active: boolean;
  retryOnFailure: boolean;
  maxRetries: number;
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: string;
  lastTriggered?: Date;
  successCount: number;
  failureCount: number;
}

const webhooks: Map<string, Webhook> = new Map();

/**
 * GET /api/v1/webhooks
 * Get all webhooks
 */
export const getWebhooks = async (req: Request, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const active = req.query.active;

    let webhookList = Array.from(webhooks.values());

    if (active !== undefined) {
      webhookList = webhookList.filter(w => w.active === (active === 'true'));
    }

    const total = webhookList.length;
    const startIndex = (page - 1) * limit;
    const paginatedWebhooks = webhookList.slice(startIndex, startIndex + limit);

    res.json({
      data: paginatedWebhooks,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    logger.error('Failed to get webhooks', err);
    res.status(500).json({ error: 'Failed to retrieve webhooks' });
  }
};

/**
 * GET /api/v1/webhooks/:id
 * Get a single webhook
 */
export const getWebhookById = async (req: Request, res: Response) => {
  try {
    const webhook = webhooks.get(req.params.id);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    res.json({ data: webhook });
  } catch (err) {
    logger.error('Failed to get webhook', err);
    res.status(500).json({ error: 'Failed to retrieve webhook' });
  }
};

/**
 * POST /api/v1/webhooks
 * Create a new webhook
 */
export const createWebhook = async (req: Request, res: Response) => {
  try {
    const webhook: Webhook = {
      id: `webhook-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.id,
      successCount: 0,
      failureCount: 0,
    };

    webhooks.set(webhook.id, webhook);

    logger.info('Webhook created', {
      id: webhook.id,
      url: webhook.url,
      events: webhook.events,
      createdBy: req.user?.username,
    });

    res.status(201).json({ data: webhook });
  } catch (err) {
    logger.error('Failed to create webhook', err);
    res.status(400).json({ error: 'Failed to create webhook' });
  }
};

/**
 * PUT /api/v1/webhooks/:id
 * Update a webhook
 */
export const updateWebhook = async (req: Request, res: Response) => {
  try {
    const webhook = webhooks.get(req.params.id);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const updates = req.body;
    Object.assign(webhook, updates, { updatedAt: new Date() });

    logger.info('Webhook updated', {
      id: webhook.id,
      updatedBy: req.user?.username,
    });

    res.json({ data: webhook });
  } catch (err) {
    logger.error('Failed to update webhook', err);
    res.status(500).json({ error: 'Failed to update webhook' });
  }
};

/**
 * DELETE /api/v1/webhooks/:id
 * Delete a webhook
 */
export const deleteWebhook = async (req: Request, res: Response) => {
  try {
    const webhook = webhooks.get(req.params.id);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    webhooks.delete(req.params.id);

    logger.info('Webhook deleted', {
      id: req.params.id,
      deletedBy: req.user?.username,
    });

    res.json({ message: 'Webhook deleted successfully' });
  } catch (err) {
    logger.error('Failed to delete webhook', err);
    res.status(500).json({ error: 'Failed to delete webhook' });
  }
};

/**
 * POST /api/v1/webhooks/:id/test
 * Test a webhook
 */
export const testWebhook = async (req: Request, res: Response) => {
  try {
    const webhook = webhooks.get(req.params.id);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    const testPayload = req.body.payload || {
      event: 'test',
      timestamp: new Date().toISOString(),
      data: { message: 'This is a test webhook' },
    };

    // Simulate webhook call
    const result = await triggerWebhook(webhook, testPayload);

    logger.info('Webhook tested', {
      id: webhook.id,
      success: result.success,
      testedBy: req.user?.username,
    });

    res.json({
      message: 'Webhook test completed',
      result,
    });
  } catch (err) {
    logger.error('Failed to test webhook', err);
    res.status(500).json({ error: 'Webhook test failed' });
  }
};

/**
 * PATCH /api/v1/webhooks/:id/toggle
 * Toggle webhook active status
 */
export const toggleWebhook = async (req: Request, res: Response) => {
  try {
    const webhook = webhooks.get(req.params.id);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    webhook.active = !webhook.active;
    webhook.updatedAt = new Date();

    logger.info('Webhook toggled', {
      id: webhook.id,
      active: webhook.active,
      toggledBy: req.user?.username,
    });

    res.json({ data: webhook });
  } catch (err) {
    logger.error('Failed to toggle webhook', err);
    res.status(500).json({ error: 'Failed to toggle webhook' });
  }
};

/**
 * GET /api/v1/webhooks/:id/logs
 * Get webhook execution logs
 */
export const getWebhookLogs = async (req: Request, res: Response) => {
  try {
    const webhook = webhooks.get(req.params.id);

    if (!webhook) {
      return res.status(404).json({ error: 'Webhook not found' });
    }

    // In production, fetch from database or logging system
    const logs = {
      webhookId: webhook.id,
      totalExecutions: webhook.successCount + webhook.failureCount,
      successCount: webhook.successCount,
      failureCount: webhook.failureCount,
      successRate: webhook.successCount + webhook.failureCount > 0
        ? ((webhook.successCount / (webhook.successCount + webhook.failureCount)) * 100).toFixed(2) + '%'
        : 'N/A',
      lastTriggered: webhook.lastTriggered,
      recentLogs: [], // Placeholder
    };

    res.json({ data: logs });
  } catch (err) {
    logger.error('Failed to get webhook logs', err);
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
};

// Helper function to trigger webhook
async function triggerWebhook(webhook: Webhook, payload: any): Promise<{ success: boolean; message: string }> {
  try {
    // Generate signature if secret is provided
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'User-Agent': 'SENTINEL-Platform/1.0',
      ...webhook.headers,
    };

    if (webhook.secret) {
      const signature = crypto
        .createHmac('sha256', webhook.secret)
        .update(JSON.stringify(payload))
        .digest('hex');
      headers['X-Webhook-Signature'] = signature;
    }

    // In production, use actual HTTP client like axios
    logger.info('Triggering webhook', {
      id: webhook.id,
      url: webhook.url,
      payload,
    });

    // Simulate successful webhook call
    webhook.lastTriggered = new Date();
    webhook.successCount++;

    return { success: true, message: 'Webhook triggered successfully' };
  } catch (err: any) {
    webhook.failureCount++;
    logger.error('Webhook trigger failed', err);
    return { success: false, message: err.message };
  }
}

// Export the trigger function for use by other controllers
export { triggerWebhook };
