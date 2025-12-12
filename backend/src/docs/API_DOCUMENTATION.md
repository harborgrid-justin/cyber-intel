# SENTINEL Platform - REST API Documentation

## Overview

The SENTINEL Cyber Intelligence Platform provides a comprehensive REST API for managing threat intelligence, cases, actors, analytics, integrations, and more.

**Base URL:** `http://localhost:3001/api/v1`

**API Version:** 1.0.0

## Authentication

All API endpoints (except `/health` and `/auth/*`) require authentication using Bearer tokens.

```bash
Authorization: Bearer <your-jwt-token>
```

## Rate Limiting

The API implements rate limiting to ensure fair usage:

- **Default:** 100 requests per 15 minutes
- **Strict operations:** 20 requests per 15 minutes
- **Bulk operations:** 10 requests per hour
- **Exports:** 20 exports per hour
- **Search:** 50 searches per 15 minutes

Rate limit headers are included in responses:
- `X-RateLimit-Limit`: Maximum requests allowed
- `X-RateLimit-Remaining`: Remaining requests
- `X-RateLimit-Reset`: Time when limit resets

## Caching

GET endpoints implement caching with appropriate `Cache-Control` headers:
- **Short:** 5 minutes (dynamic data)
- **Medium:** 15 minutes (semi-static data)
- **Long:** 1 hour (static data)
- **Very Long:** 24 hours (configuration data)

## Response Format

All successful responses follow this format:

```json
{
  "data": { ... },
  "pagination": {
    "total": 100,
    "page": 1,
    "limit": 10,
    "pages": 10
  }
}
```

Error responses:

```json
{
  "error": "Error message",
  "details": [
    {
      "path": ["field"],
      "message": "Validation error message"
    }
  ]
}
```

## Core Endpoints

### 1. Infrastructure

#### Health Check
```
GET /api/v1/health
```
No authentication required. Returns API health status.

#### Metrics
```
GET /api/v1/metrics
```
Returns API performance and usage metrics.

**Response:**
```json
{
  "data": {
    "totalRequests": 1000,
    "totalErrors": 5,
    "errorRate": "0.50%",
    "averageResponseTime": "125.45ms",
    "requestsByMethod": { "GET": 800, "POST": 150, "PUT": 30, "DELETE": 20 },
    "topEndpoints": [ ... ]
  }
}
```

### 2. Threats

#### List Threats
```
GET /api/v1/threats?page=1&limit=10&sortBy=severity&sortOrder=desc&status=ACTIVE
```

**Query Parameters:**
- `page` (integer): Page number (default: 1)
- `limit` (integer): Items per page (default: 10)
- `sortBy` (string): Field to sort by
- `sortOrder` (asc|desc): Sort direction
- `status` (string): Filter by status
- `severity` (string): Filter by severity
- `type` (string): Filter by type
- `search` (string): Search in name/description

#### Get Threat by ID
```
GET /api/v1/threats/:id
```

#### Create Threat
```
POST /api/v1/threats
Content-Type: application/json

{
  "type": "MALWARE",
  "name": "Advanced Persistent Threat",
  "description": "Sophisticated malware campaign",
  "severity": "CRITICAL",
  "confidence": 85,
  "reputation": 70,
  "tags": ["apt", "malware"],
  "indicators": [
    {
      "type": "ip",
      "value": "192.168.1.1",
      "confidence": 90
    }
  ]
}
```

#### Update Threat
```
PUT /api/v1/threats/:id
Content-Type: application/json

{
  "severity": "HIGH",
  "status": "MONITORING"
}
```

#### Delete Threat
```
DELETE /api/v1/threats/:id
```

#### Update Threat Status
```
PATCH /api/v1/threats/:id/status
Content-Type: application/json

{
  "status": "RESOLVED",
  "reason": "Threat neutralized"
}
```

#### Bulk Create Threats
```
POST /api/v1/threats/bulk
Content-Type: application/json

{
  "threats": [
    { "name": "Threat 1", "type": "MALWARE", "severity": "HIGH" },
    { "name": "Threat 2", "type": "PHISHING", "severity": "MEDIUM" }
  ]
}
```

