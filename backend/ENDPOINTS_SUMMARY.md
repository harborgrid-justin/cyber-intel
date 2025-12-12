# SENTINEL Platform - Complete API Endpoints Summary

## Quick Reference Guide

### 🏥 Infrastructure (2 endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/health` | Health check | ❌ |
| GET | `/api/v1/metrics` | API metrics | ✅ |

### 🎯 Threats (10 endpoints)
| Method | Endpoint | Description | Rate Limit |
|--------|----------|-------------|------------|
| GET | `/api/v1/threats` | List with filters | Default |
| GET | `/api/v1/threats/:id` | Get by ID | Default |
| POST | `/api/v1/threats` | Create | Default |
| PUT | `/api/v1/threats/:id` | Update | Default |
| DELETE | `/api/v1/threats/:id` | Delete | Default |
| PATCH | `/api/v1/threats/:id/status` | Update status | Default |
| POST | `/api/v1/threats/bulk` | Bulk create | Bulk |
| PATCH | `/api/v1/threats/bulk` | Bulk update | Bulk |
| DELETE | `/api/v1/threats/bulk` | Bulk delete | Bulk |
| GET | `/api/v1/threats/export` | Export data | Export |
| GET | `/api/v1/threats/stats` | Statistics | Default |

### 📊 Analytics (6 endpoints)
| Method | Endpoint | Description | Cache |
|--------|----------|-------------|-------|
| GET | `/api/v1/analytics/overview` | Platform overview | Medium |
| GET | `/api/v1/analytics/trends` | Trend analysis | Medium |
| GET | `/api/v1/analytics/threat-landscape` | Threat landscape | Medium |
| GET | `/api/v1/analytics/performance` | Performance metrics | Long |
| GET | `/api/v1/analytics/threat-actors` | Actor analytics | Medium |
| POST | `/api/v1/analytics/custom-query` | Custom queries | None |

