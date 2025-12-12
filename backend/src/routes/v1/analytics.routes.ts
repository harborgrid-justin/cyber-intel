
import { Router } from 'express';
import {
  getOverview,
  getTrends,
  getThreatLandscape,
  getPerformance,
  getThreatActorAnalytics,
  executeCustomQuery,
} from '../../controllers/analytics.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { defaultLimiter, strictLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Analytics endpoints
router.get(
  '/overview',
  requirePermission('analytics', 'read'),
  cacheControl(CACHE_DURATIONS.medium),
  defaultLimiter,
  getOverview
);

router.get(
  '/trends',
  requirePermission('analytics', 'read'),
  cacheControl(CACHE_DURATIONS.medium),
  defaultLimiter,
  getTrends
);

router.get(
  '/threat-landscape',
  requirePermission('analytics', 'read'),
  cacheControl(CACHE_DURATIONS.medium),
  defaultLimiter,
  getThreatLandscape
);

router.get(
  '/performance',
  requirePermission('analytics', 'read'),
  cacheControl(CACHE_DURATIONS.long),
  defaultLimiter,
  getPerformance
);

router.get(
  '/threat-actors',
  requirePermission('analytics', 'read'),
  cacheControl(CACHE_DURATIONS.medium),
  defaultLimiter,
  getThreatActorAnalytics
);

router.post(
  '/custom-query',
  requirePermission('analytics', 'admin'),
  strictLimiter,
  executeCustomQuery
);

export default router;
