# Complete Server-Frontend Endpoint Mapping

## Controller to API Client Mapping Table

| Server Controller | Base Route | API Client Object | Status | Method Count |
|------------------|------------|-------------------|--------|--------------|
| `threats.controller.ts` | `/api/threats` | `apiClient.threats` | ✅ Full | 8 |
| `cases.controller.ts` | `/api/cases` | `apiClient.cases` | ✅ Full | 8 |
| `actors.controller.ts` | `/api/actors` | `apiClient.actors` | ✅ Full | 8 |
| `campaigns.controller.ts` | `/api/campaigns` | `apiClient.campaigns` | ✅ Full | 10 |
| `vulnerabilities.controller.ts` | `/api/vulnerabilities` | `apiClient.vulnerabilities` | ✅ Full | 10 |
| `system.controller.ts` | `/api/system` | `apiClient.system` | ✅ Full | 10 |
| `incidents.controller.ts` | `/api/incidents` | `apiClient.incidents` | ✅ Full | 5 |
| `detection.controller.ts` | `/api/detection` | `apiClient.detection` | ✅ Full | 8 |
| `osint.controller.ts` | `/api/osint` | `apiClient.osint` | ✅ Full | 16 |
| `channels.controller.ts` | `/api/channels` | `apiClient.channels` | ✅ Full | 5 |
| `team-messages.controller.ts` | `/api/team-messages` | `apiClient.teamMessages` | ✅ Full | 5 |
| `tasks.controller.ts` | `/api/tasks` | `apiClient.tasks` | ✅ **ENHANCED** | 10 |
| `notes.controller.ts` | `/api/notes` | `apiClient.notes` | ✅ **ENHANCED** | 8 |
| `artifacts.controller.ts` | `/api/artifacts` | `apiClient.artifacts` | ✅ **ENHANCED** | 8 |
| `evidence.controller.ts` | `/api/evidence` | `apiClient.evidence` | ✅ **ENHANCED** | 18 |
| `reports.controller.ts` | `/api/reports` | `apiClient.reports` | ✅ **ENHANCED** | 12 |
| `messaging.controller.ts` | `/api/messaging` | `apiClient.messaging` | ✅ **ENHANCED** | 15 |
| `feed.controller.ts` | `/api/feeds` | `apiClient.feeds` | ✅ **ENHANCED** | 7 |
| `users.controller.ts` | `/api/users` | `apiClient.users` | ✅ **ENHANCED** | 10 |
| `analysis.controller.ts` | `/api/analysis` | `apiClient.analysis` | ✅ **ENHANCED** | 2 |
| `ingestion.controller.ts` | `/api/ingestion` | `apiClient.ingestion` | ✅ **ENHANCED** | 25 |
| `orchestrator.controller.ts` | `/api/orchestrator` | `apiClient.orchestrator` | ✅ **ENHANCED** | 23 |
| `compliance-items.controller.ts` | `/api/compliance-items` | `apiClient.complianceItems` | ✅ **ENHANCED** | 6 |
| `osint-results.controller.ts` | `/api/osint-results` | `apiClient.osintResults` | ✅ **ENHANCED** | 5 |

**Total**: 24 controllers, 220+ endpoints, 100% coverage

## Detailed Endpoint Mapping

### Tasks (`/api/tasks`)
```typescript
GET    /api/tasks                    → apiClient.tasks.getAll()
GET    /api/tasks/stats/overview     → apiClient.tasks.getStats()
GET    /api/tasks/overdue/list       → apiClient.tasks.getOverdue()
GET    /api/tasks/case/:caseId       → apiClient.tasks.getByCase(caseId)
GET    /api/tasks/assignee/:assignee → apiClient.tasks.getByAssignee(assignee)
GET    /api/tasks/:id                → apiClient.tasks.getById(id)
POST   /api/tasks                    → apiClient.tasks.create(data)
PUT    /api/tasks/:id                → apiClient.tasks.update(id, data)
PUT    /api/tasks/:id/status         → apiClient.tasks.updateStatus(id, status)
DELETE /api/tasks/:id                → apiClient.tasks.delete(id)
```

