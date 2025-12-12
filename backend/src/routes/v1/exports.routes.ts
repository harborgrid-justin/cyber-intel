
import { Router } from 'express';
import {
  exportThreats,
  exportCases,
  exportActors,
  exportCustom,
  getExportHistory,
} from '../../controllers/exports.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { exportLimiter } from '../../middleware/rateLimit.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

router.get(
  '/history',
  requirePermission('exports', 'read'),
  getExportHistory
);

router.post(
  '/threats',
  requirePermission('threat', 'export'),
  exportLimiter,
  exportThreats
);

router.post(
  '/cases',
  requirePermission('case', 'export'),
  exportLimiter,
  exportCases
);

router.post(
  '/actors',
  requirePermission('actor', 'export'),
  exportLimiter,
  exportActors
);

router.post(
  '/custom',
  requirePermission('exports', 'admin'),
  exportLimiter,
  exportCustom
);

export default router;
