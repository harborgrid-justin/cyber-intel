import { Request, Response, NextFunction } from 'express';
import * as crypto from 'crypto';
import { logger } from '../utils/logger';
import { AuditService } from '../services/audit.service';
import { User, Role } from '../models/system';
import { RbacEngine } from '../services/security/rbac.engine';

declare global {
  namespace Express {
    interface Request {
      apiKey?: ApiKey;
      apiKeyUser?: User;
    }
  }
}

/**
 * API Key Model (In-memory for demo - should be in database)
 */
interface ApiKey {
  id: string;
  key: string;
  keyHash: string;
  name: string;
  userId: string;
  organizationId: string;
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  expiresAt?: Date;
  lastUsedAt?: Date;
  usageCount: number;
  rateLimit: number;
  ipWhitelist?: string[];
  createdAt: Date;
}

/**
 * API Key Store (In production, this should be a database table)
 * Using hash map for O(1) lookup performance
 */
class ApiKeyStore {
  private static keys = new Map<string, ApiKey>();
  private static usageTracking = new Map<string, { count: number; resetAt: number }>();

  /**
   * Register a new API key
   */
  static async registerKey(key: ApiKey): Promise<void> {
    this.keys.set(key.keyHash, key);
    logger.info(`[ApiKey] Registered new API key: ${key.id} for user ${key.userId}`);
  }

  /**
   * Find API key by hash
   */
  static async findByHash(keyHash: string): Promise<ApiKey | undefined> {
    return this.keys.get(keyHash);
  }

  /**
   * Revoke API key
   */
  static async revokeKey(keyHash: string): Promise<void> {
    const key = this.keys.get(keyHash);
    if (key) {
      key.status = 'REVOKED';
      logger.info(`[ApiKey] Revoked API key: ${key.id}`);
    }
  }

  /**
   * Update last used timestamp
   */
  static async updateLastUsed(keyHash: string): Promise<void> {
    const key = this.keys.get(keyHash);
    if (key) {
      key.lastUsedAt = new Date();
      key.usageCount++;
    }
  }

  /**
   * Check and update rate limit
   */
  static checkRateLimit(keyHash: string, limit: number): boolean {
    const now = Date.now();
    const hourInMs = 60 * 60 * 1000;

    let usage = this.usageTracking.get(keyHash);

    if (!usage || now >= usage.resetAt) {
      // Reset or create new usage tracking
      usage = { count: 0, resetAt: now + hourInMs };
      this.usageTracking.set(keyHash, usage);
    }

    if (usage.count >= limit) {
      return false; // Rate limit exceeded
    }

    usage.count++;
    return true;
  }

  /**
   * Get all keys for a user
   */
  static async getKeysForUser(userId: string): Promise<ApiKey[]> {
    return Array.from(this.keys.values()).filter(k => k.userId === userId);
  }
}

/**
 * API Key Generation Utility
 */
export class ApiKeyGenerator {
  /**
   * Generate a new API key with cryptographically secure random bytes
   */
  static generateKey(): string {
    // Format: sk_live_<32 random bytes in hex>
    const randomBytes = crypto.randomBytes(32).toString('hex');
    return `sk_live_${randomBytes}`;
  }

  /**
   * Hash API key for storage (SHA-256)
   */
  static hashKey(key: string): string {
    return crypto.createHash('sha256').update(key).digest('hex');
  }

  /**
   * Create a new API key for a user
   */
  static async createApiKey(params: {
    userId: string;
    organizationId: string;
    name: string;
    scopes?: string[];
    expiresInDays?: number;
    rateLimit?: number;
    ipWhitelist?: string[];
  }): Promise<{ key: string; apiKey: ApiKey }> {
    const key = this.generateKey();
    const keyHash = this.hashKey(key);

    const apiKey: ApiKey = {
      id: `KEY-${crypto.randomBytes(8).toString('hex').toUpperCase()}`,
      key: key, // Only returned once, never stored in plain text
      keyHash: keyHash,
      name: params.name,
      userId: params.userId,
      organizationId: params.organizationId,
      scopes: params.scopes || ['*'],
      status: 'ACTIVE',
      expiresAt: params.expiresInDays
        ? new Date(Date.now() + params.expiresInDays * 24 * 60 * 60 * 1000)
        : undefined,
      usageCount: 0,
      rateLimit: params.rateLimit || 1000,
      ipWhitelist: params.ipWhitelist,
      createdAt: new Date()
    };

    await ApiKeyStore.registerKey(apiKey);

    await AuditService.logAuthEvent(
      'API_KEY_CREATED',
      params.userId,
      undefined,
      `API Key: ${apiKey.name} (${apiKey.id})`
    );

    return { key, apiKey };
  }

