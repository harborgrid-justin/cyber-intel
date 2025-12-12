
export const INITIAL_ASSETS = [
  { id: 'AST-001', name: 'SENSOR-ALPHA', type: 'sensor', ip_address: '10.0.1.5', status: 'active', criticality: 'MEDIUM', owner: 'SecOps', load: 45, latency: 12, security_controls: ['FIREWALL', 'IDS'], data_sensitivity: 'INTERNAL', data_volume_gb: 5, last_seen: new Date('2024-12-12') },
  { id: 'AST-002', name: 'DB-CLUSTER-01', type: 'database', ip_address: '10.0.5.10', status: 'degraded', criticality: 'CRITICAL', owner: 'DataTeam', load: 88, latency: 120, security_controls: ['EDR', 'DLP', 'ENCRYPTION'], data_sensitivity: 'RESTRICTED', data_volume_gb: 5000, last_seen: new Date('2024-12-12') },
  { id: 'AST-003', name: 'HQ-DC-01', type: 'server', ip_address: '10.0.0.2', status: 'active', criticality: 'CRITICAL', owner: 'IT', load: 32, latency: 4, security_controls: ['EDR', 'SIEM_AGENT', 'FIREWALL'], data_sensitivity: 'CONFIDENTIAL', data_volume_gb: 50, last_seen: new Date('2024-12-12') },
  { id: 'AST-004', name: 'WEB-FRONTEND-01', type: 'application', ip_address: '192.168.10.50', status: 'active', criticality: 'HIGH', owner: 'WebOps', load: 65, latency: 25, security_controls: ['WAF', 'DDoS_Protection'], data_sensitivity: 'PUBLIC', data_volume_gb: 100, last_seen: new Date('2024-12-12') },
  { id: 'AST-005', name: 'MAIL-SERVER-01', type: 'server', ip_address: '10.0.2.15', status: 'active', criticality: 'HIGH', owner: 'IT', load: 42, latency: 8, security_controls: ['EMAIL_GATEWAY', 'SPAM_FILTER', 'DLP'], data_sensitivity: 'CONFIDENTIAL', data_volume_gb: 750, last_seen: new Date('2024-12-12') },
  { id: 'AST-006', name: 'FINANCE-WS-001', type: 'workstation', ip_address: '10.20.0.55', status: 'quarantined', criticality: 'MEDIUM', owner: 'Finance', load: 75, latency: 15, security_controls: ['EDR', 'ENCRYPTION'], data_sensitivity: 'RESTRICTED', data_volume_gb: 200, last_seen: new Date('2024-12-10') },
  { id: 'AST-007', name: 'BACKUP-STORAGE-01', type: 'storage', ip_address: '10.0.6.20', status: 'active', criticality: 'CRITICAL', owner: 'IT', load: 55, latency: 10, security_controls: ['ENCRYPTION', 'ACCESS_CONTROL'], data_sensitivity: 'RESTRICTED', data_volume_gb: 50000, last_seen: new Date('2024-12-12') },
  { id: 'AST-008', name: 'VPN-GATEWAY-01', type: 'network_device', ip_address: '203.0.113.10', status: 'active', criticality: 'HIGH', owner: 'NetOps', load: 38, latency: 5, security_controls: ['FIREWALL', 'IDS', 'MFA'], data_sensitivity: 'INTERNAL', data_volume_gb: 1, last_seen: new Date('2024-12-12') },
  { id: 'AST-009', name: 'SCADA-CONTROLLER-01', type: 'iot', ip_address: '172.16.1.100', status: 'active', criticality: 'CRITICAL', owner: 'OT_Team', load: 20, latency: 2, security_controls: ['FIREWALL', 'NETWORK_SEGMENTATION'], data_sensitivity: 'RESTRICTED', data_volume_gb: 10, last_seen: new Date('2024-12-12') },
  { id: 'AST-010', name: 'CEO-LAPTOP-01', type: 'workstation', ip_address: '10.10.0.5', status: 'active', criticality: 'HIGH', owner: 'Executive', load: 30, latency: 18, security_controls: ['EDR', 'ENCRYPTION', 'DLP'], data_sensitivity: 'CONFIDENTIAL', data_volume_gb: 500, last_seen: new Date('2024-12-11') }
];

