
import { Router } from 'express';
import {
  listCases,
  getCase,
  createCase,
  updateCase,
  deleteCase,
} from '../../controllers/case.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { caseSchema, statusUpdateSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/',
  requirePermission('case', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listCases
);

router.get(
  '/:id',
  requirePermission('case', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getCase
);

// POST routes
router.post(
  '/',
  requirePermission('case', 'create'),
  validate(caseSchema),
  defaultLimiter,
  createCase
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('case', 'update'),
  validate(statusUpdateSchema),
  defaultLimiter,
  updateCase
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('case', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteCase
);

export default router;
