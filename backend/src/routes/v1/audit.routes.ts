
import { Router } from 'express';
import { getAuditLogs } from '../../controllers/audit.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes - Audit logs require elevated permissions
router.get(
  '/',
  requirePermission('audit', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getAuditLogs
);

export default router;
