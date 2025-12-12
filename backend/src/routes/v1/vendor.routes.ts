
import { Router } from 'express';
import {
  listVendors,
  getVendor,
  addVendor,
  updateVendor,
  deleteVendor,
} from '../../controllers/vendor.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { vendorSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/',
  requirePermission('vendor', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listVendors
);

router.get(
  '/:id',
  requirePermission('vendor', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getVendor
);

// POST routes
router.post(
  '/',
  requirePermission('vendor', 'create'),
  validate(vendorSchema),
  defaultLimiter,
  addVendor
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('vendor', 'update'),
  validate(vendorSchema),
  defaultLimiter,
  updateVendor
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('vendor', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteVendor
);

export default router;
