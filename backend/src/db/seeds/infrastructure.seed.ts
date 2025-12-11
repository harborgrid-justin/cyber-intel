
export const INITIAL_ASSETS = [
  { id: 'n1', name: 'SENSOR-ALPHA', type: 'Sensor', ip_address: '10.0.1.5', status: 'ONLINE', criticality: 'MEDIUM', owner: 'SecOps', load: 45, latency: 12, security_controls: ['FIREWALL'], data_sensitivity: 'INTERNAL', data_volume_gb: 5 },
  { id: 'n2', name: 'DB-CLUSTER', type: 'Database', ip_address: '10.0.5.10', status: 'DEGRADED', criticality: 'HIGH', owner: 'DataTeam', load: 88, latency: 120, security_controls: ['EDR', 'DLP'], data_sensitivity: 'RESTRICTED', data_volume_gb: 5000 },
  { id: 'n3', name: 'HQ-DC-01', type: 'Server', ip_address: '10.0.0.2', status: 'ONLINE', criticality: 'CRITICAL', owner: 'IT', load: 32, latency: 4, security_controls: ['EDR', 'SIEM_AGENT'], data_sensitivity: 'CONFIDENTIAL', data_volume_gb: 50 }
];

export const INITIAL_FEEDS = [
  { id: 'FEED-01', name: 'AlienVault OTX', url: 'https://otx.alienvault.com', type: 'STIX', interval_min: 60, status: 'ACTIVE' },
  { id: 'FEED-02', name: 'CISA Known Exploited', url: 'https://cisa.gov/kev', type: 'JSON', interval_min: 360, status: 'ACTIVE' }
];

export const INITIAL_VENDORS = [
  { 
    id: 'VEND-01', name: 'SolarWinds', product: 'Orion', tier: 'Tactical', category: 'Software', risk_score: 85, hq_location: 'USA',
    subcontractors: ['Unknown_Offshore_Dev'], compliance: [{ standard: 'ISO27001', status: 'EXPIRED', expiry: '2023-01-01' }], access: [{ systemId: 'n2', accessLevel: 'READ', accountCount: 1, mfaEnabled: true }], sbom: [{ name: 'log4j', version: '2.14.1', critical: true, vulnerabilities: 5, license: 'Apache-2.0' }]
  },
  { 
    id: 'VEND-02', name: 'Microsoft', product: 'Azure', tier: 'Strategic', category: 'Cloud', risk_score: 15, hq_location: 'USA',
    subcontractors: ['Akamai', 'Intel'], compliance: [], access: [{ systemId: 'n3', accessLevel: 'ADMIN', accountCount: 5, mfaEnabled: true }], sbom: [{ name: 'openssl', version: '3.0.0', critical: false, vulnerabilities: 0, license: 'Apache-2.0' }]
  },
  {
    id: 'VEND-03', name: 'Kaspersky', product: 'Endpoint Security', tier: 'Commodity', category: 'Security', risk_score: 95, hq_location: 'Russia',
    subcontractors: [], compliance: [{ standard: 'SOC2', status: 'VALID', expiry: '2025-01-01' }], access: [{ systemId: 'n1', accessLevel: 'WRITE', accountCount: 2, mfaEnabled: false }], sbom: [{ name: 'sqlite', version: '3.38.0', critical: false, vulnerabilities: 0, license: 'Public Domain' }]
  }
];
