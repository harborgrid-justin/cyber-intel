
import { Router } from 'express';
import {
  listUsers,
  getUser,
  createUser,
  updateUser,
  updateUserStatus,
  deleteUser,
  getCurrentUser,
} from '../../controllers/user.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { userSchema, statusUpdateSchema } from '../../schemas/validation.schemas';
import { idParamSchema } from '../../validations/common.schemas';
import { defaultLimiter } from '../../middleware/rateLimit.middleware';
import { cacheControl, CACHE_DURATIONS } from '../../middleware/cache.middleware';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// Current User Context (No permission check needed beyond auth)
router.get('/me', getCurrentUser);

// GET routes
router.get(
  '/',
  requirePermission('user', 'read'),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  listUsers
);

router.get(
  '/:id',
  requirePermission('user', 'read'),
  validate(idParamSchema),
  cacheControl(CACHE_DURATIONS.short),
  defaultLimiter,
  getUser
);

// POST routes
router.post(
  '/',
  requirePermission('user', 'manage'),
  validate(userSchema),
  defaultLimiter,
  createUser
);

// PATCH routes
router.patch(
  '/:id',
  requirePermission('user', 'manage'),
  validate(userSchema),
  defaultLimiter,
  updateUser
);

router.patch(
  '/:id/status',
  requirePermission('user', 'manage'),
  validate(statusUpdateSchema),
  defaultLimiter,
  updateUserStatus
);

// DELETE routes
router.delete(
  '/:id',
  requirePermission('user', 'manage'),
  validate(idParamSchema),
  defaultLimiter,
  deleteUser
);

export default router;
