
export enum View {
  DASHBOARD = 'DASHBOARD', FEED = 'FEED', ANALYSIS = 'ANALYSIS', INGESTION = 'INGESTION',
  DETECTION = 'DETECTION', INCIDENTS = 'INCIDENTS', CASES = 'CASES', ACTORS = 'ACTORS',
  REPORTS = 'REPORTS', AUDIT = 'AUDIT', SYSTEM = 'SYSTEM',
  VULNERABILITIES = 'VULNERABILITIES', MITRE = 'MITRE', OSINT = 'OSINT', EVIDENCE = 'EVIDENCE',
  CAMPAIGNS = 'CAMPAIGNS', SUPPLY_CHAIN = 'SUPPLY_CHAIN', SIMULATION = 'SIMULATION',
  ORCHESTRATOR = 'ORCHESTRATOR', VIP_PROTECTION = 'VIP_PROTECTION'
}

export enum Severity { LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum IncidentStatus { NEW = 'NEW', INVESTIGATING = 'INVESTIGATING', CONTAINED = 'CONTAINED', CLOSED = 'CLOSED' }

export interface Threat { 
  id: string; indicator: string; type: string; severity: Severity; lastSeen: string; 
  source: string; description: string; status: IncidentStatus; confidence: number; 
  region: string; threatActor: string; reputation: number; score: number; 
  tlp?: 'RED'|'AMBER'|'GREEN'|'CLEAR'; sanctioned?: boolean; mlRetrain?: boolean; tags?: string[]; origin?: string;
}

export interface Task { id: string; title: string; status: 'PENDING' | 'DONE' | 'SKIPPED'; assignee?: string; dueDate?: string; dependsOn?: string[]; }
export interface Note { id: string; author: string; date: string; content: string; isInternal: boolean; }
export interface Artifact { id: string; name: string; type: string; size: string; hash: string; uploadedBy: string; uploadDate: string; status?: 'SECURE' | 'CHECKED_OUT' | 'ARCHIVED' | 'COMPROMISED'; originalHash?: string; }
export interface TimelineEvent { id: string; date: string; title: string; type: 'ALERT'|'ACTION'|'SYSTEM'|'TRANSFER'; }

export interface Case {
  id: string; title: string; description: string; status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; assignee: string; reporter: string;
  tasks: Task[]; findings: string; relatedThreatIds: string[]; created: string;
  notes: Note[]; artifacts: Artifact[]; timeline: TimelineEvent[];
  agency: string; sharingScope: 'INTERNAL' | 'JOINT_TASK_FORCE' | 'PUBLIC'; sharedWith: string[];
  dueDate?: string; labels: string[]; tlp: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';
  slaBreach?: boolean; region?: string; 
}

export interface Playbook { id: string; name: string; description: string; tasks: string[]; triggerLabel?: string; usageCount?: number; skipCount?: number; status?: 'ACTIVE' | 'DEPRECATED'; estimatedDuration?: string; riskLevel?: 'LOW' | 'MODERATE' | 'HIGH'; }
export interface IoCFeed { 
  id: string; name: string; url: string; 
  type: 'STIX/TAXII' | 'MISP' | 'JSON_FEED' | 'VENDOR_ADVISORY' | 'SIEM_CONNECTOR' | 'VULN_SCANNER'; 
  status: 'ACTIVE' | 'ERROR' | 'DISABLED' | 'CIRCUIT_BROKEN'; 
  interval: number; lastSync: string; errorCount?: number; 
}
export interface TTP { id: string; code: string; name: string; }
export interface Infrastructure { id: string; value: string; type: string; status: 'ACTIVE'|'DOWN'; }
export interface ActorHistory { date: string; title: string; description: string; }

export interface ThreatActor {
  id: string; name: string; aliases: string[]; origin: string; description: string;
  sophistication: 'Advanced' | 'Intermediate' | 'Novice'; targets: string[];
  ttps: TTP[]; campaigns: string[]; infrastructure: Infrastructure[]; exploits: string[];
  references: string[]; history: ActorHistory[]; relatedActors?: string[]; campaignDates?: string[];
  evasionTechniques?: string[];
}

export interface Campaign {
  id: string; name: string; description: string; status: 'ACTIVE' | 'DORMANT' | 'ARCHIVED';
  objective: 'ESPIONAGE' | 'FINANCIAL' | 'DESTRUCTION' | 'INFLUENCE' | 'UNKNOWN';
  actors: string[]; firstSeen: string; lastSeen: string; targetSectors: string[]; targetRegions: string[];
  threatIds: string[]; ttps: string[];
}

export interface Vulnerability { 
  id: string; name: string; score: number; status: 'PATCHED' | 'UNPATCHED' | 'MITIGATED' | 'NEW'; 
  vendor: string; vectors: string; zeroDay: boolean; exploited: boolean; 
  description?: string; riskAmplified?: boolean; killChainReady?: boolean; 
  firstDetected?: string; affectedAssets?: string[];
} 

export interface SlaStatus { status: 'ON_TRACK' | 'WARNING' | 'BREACHED'; daysRemaining: number; dueDate: string; }
export interface VulnerabilityScan { id: string; target: string; status: 'QUEUED' | 'RUNNING' | 'COMPLETED' | 'FAILED'; findings: number; progress: number; startTime: string; }

export interface AuditLog { id: string; action: string; user: string; timestamp: string; details: string; location?: string; } 

export interface SystemNode { 
  id: string; name: string; status: 'ONLINE'|'OFFLINE'|'DEGRADED'|'ISOLATED'; 
  load: number; latency: number; type?: 'Database'|'Sensor'|'Server'|'Firewall'|'Workstation'; 
  vulnerabilities?: string[]; vendor?: string; criticalProcess?: string; dependencies?: string[];
  securityControls: ('EDR' | 'AV' | 'DLP' | 'FIREWALL' | 'SIEM_AGENT')[];
  dataSensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';
  dataVolumeGB: number;
  segment?: 'DMZ' | 'PROD' | 'DEV' | 'CORP';
  networkConnections?: number;
}

export interface ChartDataPoint { name: string; value: number; fullMark?: number; }
export interface ChatMessage { id: string; role: 'user' | 'model'; text: string; timestamp: number; }
export interface IngestionJob { id: string; source: string; format: 'STIX'|'CSV'|'JSON'; status: 'PENDING'|'PROCESSING'|'COMPLETED'|'FAILED'; count: number; timestamp: string; }

export interface ChainEvent { id: string; date: string; artifactId: string; artifactName: string; action: 'CHECK_IN' | 'CHECK_OUT' | 'TRANSFER' | 'ANALYSIS' | 'ARCHIVE'; user: string; notes: string; }
export interface Malware { id: string; name: string; family: string; hash: string; verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN'; score: number; associatedActor?: string; }
export interface ForensicJob { id: string; type: string; target: string; status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'; progress: number; technician: string; }
export interface Device { id: string; name: string; type: 'Mobile' | 'Laptop' | 'Server' | 'Drive'; serial: string; custodian: string; status: 'SECURE' | 'ANALYSIS' | 'RELEASED' | 'QUARANTINED'; missedPatches?: number; }
export interface Pcap { id: string; name: string; size: string; date: string; source: string; protocol: string; analysisStatus: 'PENDING' | 'ANALYZED'; associatedActor?: string; }

export interface IncidentReport { id: string; title: string; type: 'Executive' | 'Forensic' | 'Compliance' | 'Technical'; date: string; author: string; status: 'DRAFT' | 'READY' | 'ARCHIVED'; content: string; relatedCaseId?: string; relatedActorId?: string; relatedThreatId?: string; }
export interface ReportSection { id: string; title: string; content: string; }

export interface MitreItem { id: string; name: string; description: string; url?: string; parent?: string; type?: string; aliases?: string[]; tactic?: string; }
export interface OsintDomain { id: string; domain: string; registrar: string; created: string; expires: string; dns: string; status: string; subdomains: string[]; ssl: string; }
export interface OsintBreach { id: string; email: string; breach: string; date: string; data: string; hash: string; source: string; }
export interface OsintSocial { id: string; handle: string; platform: string; status: string; followers: number; lastPost: string; sentiment: string; bio: string; priorityScore?: number; } 
export interface OsintGeo { id: string; ip: string; city: string; country: string; isp: string; asn: string; coords: string; ports: number[]; threatScore: number; }
export interface OsintDarkWebItem { source: string; title: string; date: string; author: string; status: string; price: string; }
export interface OsintFileMeta { name: string; size: string; type: string; author: string; created: string; gps: string; }

export interface SystemUser { id: string; name: string; role: string; clearance: string; status: 'Online' | 'Offline' | 'Busy' | 'LOCKED' | 'FATIGUED'; lastLogin?: string; casesResolved24h?: number; email?: string; isVIP?: boolean; }
export interface Integration { id: string; name: string; status: 'Connected' | 'Disconnected' | 'Limited'; type: string; }

export interface PatchStatus { id: string; system: string; total: number; patched: number; compliance: number; criticalPending: number; }
export interface ScannerStatus { id: string; name: string; status: string; lastScan: string; coverage: string; findings: number; healthScore?: number; licenseExpiry?: string; }
export interface VendorFeedItem { id: string; vendor: string; date: string; title: string; severity: string; matchedAssets?: number; cveIds?: string[]; }

// Enhanced SCRM Types
export interface SbomComponent { name: string; version: string; license: string; vulnerabilities: number; critical: boolean; outdated?: boolean; }
export interface ComplianceCert { standard: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'FEDRAMP'; status: 'VALID' | 'EXPIRED' | 'PENDING'; expiry: string; }
export interface VendorAccess { systemId: string; accessLevel: 'READ' | 'WRITE' | 'ADMIN'; accountCount: number; lastAudit?: string; mfaEnabled?: boolean; }

export interface Vendor { 
  id: string;
  name: string; 
  product: string; 
  riskScore: number; 
  tier: 'Strategic' | 'Tactical' | 'Commodity';
  category: 'Cloud' | 'Software' | 'Hardware' | 'Services';
  hqLocation: string;
  website: string;
  activeVulns: number; 
  campaignsTargeting: number; 
  sbom: SbomComponent[];
  compliance: ComplianceCert[];
  access: VendorAccess[];
  subcontractors: string[]; // IDs of other vendors or names
}

export interface AttackStep { id: string; stage: string; node?: string; method: string; successProbability: number; description: string; detectionRisk?: number; }
export interface AttackPath { actorId: string; entryPoint: string; steps: AttackStep[]; estimatedTime: string; criticalAssetCompromised: boolean; totalDetectionProbability: number; }

// Active Defense & Orchestrator Types
export interface ResponsePlan { 
  id: string; name: string; targetNodes: string[]; type: 'ISOLATION' | 'PATCH' | 'BLOCK_IP' | 'DECEPTION'; 
  collateralDamageScore: number; businessImpact: string[]; successRate: number; 
  status: 'DRAFT' | 'EXECUTING' | 'COMPLETED'; requiredAuth?: string; estimatedTTR?: string;
}
export interface VIPProfile { userId: string; name: string; title: string; doxxingProb: number; phishingSusceptibility: number; exposedCreds: number; sentiment: 'Neutral' | 'Negative' | 'Hostile'; recentMentions: number; }

export interface Honeytoken { 
  id: string; name: string; type: 'FILE' | 'CREDENTIAL' | 'SERVICE'; 
  location: string; status: 'ACTIVE' | 'TRIGGERED' | 'DORMANT'; 
  lastTriggered?: string; effectiveness?: number; deploymentDate?: string;
}
export interface PatchPrioritization { vulnId: string; assetId: string; score: number; reason: string; cvss: number; businessCriticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; }

export interface SegmentationPolicy { id: string; name: string; source: string; destination: string; port: string; action: 'ALLOW' | 'DENY'; status: 'ACTIVE' | 'DRAFT' | 'CONFLICT'; }
export interface TrafficFlow { id: string; source: string; dest: string; port: string; allowed: boolean; timestamp: string; policyMatched?: string; }

// Compliance
export interface NistControl { id: string; family: string; name: string; status: 'IMPLEMENTED' | 'PARTIAL' | 'PLANNED' | 'FAILED'; lastAudit: string; description: string; }
export interface AuditArtifact { id: string; controlId: string; type: 'SCREENSHOT' | 'LOG' | 'POLICY'; name: string; timestamp: string; }

// Ingestion Types
export interface ParserRule { id: string; name: string; sourceType: string; pattern: string; sampleLog: string; status: 'ACTIVE' | 'INACTIVE' | 'ERROR'; performance: 'FAST' | 'MODERATE' | 'SLOW'; }
export interface EnrichmentModule { id: string; name: string; type: 'GEO' | 'ASN' | 'THREAT_INTEL' | 'WHOIS' | 'ASSET_DB'; provider: string; costPerRequest: number; latencyMs: number; enabled: boolean; }
export interface NormalizationRule { id: string; sourceField: string; targetField: string; transform: 'NONE' | 'LOWERCASE' | 'UPPERCASE' | 'TRIM' | 'IP_TO_GEO'; validation: 'VALID' | 'TYPE_MISMATCH' | 'MISSING_FIELD'; }