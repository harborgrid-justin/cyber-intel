
import { Threat, Severity, IngestionJob, IncidentStatus, VendorFeedItem, Vulnerability, ScannerStatus } from '../types';
import { calculateThreatScore } from './scoringEngine';

const generateRandomIP = () => Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
const generateRandomHash = () => Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');

export const mockParseSTIX = (data: string, sourceName: string = 'TAXII Feed'): Threat[] => {
  const confidence = 85 + Math.floor(Math.random() * 15);
  const reputation = 70 + Math.floor(Math.random() * 30);
  const severity = Math.random() > 0.7 ? Severity.CRITICAL : Severity.HIGH;
  
  return [{
    id: `stix-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    indicator: Math.random() > 0.5 ? generateRandomIP() : `malware-${Math.floor(Math.random() * 1000)}.org`,
    type: Math.random() > 0.5 ? 'IP Address' : 'Domain',
    severity: severity,
    lastSeen: 'Just now',
    source: sourceName,
    description: `Ingested observable from ${sourceName} via STIX/TAXII`,
    status: IncidentStatus.NEW,
    confidence: confidence,
    region: 'Global',
    threatActor: Math.random() > 0.6 ? 'APT-29' : 'Unknown',
    reputation: reputation,
    score: calculateThreatScore(confidence, reputation, severity)
  }];
};

export const mockParseCSV = (data: string, sourceName: string = 'CSV Import'): Threat[] => {
  const confidence = 60 + Math.floor(Math.random() * 20);
  const severity = Severity.MEDIUM;

  return [{
    id: `csv-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    indicator: generateRandomHash(),
    type: 'File Hash',
    severity: severity,
    lastSeen: '10 mins ago',
    source: sourceName,
    description: 'Bulk CSV import indicator',
    status: IncidentStatus.NEW,
    confidence: confidence,
    region: 'Internal',
    threatActor: 'Unattributed',
    reputation: 50,
    score: calculateThreatScore(confidence, 50, severity)
  }];
};

export const mockParseVendorAdvisory = (source: string): VendorFeedItem[] => {
  return [{
    id: `adv-${Date.now()}`,
    vendor: source,
    date: new Date().toISOString().split('T')[0],
    title: `Security Advisory: Critical Patch for ${Math.random() > 0.5 ? 'Server' : 'Client'} Runtime`,
    severity: Math.random() > 0.7 ? 'Critical' : 'High'
  }];
};

export const mockParseVulnScan = (source: string): { findings: Vulnerability[], status: ScannerStatus } => {
  const cveId = `CVE-2024-${1000 + Math.floor(Math.random() * 9000)}`;
  const findings: Vulnerability[] = [{
    id: cveId,
    name: 'Remote Code Execution in Core Service',
    score: 9.8,
    status: 'NEW',
    vendor: 'Enterprise App',
    vectors: 'Network',
    zeroDay: Math.random() > 0.9,
    exploited: Math.random() > 0.8
  }];
  
  const status: ScannerStatus = {
    id: source === 'Nessus Pro' ? 's1' : 's2',
    name: source,
    status: 'ONLINE',
    lastScan: 'Just now',
    coverage: '99%',
    findings: 10 + Math.floor(Math.random() * 50)
  };
  
  return { findings, status };
};

export const getRecentJobs = (): IngestionJob[] => [
  { id: '1', source: 'AlienVault OTX', format: 'STIX', status: 'COMPLETED', count: 1420, timestamp: '10:00 AM' },
  { id: '2', source: 'CrowdStrike Feed', format: 'JSON', status: 'PROCESSING', count: 450, timestamp: '10:15 AM' },
  { id: '3', source: 'Manual_Blocklist.csv', format: 'CSV', status: 'COMPLETED', count: 58, timestamp: '09:30 AM' },
];
