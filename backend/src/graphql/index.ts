/**
 * GraphQL Module Main Entry Point
 * Exports all GraphQL components for easy integration
 */

import { schema as graphqlSchema } from './schema';
import { resolvers, rootResolver, pubsub, EVENTS, type Context } from './resolvers';
import { createLoaders, type Loaders } from './dataloaders';
import {
  createGraphQLContext,
  queryComplexityPlugin,
  createDepthLimitRule,
  rateLimitingPlugin,
  formatError,
  requireAuth,
  requireRole,
  requirePermission,
  requireClearance,
  loggingPlugin,
  performancePlugin,
  cacheControlPlugin
} from './middleware';
import {
  authDirective,
  cacheDirective,
  rateLimitDirective,
  deprecatedDirective
} from './directives';
import {
  DateTimeScalar,
  JSONScalar,
  UUIDScalar
} from './scalars';

// The schema from schema.ts is already a built GraphQLSchema
// We export it as-is since directives are custom implementations
export const schema = graphqlSchema;

// Export all components
export {
  // Schema (already built)
  graphqlSchema,

  // Resolvers
  resolvers,
  rootResolver,

  // Subscriptions
  pubsub,
  EVENTS,

  // DataLoaders & Types
  createLoaders,
  type Loaders,
  type Context,

  // Middleware
  createGraphQLContext,
  queryComplexityPlugin,
  createDepthLimitRule,
  rateLimitingPlugin,
  formatError,
  requireAuth,
  requireRole,
  requirePermission,
  requireClearance,
  loggingPlugin,
  performancePlugin,
  cacheControlPlugin,

  // Directives
  authDirective,
  cacheDirective,
  rateLimitDirective,
  deprecatedDirective,

  // Scalars
  DateTimeScalar,
  JSONScalar,
  UUIDScalar
};

// Default export for convenience
export default {
  schema,
  resolvers,
  rootResolver,
  createLoaders,
  createGraphQLContext,
  pubsub,
  EVENTS
};
