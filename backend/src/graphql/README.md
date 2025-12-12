# SENTINEL GraphQL API Documentation

## Overview

Comprehensive GraphQL API for the SENTINEL Cyber Intelligence Platform providing:
- **20 Model Types** with full CRUD operations
- **Real-time Subscriptions** via WebSocket
- **DataLoader** batch loading for N+1 query optimization
- **Custom Scalars** (DateTime, JSON, UUID)
- **Custom Directives** (@auth, @cache, @rateLimit)
- **Query Complexity** and **Depth Limiting**
- **Field-level Authorization**
- **Relationship Resolvers** with efficient loading

## Architecture

```
backend/src/graphql/
├── schema.ts          # Complete GraphQL schema (1310 lines)
├── resolvers.ts       # All query/mutation/subscription resolvers (1516 lines)
├── dataloaders.ts     # DataLoader instances for batch loading
├── scalars.ts         # Custom scalar types
├── directives.ts      # Custom directives (@auth, @cache, @rateLimit)
├── middleware.ts      # Auth, complexity, rate limiting middleware
└── README.md         # This documentation
```

## Required Dependencies

Add these to `package.json`:

```json
{
  "dependencies": {
    "dataloader": "^2.2.2",
    "graphql-subscriptions": "^2.0.0",
    "@graphql-tools/utils": "^10.0.13",
    "graphql-query-complexity": "^0.12.0",
    "graphql-depth-limit": "^1.1.0",
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.7"
  }
}
```

Install with:
```bash
npm install dataloader graphql-subscriptions @graphql-tools/utils graphql-query-complexity graphql-depth-limit uuid
npm install --save-dev @types/uuid
```

## Schema Structure

### Model Categories

#### Intelligence (4 types)
- **Threat**: Threat indicators with severity, status, scoring
- **Case**: Incident cases with priority, assignment, SLA tracking
- **Actor**: Threat actors with sophistication, tactics, aliases
- **Campaign**: Attack campaigns with objectives, TTPs, targets

#### Infrastructure (4 types)
- **Asset**: Network assets with criticality, security controls
- **Vulnerability**: CVEs with CVSS scores, affected assets
- **Feed**: Threat intelligence feeds with sync status
- **Vendor**: Third-party vendors with risk scoring, SBOM

#### Operations (5 types)
- **AuditLog**: System audit trail with user actions
- **Report**: Intelligence reports with types, status workflow
- **Playbook**: SOAR playbooks with execution tracking
- **Artifact**: Evidence artifacts with chain of custody
- **ChainEvent**: Chain of custody events for artifacts

#### System (7 types)
- **User**: System users with roles, clearance, organization
- **Role**: RBAC roles with permission assignments
- **Permission**: Granular permissions (resource:action)
- **Organization**: Hierarchical organization structure
- **Integration**: External system integrations
- **Channel**: Messaging channels for collaboration
- **Message**: Real-time messages in channels

### Key Features

#### 1. Pagination
All list queries return Relay-style cursor-based connections:

```graphql
type ThreatConnection {
  edges: [ThreatEdge!]!
  pageInfo: PageInfo!
}

type PageInfo {
  hasNextPage: Boolean!
  hasPreviousPage: Boolean!
  startCursor: String
  endCursor: String
  totalCount: Int!
}
```

#### 2. Filtering
All queries support filter inputs:

```graphql
query {
  threats(
    filter: {
      severity: CRITICAL
      status: NEW
      min_score: 80
      tags: ["malware", "ransomware"]
    }
    limit: 50
    offset: 0
    sortBy: "last_seen"
    sortOrder: DESC
  ) {
    edges {
      node {
        id
        indicator
        severity
      }
    }
  }
}
```

#### 3. Relationships
Efficient relationship loading with DataLoader:

```graphql
query {
  case(id: "case-123") {
    title
    threats {  # Batch loaded
      indicator
      severity
    }
    artifacts {  # Batch loaded
      name
      type
    }
    assigneeUser {  # Single load
      username
      email
    }
  }
}
```

#### 4. Real-time Subscriptions

```graphql
subscription {
  threatCreated {
    id
    indicator
    severity
  }
}

subscription {
  messageReceived(channelId: "channel-123") {
    content
    user {
      username
    }
  }
}
```

## Usage Examples

### Query Examples

#### Get Threats with Filtering
```graphql
query GetCriticalThreats {
  threats(
    filter: { severity: CRITICAL, status: NEW }
    limit: 20
  ) {
    edges {
      node {
        id
        indicator
        type
        severity
        score
        last_seen
        cases {
          title
          status
        }
      }
    }
    pageInfo {
      totalCount
      hasNextPage
    }
  }
}
```