#### Bulk Update Threats
```
PATCH /api/v1/threats/bulk
Content-Type: application/json

{
  "ids": ["threat-1", "threat-2"],
  "updates": {
    "status": "MONITORING",
    "tags": ["updated"]
  }
}
```

#### Bulk Delete Threats
```
DELETE /api/v1/threats/bulk
Content-Type: application/json

{
  "ids": ["threat-1", "threat-2"],
  "permanent": false
}
```

#### Export Threats
```
GET /api/v1/threats/export?format=csv
```

**Formats:** `json`, `csv`, `pdf` (PDF not yet implemented)

#### Threat Statistics
```
GET /api/v1/threats/stats
```

### 3. Analytics

#### Platform Overview
```
GET /api/v1/analytics/overview
```

Returns counts and statistics for threats, actors, and cases.

#### Trends
```
GET /api/v1/analytics/trends?days=30
```

Returns trend data over the specified time period.

#### Threat Landscape
```
GET /api/v1/analytics/threat-landscape
```

Returns comprehensive threat landscape analysis.

#### Performance Metrics
```
GET /api/v1/analytics/performance
```

Returns case resolution metrics and performance indicators.

#### Threat Actor Analytics
```
GET /api/v1/analytics/threat-actors
```

Returns analytics specific to threat actors.

### 4. Notifications

#### List Notifications
```
GET /api/v1/notifications?status=SENT&page=1&limit=20
```

#### Get Notification by ID
```
GET /api/v1/notifications/:id
```

#### Create Notification
```
POST /api/v1/notifications
Content-Type: application/json

{
  "type": "ALERT",
  "title": "Critical Threat Detected",
  "message": "High-severity threat requires immediate attention",
  "recipients": ["user-1", "user-2"],
  "channels": ["EMAIL", "IN_APP"],
  "priority": "URGENT"
}
```

#### Update Notification Status
```
PATCH /api/v1/notifications/:id/status
Content-Type: application/json

{
  "status": "READ"
}
```

#### Bulk Mark as Read
```
POST /api/v1/notifications/bulk/mark-read
Content-Type: application/json

{
  "ids": ["notif-1", "notif-2"]
}
```

#### Delete Notification
```
DELETE /api/v1/notifications/:id
```

#### Notification Statistics
```
GET /api/v1/notifications/stats
```

### 5. Webhooks

#### List Webhooks
```
GET /api/v1/webhooks?active=true
```

#### Get Webhook by ID
```
GET /api/v1/webhooks/:id
```

#### Create Webhook
```
POST /api/v1/webhooks
Content-Type: application/json

{
  "name": "Slack Integration",
  "url": "https://hooks.slack.com/services/YOUR/WEBHOOK/URL",
  "events": ["threat.created", "case.updated"],
  "headers": {
    "Content-Type": "application/json"
  },
  "secret": "your-webhook-secret",
  "active": true,
  "retryOnFailure": true,
  "maxRetries": 3
}
```

#### Update Webhook
```
PUT /api/v1/webhooks/:id
Content-Type: application/json

{
  "active": true,
  "events": ["threat.created", "threat.updated"]
}
```

#### Test Webhook
```
POST /api/v1/webhooks/:id/test
Content-Type: application/json

{
  "payload": {
    "test": true
  }
}
```

#### Toggle Webhook
```
PATCH /api/v1/webhooks/:id/toggle
```

#### Delete Webhook
```
DELETE /api/v1/webhooks/:id
```

#### Webhook Logs
```
GET /api/v1/webhooks/:id/logs
```

### 6. Integrations

#### List Integrations
```
GET /api/v1/integrations?type=SIEM&enabled=true
```

#### Get Integration Types
```
GET /api/v1/integrations/types
```

Returns available integration types and providers.

#### Get Integration by ID
```
GET /api/v1/integrations/:id
```

#### Create Integration
```
POST /api/v1/integrations
Content-Type: application/json

{
  "name": "Splunk Integration",
  "type": "SIEM",
  "provider": "Splunk",
  "configuration": {
    "apiUrl": "https://splunk.example.com/api",
    "apiKey": "your-api-key"
  },
  "enabled": true,
  "autoSync": true,
  "syncInterval": 300,
  "features": ["log_forwarding", "alert_sync"]
}
```

