
import { Threat, Severity, IncidentStatus, ThreatId } from '../types';
import { calculateThreatScore } from './scoringEngine';

const PATTERNS = {
  IP: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g,
  EMAIL: /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g,
  MD5: /\b[a-fA-F0-9]{32}\b/g,
  DOMAIN: /\b((?=[a-z0-9-]{1,63}\.)(xn--)?[a-z0-9]+(-[a-z0-9]+)*\.)+[a-z]{2,63}\b/g
};

export const scanTextForIoCs = (text: string): Threat[] => {
  const findings: Threat[] = [];
  
  const scan = (regex: RegExp, type: string, severity: Severity, baseReputation: number) => {
    const matches = text.match(regex) || [];
    matches.forEach(match => {
      if (!findings.find(f => f.indicator === match)) {
        const confidence = 80;
        findings.push({
          id: `scan-${match}` as ThreatId, indicator: match, type, severity, lastSeen: 'Now', source: 'Live Scan',
          description: `Pattern match detected`, status: IncidentStatus.NEW, confidence, region: 'Unknown',
          threatActor: 'Unattributed', reputation: baseReputation,
          score: calculateThreatScore(confidence, baseReputation, severity)
        });
      }
    });
  };

  scan(PATTERNS.IP, 'IP Address', Severity.MEDIUM, 40);
  scan(PATTERNS.MD5, 'File Hash', Severity.HIGH, 60);
  scan(PATTERNS.EMAIL, 'Email', Severity.LOW, 20);
  
  return findings;
};