  /**
   * Revoke an API key
   */
  static async revokeApiKey(keyHash: string, revokedBy: string): Promise<void> {
    await ApiKeyStore.revokeKey(keyHash);
    await AuditService.logAuthEvent(
      'API_KEY_REVOKED',
      revokedBy,
      undefined,
      `Key hash: ${keyHash.substring(0, 8)}...`
    );
  }

  /**
   * List API keys for a user (without revealing the actual keys)
   */
  static async listApiKeys(userId: string): Promise<Omit<ApiKey, 'key' | 'keyHash'>[]> {
    const keys = await ApiKeyStore.getKeysForUser(userId);
    return keys.map(k => ({
      id: k.id,
      name: k.name,
      userId: k.userId,
      organizationId: k.organizationId,
      scopes: k.scopes,
      status: k.status,
      expiresAt: k.expiresAt,
      lastUsedAt: k.lastUsedAt,
      usageCount: k.usageCount,
      rateLimit: k.rateLimit,
      ipWhitelist: k.ipWhitelist,
      createdAt: k.createdAt
    }));
  }
}

/**
 * API Key Authentication Middleware
 * Supports both Bearer token (JWT) and API Key authentication
 * API Keys are passed via X-API-Key header
 */
export const authenticateApiKey = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Check for API Key in header
    const apiKeyHeader = req.headers['x-api-key'] as string;

    if (!apiKeyHeader) {
      logger.debug(`[ApiKey] No X-API-Key header from ${req.ip}`);
      res.status(401).json({
        error: 'No API Key provided',
        message: 'Include your API key in the X-API-Key header'
      });
      return;
    }

    // Validate API key format
    if (!apiKeyHeader.startsWith('sk_live_') && !apiKeyHeader.startsWith('sk_test_')) {
      logger.warn(`[ApiKey] Invalid API key format from ${req.ip}`);
      res.status(401).json({ error: 'Invalid API key format' });
      return;
    }

    // Hash the provided key to look it up
    const keyHash = ApiKeyGenerator.hashKey(apiKeyHeader);

    // Find the API key
    const apiKey = await ApiKeyStore.findByHash(keyHash);

    if (!apiKey) {
      logger.warn(`[ApiKey] API key not found from ${req.ip}`);
      await AuditService.logAuthEvent(
        'API_KEY_INVALID',
        'unknown',
        req.ip,
        'API key not found in database'
      );
      res.status(401).json({ error: 'Invalid API key' });
      return;
    }

    // Check if key is revoked
    if (apiKey.status === 'REVOKED') {
      logger.warn(`[ApiKey] Revoked API key used: ${apiKey.id} from ${req.ip}`);
      await AuditService.logAuthEvent(
        'API_KEY_REVOKED_ATTEMPT',
        apiKey.userId,
        req.ip,
        `Attempted to use revoked key: ${apiKey.name}`
      );
      res.status(401).json({ error: 'API key has been revoked' });
      return;
    }

    // Check if key is expired
    if (apiKey.expiresAt && apiKey.expiresAt < new Date()) {
      logger.warn(`[ApiKey] Expired API key used: ${apiKey.id} from ${req.ip}`);
      await AuditService.logAuthEvent(
        'API_KEY_EXPIRED_ATTEMPT',
        apiKey.userId,
        req.ip,
        `Attempted to use expired key: ${apiKey.name}`
      );
      res.status(401).json({ error: 'API key has expired' });
      return;
    }

    // Check IP whitelist if configured
    if (apiKey.ipWhitelist && apiKey.ipWhitelist.length > 0) {
      const clientIp = req.ip || req.socket.remoteAddress || 'unknown';
      if (!apiKey.ipWhitelist.includes(clientIp)) {
        logger.warn(`[ApiKey] IP not whitelisted: ${clientIp} for key ${apiKey.id}`);
        await AuditService.logAuthEvent(
          'API_KEY_IP_BLOCKED',
          apiKey.userId,
          req.ip,
          `IP ${clientIp} not in whitelist for key ${apiKey.name}`
        );
        res.status(403).json({ error: 'API key not authorized from this IP address' });
        return;
      }
    }

    // Check rate limit
    if (!ApiKeyStore.checkRateLimit(keyHash, apiKey.rateLimit)) {
      logger.warn(`[ApiKey] Rate limit exceeded for key ${apiKey.id} from ${req.ip}`);
      await AuditService.logAuthEvent(
        'API_KEY_RATE_LIMIT',
        apiKey.userId,
        req.ip,
        `Rate limit exceeded for key: ${apiKey.name}`
      );
      res.status(429).json({
        error: 'API key rate limit exceeded',
        message: `Rate limit: ${apiKey.rateLimit} requests per hour`
      });
      return;
    }

    // Load the user associated with this API key
    const user = await (User as any).findByPk(apiKey.userId, {
      include: [Role]
    });

    if (!user) {
      logger.error(`[ApiKey] User ${apiKey.userId} not found for API key ${apiKey.id}`);
      res.status(401).json({ error: 'API key user not found' });
      return;
    }

    // Check user account status
    if (user.status !== 'ACTIVE') {
      logger.warn(`[ApiKey] User ${user.username} attempted API access with status: ${user.status}`);
      res.status(403).json({ error: 'User account is not active' });
      return;
    }

    // Check scope restrictions
    const requestPath = req.path;
    const requestMethod = req.method;

    // If scopes are restricted (not wildcard '*'), validate access
    if (!apiKey.scopes.includes('*')) {
      let hasScope = false;

      for (const scope of apiKey.scopes) {
        // Scope format: resource:action (e.g., "case:read", "intel:write")
        const [resource, action] = scope.split(':');

        // Match HTTP method to action
        const methodActionMap: Record<string, string> = {
          'GET': 'read',
          'POST': 'create',
          'PUT': 'update',
          'PATCH': 'update',
          'DELETE': 'delete'
        };

        const requiredAction = methodActionMap[requestMethod] || 'read';

        if (requestPath.includes(`/${resource}`) && (action === '*' || action === requiredAction)) {
          hasScope = true;
          break;
        }
      }

      if (!hasScope) {
        logger.warn(`[ApiKey] Insufficient scope for key ${apiKey.id}: ${requestMethod} ${requestPath}`);
        await AuditService.logAuthEvent(
          'API_KEY_SCOPE_DENIED',
          apiKey.userId,
          req.ip,
          `Scope denied: ${requestMethod} ${requestPath}`
        );
        res.status(403).json({
          error: 'Insufficient API key scope',
          message: 'This API key does not have permission to access this endpoint'
        });
        return;
      }
    }

    // Load permissions for RBAC
    const permissions = await RbacEngine.getEffectivePermissions(user.id);

    // Attach API key, user, and permissions to request
    req.apiKey = apiKey;
    req.apiKeyUser = user;
    req.user = user; // For compatibility with other middleware
    req.permissions = permissions;

    // Update last used timestamp (async, don't block)
    ApiKeyStore.updateLastUsed(keyHash).catch(err =>
      logger.error('[ApiKey] Failed to update last used', err)
    );

    // Log successful API key authentication
    logger.debug(`[ApiKey] API key authenticated: ${apiKey.name} (${apiKey.id}) for user ${user.username}`);

    next();
  } catch (error: any) {
    logger.error('[ApiKey] API key authentication error', {
      error: error.message,
      stack: error.stack,
      ip: req.ip
    });
    res.status(401).json({ error: 'API key authentication failed' });
    return;
  }
};

