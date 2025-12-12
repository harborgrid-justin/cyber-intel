
import { Router } from 'express';
import {
  getThreats,
  getThreatById,
  createThreat,
  updateThreat,
  deleteThreat,
  updateThreatStatus,
  bulkCreateThreats,
  bulkUpdateThreats,
  bulkDeleteThreats,
  exportThreats,
  getThreatStats,
} from '../../controllers/threat.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import {
  defaultLimiter,
  bulkOperationLimiter,
  exportLimiter,
} from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';
import {
  createThreatSchema,
  updateThreatSchema,
  updateThreatStatusSchema,
  bulkCreateThreatsSchema,
  bulkUpdateThreatsSchema,
} from '../../validations/threat.schemas';
import { idParamSchema, bulkDeleteSchema, exportSchema } from '../../validations/common.schemas';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes with caching
router.get(
  '/',
  requirePermission('threat', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getThreats
);

router.get(
  '/stats',
  requirePermission('threat', 'read'),
  cacheControl(CACHE_DURATIONS.medium),
  defaultLimiter,
  getThreatStats
);

router.get(
  '/export',
  requirePermission('threat', 'export'),
  validate(exportSchema),
  exportLimiter,
  exportThreats
);

router.get(
  '/:id',
  requirePermission('threat', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getThreatById
);

// POST routes
router.post(
  '/',
  requirePermission('threat', 'create'),
  validate(createThreatSchema),
  defaultLimiter,
  createThreat
);

router.post(
  '/bulk',
  requirePermission('threat', 'create'),
  validate(bulkCreateThreatsSchema),
  bulkOperationLimiter,
  bulkCreateThreats
);

// PUT routes
router.put(
  '/:id',
  requirePermission('threat', 'update'),
  validate(updateThreatSchema),
  defaultLimiter,
  updateThreat
);

// PATCH routes
router.patch(
  '/:id/status',
  requirePermission('threat', 'update'),
  validate(updateThreatStatusSchema),
  defaultLimiter,
  updateThreatStatus
);

router.patch(
  '/bulk',
  requirePermission('threat', 'update'),
  validate(bulkUpdateThreatsSchema),
  bulkOperationLimiter,
  bulkUpdateThreats
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('threat', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteThreat
);

router.delete(
  '/bulk',
  requirePermission('threat', 'delete'),
  validate(bulkDeleteSchema),
  bulkOperationLimiter,
  bulkDeleteThreats
);

export default router;
