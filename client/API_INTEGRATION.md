# API Integration Guide

## Overview

The frontend now has full integration with the backend API. All server endpoints use the `/api/` prefix for consistency.

## Available Components

### 1. API Client (`apiClient.ts`)
Direct HTTP client for making API calls to the backend.

```typescript
import { apiClient } from './services-frontend/apiClient';

// Fetch all threats
const threats = await apiClient.threats.getAll();

// Create a new case
const newCase = await apiClient.cases.create({
  title: 'Investigation',
  priority: 'HIGH',
  // ... other fields
});

// Update vulnerability status
await apiClient.vulnerabilities.mitigate(vulnId, {
  action: 'PATCH',
  notes: 'Applied security update'
});
```

### 2. HTTP Adapter (`httpAdapter.ts`)
Database adapter that syncs stores with the backend API.

```typescript
import { HttpAdapter } from './services-frontend/httpAdapter';
import { threatData } from './services-frontend/dataLayer';

// Switch to HTTP backend
await threatData.useHttpAdapter({ 
  host: 'http://localhost', 
  port: 3001 
});

// Now all store operations sync with backend
threatData.addThreat(newThreat); // Automatically POSTs to /api/threats
```

### 3. Data Layer Integration
The `DataLayer` class now supports switching between Mock and HTTP adapters.

```typescript
import { threatData } from './services-frontend/dataLayer';

// Use HTTP backend (connects to server)
await threatData.useHttpAdapter();

// Use Mock backend (in-memory only)
threatData.useMockAdapter();

// All store operations work the same regardless of adapter
const threats = threatData.getThreats();
```

## API Endpoints

All backend endpoints are now standardized with the `/api/` prefix:

### Core Resources
- `/api/threats` - Threat indicators and IOCs
- `/api/cases` - Investigation cases
- `/api/actors` - Threat actors and APTs
- `/api/campaigns` - Threat campaigns
- `/api/vulnerabilities` - CVE tracking
- `/api/incidents` - Security incidents

### System & Infrastructure
- `/api/system/nodes` - System nodes and assets
- `/api/system/health` - System health metrics
- `/api/detection/*` - Detection rules and forensics

### OSINT
- `/api/osint/domains` - Domain intelligence
- `/api/osint/breaches` - Breach data
- `/api/osint/social` - Social media monitoring
- `/api/osint/geo` - Geo-IP analysis
- `/api/osint/darkweb` - Dark web monitoring

### Collaboration
- `/api/users` - User management
- `/api/tasks` - Task tracking
- `/api/notes` - Case notes
- `/api/artifacts` - Evidence artifacts
- `/api/channels` - Communication channels
- `/api/team-messages` - Team messaging

### Analytics & Reports
- `/api/reports` - Intelligence reports
- `/api/feeds` - Threat feeds
- `/api/analysis` - Threat analysis

## Usage Examples

### Example 1: Fetching Data
```typescript
// Using API client directly
import { apiClient } from './services-frontend/apiClient';

const highSeverityThreats = await apiClient.threats.getBySeverity('CRITICAL');
const openCases = await apiClient.cases.getByStatus('OPEN');
const systemHealth = await apiClient.system.getHealth();
```

### Example 2: Using Stores with HTTP Backend
```typescript
import { threatData } from './services-frontend/dataLayer';

// Switch to HTTP backend
await threatData.useHttpAdapter();

// Fetch from backend
await threatData.threatStore.fetch();

// Add new threat (syncs to backend)
threatData.addThreat({
  id: 'threat-001',
  indicator: '192.168.1.100',
  type: 'IP_ADDRESS',
  severity: 'HIGH',
  // ...
});

// Data automatically syncs to /api/threats
```

### Example 3: OSINT Operations
```typescript
import { apiClient } from './services-frontend/apiClient';

// Search for domain intelligence
const domainInfo = await apiClient.osint.searchByDomain('example.com');

// Check for breaches
const breaches = await apiClient.osint.getBreaches('user@example.com');

// Get geo-IP data
const geoData = await apiClient.osint.getGeoByIP('8.8.8.8');
```

### Example 4: System Management
```typescript
import { apiClient } from './services-frontend/apiClient';

// Get all nodes in production segment
const prodNodes = await apiClient.system.getNodesBySegment('PROD');

// Isolate a compromised node
await apiClient.system.isolateNode('node-prod-web-01', {
  reason: 'Suspected malware infection',
  isolatedBy: 'security-team'
});

// Restore node after cleanup
await apiClient.system.restoreNode('node-prod-web-01');
```

## Environment Configuration

Set the API backend URL via environment variable:

```env
# .env.local
VITE_API_URL=http://localhost:3001
```

Or it defaults to `http://localhost:3001`.

## Testing

### Test Mock Mode (No Backend Required)
```typescript
import { threatData } from './services-frontend/dataLayer';

// Default is mock mode
const threats = threatData.getThreats(); // Uses in-memory data
```

### Test HTTP Mode (Requires Backend)
```typescript
import { threatData } from './services-frontend/dataLayer';

// Start backend first: npm run dev:server
await threatData.useHttpAdapter();

// Fetch real data from backend
await threatData.threatStore.fetch();
console.log(threatData.getThreats());
```

## Architecture Notes

1. **Store Pattern**: All data operations go through stores (ThreatStore, CaseStore, etc.)
2. **Adapter Pattern**: Adapters (Mock, HTTP) handle persistence layer
3. **Automatic Sync**: Store operations automatically sync to backend via adapter
4. **Type Safety**: All operations are fully typed with TypeScript
5. **Error Handling**: API client includes error handling and logging

## Migration Path

To migrate from mock data to live backend:

1. Ensure backend is running: `npm run dev:server`
2. In your app initialization:
   ```typescript
   import { threatData } from './services-frontend/dataLayer';
   
   // Switch to HTTP backend
   await threatData.useHttpAdapter();
   ```
3. All existing code continues to work - just change the adapter!
