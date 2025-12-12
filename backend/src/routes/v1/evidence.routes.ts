
import { Router } from 'express';
import {
  listEvidence,
  getEvidence,
  uploadEvidence,
  updateEvidence,
  deleteEvidence,
  getChain,
} from '../../controllers/evidence.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { evidenceSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/',
  requirePermission('evidence', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listEvidence
);

router.get(
  '/:id',
  requirePermission('evidence', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getEvidence
);

router.get(
  '/:id/chain',
  requirePermission('evidence', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getChain
);

// POST routes
router.post(
  '/',
  requirePermission('evidence', 'create'),
  validate(evidenceSchema),
  defaultLimiter,
  uploadEvidence
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('evidence', 'update'),
  validate(evidenceSchema),
  defaultLimiter,
  updateEvidence
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('evidence', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteEvidence
);

export default router;
