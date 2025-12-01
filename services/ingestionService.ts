import { Threat, Severity, IngestionJob, IncidentStatus } from '../types';
import { calculateThreatScore } from './scoringEngine';

export const mockParseSTIX = (data: string): Threat[] => {
  const confidence = 90;
  const reputation = 85;
  const severity = Severity.CRITICAL;
  
  return [{
    id: `stix-${Date.now()}`,
    indicator: 'apt29-beacon.org',
    type: 'Domain',
    severity: severity,
    lastSeen: 'Just now',
    source: 'TAXII Feed 1',
    description: 'Auto-ingested STIX observable linked to APT29',
    status: IncidentStatus.NEW,
    confidence: confidence,
    region: 'Global',
    threatActor: 'APT-29',
    reputation: reputation,
    score: calculateThreatScore(confidence, reputation, severity)
  }];
};

export const mockParseCSV = (data: string): Threat[] => {
  const confidence = 75;
  const reputation = 50;
  const severity = Severity.HIGH;

  return [{
    id: `csv-${Date.now()}`,
    indicator: '192.168.99.100',
    type: 'IP Address',
    severity: severity,
    lastSeen: '10 mins ago',
    source: 'Upload',
    description: 'Batch CSV import',
    status: IncidentStatus.NEW,
    confidence: confidence,
    region: 'NA',
    threatActor: 'Unknown',
    reputation: reputation,
    score: calculateThreatScore(confidence, reputation, severity)
  }];
};

export const getRecentJobs = (): IngestionJob[] => [
  { id: '1', source: 'AlienVault OTX', format: 'STIX', status: 'COMPLETED', count: 1420, timestamp: '10:00 AM' },
  { id: '2', source: 'CrowdStrike Feed', format: 'JSON', status: 'PROCESSING', count: 450, timestamp: '10:15 AM' },
  { id: '3', source: 'Manual_Blocklist.csv', format: 'CSV', status: 'COMPLETED', count: 58, timestamp: '09:30 AM' },
];