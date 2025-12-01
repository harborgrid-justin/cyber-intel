
export enum View {
  DASHBOARD = 'DASHBOARD', FEED = 'FEED', ANALYSIS = 'ANALYSIS', INGESTION = 'INGESTION',
  DETECTION = 'DETECTION', INCIDENTS = 'INCIDENTS', CASES = 'CASES', ACTORS = 'ACTORS',
  REPORTS = 'REPORTS', AUDIT = 'AUDIT', SYSTEM = 'SYSTEM',
  VULNERABILITIES = 'VULNERABILITIES', MITRE = 'MITRE', OSINT = 'OSINT', EVIDENCE = 'EVIDENCE',
  CAMPAIGNS = 'CAMPAIGNS'
}

export enum Severity { LOW = 'LOW', MEDIUM = 'MEDIUM', HIGH = 'HIGH', CRITICAL = 'CRITICAL' }
export enum IncidentStatus { NEW = 'NEW', INVESTIGATING = 'INVESTIGATING', CONTAINED = 'CONTAINED', CLOSED = 'CLOSED' }

export interface Threat { 
  id: string; indicator: string; type: string; severity: Severity; lastSeen: string; 
  source: string; description: string; status: IncidentStatus; confidence: number; 
  region: string; threatActor: string; reputation: number; score: number; 
  tlp?: 'RED'|'AMBER'|'GREEN'|'CLEAR'; 
  sanctioned?: boolean; 
  mlRetrain?: boolean; // Flag to indicate if this IoC should be used for ML model retraining
  tags?: string[];
  origin?: string;
}

export interface Task { 
  id: string; title: string; status: 'PENDING' | 'DONE' | 'SKIPPED'; 
  assignee?: string; dueDate?: string; dependsOn?: string[]; 
}
export interface Note { id: string; author: string; date: string; content: string; isInternal: boolean; }
export interface Artifact { 
  id: string; name: string; type: string; size: string; hash: string; uploadedBy: string; 
  uploadDate: string; status?: 'SECURE' | 'CHECKED_OUT' | 'ARCHIVED' | 'COMPROMISED'; 
  originalHash?: string; 
}
export interface TimelineEvent { id: string; date: string; title: string; type: 'ALERT'|'ACTION'|'SYSTEM'|'TRANSFER'; }

export interface Case {
  id: string; title: string; description: string; status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'; assignee: string; reporter: string;
  tasks: Task[]; findings: string; relatedThreatIds: string[]; created: string;
  notes: Note[]; artifacts: Artifact[]; timeline: TimelineEvent[];
  agency: string; sharingScope: 'INTERNAL' | 'JOINT_TASK_FORCE' | 'PUBLIC'; sharedWith: string[];
  dueDate?: string; labels: string[]; tlp: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';
  slaBreach?: boolean;
  region?: string; 
}

export interface Playbook { 
  id: string; name: string; description: string; tasks: string[]; triggerLabel?: string; 
  usageCount?: number; skipCount?: number; status?: 'ACTIVE' | 'DEPRECATED'; 
}
export interface IoCFeed { 
  id: string; name: string; url: string; type: 'STIX/TAXII' | 'MISP' | 'JSON_FEED'; 
  status: 'ACTIVE' | 'ERROR' | 'DISABLED' | 'CIRCUIT_BROKEN'; 
  interval: number; lastSync: string; 
  errorCount?: number; 
}
export interface TTP { id: string; code: string; name: string; }
export interface Infrastructure { id: string; value: string; type: string; status: 'ACTIVE'|'DOWN'; }
export interface ActorHistory { date: string; title: string; description: string; }

export interface ThreatActor {
  id: string; name: string; aliases: string[]; origin: string; description: string;
  sophistication: 'Advanced' | 'Intermediate' | 'Novice'; targets: string[];
  ttps: TTP[]; campaigns: string[]; infrastructure: Infrastructure[]; exploits: string[];
  references: string[]; history: ActorHistory[];
  relatedActors?: string[]; 
  campaignDates?: string[]; 
}