#### Get Case with Full Details
```graphql
query GetCaseDetails($id: ID!) {
  case(id: $id) {
    id
    title
    description
    priority
    status
    assigneeUser {
      username
      email
      role {
        name
      }
    }
    threats {
      indicator
      severity
      score
    }
    artifacts {
      name
      type
      status
      chainEvents {
        action
        timestamp
        user {
          username
        }
      }
    }
    reports {
      title
      type
      status
    }
  }
}
```

#### Dashboard Analytics
```graphql
query DashboardData {
  dashboardStats {
    totalThreats
    activeCases
    criticalAssets
    openVulnerabilities
    threatsBySource {
      source
      count
    }
    casesByPriority {
      priority
      count
    }
  }

  threatTrends(days: 30) {
    date
    count
  }

  caseMetrics {
    totalCases
    openCases
    resolvedCases
    slaComplianceRate
  }
}
```

### Mutation Examples

#### Create Threat
```graphql
mutation CreateThreat {
  createThreat(input: {
    indicator: "192.168.1.100"
    type: "IP"
    severity: HIGH
    source: "OSINT"
    score: 85
    description: "Suspected C2 server"
    tags: ["malware", "botnet"]
  }) {
    id
    indicator
    severity
    score
  }
}
```

#### Create Case with Threats
```graphql
mutation CreateCase {
  createCase(input: {
    title: "APT Campaign Investigation"
    description: "Suspected nation-state activity"
    priority: CRITICAL
    assignee: "analyst01"
    related_threat_ids: ["threat-1", "threat-2"]
  }) {
    id
    title
    status
    threats {
      indicator
      severity
    }
  }
}
```

#### Update Case Status
```graphql
mutation ResolveCase($id: ID!) {
  updateCaseStatus(id: $id, status: RESOLVED) {
    id
    status
    updated_at
  }
}
```

#### Execute Playbook
```graphql
mutation RunPlaybook($id: ID!) {
  executePlaybook(
    id: $id
    context: {
      threatId: "threat-123"
      caseId: "case-456"
    }
  )
}
```

### Subscription Examples

#### Monitor New Threats
```graphql
subscription OnThreatCreated {
  threatCreated {
    id
    indicator
    severity
    type
    score
  }
}
```

#### Monitor Case Updates
```graphql
subscription OnCaseStatusChange {
  caseStatusChanged {
    id
    title
    status
    assignee
  }
}
```

#### Real-time Messages
```graphql
subscription OnChannelMessages($channelId: ID!) {
  messageReceived(channelId: $channelId) {
    id
    content
    type
    user {
      username
    }
    created_at
  }
}
```

## Authentication & Authorization

### Context Setup
The GraphQL context includes:
- `user`: Authenticated user object
- `loaders`: DataLoader instances
- `ip`: Client IP address

### Middleware

#### Authentication
```typescript
import { requireAuth } from './middleware';

// In resolver
const user = requireAuth(context);
```

#### Role-based Access
```typescript
import { requireRole } from './middleware';

// Require ADMIN role
const user = requireRole(context, 'ADMIN');
```

#### Permission-based Access
```typescript
import { requirePermission } from './middleware';

// Require specific permission
await requirePermission(context, 'threats', 'delete');
```

#### Clearance-based Access
```typescript
import { requireClearance } from './middleware';

// Require TS clearance
const user = requireClearance(context, 'TS');
```

### Directives

#### @auth Directive
```graphql
type Mutation {
  deleteThreat(id: ID!): Boolean @auth(requires: ADMIN)
}
```

#### @cache Directive
```graphql
type Query {
  dashboardStats: DashboardStats @cache(maxAge: 60)
}
```

#### @rateLimit Directive
```graphql
type Mutation {
  sendMessage(input: MessageInput!): Message @rateLimit(limit: 10, window: 60)
}
```

## Performance Optimization

### DataLoader
Prevents N+1 queries by batching:

```typescript
// Without DataLoader: N+1 queries
case.threats.forEach(async threat => {
  const threatData = await Threat.findByPk(threat.id);
});

// With DataLoader: 1 batched query
const threats = await Promise.all(
  case.threats.map(id => loaders.threatLoader.load(id))
);
```

### Query Complexity
Limits expensive queries:

```typescript
// Max complexity: 1000
// Each field: +1 complexity
// Each relationship: +10 complexity
```

### Depth Limiting
Prevents deeply nested queries:

```typescript
// Max depth: 10 levels
```

### Rate Limiting
Per-user/IP rate limiting:

```typescript
// Default: 100 requests per 60 seconds
```

## Server Setup

### Express + GraphQL Setup