### Evidence (`/api/evidence`)
```typescript
// Chain of Custody
GET    /api/evidence/chain           → apiClient.evidence.getChain()
GET    /api/evidence/chain/:id       → apiClient.evidence.getChainById(id)
POST   /api/evidence/chain           → apiClient.evidence.addChainEvent(data)

// Malware
GET    /api/evidence/malware         → apiClient.evidence.getMalware()
GET    /api/evidence/malware/:id     → apiClient.evidence.getMalwareById(id)
POST   /api/evidence/malware         → apiClient.evidence.addMalware(data)

// Forensics
GET    /api/evidence/forensics       → apiClient.evidence.getForensics()
GET    /api/evidence/forensics/:id   → apiClient.evidence.getForensicById(id)
POST   /api/evidence/forensics       → apiClient.evidence.createForensic(data)
PUT    /api/evidence/forensics/:id   → apiClient.evidence.updateForensic(id, data)

// Devices
GET    /api/evidence/devices         → apiClient.evidence.getDevices()
GET    /api/evidence/devices/:id     → apiClient.evidence.getDeviceById(id)
POST   /api/evidence/devices         → apiClient.evidence.createDevice(data)
PUT    /api/evidence/devices/:id     → apiClient.evidence.updateDevice(id, data)
POST   /api/evidence/devices/:id/quarantine → apiClient.evidence.quarantineDevice(id, data)
POST   /api/evidence/devices/:id/release    → apiClient.evidence.releaseDevice(id)

// Network Captures
GET    /api/evidence/pcaps           → apiClient.evidence.getPcaps()
GET    /api/evidence/pcaps/:id       → apiClient.evidence.getPcapById(id)
POST   /api/evidence/pcaps           → apiClient.evidence.createPcap(data)
PUT    /api/evidence/pcaps/:id       → apiClient.evidence.updatePcap(id, data)
POST   /api/evidence/pcaps/:id/analyze → apiClient.evidence.analyzePcap(id, data)

// Stats
GET    /api/evidence/stats/overview  → apiClient.evidence.getStats()
```

### Messaging (`/api/messaging`)
```typescript
// Channels
GET    /api/messaging/channels            → apiClient.messaging.getChannels()
GET    /api/messaging/channels/:id        → apiClient.messaging.getChannelById(id)
POST   /api/messaging/channels            → apiClient.messaging.createChannel(data)
PUT    /api/messaging/channels/:id        → apiClient.messaging.updateChannel(id, data)
DELETE /api/messaging/channels/:id        → apiClient.messaging.deleteChannel(id)
POST   /api/messaging/channels/:id/join   → apiClient.messaging.joinChannel(id, data)
POST   /api/messaging/channels/:id/leave  → apiClient.messaging.leaveChannel(id, data)
GET    /api/messaging/channels/:id/activity → apiClient.messaging.getChannelActivity(id)

// Messages
GET    /api/messaging/channels/:channelId/messages → apiClient.messaging.getMessages(channelId)
POST   /api/messaging/channels/:channelId/messages → apiClient.messaging.sendMessage(channelId, data)
PUT    /api/messaging/messages/:id        → apiClient.messaging.updateMessage(id, data)
DELETE /api/messaging/messages/:id        → apiClient.messaging.deleteMessage(id)

// Direct Messages
POST   /api/messaging/dm                  → apiClient.messaging.sendDM(data)
GET    /api/messaging/dm/:userId          → apiClient.messaging.getDMs(userId)

// Stats
GET    /api/messaging/stats/overview      → apiClient.messaging.getStats()
```

