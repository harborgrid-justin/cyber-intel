
import { GraphQLSchema, defaultFieldResolver } from 'graphql';
import { mapSchema, getDirective, MapperKind } from '@graphql-tools/utils';
import { User } from '../models/system';

/**
 * Authentication directive to protect fields/types
 * Usage: @auth(requires: ADMIN)
 */
export function authDirective(directiveName: string = 'auth') {
  return {
    authDirectiveTypeDefs: `directive @${directiveName}(
      requires: Role = VIEWER
    ) on OBJECT | FIELD_DEFINITION

    enum Role {
      ADMIN
      ANALYST
      VIEWER
    }`,

    authDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const authDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

          if (authDirective) {
            const { requires } = authDirective;
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (source, args, context, info) {
              const user: User | undefined = context.user;

              if (!user) {
                throw new Error('Authentication required');
              }

              const roleHierarchy: Record<string, number> = {
                ADMIN: 3,
                ANALYST: 2,
                VIEWER: 1
              };

              const userRoleLevel = roleHierarchy[user.role?.name || 'VIEWER'] || 0;
              const requiredRoleLevel = roleHierarchy[requires] || 0;

              if (userRoleLevel < requiredRoleLevel) {
                throw new Error(`Insufficient permissions. Requires: ${requires}`);
              }

              return resolve(source, args, context, info);
            };

            return fieldConfig;
          }
        }
      })
  };
}

/**
 * Cache directive for field-level caching
 * Usage: @cache(maxAge: 300)
 */
export function cacheDirective(directiveName: string = 'cache') {
  const cache = new Map<string, { value: any; expiresAt: number }>();

  return {
    cacheDirectiveTypeDefs: `directive @${directiveName}(
      maxAge: Int
    ) on FIELD_DEFINITION`,

    cacheDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const cacheDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

          if (cacheDirective) {
            const { maxAge = 60 } = cacheDirective;
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (source, args, context, info) {
              const cacheKey = `${info.parentType.name}.${info.fieldName}:${JSON.stringify(args)}`;
              const cached = cache.get(cacheKey);

              if (cached && cached.expiresAt > Date.now()) {
                return cached.value;
              }

              const result = await resolve(source, args, context, info);

              cache.set(cacheKey, {
                value: result,
                expiresAt: Date.now() + maxAge * 1000
              });

              // Cleanup expired entries periodically
              if (Math.random() < 0.01) {
                const now = Date.now();
                for (const [key, entry] of cache.entries()) {
                  if (entry.expiresAt <= now) {
                    cache.delete(key);
                  }
                }
              }

              return result;
            };

            return fieldConfig;
          }
        }
      })
  };
}

/**
 * Rate limiting directive
 * Usage: @rateLimit(limit: 100, window: 60)
 */
export function rateLimitDirective(directiveName: string = 'rateLimit') {
  const requests = new Map<string, number[]>();

  return {
    rateLimitDirectiveTypeDefs: `directive @${directiveName}(
      limit: Int!
      window: Int!
    ) on FIELD_DEFINITION`,

    rateLimitDirectiveTransformer: (schema: GraphQLSchema) =>
      mapSchema(schema, {
        [MapperKind.OBJECT_FIELD]: (fieldConfig) => {
          const rateLimitDirective = getDirective(schema, fieldConfig, directiveName)?.[0];

          if (rateLimitDirective) {
            const { limit, window } = rateLimitDirective;
            const { resolve = defaultFieldResolver } = fieldConfig;

            fieldConfig.resolve = async function (source, args, context, info) {
              const user: User | undefined = context.user;
              const identifier = user?.id || context.ip || 'anonymous';
              const key = `${identifier}:${info.parentType.name}.${info.fieldName}`;

              const now = Date.now();
              const windowMs = window * 1000;
              const userRequests = requests.get(key) || [];

              // Filter out requests outside the window
              const recentRequests = userRequests.filter(timestamp => now - timestamp < windowMs);

              if (recentRequests.length >= limit) {
                throw new Error(`Rate limit exceeded. Max ${limit} requests per ${window} seconds.`);
              }

              recentRequests.push(now);
              requests.set(key, recentRequests);

              return resolve(source, args, context, info);
            };

            return fieldConfig;
          }
        }
      })
  };
}

/**
 * Deprecated directive to mark fields as deprecated
 * Usage: @deprecated(reason: "Use newField instead")
 */
export function deprecatedDirective(directiveName: string = 'deprecated') {
  return {
    deprecatedDirectiveTypeDefs: `directive @${directiveName}(
      reason: String = "No longer supported"
    ) on FIELD_DEFINITION | ENUM_VALUE`,

    deprecatedDirectiveTransformer: (schema: GraphQLSchema) => schema
  };
}
