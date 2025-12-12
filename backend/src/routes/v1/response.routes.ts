
import { Router } from 'express';
import {
  listPlaybooks,
  getPlaybook,
  createPlaybook,
  updatePlaybook,
  deletePlaybook,
  runPlaybook,
} from '../../controllers/response.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { playbookSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter, strictLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// GET routes
router.get(
  '/playbooks',
  requirePermission('response', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listPlaybooks
);

router.get(
  '/playbooks/:id',
  requirePermission('response', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getPlaybook
);

// POST routes
router.post(
  '/playbooks',
  requirePermission('response', 'create'),
  validate(playbookSchema),
  defaultLimiter,
  createPlaybook
);

router.post(
  '/playbooks/:id/execute',
  requirePermission('response', 'execute'),
  validate(idParamSchema),
  strictLimiter,
  runPlaybook
);

// PATCH routes
router.patch(
  '/playbooks/:id',
  requirePermission('response', 'update'),
  validate(playbookSchema),
  defaultLimiter,
  updatePlaybook
);

// DELETE routes
router.delete(
  '/playbooks/:id',
  requirePermission('response', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deletePlaybook
);

export default router;
