
import { Threat, Severity, IncidentStatus, ThreatId, IngestionJob, VendorFeedItem, Vulnerability, ScannerStatus } from '../types';
import { calculateThreatScore } from './scoringEngine';
import { apiClient } from './apiClient';

const generateRandomIP = () => Array.from({length: 4}, () => Math.floor(Math.random() * 256)).join('.');
const generateRandomHash = () => Array.from({length: 32}, () => Math.floor(Math.random() * 16).toString(16)).join('');

const localParseSTIX = (sourceName: string): Threat[] => {
  const confidence = 85 + Math.floor(Math.random() * 15);
  const reputation = 70 + Math.floor(Math.random() * 30);
  const severity = Math.random() > 0.7 ? Severity.CRITICAL : Severity.HIGH;
  
  return [{
    id: `stix-${Date.now()}` as ThreatId,
    indicator: Math.random() > 0.5 ? generateRandomIP() : `malware-${Math.floor(Math.random() * 1000)}.org`,
    type: Math.random() > 0.5 ? 'IP Address' : 'Domain',
    severity: severity,
    lastSeen: 'Just now',
    source: sourceName,
    description: `Ingested observable from ${sourceName} via STIX/TAXII (Offline)`,
    status: IncidentStatus.NEW,
    confidence, reputation,
    region: 'Global',
    threatActor: Math.random() > 0.6 ? 'APT-29' : 'Unknown',
    score: calculateThreatScore(confidence, reputation, severity)
  }];
};

export const mockParseSTIX = (data: string, sourceName: string = 'TAXII Feed'): Threat[] => localParseSTIX(sourceName);

export const ingestData = async (content: string, format: 'STIX' | 'CSV' | 'VULN_SCAN'): Promise<any> => {
  try { return await apiClient.post<any>('/ingestion/parse', { content, format }); } 
  catch (e) { console.warn("Ingestion API unavailable, using local parser"); if (format === 'STIX') return localParseSTIX('Offline Feed'); if (format === 'VULN_SCAN') return mockParseVulnScan('Offline Scanner'); return []; }
};

export const ingestDataStream = (sourceName: string, count: number = 50): ReadableStream<Threat> => {
  return new ReadableStream({
    async start(controller) {
      for (let i = 0; i < count; i++) {
        await new Promise(resolve => setTimeout(resolve, 50)); 
        controller.enqueue(localParseSTIX(sourceName)[0] as Threat);
      }
      controller.close();
    }
  });
};

export const mockParseCSV = (data: string, sourceName: string = 'CSV Import'): Threat[] => {
  return [{ id: `csv-${Date.now()}` as ThreatId, indicator: generateRandomHash(), type: 'File Hash', severity: Severity.MEDIUM, lastSeen: '10 mins ago', source: sourceName, description: 'Bulk CSV import indicator', status: IncidentStatus.NEW, confidence: 70, region: 'Internal', threatActor: 'Unattributed', reputation: 50, score: calculateThreatScore(70, 50, Severity.MEDIUM) }];
};

export const mockParseVendorAdvisory = (source: string): VendorFeedItem[] => [{ id: `adv-${Date.now()}`, vendor: source, date: new Date().toISOString().split('T')[0], title: `Security Advisory: Critical Patch`, severity: 'Critical' }];
export const mockParseVulnScan = (source: string): { findings: Vulnerability[], status: ScannerStatus } => {
  const cveId = `CVE-2024-${1000 + Math.floor(Math.random() * 9000)}`;
  const findings: Vulnerability[] = [{ id: cveId, name: 'Remote Code Execution', score: 9.8, status: 'NEW', vendor: 'App', vectors: 'Network', zeroDay: false, exploited: false }];
  const status: ScannerStatus = { id: source === 'Nessus Pro' ? 's1' : 's2', name: source, status: 'ONLINE', lastScan: 'Just now', coverage: '99%', findings: 10 };
  return { findings, status };
};
export const getRecentJobs = (): IngestionJob[] => [ { id: '1', source: 'AlienVault OTX', format: 'STIX', status: 'COMPLETED', count: 1420, timestamp: '10:00 AM' } ];