```typescript
import express from 'express';
import { graphqlHTTP } from 'express-graphql';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { execute, subscribe } from 'graphql';
import { schema } from './graphql/schema';
import { resolvers } from './graphql/resolvers';
import { createLoaders } from './graphql/dataloaders';
import {
  createGraphQLContext,
  queryComplexityPlugin,
  createDepthLimitRule,
  rateLimitingPlugin,
  loggingPlugin,
  performancePlugin,
  formatError
} from './graphql/middleware';

const app = express();
const httpServer = createServer(app);

// GraphQL HTTP endpoint
app.use('/graphql', graphqlHTTP(async (req) => ({
  schema,
  rootValue: resolvers,
  context: {
    ...(await createGraphQLContext(req)),
    loaders: createLoaders()
  },
  graphiql: process.env.NODE_ENV === 'development',
  customFormatErrorFn: formatError,
  validationRules: [createDepthLimitRule(10)]
})));

// WebSocket for Subscriptions
SubscriptionServer.create(
  {
    schema,
    execute,
    subscribe,
    onConnect: (connectionParams, webSocket) => {
      // Authentication logic here
      return {
        loaders: createLoaders()
      };
    }
  },
  {
    server: httpServer,
    path: '/graphql'
  }
);

httpServer.listen(4000, () => {
  console.log('GraphQL server running on http://localhost:4000/graphql');
  console.log('Subscriptions on ws://localhost:4000/graphql');
});
```

## Testing

### Example Test
```typescript
import { graphql } from 'graphql';
import { schema } from './schema';
import { resolvers } from './resolvers';
import { createLoaders } from './dataloaders';

describe('GraphQL API', () => {
  it('should fetch threats', async () => {
    const query = `
      query {
        threats(limit: 10) {
          edges {
            node {
              id
              indicator
            }
          }
        }
      }
    `;

    const result = await graphql({
      schema,
      source: query,
      rootValue: resolvers,
      contextValue: {
        loaders: createLoaders()
      }
    });

    expect(result.errors).toBeUndefined();
    expect(result.data?.threats).toBeDefined();
  });
});
```

## Error Handling

All errors are formatted consistently:

```json
{
  "errors": [
    {
      "message": "Threat not found",
      "extensions": {
        "code": "NOT_FOUND"
      },
      "path": ["threat"],
      "locations": [{ "line": 2, "column": 3 }]
    }
  ]
}
```

Common error codes:
- `UNAUTHENTICATED`: User not authenticated
- `FORBIDDEN`: Insufficient permissions
- `NOT_FOUND`: Resource not found
- `BAD_USER_INPUT`: Invalid input
- `QUERY_TOO_COMPLEX`: Query exceeds complexity limit
- `RATE_LIMIT_EXCEEDED`: Too many requests
- `INTERNAL_SERVER_ERROR`: Server error

## Monitoring

### Logging
All operations are logged with:
- Operation name
- User
- Duration
- Errors

### Performance
Slow queries (>1000ms) are automatically logged with warnings.

### Metrics
Response extensions include timing data:

```json
{
  "data": { ... },
  "extensions": {
    "timing": {
      "duration": 245,
      "startTime": "2024-01-01T12:00:00.000Z"
    }
  }
}
```

## Security

### Input Validation
All inputs are validated at the schema level.

### SQL Injection Prevention
Sequelize ORM prevents SQL injection.

### Rate Limiting
Prevents abuse with per-user/IP limits.

### Query Complexity
Prevents resource exhaustion.

### Audit Logging
All mutations are logged in audit_logs table.

## Future Enhancements

1. **DataLoader Caching**: Add Redis caching layer
2. **Subscription Filtering**: Filter subscriptions by user permissions
3. **Field-level Permissions**: More granular access control
4. **Query Batching**: Support for batched queries
5. **Persisted Queries**: Pre-registered queries for security
6. **Federation**: Support for federated GraphQL schemas
7. **Tracing**: OpenTelemetry integration
8. **Metrics**: Prometheus metrics export

## Troubleshooting

### Common Issues

#### Missing Dependencies
```bash
npm install dataloader graphql-subscriptions @graphql-tools/utils graphql-query-complexity graphql-depth-limit uuid
```

#### Type Errors
Ensure all models are exported in `/backend/src/models/index.ts`

#### Subscription Not Working
Check WebSocket server is running and client is using correct protocol.

#### Performance Issues
- Enable DataLoader caching
- Reduce query complexity
- Add database indexes
- Use pagination

## Contributing

When adding new types:
1. Add model to appropriate file in `/models/`
2. Export from `/models/index.ts`
3. Add type definition to `schema.ts`
4. Add input types and filters
5. Add query resolvers
6. Add mutation resolvers
7. Add relationship resolvers
8. Add DataLoader if needed
9. Add subscriptions if appropriate
10. Update this documentation

## Support

For issues or questions:
- Check this documentation
- Review resolver implementations
- Check console logs for errors
- Enable GraphiQL for query testing