/**
 * Flexible Authentication Middleware
 * Supports both JWT Bearer tokens and API Keys
 * Tries JWT first, then API Key
 */
export const authenticateFlexible = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  const apiKeyHeader = req.headers['x-api-key'];

  // Try JWT Bearer token first
  if (authHeader && authHeader.startsWith('Bearer ')) {
    // Import the JWT auth middleware
    const { authenticate } = require('./auth.middleware');
    return authenticate(req, res, next);
  }

  // Try API Key
  if (apiKeyHeader) {
    return authenticateApiKey(req, res, next);
  }

  // No authentication method provided
  logger.debug(`[Auth] No authentication method provided from ${req.ip}`);
  res.status(401).json({
    error: 'Authentication required',
    message: 'Provide either a Bearer token (Authorization header) or API key (X-API-Key header)'
  });
  return;
};

/**
 * Middleware to require specific API key scopes
 */
export const requireApiKeyScope = (requiredScope: string) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.apiKey) {
      res.status(401).json({ error: 'API key authentication required' });
      return;
    }

    const [resource, action] = requiredScope.split(':');

    // Check if API key has wildcard scope
    if (req.apiKey.scopes.includes('*')) {
      next();
      return;
    }

    // Check if API key has exact scope match
    if (req.apiKey.scopes.includes(requiredScope)) {
      next();
      return;
    }

    // Check if API key has resource wildcard (e.g., "case:*")
    if (req.apiKey.scopes.includes(`${resource}:*`)) {
      next();
      return;
    }

    // Check if API key has action wildcard (e.g., "*:read")
    if (req.apiKey.scopes.includes(`*:${action}`)) {
      next();
      return;
    }

    logger.warn(`[ApiKey] Scope denied: ${requiredScope} for key ${req.apiKey.id}`);
    res.status(403).json({
      error: 'Insufficient API key scope',
      required: requiredScope,
      available: req.apiKey.scopes
    });
    return;
  };
};

// Export the store for testing and management
export { ApiKeyStore };
