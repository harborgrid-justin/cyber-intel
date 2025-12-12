
import { Router } from 'express';
import {
  listAssets,
  getAsset,
  createAsset,
  updateAsset,
  updateAssetStatus,
  deleteAsset,
} from '../../controllers/asset.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { assetSchema, statusUpdateSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/',
  requirePermission('asset', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listAssets
);

router.get(
  '/:id',
  requirePermission('asset', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getAsset
);

// POST routes
router.post(
  '/',
  requirePermission('asset', 'create'),
  validate(assetSchema),
  defaultLimiter,
  createAsset
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('asset', 'update'),
  validate(assetSchema),
  defaultLimiter,
  updateAsset
);

router.patch(
  '/:id/status',
  requirePermission('asset', 'update'),
  validate(statusUpdateSchema),
  defaultLimiter,
  updateAssetStatus
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('asset', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteAsset
);

export default router;
