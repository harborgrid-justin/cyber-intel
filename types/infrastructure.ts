
import { UserId, AssetId, VendorId } from './opaque';
import { Threat } from './intelligence';

export interface SystemUser {
    id: UserId;
    name: string;
    username: string;
    roleId: string;
    role: string;
    clearance: string;
    status: 'Online' | 'Offline' | 'Busy' | 'LOCKED' | 'FATIGUED';
    isVIP?: boolean;
    email?: string;
    lastLogin?: string;
    effectivePermissions?: string[];
    trainingNeeded?: boolean;
}

export interface SystemNode {
    id: AssetId;
    name: string;
    status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'ISOLATED';
    load: number;
    latency: number;
    type: string;
    vendor?: string;
    securityControls: string[];
    dataSensitivity: string;
    dataVolumeGB: number;
    vulnerabilities?: string[];
    criticalProcess?: string;
    dependencies?: string[];
    ip_address?: string;
    criticality?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    owner?: string;
    configHash?: string;
    iamRoles?: string[];
}

export interface SbomComponent {
  name: string;
  version: string;
  license: string;
  vulnerabilities: number;
  critical: boolean;
}

export interface VendorAccess {
  systemId: string;
  accessLevel: 'ADMIN' | 'READ' | 'WRITE';
  accountCount: number;
  mfaEnabled?: boolean;
  lastAudit?: string;
}

export interface Vendor {
    id: VendorId;
    name: string;
    product: string;
    riskScore: number;
    tier: 'Strategic' | 'Tactical' | 'Commodity';
    category: 'Software' | 'Hardware' | 'Cloud' | 'Security';
    hqLocation: string;
    website?: string;
    activeVulns: number;
    campaignsTargeting: number;
    sbom: SbomComponent[];
    compliance: { standard: string; status: string; expiry: string }[];
    access: VendorAccess[];
    subcontractors: string[];
}

export interface Vulnerability {
    id: string;
    score: number;
    name: string;
    status: 'NEW' | 'UNPATCHED' | 'PATCHED' | 'MITIGATED';
    vendor: string;
    vectors: string;
    zeroDay: boolean;
    exploited: boolean;
    affectedAssets?: string[];
    killChainReady?: boolean;
    firstDetected?: string;
}

export interface IoCFeed {
    id: string;
    name: string;
    url: string;
    type: 'STIX/TAXII' | 'JSON_FEED' | 'SIEM_CONNECTOR' | 'VENDOR_ADVISORY' | 'VULN_SCANNER';
    status: 'ACTIVE' | 'DISABLED' | 'ERROR' | 'CIRCUIT_BROKEN';
    interval: number;
    lastSync: string;
    errorCount?: number;
    configuration?: any;
}

export interface IngestionJob {
  id: string;
  source: string;
  format: 'STIX' | 'CSV' | 'VULN_SCAN';
  status: 'COMPLETED' | 'FAILED' | 'RUNNING';
  count: number;
  timestamp: string;
}

export interface Integration { id: string; name: string; status: 'Connected' | 'Error' | 'PENDING'; type: string; desc?: string; }

export interface ApiKey {
  id: string;
  name: string;
  prefix: string;
  created: string;
  lastUsed: string;
  scopes: string[];
  status: 'ACTIVE' | 'REVOKED';
}

export interface Device {
    id: string;
    name: string;
    type: string;
    serial: string;
    custodian: string;
    status: 'SECURE' | 'QUARANTINED' | 'UNKNOWN';
    macAddress?: string;
}

export interface NistControl {
  id: string;
  family: string;
  name: string;
  status: 'IMPLEMENTED' | 'PLANNED' | 'NOT_APPLICABLE' | 'FAILED';
  lastAudit: string;
  description: string;
}

export interface PatchStatus {
    id: string;
    system: string;
    total: number;
    patched: number;
    compliance: number;
    criticalPending: number;
}

export interface ScannerStatus {
    id: string;
    name: string;
    status: 'ONLINE' | 'OFFLINE';
    lastScan: string;
    coverage: string;
    findings: number;
}

export interface VendorFeedItem {
    id: string;
    vendor: string;
    date: string;
    title: string;
    severity: string;
    matchedAssets?: number;
    cveIds?: string[];
}

export interface AssetAtRisk extends SystemNode {
  activeThreats: Threat[];
  exploitableVulns: Vulnerability[];
  riskFactor: number;
}
