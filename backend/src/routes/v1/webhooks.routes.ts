
import { Router } from 'express';
import {
  getWebhooks,
  getWebhookById,
  createWebhook,
  updateWebhook,
  deleteWebhook,
  testWebhook,
  toggleWebhook,
  getWebhookLogs,
} from '../../controllers/webhooks.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { defaultLimiter, strictLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';
import {
  createWebhookSchema,
  updateWebhookSchema,
  testWebhookSchema,
} from '../../validations/webhook.schemas';
import { idParamSchema } from '../../validations/common.schemas';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.get(
  '/',
  requirePermission('webhooks', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getWebhooks
);

router.get(
  '/:id',
  requirePermission('webhooks', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getWebhookById
);

router.get(
  '/:id/logs',
  requirePermission('webhooks', 'read'),
  validate(idParamSchema),
  defaultLimiter,
  getWebhookLogs
);

router.post(
  '/',
  requirePermission('webhooks', 'create'),
  validate(createWebhookSchema),
  defaultLimiter,
  createWebhook
);

router.post(
  '/:id/test',
  requirePermission('webhooks', 'test'),
  validate(testWebhookSchema),
  strictLimiter,
  testWebhook
);

router.put(
  '/:id',
  requirePermission('webhooks', 'update'),
  validate(updateWebhookSchema),
  defaultLimiter,
  updateWebhook
);

router.patch(
  '/:id/toggle',
  requirePermission('webhooks', 'update'),
  validate(idParamSchema),
  defaultLimiter,
  toggleWebhook
);

router.delete(
  '/:id',
  requirePermission('webhooks', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteWebhook
);

export default router;