### 🔔 Notifications (7 endpoints)
| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/v1/notifications` | List notifications | ✅ |
| GET | `/api/v1/notifications/:id` | Get by ID | ✅ |
| POST | `/api/v1/notifications` | Create | ✅ |
| PATCH | `/api/v1/notifications/:id/status` | Update status | ✅ |
| POST | `/api/v1/notifications/bulk/mark-read` | Bulk mark read | ✅ |
| DELETE | `/api/v1/notifications/:id` | Delete | ✅ |
| GET | `/api/v1/notifications/stats` | Statistics | ✅ |

### 🪝 Webhooks (8 endpoints)
| Method | Endpoint | Description | Limit |
|--------|----------|-------------|-------|
| GET | `/api/v1/webhooks` | List webhooks | Default |
| GET | `/api/v1/webhooks/:id` | Get by ID | Default |
| POST | `/api/v1/webhooks` | Create | Default |
| PUT | `/api/v1/webhooks/:id` | Update | Default |
| DELETE | `/api/v1/webhooks/:id` | Delete | Default |
| POST | `/api/v1/webhooks/:id/test` | Test webhook | Strict |
| PATCH | `/api/v1/webhooks/:id/toggle` | Toggle active | Default |
| GET | `/api/v1/webhooks/:id/logs` | Get logs | Default |

### 🔌 Integrations (9 endpoints)
| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| GET | `/api/v1/integrations` | List integrations | Filter by type |
| GET | `/api/v1/integrations/types` | Get available types | 10+ types |
| GET | `/api/v1/integrations/:id` | Get by ID | Sanitized config |
| POST | `/api/v1/integrations` | Create | SIEM/SOAR/etc |
| PUT | `/api/v1/integrations/:id` | Update | Config update |
| DELETE | `/api/v1/integrations/:id` | Delete | - |
| POST | `/api/v1/integrations/:id/test` | Test connection | Strict limit |
| POST | `/api/v1/integrations/:id/sync` | Trigger sync | Manual/auto |
| PATCH | `/api/v1/integrations/:id/toggle` | Toggle status | Enable/disable |

### 📤 Exports (5 endpoints)
| Method | Endpoint | Description | Formats |
|--------|----------|-------------|---------|
| GET | `/api/v1/exports/history` | Export history | - |
| POST | `/api/v1/exports/threats` | Export threats | CSV, JSON |
| POST | `/api/v1/exports/cases` | Export cases | CSV, JSON |
| POST | `/api/v1/exports/actors` | Export actors | CSV, JSON |
| POST | `/api/v1/exports/custom` | Custom export | Placeholder |

### 📥 Imports (6 endpoints)
| Method | Endpoint | Description | Features |
|--------|----------|-------------|----------|
| GET | `/api/v1/imports/history` | Import history | - |
| GET | `/api/v1/imports/templates/:entity` | Get template | JSON/CSV |
| POST | `/api/v1/imports/validate` | Validate data | Pre-import check |
| POST | `/api/v1/imports/threats` | Import threats | With validation |
| POST | `/api/v1/imports/cases` | Import cases | With validation |
| POST | `/api/v1/imports/actors` | Import actors | With validation |

---

## Rate Limiting Summary

| Limiter Type | Requests | Window | Applicable Endpoints |
|--------------|----------|--------|---------------------|
| **Default** | 100 | 15 min | Most GET/POST/PUT/DELETE |
| **Strict** | 20 | 15 min | Admin, test endpoints |
| **Auth** | 5 | 15 min | Login attempts |
| **Bulk** | 10 | 1 hour | Bulk operations |
| **Export** | 20 | 1 hour | Export endpoints |
| **Search** | 50 | 15 min | Search endpoints |

---

## Cache Durations

| Duration | Time | Use Case |
|----------|------|----------|
| **Short** | 5 min | Threats, cases (dynamic) |
| **Medium** | 15 min | Analytics, dashboards |
| **Long** | 1 hour | Performance metrics |
| **Very Long** | 24 hours | Types, templates |

---

## Response Codes

| Code | Meaning | When |
|------|---------|------|
| 200 | Success | Successful GET/PUT/PATCH/DELETE |
| 201 | Created | Successful POST |
| 304 | Not Modified | Cached response |
| 400 | Bad Request | Validation error |
| 401 | Unauthorized | Missing/invalid token |
| 403 | Forbidden | Insufficient permissions |
| 404 | Not Found | Resource doesn't exist |
| 429 | Too Many Requests | Rate limit exceeded |
| 500 | Internal Error | Server error |
| 501 | Not Implemented | Feature not ready |

---

## Quick Usage

### Authentication
```bash
Authorization: Bearer <jwt-token>
```

### Pagination
```bash
GET /api/v1/threats?page=1&limit=10
```

### Filtering
```bash
GET /api/v1/threats?severity=CRITICAL&status=ACTIVE
```

### Sorting
```bash
GET /api/v1/threats?sortBy=created_at&sortOrder=desc
```

### Bulk Operations
```bash
POST /api/v1/threats/bulk
{
  "threats": [ /* up to 100 items */ ]
}
```

### Export
```bash
GET /api/v1/threats/export?format=csv
```

### Import
```bash
POST /api/v1/imports/threats
{
  "data": [ /* array of threats */ ],
  "validate": true
}
```

---

## Integration Types Supported

1. **SIEM** - Splunk, QRadar, ArcSight, LogRhythm
2. **SOAR** - Palo Alto XSOAR, Splunk Phantom, IBM Resilient
3. **Threat Intel** - MISP, ThreatConnect, AlienVault OTX, VirusTotal
4. **Vulnerability Scanner** - Nessus, Qualys, Rapid7, OpenVAS
5. **EDR** - CrowdStrike, Carbon Black, SentinelOne
6. **Firewall** - Palo Alto, Cisco, Fortinet, Check Point
7. **IDS/IPS** - Snort, Suricata, Zeek
8. **Ticketing** - Jira, ServiceNow, Zendesk
9. **Chat** - Slack, Microsoft Teams, Discord
10. **Email** - SendGrid, Mailgun, SMTP

---

## Webhook Events

- `threat.created`
- `threat.updated`
- `threat.resolved`
- `case.created`
- `case.updated`
- `case.closed`
- `alert.triggered`
- `vulnerability.discovered`
- `actor.identified`

---

**Total Endpoints:** 54 new + existing = 100+
**Documentation:** OpenAPI 3.0.3 spec available at `/backend/src/docs/openapi.yaml`
**API Docs:** Full documentation at `/backend/src/docs/API_DOCUMENTATION.md`
