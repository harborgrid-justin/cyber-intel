
import { Router } from 'express';
import {
  listActors,
  getActor,
  createActor,
  updateActor,
  deleteActor,
} from '../../controllers/actor.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { actorSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/',
  requirePermission('actor', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listActors
);

router.get(
  '/:id',
  requirePermission('actor', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getActor
);

// POST routes
router.post(
  '/',
  requirePermission('actor', 'create'),
  validate(actorSchema),
  defaultLimiter,
  createActor
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('actor', 'update'),
  validate(actorSchema),
  defaultLimiter,
  updateActor
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('actor', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteActor
);

export default router;
