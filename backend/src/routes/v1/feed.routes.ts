
import { Router } from 'express';
import {
  listFeeds,
  getFeed,
  addFeed,
  updateFeed,
  deleteFeed,
  syncFeed,
} from '../../controllers/feed.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { feedSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter, strictLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/',
  requirePermission('feed', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listFeeds
);

router.get(
  '/:id',
  requirePermission('feed', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getFeed
);

// POST routes
router.post(
  '/',
  requirePermission('feed', 'create'),
  validate(feedSchema),
  defaultLimiter,
  addFeed
);

router.post(
  '/:id/sync',
  requirePermission('feed', 'sync'),
  validate(idParamSchema),
  strictLimiter,
  syncFeed
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('feed', 'update'),
  validate(feedSchema),
  defaultLimiter,
  updateFeed
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('feed', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteFeed
);

export default router;