#### Update Integration
```
PUT /api/v1/integrations/:id
Content-Type: application/json

{
  "enabled": true,
  "syncInterval": 600
}
```

#### Test Integration
```
POST /api/v1/integrations/:id/test
```

#### Sync Integration
```
POST /api/v1/integrations/:id/sync
Content-Type: application/json

{
  "fullSync": false
}
```

#### Toggle Integration
```
PATCH /api/v1/integrations/:id/toggle
```

#### Delete Integration
```
DELETE /api/v1/integrations/:id
```

### 7. Exports

#### Export Threats
```
POST /api/v1/exports/threats
Content-Type: application/json

{
  "format": "csv",
  "filters": {
    "severity": "CRITICAL",
    "status": "ACTIVE"
  }
}
```

#### Export Cases
```
POST /api/v1/exports/cases
Content-Type: application/json

{
  "format": "json",
  "filters": {}
}
```

#### Export Actors
```
POST /api/v1/exports/actors
Content-Type: application/json

{
  "format": "csv",
  "filters": {}
}
```

#### Export History
```
GET /api/v1/exports/history
```

### 8. Imports

#### Import Threats
```
POST /api/v1/imports/threats
Content-Type: application/json

{
  "data": [
    { "name": "Threat 1", "type": "MALWARE", "severity": "HIGH" }
  ],
  "format": "json",
  "validate": true
}
```

#### Import Cases
```
POST /api/v1/imports/cases
Content-Type: application/json

{
  "data": [ ... ],
  "format": "json"
}
```

#### Import Actors
```
POST /api/v1/imports/actors
Content-Type: application/json

{
  "data": [ ... ],
  "format": "json"
}
```

#### Validate Import
```
POST /api/v1/imports/validate
Content-Type: application/json

{
  "entity": "threats",
  "data": [ ... ]
}
```

#### Get Import Template
```
GET /api/v1/imports/templates/threats?format=json
```

Returns a template for importing the specified entity type.

#### Import History
```
GET /api/v1/imports/history
```

## Error Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 201 | Created |
| 204 | No Content |
| 304 | Not Modified (cached) |
| 400 | Bad Request (validation error) |
| 401 | Unauthorized (missing/invalid token) |
| 403 | Forbidden (insufficient permissions) |
| 404 | Not Found |
| 429 | Too Many Requests (rate limit exceeded) |
| 500 | Internal Server Error |
| 501 | Not Implemented |

## Best Practices

1. **Always use pagination** for list endpoints to avoid performance issues
2. **Implement exponential backoff** when receiving 429 errors
3. **Use bulk operations** when creating/updating multiple items
4. **Cache responses** when appropriate based on Cache-Control headers
5. **Validate data** before importing using the `/imports/validate` endpoint
6. **Monitor webhook health** using the logs endpoint
7. **Use filters** to reduce response payload size
8. **Implement proper error handling** for all API calls

## Examples

### cURL Examples

```bash
# Get threats
curl -X GET \
  'http://localhost:3001/api/v1/threats?page=1&limit=10' \
  -H 'Authorization: Bearer YOUR_TOKEN'

# Create threat
curl -X POST \
  'http://localhost:3001/api/v1/threats' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  -H 'Content-Type: application/json' \
  -d '{
    "type": "MALWARE",
    "name": "Test Threat",
    "severity": "HIGH"
  }'

# Export threats to CSV
curl -X GET \
  'http://localhost:3001/api/v1/threats/export?format=csv' \
  -H 'Authorization: Bearer YOUR_TOKEN' \
  --output threats.csv
```

### JavaScript/TypeScript Examples

```typescript
// Using fetch
const response = await fetch('http://localhost:3001/api/v1/threats', {
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  }
});
const { data, pagination } = await response.json();

// Using axios
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api/v1',
  headers: {
    'Authorization': `Bearer ${token}`
  }
});

const { data } = await api.get('/threats', {
  params: {
    page: 1,
    limit: 10,
    severity: 'CRITICAL'
  }
});
```

## Support

For API support, please contact: api@sentinel.io
