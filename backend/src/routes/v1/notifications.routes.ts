
import { Router } from 'express';
import {
  getNotifications,
  getNotificationById,
  createNotification,
  updateNotificationStatus,
  bulkMarkAsRead,
  deleteNotification,
  getNotificationStats,
} from '../../controllers/notifications.controller';
import { authenticate, requirePermission } from '../../middleware/auth.middleware';
import { validate } from '../../middleware/validate.middleware';
import { defaultLimiter, bulkOperationLimiter } from '../../middleware/rateLimit.middleware';
import { noCache } from '../../middleware/cache.middleware';
import {
  createNotificationSchema,
  updateNotificationStatusSchema,
  bulkMarkAsReadSchema,
} from '../../validations/notification.schemas';
import { idParamSchema } from '../../validations/common.schemas';

const router = Router();

// Apply authentication to all routes
router.use(authenticate);

// No caching for notifications (real-time data)
router.use(noCache);

router.get(
  '/',
  requirePermission('notifications', 'read'),
  defaultLimiter,
  getNotifications
);

router.get(
  '/stats',
  requirePermission('notifications', 'read'),
  defaultLimiter,
  getNotificationStats
);

router.get(
  '/:id',
  requirePermission('notifications', 'read'),
  validate(idParamSchema),
  defaultLimiter,
  getNotificationById
);

router.post(
  '/',
  requirePermission('notifications', 'create'),
  validate(createNotificationSchema),
  defaultLimiter,
  createNotification
);

router.post(
  '/bulk/mark-read',
  requirePermission('notifications', 'update'),
  validate(bulkMarkAsReadSchema),
  bulkOperationLimiter,
  bulkMarkAsRead
);

router.patch(
  '/:id/status',
  requirePermission('notifications', 'update'),
  validate(updateNotificationStatusSchema),
  defaultLimiter,
  updateNotificationStatus
);

router.delete(
  '/:id',
  requirePermission('notifications', 'delete'),
  validate(idParamSchema),
  defaultLimiter,
  deleteNotification
);

export default router;