export const INITIAL_VULNERABILITIES = [
  { id: 'CVE-2023-44487', name: 'HTTP/2 Rapid Reset', score: 7.5, status: 'open', vendor: 'Multiple', vectors: 'Network', zero_day: false, exploited: true, affected_assets: ['AST-004', 'AST-008'], kill_chain_ready: true },
  { id: 'CVE-2021-44228', name: 'Log4Shell', score: 10.0, status: 'patched', vendor: 'Apache', vectors: 'Network', zero_day: false, exploited: true, affected_assets: [], kill_chain_ready: false },
  { id: 'CVE-2023-34362', name: 'MOVEit Transfer SQL Injection', score: 9.8, status: 'mitigated', vendor: 'Progress Software', vectors: 'Network', zero_day: false, exploited: true, affected_assets: ['AST-004'], kill_chain_ready: true },
  { id: 'CVE-2023-23397', name: 'Microsoft Outlook Elevation of Privilege', score: 9.8, status: 'open', vendor: 'Microsoft', vectors: 'Network', zero_day: false, exploited: true, affected_assets: ['AST-005', 'AST-010'], kill_chain_ready: true },
  { id: 'CVE-2024-XXXXX', name: 'Zero-Day SCADA Vulnerability', score: 9.5, status: 'open', vendor: 'Proprietary', vectors: 'Network, Adjacent', zero_day: true, exploited: false, affected_assets: ['AST-009'], kill_chain_ready: false },
  { id: 'CVE-2023-4966', name: 'Citrix Bleed', score: 9.4, status: 'patched', vendor: 'Citrix', vectors: 'Network', zero_day: false, exploited: true, affected_assets: [], kill_chain_ready: false },
  { id: 'CVE-2023-3519', name: 'Citrix ADC and Gateway Code Injection', score: 9.8, status: 'open', vendor: 'Citrix', vectors: 'Network', zero_day: false, exploited: true, affected_assets: ['AST-008'], kill_chain_ready: true }
];

export const INITIAL_FEEDS = [
  { id: 'FEED-001', name: 'AlienVault OTX', url: 'https://otx.alienvault.com/api/v1/pulses', type: 'STIX', interval_min: 60, status: 'active', last_sync: new Date('2024-12-12T08:00:00Z'), configuration: { api_key: 'encrypted', timeout: 30 }, error_count: 0 },
  { id: 'FEED-002', name: 'CISA Known Exploited Vulnerabilities', url: 'https://www.cisa.gov/sites/default/files/feeds/known_exploited_vulnerabilities.json', type: 'JSON', interval_min: 360, status: 'active', last_sync: new Date('2024-12-12T06:00:00Z'), configuration: {}, error_count: 0 },
  { id: 'FEED-003', name: 'MISP Threat Sharing', url: 'https://misp.internal.local/events/restSearch', type: 'TAXII', interval_min: 120, status: 'active', last_sync: new Date('2024-12-12T07:30:00Z'), configuration: { api_key: 'encrypted', verifypeer: false }, error_count: 0 },
  { id: 'FEED-004', name: 'Abuse.ch URLhaus', url: 'https://urlhaus.abuse.ch/downloads/csv_recent/', type: 'CSV', interval_min: 180, status: 'active', last_sync: new Date('2024-12-12T07:00:00Z'), configuration: {}, error_count: 0 },
  { id: 'FEED-005', name: 'Emerging Threats', url: 'https://rules.emergingthreats.net/open/', type: 'SNORT', interval_min: 1440, status: 'active', last_sync: new Date('2024-12-11T00:00:00Z'), configuration: {}, error_count: 0 },
  { id: 'FEED-006', name: 'Internal Threat Intel', url: 'https://internal-ti.sentinel.local/api/indicators', type: 'API', interval_min: 30, status: 'active', last_sync: new Date('2024-12-12T08:30:00Z'), configuration: { api_key: 'encrypted' }, error_count: 0 },
  { id: 'FEED-007', name: 'VirusTotal Intelligence', url: 'https://www.virustotal.com/api/v3/intelligence', type: 'API', interval_min: 240, status: 'error', last_sync: new Date('2024-12-11T12:00:00Z'), configuration: { api_key: 'encrypted', rate_limit: 500 }, error_count: 3 }
];

