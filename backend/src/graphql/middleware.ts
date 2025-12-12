
import { GraphQLError } from 'graphql';
import {
  getComplexity,
  simpleEstimator,
  directiveEstimator,
  fieldExtensionsEstimator
} from 'graphql-query-complexity';
import depthLimit from 'graphql-depth-limit';
import { User } from '../models/system';

/**
 * Authentication middleware for GraphQL context
 * Extracts user from request and adds to context
 */
export async function createGraphQLContext(req: any): Promise<any> {
  const user = req.user; // Assumes auth middleware has already run
  const ip = req.ip || req.connection.remoteAddress;

  return {
    user,
    ip,
    req
  };
}

/**
 * Query complexity analysis middleware
 * Prevents expensive queries from overwhelming the server
 */
export function queryComplexityPlugin(schema: any, maxComplexity: number = 1000) {
  return {
    requestDidStart: () => ({
      didResolveOperation({ request, document }: any) {
        const complexity = getComplexity({
          schema,
          operationName: request.operationName,
          query: document,
          variables: request.variables,
          estimators: [
            fieldExtensionsEstimator(),
            directiveEstimator({ name: 'complexity' }),
            simpleEstimator({ defaultComplexity: 1 })
          ]
        });

        if (complexity > maxComplexity) {
          throw new GraphQLError(
            `Query complexity of ${complexity} exceeds maximum allowed complexity of ${maxComplexity}`,
            {
              extensions: {
                code: 'QUERY_TOO_COMPLEX',
                complexity,
                maxComplexity
              }
            }
          );
        }

        console.log(`Query complexity: ${complexity}`);
      }
    })
  };
}

/**
 * Query depth limiter
 * Prevents deeply nested queries
 */
export function createDepthLimitRule(maxDepth: number = 10) {
  return depthLimit(maxDepth, {
    ignore: [
      '_service',
      '_entities'
    ]
  });
}

/**
 * Rate limiting middleware per user/IP
 */
export class RateLimiter {
  private requests: Map<string, number[]> = new Map();
  private windowMs: number;
  private maxRequests: number;

  constructor(windowMs: number = 60000, maxRequests: number = 100) {
    this.windowMs = windowMs;
    this.maxRequests = maxRequests;
  }

  check(identifier: string): boolean {
    const now = Date.now();
    const userRequests = this.requests.get(identifier) || [];

    // Remove old requests outside the window
    const recentRequests = userRequests.filter(timestamp => now - timestamp < this.windowMs);

    if (recentRequests.length >= this.maxRequests) {
      return false;
    }

    recentRequests.push(now);
    this.requests.set(identifier, recentRequests);

    // Cleanup old entries periodically
    if (Math.random() < 0.01) {
      this.cleanup();
    }

    return true;
  }

  private cleanup() {
    const now = Date.now();
    for (const [key, timestamps] of this.requests.entries()) {
      const recent = timestamps.filter(t => now - t < this.windowMs);
      if (recent.length === 0) {
        this.requests.delete(key);
      } else {
        this.requests.set(key, recent);
      }
    }
  }
}

// Global rate limiter instance
const rateLimiter = new RateLimiter();

/**
 * Rate limiting plugin for GraphQL
 */
export function rateLimitingPlugin() {
  return {
    requestDidStart: ({ request, context }: any) => {
      const identifier = context.user?.id || context.ip || 'anonymous';

      if (!rateLimiter.check(identifier)) {
        throw new GraphQLError('Rate limit exceeded. Please try again later.', {
          extensions: {
            code: 'RATE_LIMIT_EXCEEDED'
          }
        });
      }

      return {};
    }
  };
}

/**
 * Error formatting middleware
 * Formats errors for consistent client-side handling
 */
export function formatError(error: GraphQLError): any {
  const formattedError: any = {
    message: error.message,
    extensions: {
      code: error.extensions?.code || 'INTERNAL_SERVER_ERROR'
    }
  };

  // Include path if available
  if (error.path) {
    formattedError.path = error.path;
  }

  // Include locations if available
  if (error.locations) {
    formattedError.locations = error.locations;
  }

  // In development, include stack trace
  if (process.env.NODE_ENV === 'development') {
    formattedError.extensions.stacktrace = error.stack?.split('\n');
  }

  // Log error server-side
  console.error('GraphQL Error:', {
    message: error.message,
    code: error.extensions?.code,
    path: error.path,
    stack: error.stack
  });

  return formattedError;
}

