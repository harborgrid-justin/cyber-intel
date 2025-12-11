
import { Threat, Case, ThreatActor, Campaign, MitreItem, Severity, IncidentStatus, ThreatId, CaseId, ActorId } from '../../types';

export const MOCK_THREATS: Threat[] = [
  { id: '1' as ThreatId, indicator: '192.168.1.105', type: 'IP Address', severity: Severity.CRITICAL, lastSeen: '2 mins ago', source: 'FW-01', description: 'C2 Beaconing Detected', status: IncidentStatus.NEW, confidence: 98, region: 'APAC', threatActor: 'APT-29', reputation: 95, score: 96, tags: ['Botnet', 'C2'], origin: 'External' },
  { id: '2' as ThreatId, indicator: '7a0d...8f2b', type: 'File Hash', severity: Severity.HIGH, lastSeen: '15 mins ago', source: 'EDR-West', description: 'Ransomware.LockBit Variant', status: IncidentStatus.INVESTIGATING, confidence: 85, region: 'NA', threatActor: 'LockBit', reputation: 90, score: 88, tags: ['Ransomware', 'Malware'], origin: 'Internal' },
  { id: '3' as ThreatId, indicator: 'update-sys-win.com', type: 'Domain', severity: Severity.MEDIUM, lastSeen: '1 hour ago', source: 'DNS-03', description: 'Typosquatting Domain', status: IncidentStatus.NEW, confidence: 72, region: 'EU', threatActor: 'Unknown', reputation: 45, score: 55, tags: ['Phishing'], origin: 'External' },
  { id: '5' as ThreatId, indicator: '10.20.0.55', type: 'IP Address', severity: Severity.HIGH, lastSeen: '3 hours ago', source: 'IDS-Core', description: 'Lateral Movement (SMB)', status: IncidentStatus.CONTAINED, confidence: 91, region: 'LATAM', threatActor: 'Insider?', reputation: 10, score: 62, tags: ['Exploit'], origin: 'Internal' },
  { id: '6' as ThreatId, indicator: 'login-microsoft-auth.com', type: 'URL', severity: Severity.HIGH, lastSeen: '5 hours ago', source: 'Email Gateway', description: 'Credential Harvesting Page', status: IncidentStatus.NEW, confidence: 88, region: 'Global', threatActor: 'Unknown', reputation: 20, score: 75, tags: ['Phishing'], origin: 'External' },
  { id: '7' as ThreatId, indicator: 'CVE-2023-44487', type: 'Exploit', severity: Severity.CRITICAL, lastSeen: '1 day ago', source: 'WAF', description: 'HTTP/2 Rapid Reset Attack', status: IncidentStatus.INVESTIGATING, confidence: 95, region: 'NA', threatActor: 'DDoS-Group', reputation: 100, score: 92, tags: ['Exploit', 'DDoS', 'Zero-Day', 'T1498'], origin: 'External' },
  { id: '8' as ThreatId, indicator: 'd1b2...c3a4', type: 'File Hash', severity: Severity.HIGH, lastSeen: '2 days ago', source: 'EDR-East', description: 'Suspicious PowerShell activity associated with Mimikatz', status: IncidentStatus.NEW, confidence: 80, region: 'NA', threatActor: 'APT-28', reputation: 85, score: 82, tags: ['Malware', 'Credential Access', 'T1003'], origin: 'Internal' },
];

export const MOCK_CASES: Case[] = [
  { id: 'CASE-23-001' as CaseId, title: 'Operation Blue Horizon', description: 'Investigation into coordinated phishing campaign targeting finance department.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'J. Doe', reporter: 'System', created: '2023-10-25', relatedThreatIds: ['1', '3'], findings: 'Confirmed C2 activity.', tasks: [{id: 't1', title: 'Analyze artifacts', status: 'DONE'}, {id: 't2', title: 'Block IoCs', status: 'PENDING'}], notes: [{id: 'n1', author: 'S. Connor', date: '2023-10-26', content: 'Initial triage complete.'}], artifacts: [], timeline: [{id: 'tl1', date: '2023-10-25', title: 'Initial Alert', type: 'ALERT'}], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Phishing'], tlp: 'AMBER' },
  { id: 'CASE-23-002' as CaseId, title: 'Internal Data Exfil - Finance', description: 'Anomalous outbound traffic from Finance subnet. Suspected insider activity.', status: 'OPEN', priority: 'CRITICAL', assignee: 'Adm. S. Connor', reporter: 'system', created: '2023-10-26', relatedThreatIds: ['5'], findings: '', tasks: [], notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: ['FBI_CYBER'], labels: ['Insider'], tlp: 'AMBER' }
];

export const MOCK_ACTORS: ThreatActor[] = [ 
  { id: 'a1' as ActorId, name: 'APT-29', aliases: ['Cozy Bear'], origin: 'Russia', description: 'SVR affiliated group known for stealthy, long-term espionage campaigns.', sophistication: 'Advanced', targets: ['Gov', 'Energy', 'Defense'], campaigns: ['SolarWinds'], ttps: [{id: 'ttp1', code: 'T1566', name: 'Phishing'}], infrastructure: [], exploits: ['CVE-2023-23397'], references: [], history: [], evasionTechniques: [] },
  { id: 'a2' as ActorId, name: 'Lazarus', aliases: ['Hidden Cobra'], origin: 'DPRK', description: 'State-sponsored cybercrime and espionage group.', sophistication: 'Advanced', targets: ['Finance', 'Crypto'], campaigns: ['WannaCry'], ttps: [], infrastructure: [], exploits: [], references: [], history: [], evasionTechniques: [] }
];

export const MOCK_CAMPAIGNS: Campaign[] = [ 
  { id: 'CAM-001', name: 'SolarWinds Supply Chain', description: 'Widespread supply chain attack.', status: 'ARCHIVED', objective: 'ESPIONAGE', actors: ['APT-29'], firstSeen: '2020-03-01', lastSeen: '2021-02-28', targetSectors: ['Gov', 'Tech'], targetRegions: ['NA'], threatIds: ['1'], ttps: ['T1195'] } 
];

export const MOCK_TACTICS: MitreItem[] = [ { id: 'TA0001', name: 'Initial Access', description: 'The adversary is trying to get into your network.' } ];
export const MOCK_TECHNIQUES: MitreItem[] = [ 
    { id: 'T1566', name: 'Phishing', tactic: 'Initial Access', description: 'Adversaries may send phishing messages to gain access to victim systems.' },
    { id: 'T1003', name: 'OS Credential Dumping', tactic: 'Credential Access', description: 'Adversaries may attempt to dump credentials to obtain account login and credential material.' }
];
export const MOCK_SUB_TECHNIQUES: MitreItem[] = [ { id: 'T1566.001', name: 'Spearphishing Attachment', parent: 'T1566', description: 'Phishing with attachment.' } ];
export const MOCK_GROUPS: MitreItem[] = [ { id: 'G0007', name: 'APT28', aliases: ['Fancy Bear'], description: 'Russian GRU.' } ];
export const MOCK_SOFTWARE: MitreItem[] = [ { id: 'S0002', name: 'Mimikatz', type: 'Tool', description: 'Credential dumper.' } ];
export const MOCK_MITIGATIONS: MitreItem[] = [ { id: 'M1050', name: 'Exploit Protection', description: 'Use ASLR and DEP.' } ];