export const INITIAL_VENDORS = [
  {
    id: 'VEND-001',
    name: 'SolarWinds',
    product: 'Orion Network Management',
    tier: 'TACTICAL',
    category: 'Software',
    risk_score: 85,
    hq_location: 'Austin, TX, USA',
    subcontractors: ['Unknown_Offshore_Dev', 'Cloud_Provider_X'],
    compliance: [
      { standard: 'ISO27001', status: 'EXPIRED', expiry: '2023-01-01', notes: 'Renewal pending' },
      { standard: 'SOC2_Type2', status: 'VALID', expiry: '2025-06-30', notes: 'Annual audit' }
    ],
    access: [
      { systemId: 'AST-002', accessLevel: 'READ', accountCount: 1, mfaEnabled: true, lastAccess: '2024-12-10' }
    ],
    sbom: [
      { name: 'log4j', version: '2.14.1', critical: true, vulnerabilities: 5, license: 'Apache-2.0', cve: 'CVE-2021-44228' },
      { name: 'spring-boot', version: '2.5.0', critical: false, vulnerabilities: 2, license: 'Apache-2.0', cve: '' }
    ]
  },
  {
    id: 'VEND-002',
    name: 'Microsoft',
    product: 'Azure Cloud Services',
    tier: 'STRATEGIC',
    category: 'Cloud',
    risk_score: 15,
    hq_location: 'Redmond, WA, USA',
    subcontractors: ['Akamai', 'Intel', 'Dell'],
    compliance: [
      { standard: 'ISO27001', status: 'VALID', expiry: '2025-12-31', notes: 'Global certification' },
      { standard: 'SOC2_Type2', status: 'VALID', expiry: '2025-12-31', notes: '' },
      { standard: 'FedRAMP_High', status: 'VALID', expiry: '2025-12-31', notes: 'Government approved' }
    ],
    access: [
      { systemId: 'AST-003', accessLevel: 'ADMIN', accountCount: 5, mfaEnabled: true, lastAccess: '2024-12-12' },
      { systemId: 'AST-007', accessLevel: 'WRITE', accountCount: 3, mfaEnabled: true, lastAccess: '2024-12-12' }
    ],
    sbom: [
      { name: 'openssl', version: '3.0.0', critical: false, vulnerabilities: 0, license: 'Apache-2.0', cve: '' },
      { name: 'azure-sdk', version: '12.0.0', critical: false, vulnerabilities: 0, license: 'MIT', cve: '' }
    ]
  },
  {
    id: 'VEND-003',
    name: 'Kaspersky',
    product: 'Endpoint Security',
    tier: 'OPERATIONAL',
    category: 'Security',
    risk_score: 95,
    hq_location: 'Moscow, Russia',
    subcontractors: [],
    compliance: [
      { standard: 'SOC2', status: 'VALID', expiry: '2025-01-01', notes: 'Limited scope' }
    ],
    access: [
      { systemId: 'AST-001', accessLevel: 'WRITE', accountCount: 2, mfaEnabled: false, lastAccess: '2024-12-05' }
    ],
    sbom: [
      { name: 'sqlite', version: '3.38.0', critical: false, vulnerabilities: 0, license: 'Public Domain', cve: '' }
    ]
  },
  {
    id: 'VEND-004',
    name: 'CrowdStrike',
    product: 'Falcon Endpoint Protection',
    tier: 'STRATEGIC',
    category: 'Security',
    risk_score: 20,
    hq_location: 'Austin, TX, USA',
    subcontractors: ['AWS'],
    compliance: [
      { standard: 'ISO27001', status: 'VALID', expiry: '2025-08-31', notes: '' },
      { standard: 'SOC2_Type2', status: 'VALID', expiry: '2025-08-31', notes: '' },
      { standard: 'FedRAMP_Moderate', status: 'VALID', expiry: '2025-08-31', notes: '' }
    ],
    access: [
      { systemId: 'AST-003', accessLevel: 'READ', accountCount: 1, mfaEnabled: true, lastAccess: '2024-12-12' },
      { systemId: 'AST-006', accessLevel: 'READ', accountCount: 1, mfaEnabled: true, lastAccess: '2024-12-10' },
      { systemId: 'AST-010', accessLevel: 'READ', accountCount: 1, mfaEnabled: true, lastAccess: '2024-12-11' }
    ],
    sbom: [
      { name: 'falcon-sensor', version: '7.10.0', critical: false, vulnerabilities: 0, license: 'Proprietary', cve: '' }
    ]
  },
  {
    id: 'VEND-005',
    name: 'Splunk',
    product: 'Enterprise SIEM',
    tier: 'STRATEGIC',
    category: 'Security',
    risk_score: 25,
    hq_location: 'San Francisco, CA, USA',
    subcontractors: ['AWS', 'GCP'],
    compliance: [
      { standard: 'ISO27001', status: 'VALID', expiry: '2025-10-31', notes: '' },
      { standard: 'SOC2_Type2', status: 'VALID', expiry: '2025-10-31', notes: '' }
    ],
    access: [
      { systemId: 'AST-001', accessLevel: 'READ', accountCount: 5, mfaEnabled: true, lastAccess: '2024-12-12' },
      { systemId: 'AST-003', accessLevel: 'READ', accountCount: 5, mfaEnabled: true, lastAccess: '2024-12-12' }
    ],
    sbom: [
      { name: 'python', version: '3.9.0', critical: false, vulnerabilities: 0, license: 'PSF', cve: '' },
      { name: 'mongodb', version: '5.0.0', critical: false, vulnerabilities: 0, license: 'SSPL', cve: '' }
    ]
  }
];
