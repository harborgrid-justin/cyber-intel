
import { Request, Response } from 'express';
import { logger } from '../utils/logger';

/**
 * Notifications Controller
 * Manages notification system for users and alerts
 */

// In-memory notification store (in production, use database)
interface Notification {
  id: string;
  type: 'INFO' | 'WARNING' | 'ALERT' | 'CRITICAL';
  title: string;
  message: string;
  recipients: string[];
  channels: ('EMAIL' | 'SMS' | 'WEBHOOK' | 'IN_APP')[];
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  status: 'PENDING' | 'SENT' | 'READ' | 'DISMISSED' | 'ARCHIVED';
  category?: string;
  relatedEntity?: { type: string; id: string };
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  expiresAt?: Date;
  createdBy?: string;
}

const notifications: Map<string, Notification> = new Map();

/**
 * GET /api/v1/notifications
 * Get all notifications for the current user
 */
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || '';
    const status = req.query.status as string;
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 20;

    let userNotifications = Array.from(notifications.values())
      .filter(n => n.recipients.includes(userId));

    if (status) {
      userNotifications = userNotifications.filter(n => n.status === status);
    }

    // Sort by created date (newest first)
    userNotifications.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    // Pagination
    const total = userNotifications.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedNotifications = userNotifications.slice(startIndex, endIndex);

    res.json({
      data: paginatedNotifications,
      pagination: {
        total,
        page,
        limit,
        pages: Math.ceil(total / limit),
      },
      unreadCount: userNotifications.filter(n => n.status === 'SENT').length,
    });
  } catch (err) {
    logger.error('Failed to get notifications', err);
    res.status(500).json({ error: 'Failed to retrieve notifications' });
  }
};

/**
 * GET /api/v1/notifications/:id
 * Get a single notification
 */
export const getNotificationById = async (req: Request, res: Response) => {
  try {
    const notification = notifications.get(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Check if user is a recipient
    if (!notification.recipients.includes(req.user?.id || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ data: notification });
  } catch (err) {
    logger.error('Failed to get notification', err);
    res.status(500).json({ error: 'Failed to retrieve notification' });
  }
};

/**
 * POST /api/v1/notifications
 * Create a new notification
 */
export const createNotification = async (req: Request, res: Response) => {
  try {
    const notification: Notification = {
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      ...req.body,
      status: 'PENDING',
      createdAt: new Date(),
      updatedAt: new Date(),
      createdBy: req.user?.id,
    };

    notifications.set(notification.id, notification);

    // In production, trigger actual notification sending here
    logger.info('Notification created', {
      id: notification.id,
      type: notification.type,
      recipients: notification.recipients.length,
      createdBy: req.user?.username,
    });

    // Simulate sending
    setTimeout(() => {
      const n = notifications.get(notification.id);
      if (n) {
        n.status = 'SENT';
        n.updatedAt = new Date();
      }
    }, 100);

    res.status(201).json({ data: notification });
  } catch (err) {
    logger.error('Failed to create notification', err);
    res.status(400).json({ error: 'Failed to create notification' });
  }
};

/**
 * PATCH /api/v1/notifications/:id/status
 * Update notification status
 */
export const updateNotificationStatus = async (req: Request, res: Response) => {
  try {
    const notification = notifications.get(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    if (!notification.recipients.includes(req.user?.id || '')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notification.status = req.body.status;
    notification.updatedAt = new Date();

    logger.info('Notification status updated', {
      id: notification.id,
      status: notification.status,
      user: req.user?.username,
    });

    res.json({ data: notification });
  } catch (err) {
    logger.error('Failed to update notification status', err);
    res.status(500).json({ error: 'Failed to update status' });
  }
};

/**
 * POST /api/v1/notifications/bulk/mark-read
 * Mark multiple notifications as read
 */
export const bulkMarkAsRead = async (req: Request, res: Response) => {
  try {
    const { ids } = req.body;
    const userId = req.user?.id || '';
    const updated = [];

    for (const id of ids) {
      const notification = notifications.get(id);
      if (notification && notification.recipients.includes(userId)) {
        notification.status = 'READ';
        notification.updatedAt = new Date();
        updated.push(id);
      }
    }

    logger.info('Bulk notifications marked as read', {
      count: updated.length,
      user: req.user?.username,
    });

    res.json({
      message: 'Notifications marked as read',
      updated: updated.length,
    });
  } catch (err) {
    logger.error('Failed to mark notifications as read', err);
    res.status(500).json({ error: 'Bulk update failed' });
  }
};

/**
 * DELETE /api/v1/notifications/:id
 * Delete a notification
 */
export const deleteNotification = async (req: Request, res: Response) => {
  try {
    const notification = notifications.get(req.params.id);

    if (!notification) {
      return res.status(404).json({ error: 'Notification not found' });
    }

    // Only allow deletion by recipients or admin
    if (!notification.recipients.includes(req.user?.id || '') && !req.permissions?.has('notifications:admin')) {
      return res.status(403).json({ error: 'Access denied' });
    }

    notifications.delete(req.params.id);

    logger.info('Notification deleted', {
      id: req.params.id,
      user: req.user?.username,
    });

    res.json({ message: 'Notification deleted successfully' });
  } catch (err) {
    logger.error('Failed to delete notification', err);
    res.status(500).json({ error: 'Failed to delete notification' });
  }
};

/**
 * GET /api/v1/notifications/stats
 * Get notification statistics
 */
export const getNotificationStats = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.id || '';
    const userNotifications = Array.from(notifications.values())
      .filter(n => n.recipients.includes(userId));

    const stats = {
      total: userNotifications.length,
      byStatus: countBy(userNotifications, 'status'),
      byType: countBy(userNotifications, 'type'),
      byPriority: countBy(userNotifications, 'priority'),
      unread: userNotifications.filter(n => n.status === 'SENT').length,
    };

    res.json({ data: stats });
  } catch (err) {
    logger.error('Failed to get notification stats', err);
    res.status(500).json({ error: 'Failed to retrieve stats' });
  }
};

// Helper function
function countBy(array: any[], key: string): Record<string, number> {
  return array.reduce((acc, item) => {
    const value = item[key] || 'Unknown';
    acc[value] = (acc[value] || 0) + 1;
    return acc;
  }, {});
}
