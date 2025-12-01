# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Sentinel CyberIntel is a full-stack cyber threat intelligence platform. It provides threat monitoring, case management, OSINT operations, vulnerability tracking, and incident response capabilities.

## Commands

### Development
```bash
# Install all dependencies (root, client, server)
npm run install:all

# Run full stack (client + server concurrently)
npm run dev

# Run client only (Vite, port 3000)
npm run dev:client

# Run server only (NestJS, port 3001)
npm run dev:server
```

### Build
```bash
npm run build           # Build both client and server
npm run build:client    # Build client only
npm run build:server    # Build server only
```

### Server-specific commands (run from /server directory)
```bash
npm run lint            # ESLint with auto-fix
npm run format          # Prettier formatting
npm run test            # Run Jest tests
npm run test:watch      # Jest in watch mode
npm run test:e2e        # End-to-end tests
```

## Architecture

### Monorepo Structure
- `/client` - React 19 frontend with Vite
- `/server` - NestJS backend with Sequelize ORM
- `/types.ts`, `/config.ts`, `/constants.ts` - Shared definitions (duplicated in client/ and server/src/)

### Frontend (client/)
- **Entry**: `App.tsx` - View routing based on `View` enum
- **Components**: Organized by domain in `components/` (Dashboard, Feed, Cases, Actors, etc.)
- **Data Layer**: `services-frontend/dataLayer.ts` - Central data management using domain-specific stores
- **Stores**: `services-frontend/stores/` - BaseStore pattern with mappers for type conversion
- **State Sync**: `services-frontend/syncManager.ts` - Intelligent pre-fetching based on view changes
- **Path alias**: `@/*` maps to project root

### Backend (server/src/)
- **Entry**: `main.ts` - NestJS bootstrap with Swagger UI at `/api`
- **Database**: SQLite (in-memory by default), Sequelize ORM with models in `models/`
- **Module Pattern**: Each domain has a module containing controller, service, and DTOs
- **Key Modules**: threats, cases, actors, campaigns, vulnerabilities, detection, osint, orchestrator, ingestion
- **Shared Services**: `services/` directory contains cross-cutting concerns (dataLayer, openAIService, detectionEngine)
- **Path aliases**: `@/types`, `@/config`, `@/constants`

### Key Domain Types (types.ts)
- `Threat` - Core IOC with severity, confidence, TLP classification
- `Case` - Investigation workflow with tasks, artifacts, timeline
- `ThreatActor` - APT profiles with TTPs, campaigns, infrastructure
- `Campaign` - Threat campaigns linking actors and threats
- `Vulnerability` - CVE tracking with patch status
- `SystemNode` - Infrastructure assets with security controls

### API Documentation
Swagger UI available at `http://localhost:3001/api` when server is running.

## Environment Variables
- `OPENAI_API_KEY` - Required for AI-powered threat analysis features (set in .env.local)
- `PORT` - Server port (default: 3001)
- `DB_HOST`, `DB_PORT`, `DB_USERNAME`, `DB_PASSWORD`, `DB_NAME` - Database config (defaults to SQLite in-memory)
