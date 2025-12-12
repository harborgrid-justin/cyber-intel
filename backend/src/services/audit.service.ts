
import { AuditLog } from '../models/operations';
import { logger } from '../utils/logger';
import { ModelStatic } from 'sequelize';

const AuditModel = AuditLog as ModelStatic<AuditLog>;

/**
 * Authentication Event Types
 */
export enum AuthEventType {
  LOGIN_SUCCESS = 'LOGIN_SUCCESS',
  LOGIN_FAILED = 'LOGIN_FAILED',
  LOGIN_BLOCKED = 'LOGIN_BLOCKED',
  LOGOUT = 'LOGOUT',
  USER_REGISTERED = 'USER_REGISTERED',
  PASSWORD_CHANGED = 'PASSWORD_CHANGED',
  PASSWORD_RESET_REQUEST = 'PASSWORD_RESET_REQUEST',
  PASSWORD_RESET_SUCCESS = 'PASSWORD_RESET_SUCCESS',
  EMAIL_CHANGED = 'EMAIL_CHANGED',
  MFA_ENABLED = 'MFA_ENABLED',
  MFA_DISABLED = 'MFA_DISABLED',
  MFA_REQUIRED = 'MFA_REQUIRED',
  MFA_VERIFIED = 'MFA_VERIFIED',
  ACCOUNT_LOCKED = 'ACCOUNT_LOCKED',
  ACCOUNT_UNLOCKED = 'ACCOUNT_UNLOCKED',
  TOKEN_REFRESHED = 'TOKEN_REFRESHED',
  SESSION_EXPIRED = 'SESSION_EXPIRED',
  PERMISSION_DENIED = 'PERMISSION_DENIED'
}

export class AuditService {
  static async log(
    user: string,
    action: string,
    details: string,
    resourceId?: string,
    ip?: string
  ): Promise<void> {
    try {
      await AuditModel.create({
        id: `audit-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        user_id: user,
        action,
        details,
        resource_id: resourceId || '', // Ensure not null/undefined for strict types if schema allows empty string
        ip_address: ip || '127.0.0.1',
        timestamp: new Date()
      } as AuditLog);
    } catch (err) {
      logger.error('FAILED TO WRITE AUDIT LOG', { error: err, user, action });
    }
  }

  /**
   * Log authentication-specific events
   * Implements comprehensive security audit trail per NIST 800-53 AU family
   */
  static async logAuthEvent(
    eventType: string,
    username: string,
    ipAddress?: string,
    details?: string
  ): Promise<void> {
    try {
      const auditId = `AUDIT-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      await AuditModel.create({
        id: auditId,
        user_id: username,
        action: eventType,
        details: details || eventType,
        resource_id: 'AUTH',
        ip_address: ipAddress || 'unknown',
        timestamp: new Date()
      } as AuditLog);

      // Also log to standard logger for real-time monitoring
      const severity = this.getEventSeverity(eventType);
      const logMessage = `[Auth Event] ${eventType} - User: ${username}, IP: ${ipAddress || 'unknown'}${details ? `, Details: ${details}` : ''}`;

      if (severity === 'high') {
        logger.warn(logMessage);
      } else if (severity === 'critical') {
        logger.error(logMessage);
      } else {
        logger.info(logMessage);
      }
    } catch (err) {
      logger.error('FAILED TO WRITE AUTH AUDIT LOG', {
        error: err,
        eventType,
        username
      });
    }
  }

  /**
   * Get severity level for authentication events
   */
  private static getEventSeverity(eventType: string): 'low' | 'medium' | 'high' | 'critical' {
    const highSeverityEvents = [
      AuthEventType.LOGIN_BLOCKED,
      AuthEventType.ACCOUNT_LOCKED,
      AuthEventType.PERMISSION_DENIED,
      'MULTIPLE_FAILED_ATTEMPTS'
    ];

    const criticalSeverityEvents = [
      'BRUTE_FORCE_DETECTED',
      'UNAUTHORIZED_ACCESS_ATTEMPT',
      'PRIVILEGE_ESCALATION_ATTEMPT'
    ];

    const mediumSeverityEvents = [
      AuthEventType.LOGIN_FAILED,
      AuthEventType.PASSWORD_RESET_REQUEST,
      AuthEventType.MFA_DISABLED
    ];

    if (criticalSeverityEvents.includes(eventType)) {
      return 'critical';
    } else if (highSeverityEvents.includes(eventType)) {
      return 'high';
    } else if (mediumSeverityEvents.includes(eventType)) {
      return 'medium';
    }

    return 'low';
  }

  /**
   * Get authentication audit logs
   */
  static async getAuthLogs(
    limit: number = 100,
    offset: number = 0,
    username?: string,
    eventType?: string
  ): Promise<AuditLog[]> {
    const where: any = { resource_id: 'AUTH' };

    if (username) {
      where.user_id = username;
    }

    if (eventType) {
      where.action = eventType;
    }

    return await AuditModel.findAll({
      where,
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });
  }

  /**
   * Get failed login attempts for a user within a time window
   */
  static async getFailedLoginAttempts(
    username: string,
    minutesWindow: number = 15
  ): Promise<number> {
    const since = new Date(Date.now() - minutesWindow * 60 * 1000);

    const logs = await AuditModel.findAll({
      where: {
        user_id: username,
        action: AuthEventType.LOGIN_FAILED,
        resource_id: 'AUTH'
      }
    });

    // Filter by timestamp (manual filter since we're using findAll)
    return logs.filter(log => new Date(log.timestamp) > since).length;
  }

  /**
   * Detect suspicious authentication patterns
   */
  static async detectSuspiciousActivity(
    username?: string,
    minutesWindow: number = 60
  ): Promise<{
    suspiciousUsers: Array<{ username: string; failedAttempts: number }>;
    totalFailedAttempts: number;
  }> {
    const since = new Date(Date.now() - minutesWindow * 60 * 1000);

    const where: any = {
      action: AuthEventType.LOGIN_FAILED,
      resource_id: 'AUTH'
    };

    if (username) {
      where.user_id = username;
    }

    const logs = await AuditModel.findAll({
      where,
      order: [['timestamp', 'DESC']]
    });

    // Filter by timestamp and group by user
    const recentLogs = logs.filter(log => new Date(log.timestamp) > since);
    const userFailures = new Map<string, number>();

    recentLogs.forEach(log => {
      const count = userFailures.get(log.user_id) || 0;
      userFailures.set(log.user_id, count + 1);
    });

    const suspiciousUsers = Array.from(userFailures.entries())
      .filter(([_, count]) => count >= 3)
      .map(([username, failedAttempts]) => ({ username, failedAttempts }))
      .sort((a, b) => b.failedAttempts - a.failedAttempts);

    return {
      suspiciousUsers,
      totalFailedAttempts: recentLogs.length
    };
  }

  static async getLogs(limit: number = 100, offset: number = 0): Promise<AuditLog[]> {
    return await AuditModel.findAll({
      limit,
      offset,
      order: [['timestamp', 'DESC']]
    });
  }
}