### Orchestrator (`/api/orchestrator`)
```typescript
// Response Plans
GET    /api/orchestrator/response-plans        → apiClient.orchestrator.getResponsePlans()
GET    /api/orchestrator/response-plans/active → apiClient.orchestrator.getActiveResponsePlans()
GET    /api/orchestrator/response-plans/:id    → apiClient.orchestrator.getResponsePlan(id)
POST   /api/orchestrator/response-plans        → apiClient.orchestrator.createResponsePlan(data)
PUT    /api/orchestrator/response-plans/:id    → apiClient.orchestrator.updateResponsePlan(id, data)
POST   /api/orchestrator/response-plans/:id/execute → apiClient.orchestrator.executeResponsePlan(id, data)

// VIP Profiles
GET    /api/orchestrator/vip-profiles          → apiClient.orchestrator.getVIPProfiles()
GET    /api/orchestrator/vip-profiles/high-risk → apiClient.orchestrator.getHighRiskVIPs()
GET    /api/orchestrator/vip-profiles/:userId  → apiClient.orchestrator.getVIPProfile(userId)
POST   /api/orchestrator/vip-profiles          → apiClient.orchestrator.createVIPProfile(data)

// Honeytokens
GET    /api/orchestrator/honeytokens           → apiClient.orchestrator.getHoneytokens()
GET    /api/orchestrator/honeytokens/:id       → apiClient.orchestrator.getHoneytoken(id)
POST   /api/orchestrator/honeytokens           → apiClient.orchestrator.createHoneytoken(data)
PUT    /api/orchestrator/honeytokens/:id       → apiClient.orchestrator.updateHoneytoken(id, data)
POST   /api/orchestrator/honeytokens/:id/trigger → apiClient.orchestrator.triggerHoneytoken(id, data)

// Segmentation & Network
GET    /api/orchestrator/segmentation-policies → apiClient.orchestrator.getSegmentationPolicies()
GET    /api/orchestrator/segmentation-policies/:id → apiClient.orchestrator.getSegmentationPolicy(id)
POST   /api/orchestrator/segmentation-policies → apiClient.orchestrator.createSegmentationPolicy(data)
PUT    /api/orchestrator/segmentation-policies/:id → apiClient.orchestrator.updateSegmentationPolicy(id, data)
POST   /api/orchestrator/segmentation/enforce/:nodeId → apiClient.orchestrator.enforceSegmentation(nodeId, data)
GET    /api/orchestrator/traffic-flows         → apiClient.orchestrator.getTrafficFlows()
POST   /api/orchestrator/traffic-flows         → apiClient.orchestrator.analyzeTrafficFlows(data)

// Patch Management
GET    /api/orchestrator/patch-prioritization  → apiClient.orchestrator.getPatchPrioritization()
POST   /api/orchestrator/patch-prioritization  → apiClient.orchestrator.createPatchPrioritization(data)

// Automation
POST   /api/orchestrator/automated-response    → apiClient.orchestrator.automatedResponse(data)
GET    /api/orchestrator/stats/overview        → apiClient.orchestrator.getStats()
```

### Ingestion (`/api/ingestion`)
```typescript
// Jobs
GET    /api/ingestion/jobs                → apiClient.ingestion.getJobs()
GET    /api/ingestion/jobs/active         → apiClient.ingestion.getActiveJobs()
GET    /api/ingestion/jobs/:id            → apiClient.ingestion.getJob(id)
POST   /api/ingestion/jobs                → apiClient.ingestion.createJob(data)
PUT    /api/ingestion/jobs/:id            → apiClient.ingestion.updateJob(id, data)
POST   /api/ingestion/jobs/:id/start      → apiClient.ingestion.startJob(id)
POST   /api/ingestion/jobs/:id/complete   → apiClient.ingestion.completeJob(id, data)
POST   /api/ingestion/jobs/:id/fail       → apiClient.ingestion.failJob(id, data)

// Parser Rules
GET    /api/ingestion/parser-rules        → apiClient.ingestion.getParserRules()
GET    /api/ingestion/parser-rules/failed → apiClient.ingestion.getFailedParsers()
GET    /api/ingestion/parser-rules/:id    → apiClient.ingestion.getParserRule(id)
POST   /api/ingestion/parser-rules        → apiClient.ingestion.createParserRule(data)
PUT    /api/ingestion/parser-rules/:id    → apiClient.ingestion.updateParserRule(id, data)
POST   /api/ingestion/parser-rules/:id/validate → apiClient.ingestion.validateParser(id, data)

// Enrichment Modules
GET    /api/ingestion/enrichment-modules      → apiClient.ingestion.getEnrichmentModules()
GET    /api/ingestion/enrichment-modules/:id  → apiClient.ingestion.getEnrichmentModule(id)
POST   /api/ingestion/enrichment-modules      → apiClient.ingestion.createEnrichmentModule(data)
PUT    /api/ingestion/enrichment-modules/:id  → apiClient.ingestion.updateEnrichmentModule(id, data)
POST   /api/ingestion/enrichment-modules/:id/enable  → apiClient.ingestion.enableEnrichment(id)
POST   /api/ingestion/enrichment-modules/:id/disable → apiClient.ingestion.disableEnrichment(id)
POST   /api/ingestion/enrichment-modules/:id/test    → apiClient.ingestion.testEnrichment(id, data)

// Normalization Rules
GET    /api/ingestion/normalization-rules     → apiClient.ingestion.getNormalizationRules()
GET    /api/ingestion/normalization-rules/:id → apiClient.ingestion.getNormalizationRule(id)
POST   /api/ingestion/normalization-rules     → apiClient.ingestion.createNormalizationRule(data)
PUT    /api/ingestion/normalization-rules/:id → apiClient.ingestion.updateNormalizationRule(id, data)

// Processing
POST   /api/ingestion/process             → apiClient.ingestion.process(data)
GET    /api/ingestion/stats/overview      → apiClient.ingestion.getStats()
```

