
import { Router } from 'express';
import {
  getIntegrations,
  getIntegrationById,
  createIntegration,
  updateIntegration,
  deleteIntegration,
  testIntegration,
  syncIntegration,
  toggleIntegration,
  getIntegrationTypes,
} from '../../controllers/integrations.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { defaultLimiter, strictLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';
import {
  createIntegrationSchema,
  updateIntegrationSchema,
  testIntegrationSchema,
  syncIntegrationSchema,
} from '../../validations/integration.schemas';
import { idParamSchema } from '../../validations/common.schemas';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.get(
  '/types',
  requirePermission('integrations', 'read'),
  cacheControl(CACHE_DURATIONS.veryLong),
  defaultLimiter,
  getIntegrationTypes
);

router.get(
  '/',
  requirePermission('integrations', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getIntegrations
);

router.get(
  '/:id',
  requirePermission('integrations', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getIntegrationById
);

router.post(
  '/',
  requirePermission('integrations', 'create'),
  validate(createIntegrationSchema),
  defaultLimiter,
  createIntegration
);

router.post(
  '/:id/test',
  requirePermission('integrations', 'test'),
  validate(testIntegrationSchema),
  strictLimiter,
  testIntegration
);

router.post(
  '/:id/sync',
  requirePermission('integrations', 'sync'),
  validate(syncIntegrationSchema),
  strictLimiter,
  syncIntegration
);

router.put(
  '/:id',
  requirePermission('integrations', 'update'),
  validate(updateIntegrationSchema),
  defaultLimiter,
  updateIntegration
);

router.patch(
  '/:id/toggle',
  requirePermission('integrations', 'update'),
  validate(idParamSchema),
  defaultLimiter,
  toggleIntegration
);

router.delete(
  '/:id',
  requirePermission('integrations', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteIntegration
);

export default router;
