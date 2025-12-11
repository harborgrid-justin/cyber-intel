
import { SystemNode, IoCFeed, Vendor, Vulnerability, SystemUser, Integration, PatchStatus, ScannerStatus, NistControl, ApiKey, AssetId, VendorId, UserId } from '../../types';

export const INITIAL_ASSETS: SystemNode[] = [
  { id: 'n1' as AssetId, name: 'SENSOR-ALPHA', status: 'ONLINE', load: 45, latency: 12, type: 'Sensor', vendor: 'Cisco', securityControls: ['FIREWALL'], dataSensitivity: 'INTERNAL', dataVolumeGB: 5, ip_address: '10.0.1.5', criticality: 'MEDIUM' },
  { id: 'n2' as AssetId, name: 'DB-CLUSTER', status: 'DEGRADED', load: 88, latency: 120, type: 'Database', vendor: 'Oracle', securityControls: ['EDR', 'DLP'], dataSensitivity: 'RESTRICTED', dataVolumeGB: 5000, ip_address: '10.0.5.10', criticality: 'HIGH' },
  { id: 'n3' as AssetId, name: 'HQ-DC-01', status: 'ONLINE', load: 32, latency: 4, type: 'Server', vendor: 'Dell', securityControls: ['EDR', 'SIEM_AGENT'], dataSensitivity: 'CONFIDENTIAL', dataVolumeGB: 50, ip_address: '10.0.0.2', criticality: 'CRITICAL' }
];

export const INITIAL_FEEDS: IoCFeed[] = [ 
  { id: 'f1', name: 'AlienVault OTX', url: 'https://otx.alienvault.com', type: 'STIX/TAXII', status: 'ACTIVE', interval: 60, lastSync: '10 mins ago' },
  { id: 'f2', name: 'CISA KEV', url: 'https://cisa.gov/kev', type: 'JSON_FEED', status: 'ACTIVE', interval: 360, lastSync: '4 hours ago' }
];

export const INITIAL_VENDORS: Vendor[] = [ 
  { id: 'v1' as VendorId, name: 'SolarWinds', product: 'Orion', riskScore: 85, tier: 'Tactical', category: 'Software', hqLocation: 'USA', activeVulns: 1, campaignsTargeting: 1, sbom: [], compliance: [], access: [], subcontractors: [] },
  { id: 'v2' as VendorId, name: 'Microsoft', product: 'Azure', riskScore: 15, tier: 'Strategic', category: 'Cloud', hqLocation: 'USA', activeVulns: 0, campaignsTargeting: 0, sbom: [], compliance: [], access: [], subcontractors: [] }
];

export const INITIAL_VULNERABILITIES: Vulnerability[] = [ 
  { id: 'CVE-2023-23397', score: 9.8, name: 'Outlook EoP', status: 'PATCHED', vendor: 'Microsoft', vectors: 'Network', zeroDay: false, exploited: true },
  { id: 'CVE-2021-44228', score: 10.0, name: 'Log4Shell', status: 'UNPATCHED', vendor: 'Apache', vectors: 'Network', zeroDay: false, exploited: true, firstDetected: '2023-10-01' }
];

export const INITIAL_USERS: SystemUser[] = [ 
  { id: 'U1' as UserId, name: 'Adm. S. Connor', username: 'admin.connor', roleId: 'ROLE-ADMIN', role: 'Administrator', clearance: 'TS/SCI', status: 'Online', isVIP: true, email: 's.connor@sentinel.local', effectivePermissions: ['*:*'] },
  { id: 'U2' as UserId, name: 'J. Doe', username: 'j.doe', roleId: 'ROLE-ANALYST', role: 'Analyst', clearance: 'SECRET', status: 'Busy', email: 'j.doe@sentinel.local', effectivePermissions: ['threat:read', 'case:read'] }
];

export const MOCK_INTEGRATIONS: Integration[] = [ { id: 'i1', name: 'CrowdStrike', status: 'Connected', type: 'EDR', desc: 'Endpoint detection and response.' } ];
export const MOCK_PATCH_STATUS: PatchStatus[] = [ { id: 'ps1', system: 'Workstations', total: 450, patched: 442, compliance: 98, criticalPending: 2 } ];
export const MOCK_SCANNERS: ScannerStatus[] = [ { id: 's1', name: 'Nessus Pro', status: 'ONLINE', lastScan: '2 hours ago', coverage: '98%', findings: 12 } ];
export const MOCK_NIST_CONTROLS: NistControl[] = [ { id: 'AC-2', family: 'AC', name: 'Account Management', status: 'IMPLEMENTED', lastAudit: '2023-10-01', description: '...' } ];
export const MOCK_API_KEYS: ApiKey[] = [ { id: 'k1', name: 'VT Connector', prefix: 'vt-prod-***', created: '2023-01-15', lastUsed: '2m ago', scopes: ['READ'], status: 'ACTIVE' } ];