## Usage Examples

### Example 1: Fetching Tasks for a Case
```typescript
import { apiClient } from '@/services-frontend/apiClient';

// Get all tasks for a specific case
const tasks = await apiClient.tasks.getByCase('case-123');

// Get overdue tasks
const overdueTasks = await apiClient.tasks.getOverdue();

// Update task status
await apiClient.tasks.updateStatus('task-456', 'COMPLETED');
```

### Example 2: Working with Evidence
```typescript
// Add a malware sample
await apiClient.evidence.addMalware({
  hash: 'abc123...',
  type: 'ransomware',
  signature: 'WannaCry variant'
});

// Quarantine a device
await apiClient.evidence.quarantineDevice('device-789', {
  reason: 'Suspected compromise',
  duration: 3600
});

// Analyze network capture
const analysis = await apiClient.evidence.analyzePcap('pcap-101', {
  depth: 'full'
});
```

### Example 3: Orchestration
```typescript
// Create automated response plan
const plan = await apiClient.orchestrator.createResponsePlan({
  name: 'Ransomware Response',
  triggers: ['malware_detected'],
  actions: ['isolate', 'backup', 'alert']
});

// Execute response
await apiClient.orchestrator.executeResponsePlan(plan.id, {
  target: 'node-123'
});

// Enforce network segmentation
await apiClient.orchestrator.enforceSegmentation('node-456', {
  policy: 'strict-isolation'
});
```

### Example 4: Using with Data Layer
```typescript
import { threatData } from '@/services-frontend/dataLayer';

// Switch to HTTP backend
await threatData.useHttpAdapter({ port: 3001 });

// Stores automatically fetch from server
const tasks = threatData.taskStore?.getAll(); // If TaskStore is added

// Or use BaseStore
const taskStore = new BaseStore('TASKS', [], threatData.adapter);
await taskStore.fetch();
```

## HttpAdapter Integration

The `httpAdapter.ts` automatically maps collection names to API endpoints:

```typescript
private collectionMap: Record<string, any> = {
  'threats': apiClient.threats,
  'cases': apiClient.cases,
  'tasks': apiClient.tasks,
  'notes': apiClient.notes,
  'artifacts': apiClient.artifacts,
  'evidence': apiClient.evidence,
  // ... etc
};
```

When you call `store.fetch()`, it:
1. Calls `adapter.query(collectionName)`
2. Maps to appropriate `apiClient` object
3. Calls `getAll()` method
4. Returns data to store

## Coverage Summary

- ✅ **100%** of server controllers mapped
- ✅ **220+** endpoint methods available
- ✅ **All CRUD operations** supported
- ✅ **All specialized operations** included
- ✅ **Statistics endpoints** mapped
- ✅ **Filter/search endpoints** mapped
- ✅ **Action endpoints** (publish, archive, execute, etc.) mapped

