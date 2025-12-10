
import { CaseId, ActorId } from './opaque';

export interface Task {
    id: string;
    title: string;
    status: 'PENDING' | 'DONE';
    dependsOn?: string[];
}

export interface Artifact {
    id: string;
    name: string;
    type: string;
    size: string;
    hash?: string;
    uploadedBy: string;
    uploadDate: string;
    status?: 'SECURE' | 'COMPROMISED' | 'ARCHIVED';
    originalHash?: string;
}

export interface TimelineEvent {
    id: string;
    date: string;
    title: string;
    type: string;
    description?: string;
}

export interface IncidentReport {
    id: string;
    title: string;
    type: 'Executive' | 'Technical' | 'Forensic' | 'Compliance';
    date: string;
    author: string;
    status: 'DRAFT' | 'READY' | 'ARCHIVED';
    content: string;
    relatedCaseId?: CaseId;
    relatedActorId?: ActorId;
}

export interface AuditLog {
    id: string;
    action: string;
    user: string;
    timestamp: string;
    details: string;
    location: string;
}

export interface Playbook {
    id: string;
    name: string;
    description: string;
    tasks: string[];
    triggerLabel: string;
    riskLevel: string;
    usageCount?: number;
    skipCount?: number;
    status?: string;
}

export interface ChainEvent {
    id: string;
    date: string;
    artifactId: string;
    artifactName: string;
    action: string;
    user: string;
    notes: string;
}

export interface Malware {
    id: string;
    name: string;
    family: string;
    hash: string;
    verdict: string;
    score: number;
    associatedActor?: string;
    c2Protocol?: string;
}

export interface ForensicJob {
    id: string;
    type: string;
    target: string;
    status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
    progress: number;
    technician: string;
}

export interface ReportSection {
  id: string;
  title: string;
  content: string;
}

export interface Pcap {
    id: string;
    name: string;
    size: string;
    date: string;
    source: string;
    protocol: string;
    analysisStatus: 'ANALYZED' | 'PENDING';
    associatedActor?: string;
}

export interface Channel {
  id: string;
  name: string;
  type: 'PUBLIC' | 'PRIVATE' | 'WAR_ROOM' | 'DM';
  members: string[];
  topic?: string;
}

export interface TeamMessage {
  id: string;
  channelId: string;
  userId: string;
  content: string;
  timestamp: string;
  type: 'TEXT' | 'SYSTEM' | 'FILE';
}

export interface EnrichmentModule {
    id: string;
    name: string;
    type: string;
    provider: string;
    costPerRequest: number;
    latencyMs: number;
    enabled: boolean;
}

export interface ParserRule {
    id: string;
    name: string;
    sourceType: string;
    pattern: string;
    sampleLog: string;
    status: 'ACTIVE' | 'INACTIVE';
    performance: 'FAST' | 'MODERATE' | 'SLOW';
}

export interface NormalizationRule {
    id: string;
    sourceField: string;
    targetField: string;
    transform: string;
    validation: 'VALID' | 'TYPE_MISMATCH' | 'MISSING_FIELD';
}

export interface SegmentationPolicy {
    id: string;
    name: string;
    source: string;
    destination: string;
    port: string;
    action: 'ALLOW' | 'DENY';
    status: 'ACTIVE' | 'DRAFT';
}

export interface Honeytoken {
    id: string;
    name: string;
    type: 'FILE' | 'CREDENTIAL' | 'SERVICE';
    location: string;
    status: 'ACTIVE' | 'TRIGGERED' | 'DORMANT';
    effectiveness: number;
    lastTriggered?: string;
}

export interface TrafficFlow {
    id: string;
    source: string;
    dest: string;
    port: string;
    allowed: boolean;
    timestamp: string;
}

export interface DetectionRuleValidation { valid: boolean; error?: string; }
export interface MemoryFinding { processId: number; processName: string; anomaly: string; }
export interface DiskFinding { filePath: string; status: string; timestamp: string; }
