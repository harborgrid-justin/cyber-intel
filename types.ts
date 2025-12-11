
export type View = 'DASHBOARD' | 'FEED' | 'ANALYSIS' | 'CASES' | 'ACTORS' | 'SETTINGS';

export enum Severity {
  LOW = 'LOW',
  MEDIUM = 'MEDIUM',
  HIGH = 'HIGH',
  CRITICAL = 'CRITICAL'
}

export interface Threat {
  id: string;
  indicator: string;
  type: string;
  severity: Severity;
  lastSeen: string;
  source: string;
  description: string;
  status: 'NEW' | 'INVESTIGATING' | 'CLOSED';
  score: number;
  threatActor?: string;
  relatedAssetIds?: string[];
}

export interface Case {
  id: string;
  title: string;
  status: 'OPEN' | 'IN_PROGRESS' | 'RESOLVED';
  priority: Severity;
  assignee: string;
  relatedThreatIds: string[];
  notes: string[];
}

export interface SystemNode {
  id: string;
  name: string;
  ip: string;
  status: 'ONLINE' | 'OFFLINE' | 'COMPROMISED';
  role: string;
  vulnerabilities: string[];
}

export interface ThreatActor {
  id: string;
  name: string;
  origin: string;
  sophistication: string;
  targetSectors: string[];
}

export interface AppConfig {
  appName: string;
  orgName: string;
  threatLevel: string;
  version: string;
}