/**
 * Authorization middleware
 * Checks if user has required permissions
 */
export function requireAuth(context: any) {
  if (!context.user) {
    throw new GraphQLError('Authentication required', {
      extensions: {
        code: 'UNAUTHENTICATED'
      }
    });
  }
  return context.user;
}

/**
 * Role-based access control
 */
export function requireRole(context: any, requiredRole: string) {
  const user = requireAuth(context);

  const roleHierarchy: Record<string, number> = {
    ADMIN: 3,
    ANALYST: 2,
    VIEWER: 1
  };

  const userRoleLevel = roleHierarchy[user.role?.name || 'VIEWER'] || 0;
  const requiredRoleLevel = roleHierarchy[requiredRole] || 0;

  if (userRoleLevel < requiredRoleLevel) {
    throw new GraphQLError(`Insufficient permissions. Required role: ${requiredRole}`, {
      extensions: {
        code: 'FORBIDDEN',
        requiredRole
      }
    });
  }

  return user;
}

/**
 * Permission-based access control
 */
export async function requirePermission(context: any, resource: string, action: string) {
  const user = requireAuth(context);

  // Load user with role and permissions
  const userWithPerms = await User.findByPk(user.id, {
    include: [{
      association: 'role',
      include: ['permissions']
    }]
  });

  if (!userWithPerms || !userWithPerms.role) {
    throw new GraphQLError('User role not found', {
      extensions: {
        code: 'FORBIDDEN'
      }
    });
  }

  const permissions = userWithPerms.role.permissions || [];
  const hasPermission = permissions.some(
    (p: any) => p.resource === resource && p.action === action
  );

  if (!hasPermission) {
    throw new GraphQLError(`Missing permission: ${resource}:${action}`, {
      extensions: {
        code: 'FORBIDDEN',
        requiredPermission: `${resource}:${action}`
      }
    });
  }

  return user;
}

/**
 * Clearance-based access control
 */
export function requireClearance(context: any, requiredClearance: string) {
  const user = requireAuth(context);

  const clearanceHierarchy: Record<string, number> = {
    TS: 3,
    SECRET: 2,
    UNCLASSIFIED: 1
  };

  const userClearanceLevel = clearanceHierarchy[user.clearance] || 0;
  const requiredClearanceLevel = clearanceHierarchy[requiredClearance] || 0;

  if (userClearanceLevel < requiredClearanceLevel) {
    throw new GraphQLError(`Insufficient clearance. Required: ${requiredClearance}`, {
      extensions: {
        code: 'FORBIDDEN',
        requiredClearance
      }
    });
  }

  return user;
}

/**
 * Logging plugin for GraphQL operations
 */
export function loggingPlugin() {
  return {
    requestDidStart({ request, context }: any) {
      const start = Date.now();
      const user = context.user?.username || 'anonymous';

      console.log(`[GraphQL] ${request.operationName || 'anonymous'} started by ${user}`);

      return {
        didEncounterErrors({ errors }: any) {
          console.error(`[GraphQL] ${request.operationName || 'anonymous'} encountered ${errors.length} error(s)`);
        },
        willSendResponse() {
          const duration = Date.now() - start;
          console.log(`[GraphQL] ${request.operationName || 'anonymous'} completed in ${duration}ms`);
        }
      };
    }
  };
}

/**
 * Performance monitoring plugin
 */
export function performancePlugin() {
  return {
    requestDidStart() {
      const start = Date.now();
      let operationName: string;

      return {
        didResolveOperation({ operation }: any) {
          operationName = operation.name?.value || 'anonymous';
        },
        willSendResponse({ response }: any) {
          const duration = Date.now() - start;

          // Log slow queries (>1000ms)
          if (duration > 1000) {
            console.warn(`[Performance] Slow query detected: ${operationName} took ${duration}ms`);
          }

          // Add timing to response extensions
          if (!response.extensions) {
            response.extensions = {};
          }
          response.extensions.timing = {
            duration,
            startTime: new Date(start).toISOString()
          };
        }
      };
    }
  };
}

/**
 * Cache control hints for Apollo Client
 */
export function cacheControlPlugin() {
  return {
    requestDidStart() {
      return {
        willSendResponse({ response }: any) {
          // Add cache control headers
          if (!response.extensions) {
            response.extensions = {};
          }
          response.extensions.cacheControl = {
            version: 1,
            hints: [
              { path: [], maxAge: 60, scope: 'PUBLIC' }
            ]
          };
        }
      };
    }
  };
}
