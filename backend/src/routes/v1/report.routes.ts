
import { Router } from 'express';
import {
  listReports,
  getReport,
  createReport,
  updateReport,
  updateReportStatus,
  deleteReport,
  generateDraft,
  getTemplates,
} from '../../controllers/report.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { reportSchema, statusUpdateSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/',
  requirePermission('report', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listReports
);

router.get(
  '/templates',
  requirePermission('report', 'read'),
  cacheControl(CACHE_DURATIONS.long),
  defaultLimiter,
  getTemplates
);

router.get(
  '/:id',
  requirePermission('report', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getReport
);

// POST routes
router.post(
  '/',
  requirePermission('report', 'create'),
  validate(reportSchema),
  defaultLimiter,
  createReport
);

router.post(
  '/generate-draft',
  requirePermission('report', 'create'),
  defaultLimiter,
  generateDraft
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('report', 'update'),
  validate(reportSchema),
  defaultLimiter,
  updateReport
);

router.patch(
  '/:id/status',
  requirePermission('report', 'update'),
  validate(statusUpdateSchema),
  defaultLimiter,
  updateReportStatus
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('report', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteReport
);

export default router;
