# SENTINEL Database Infrastructure

Complete database setup for the SENTINEL Cyber Intelligence Platform.

## Quick Start

### 1. Start Docker Services

```bash
# Start PostgreSQL, pgAdmin, and Redis
docker-compose up -d

# Check services are running
docker-compose ps
```

### 2. Initialize Database

```bash
cd backend

# Install dependencies (if not already done)
npm install

# Initialize database with migrations and seed data
npm run db:init

# OR use the TypeScript script directly
ts-node src/scripts/init-database.ts
```

### 3. Access Services

- **PostgreSQL**: `postgresql://sentinel_user:sentinel_secure_pass@localhost:5432/sentinel_core`
- **pgAdmin**: http://localhost:5050
  - Email: `admin@sentinel.local`
  - Password: `sentinel_admin_pass`
- **Redis**: `localhost:6379`
  - Password: `sentinel_redis_pass`
- **Redis Commander**: http://localhost:8081

## Database Schema

The database includes 18 models across 4 categories:

### Intelligence Models
- **Threat**: Threat indicators and IOCs
- **Case**: Investigation cases
- **Actor**: Threat actor profiles
- **Campaign**: Attack campaigns

### Infrastructure Models
- **Asset**: Network and system assets
- **Vulnerability**: CVE and vulnerability data
- **Feed**: Threat intelligence feeds
- **Vendor**: Third-party vendor management

### Operations Models
- **AuditLog**: System audit trails
- **Report**: Threat intelligence reports
- **Playbook**: Response playbooks
- **Artifact**: Evidence and forensic artifacts
- **ChainEvent**: Chain of custody tracking

### System Models
- **Organization**: Organizational hierarchy
- **User**: User accounts
- **Role**: User roles
- **Permission**: Granular permissions
- **RolePermission**: Role-permission mappings
- **Integration**: External system integrations
- **Channel**: Communication channels
- **Message**: Chat messages

## Seed Data

Comprehensive test data is automatically loaded including:

- **10 Users** with different roles and clearances
- **12 Threats** covering various IOC types
- **4 Cases** representing different incident scenarios
- **6 Threat Actors** (APT-29, Lazarus, LockBit, etc.)
- **3 Campaigns** tracking coordinated attacks
- **10 Assets** across different criticality levels
- **7 Vulnerabilities** including zero-days
- **7 Threat Feeds** from various sources
- **5 Vendors** with risk scores and SBOMs
- **6 Playbooks** for incident response
- **5 Artifacts** with chain of custody
- **10 Integrations** with external systems
- **10 Communication Channels**
- **24 Messages** across different channels

## Scripts

### Initialization
```bash
# Full database setup (migrations + seeds)
npm run db:init
ts-node src/scripts/init-database.ts
```

### Seeding
```bash
# Run seeds only (keeps existing data)
npm run db:seed
ts-node src/scripts/seed-all.ts

# Force re-seed (overwrites data)
ts-node src/scripts/seed-all.ts --force
```

### Reset (Development Only)
```bash
# WARNING: Drops all tables and data!
ts-node src/scripts/reset-database.ts
```

### Migrations
```bash
# Run pending migrations
ts-node src/db/migrations/index.ts

# Check migration status
ts-node src/db/migrations/index.ts status

# Rollback last migration
ts-node src/db/migrations/index.ts down
```

## Default Credentials

All test users have the default password: `Sentinel@2024!`

**Users:**
- `superadmin` - Super Administrator (TS/SCI clearance)
- `admin.connor` - Administrator (TS clearance)
- `manager.blake` - SOC Manager (SECRET clearance)
- `senior.taylor` - Senior Analyst (SECRET clearance)
- `analyst.doe` - Security Analyst (SECRET clearance)
- `junior.morgan` - Junior Analyst (CONFIDENTIAL clearance)
- `investigator.reed` - Threat Investigator (SECRET clearance)
- `responder.cruz` - Incident Responder (SECRET clearance)
- `auditor.smith` - Compliance Auditor (SECRET clearance)
- `viewer.jones` - Read-Only Viewer (UNCLASSIFIED clearance)

**⚠️ Change all passwords immediately in production!**

## Environment Variables

See `/backend/.env` for complete configuration:

```env
DATABASE_URL=postgresql://sentinel_user:sentinel_secure_pass@localhost:5432/sentinel_core
REDIS_URL=redis://:sentinel_redis_pass@localhost:6379
```

## Docker Services

### PostgreSQL 15
- Port: 5432
- Database: sentinel_core
- User: sentinel_user
- Health checks enabled
- Persistent volumes

### pgAdmin 4
- Port: 5050
- Pre-configured server connection
- Auto-import of database

### Redis 7
- Port: 6379
- Password protected
- AOF persistence enabled
- Health checks enabled

### Redis Commander
- Port: 8081
- Web-based Redis management
- Auto-configured for Sentinel Redis

## Health Checks

Check database health:
```typescript
import { checkDatabaseHealth } from './config/database';

const health = await checkDatabaseHealth();
console.log(health);
// { status: 'healthy', latency: 15 }
```

Get connection pool stats:
```typescript
import { getPoolStats } from './config/database';

const stats = getPoolStats();
console.log(stats);
// { total: 20, idle: 15, active: 5, waiting: 0 }
```

## Troubleshooting

### Connection Issues
```bash
# Check Docker services
docker-compose ps

# View PostgreSQL logs
docker-compose logs postgres

# Restart services
docker-compose restart
```

### Reset Everything
```bash
# Stop and remove all containers, volumes, and networks
docker-compose down -v

# Restart from scratch
docker-compose up -d
npm run db:init
```

### Manual Database Access
```bash
# psql
docker-compose exec postgres psql -U sentinel_user -d sentinel_core

# Or from host (if psql installed)
psql postgresql://sentinel_user:sentinel_secure_pass@localhost:5432/sentinel_core
```

## Production Deployment

**Before deploying to production:**

1. Change all default passwords in `.env`
2. Update database connection strings
3. Enable SSL/TLS for database connections
4. Configure proper backup strategy
5. Set `NODE_ENV=production`
6. Use migrations instead of `sync()`
7. Disable dangerous scripts (reset-database.ts)
8. Configure proper access controls
9. Enable audit logging
10. Review and update security settings

## Architecture

```
backend/src/db/
├── init/                    # Docker entrypoint scripts
│   └── 01-create-database.sql
├── migrations/              # Schema migrations
│   ├── 001_create_system_tables.ts
│   ├── 002_create_intelligence_tables.ts
│   ├── 003_create_infrastructure_tables.ts
│   ├── 004_create_operations_tables.ts
│   ├── 005_create_integration_tables.ts
│   └── index.ts            # Migration runner
├── seeds/                   # Seed data
│   ├── system.seed.ts
│   ├── intelligence.seed.ts
│   ├── infrastructure.seed.ts
│   ├── operations.seed.ts
│   └── communications.seed.ts
└── README.md               # This file
```

## Support

For issues or questions:
1. Check logs: `docker-compose logs`
2. Review this README
3. Consult the main project documentation
4. Create a GitHub issue with details

---

**SENTINEL Cyber Intelligence Platform**
*Enterprise-Grade Threat Intelligence & Investigation*
