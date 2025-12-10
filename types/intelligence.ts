
import { Severity, IncidentStatus } from './common';
import { ThreatId, CaseId, ActorId } from './opaque';
import { Task, Artifact, TimelineEvent } from './operations';

export interface Threat {
  id: ThreatId;
  indicator: string;
  type: string;
  severity: Severity;
  lastSeen: string;
  source: string;
  description: string;
  status: IncidentStatus;
  confidence: number;
  region: string;
  threatActor: string;
  reputation: number;
  score: number;
  tlp?: string;
  tags?: string[];
  sanctioned?: boolean;
  mlRetrain?: boolean;
  origin?: string;
}

export interface Case {
    id: CaseId;
    title: string;
    description: string;
    status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    assignee: string;
    reporter: string;
    created: string;
    relatedThreatIds: string[];
    findings: string;
    tasks: Task[];
    notes: { id: string; author: string; date: string; content: string; isInternal?: boolean }[];
    artifacts: Artifact[];
    timeline: TimelineEvent[];
    agency: string;
    sharingScope: string;
    sharedWith: string[];
    labels: string[];
    tlp: string;
    slaBreach?: boolean;
    region?: string;
    created_by?: string;
    linkedCaseIds?: string[];
}

export interface TTP { id: string; code: string; name: string; }
export interface Infrastructure { id: string; value: string; type: string; status: string; }
export interface ActorHistory { date: string; title: string; description: string; }

export interface ThreatActor {
    id: ActorId;
    name: string;
    aliases: string[];
    origin: string;
    description: string;
    sophistication: string;
    targets: string[];
    campaigns: string[];
    ttps: TTP[];
    infrastructure: Infrastructure[];
    exploits: string[];
    references: string[];
    history: ActorHistory[];
    evasionTechniques: string[];
    relatedActors?: string[];
    campaignDates?: string[];
}

export interface Campaign {
    id: string;
    name: string;
    description: string;
    status: string;
    objective: string;
    actors: string[];
    firstSeen: string;
    lastSeen: string;
    targetSectors: string[];
    targetRegions: string[];
    threatIds: string[];
    ttps: string[];
}

export interface MitreItem {
    id: string;
    name: string;
    description: string;
    tactic?: string;
    parent?: string;
    aliases?: string[];
    type?: string;
    url?: string;
}