export interface Campaign {
  id: string; name: string; description: string; status: 'ACTIVE' | 'DORMANT' | 'ARCHIVED';
  objective: 'ESPIONAGE' | 'FINANCIAL' | 'DESTRUCTION' | 'INFLUENCE' | 'UNKNOWN';
  actors: string[]; // Actor Names
  firstSeen: string; lastSeen: string;
  targetSectors: string[]; targetRegions: string[];
  threatIds: string[]; // Linked IOCs
  ttps: string[];
}

export interface Vulnerability { id: string; name: string; score: number; status: 'PATCHED' | 'UNPATCHED' | 'MITIGATED' | 'NEW'; vendor: string; vectors: string; zeroDay: boolean; exploited: boolean; description?: string; riskAmplified?: boolean; killChainReady?: boolean; } 
export interface AuditLog { id: string; action: string; user: string; timestamp: string; details: string; location?: string; } 
export interface SystemNode { id: string; name: string; status: 'ONLINE'|'OFFLINE'|'DEGRADED'; load: number; latency: number; type?: 'Database'|'Sensor'|'Server'; }
export interface ChartDataPoint { name: string; value: number; fullMark?: number; }
export interface ChatMessage { id: string; role: 'user' | 'model'; text: string; timestamp: number; }
export interface IngestionJob { id: string; source: string; format: 'STIX'|'CSV'|'JSON'; status: 'PENDING'|'PROCESSING'|'COMPLETED'|'FAILED'; count: number; timestamp: string; }

export interface ChainEvent { id: string; date: string; artifactId: string; artifactName: string; action: 'CHECK_IN' | 'CHECK_OUT' | 'TRANSFER' | 'ANALYSIS' | 'ARCHIVE'; user: string; notes: string; }
export interface Malware { id: string; name: string; family: string; hash: string; verdict: 'MALICIOUS' | 'SUSPICIOUS' | 'CLEAN'; score: number; associatedActor?: string; }
export interface ForensicJob { id: string; type: string; target: string; status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED'; progress: number; technician: string; }
export interface Device { id: string; name: string; type: 'Mobile' | 'Laptop' | 'Server' | 'Drive'; serial: string; custodian: string; status: 'SECURE' | 'ANALYSIS' | 'RELEASED' | 'QUARANTINED'; missedPatches?: number; }
export interface Pcap { id: string; name: string; size: string; date: string; source: string; protocol: string; analysisStatus: 'PENDING' | 'ANALYZED'; associatedActor?: string; }

export interface IncidentReport {
  id: string; title: string; type: 'Executive' | 'Forensic' | 'Compliance' | 'Technical';
  date: string; author: string; status: 'DRAFT' | 'READY' | 'ARCHIVED';
  content: string; relatedCaseId?: string; relatedActorId?: string; relatedThreatId?: string;
}

export interface MitreItem { id: string; name: string; description: string; url?: string; parent?: string; type?: string; aliases?: string[]; tactic?: string; }
export interface MitreTactic extends MitreItem {}

export interface OsintDomain { domain: string; registrar: string; created: string; expires: string; dns: string; status: string; subdomains: string[]; ssl: string; }
export interface OsintBreach { email: string; breach: string; date: string; data: string; hash: string; source: string; }
export interface OsintSocial { handle: string; platform: string; status: string; followers: number; lastPost: string; sentiment: string; bio: string; priorityScore?: number; } 
export interface OsintGeo { ip: string; city: string; country: string; isp: string; asn: string; coords: string; ports: number[]; threatScore: number; }

export interface SystemUser { id: string; name: string; role: string; clearance: string; status: 'Online' | 'Offline' | 'Busy' | 'LOCKED' | 'FATIGUED'; lastLogin?: string; casesResolved24h?: number; }
export interface Integration { name: string; status: 'Connected' | 'Disconnected' | 'Limited'; type: string; }
