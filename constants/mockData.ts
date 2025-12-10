
import { 
    Threat, Severity, IncidentStatus, SystemNode, AuditLog, Case, IoCFeed, ThreatActor, 
    Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, Vulnerability, MitreItem, 
    OsintDomain, OsintBreach, OsintSocial, OsintGeo, SystemUser, Integration, 
    IncidentReport, Campaign, PatchStatus, ScannerStatus, VendorFeedItem, ReportSection, 
    Vendor, NistControl, ApiKey, EnrichmentModule, ParserRule, NormalizationRule, 
    SegmentationPolicy, Honeytoken, TrafficFlow, OsintDarkWebItem, OsintFileMeta,
    ThreatId, CaseId, ActorId, UserId, AssetId, VendorId
} from '../types';

// FIX: Add missing export for MOCK_USERS. This data is adapted from backend seeds.
export const MOCK_USERS: SystemUser[] = [
  { id: 'USR-ADMIN' as UserId, name: 'Adm. S. Connor', username: 'admin.connor', roleId: 'ROLE-ADMIN', role: 'Administrator', clearance: 'TS/SCI', status: 'Online', email: 'admin@sentinel.local', isVIP: true, effectivePermissions: ['*:*'] },
  { id: 'USR-ANALYST' as UserId, name: 'J. Doe', username: 'analyst.doe', roleId: 'ROLE-ANALYST', role: 'Analyst', clearance: 'SECRET', status: 'Online', email: 'doe@sentinel.local', isVIP: false, effectivePermissions: ['threat:read', 'case:read'] },
  { id: 'USR-VIEWER' as UserId, name: 'Auditor Smith', username: 'auditor.smith', roleId: 'ROLE-VIEWER', role: 'Viewer', clearance: 'UNCLASSIFIED', status: 'Offline', email: 'audit@sentinel.local', isVIP: false, effectivePermissions: ['audit:read'] }
];

// FIX: Add missing export for MOCK_FEEDS.
export const MOCK_FEEDS: IoCFeed[] = [
  { id: 'FEED-01', name: 'AlienVault OTX', url: 'https://otx.alienvault.com', type: 'STIX', status: 'ACTIVE', interval: 60, lastSync: '1 hour ago' },
  { id: 'FEED-02', name: 'CISA Known Exploited', url: 'https://cisa.gov/kev', type: 'JSON', status: 'ACTIVE', interval: 360, lastSync: '6 hours ago' }
];

// FIX: Add missing export for MOCK_VENDORS.
export const MOCK_VENDORS: Vendor[] = [
  { 
    id: 'VEND-01' as VendorId, name: 'SolarWinds', product: 'Orion', tier: 'Tactical', category: 'Software', riskScore: 85, hqLocation: 'USA', activeVulns: 1, campaignsTargeting: 1,
    subcontractors: ['Unknown_Offshore_Dev'], compliance: [{ standard: 'ISO27001', status: 'EXPIRED', expiry: '2022-12-31' }], access: [{ systemId: 'n2', accessLevel: 'READ', accountCount: 1, mfaEnabled: true }], sbom: [{ name: 'log4j', version: '2.14', license: 'Apache', vulnerabilities: 1, critical: true }]
  },
  { 
    id: 'VEND-02' as VendorId, name: 'Microsoft', product: 'Azure', tier: 'Strategic', category: 'Cloud', riskScore: 15, hqLocation: 'USA', activeVulns: 0, campaignsTargeting: 0,
    subcontractors: ['Akamai'], compliance: [{ standard: 'FEDRAMP', status: 'VALID', expiry: '2024-12-31' }], access: [{ systemId: 'n3', accessLevel: 'ADMIN', accountCount: 3, mfaEnabled: false }], sbom: [{ name: 'openssl', version: '3.0', license: 'Apache', vulnerabilities: 0, critical: false }]
  }
];

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  { id: 'CVE-2023-23397', score: 9.8, name: 'Outlook EoP', status: 'PATCHED', vendor: 'Microsoft', vectors: 'Network', zeroDay: false, exploited: true, affectedAssets: ['n3'] },
  { id: 'CVE-2021-44228', score: 10.0, name: 'Log4Shell', status: 'UNPATCHED', vendor: 'Apache', vectors: 'Network', zeroDay: false, exploited: true, affectedAssets: ['n1'] },
  { id: 'CVE-2023-34362', score: 9.8, name: 'MOVEit RCE', status: 'UNPATCHED', vendor: 'Progress', vectors: 'Network', zeroDay: false, exploited: true, affectedAssets: ['n3', 'n5'] },
  { id: 'CVE-2023-4966', score: 9.8, name: 'Citrix Bleed', status: 'PENDING', vendor: 'Citrix', vectors: 'Network', zeroDay: false, exploited: true, affectedAssets: ['n6'] },
  { id: 'CVE-2024-0001', score: 8.5, name: 'Internal Library Flaw', status: 'NEW', vendor: 'In-House', vectors: 'Local', zeroDay: false, exploited: false, affectedAssets: ['n2'] },
];

export const SYSTEM_NODES: SystemNode[] = [
  { id: 'n1' as AssetId, name: 'FW-PROD-01', status: 'ONLINE', load: 15, latency: 2, type: 'Firewall', vendor: 'Palo Alto', securityControls: ['FIREWALL', 'IDS'], dataSensitivity: 'INTERNAL', dataVolumeGB: 1, ip_address: '1.1.1.1', vulnerabilities: ['CVE-2021-44228'], criticality: 'HIGH' },
  { id: 'n2' as AssetId, name: 'FIN-DB-CLUSTER', status: 'DEGRADED', load: 88, latency: 120, type: 'Database', vendor: 'Oracle', securityControls: ['EDR', 'DLP'], dataSensitivity: 'RESTRICTED', dataVolumeGB: 5000, ip_address: '10.10.1.5', vulnerabilities: ['CVE-2024-0001'], criticality: 'CRITICAL' },
  { id: 'n3' as AssetId, name: 'HQ-DC-01', status: 'ONLINE', load: 32, latency: 4, type: 'Server', vendor: 'Microsoft', securityControls: ['EDR', 'SIEM_AGENT'], dataSensitivity: 'CONFIDENTIAL', dataVolumeGB: 50, ip_address: '10.20.0.55', vulnerabilities: ['CVE-2023-23397', 'CVE-2023-34362'], criticality: 'CRITICAL' },
  { id: 'n4' as AssetId, name: 'Workstation-HR-05', status: 'ONLINE', load: 25, latency: 22, type: 'Workstation', vendor: 'Dell', securityControls: ['EDR', 'AV'], dataSensitivity: 'INTERNAL', dataVolumeGB: 0.5, ip_address: '192.168.1.105', criticality: 'MEDIUM' },
  { id: 'n5' as AssetId, name: 'WEB-PUBLIC-02', status: 'ONLINE', load: 60, latency: 15, type: 'Server', vendor: 'Apache', securityControls: ['WAF'], dataSensitivity: 'PUBLIC', dataVolumeGB: 10, ip_address: '2.2.2.2', vulnerabilities: ['CVE-2023-34362'], criticality: 'HIGH' },
  { id: 'n6' as AssetId, name: 'VPN-GATEWAY', status: 'ONLINE', load: 40, latency: 30, type: 'Gateway', vendor: 'Citrix', securityControls: ['FIREWALL'], dataSensitivity: 'INTERNAL', dataVolumeGB: 0, ip_address: '3.3.3.3', vulnerabilities: ['CVE-2023-4966'], criticality: 'HIGH' },
  { id: 'n7' as AssetId, name: 'HONEYPOT-DECOY-01', status: 'ISOLATED', load: 5, latency: 1, type: 'Sensor', vendor: 'Internal', securityControls: [], dataSensitivity: 'PUBLIC', dataVolumeGB: 0, ip_address: '4.4.4.4', criticality: 'LOW' },
  { id: 'n8' as AssetId, name: 'BACKUP-ARCHIVE', status: 'OFFLINE', load: 0, latency: 0, type: 'Storage', vendor: 'Dell', securityControls: [], dataSensitivity: 'RESTRICTED', dataVolumeGB: 25000, criticality: 'MEDIUM' },
];

export const MOCK_THREATS: Threat[] = [
  { id: '1' as ThreatId, indicator: '192.168.1.105', type: 'IP Address', severity: Severity.CRITICAL, lastSeen: '2 mins ago', source: 'FW-01', description: 'C2 Beaconing Detected from HR Workstation', status: IncidentStatus.NEW, confidence: 98, region: 'Internal', threatActor: 'APT-29', reputation: 95, score: 96, tags: ['Botnet', 'C2'], origin: 'Internal' },
  { id: '2' as ThreatId, indicator: '7a0d...8f2b', type: 'File Hash', severity: Severity.HIGH, lastSeen: '15 mins ago', source: 'EDR-West', description: 'Ransomware.LockBit Variant on HQ-DC-01', status: IncidentStatus.INVESTIGATING, confidence: 85, region: 'NA', threatActor: 'LockBit', reputation: 90, score: 88, tags: ['Ransomware', 'Malware'], origin: 'Internal' },
  { id: '3' as ThreatId, indicator: 'update-sys-win.com', type: 'Domain', severity: Severity.MEDIUM, lastSeen: '1 hour ago', source: 'DNS-03', description: 'Typosquatting Domain', status: IncidentStatus.NEW, confidence: 72, region: 'EU', threatActor: 'FIN7', reputation: 45, score: 55, tags: ['Phishing'], origin: 'External' },
  { id: '5' as ThreatId, indicator: '10.20.0.55', type: 'IP Address', severity: Severity.HIGH, lastSeen: '3 hours ago', source: 'IDS-Core', description: 'Lateral Movement (SMB) targeting HQ-DC-01', status: IncidentStatus.CONTAINED, confidence: 91, region: 'Internal', threatActor: 'Insider-01', reputation: 10, score: 62, tags: ['Exploit', 'Insider'], origin: 'Internal' },
  { id: '6' as ThreatId, indicator: 'login-microsoft-auth.com', type: 'URL', severity: Severity.HIGH, lastSeen: '5 hours ago', source: 'Email Gateway', description: 'Credential Harvesting Page', status: IncidentStatus.NEW, confidence: 88, region: 'Global', threatActor: 'Unknown', reputation: 20, score: 75, tags: ['Phishing'], origin: 'External' },
  { id: '7' as ThreatId, indicator: 'CVE-2023-44487', type: 'Exploit', severity: Severity.CRITICAL, lastSeen: '1 day ago', source: 'WAF', description: 'HTTP/2 Rapid Reset Attack on WEB-PUBLIC-02', status: IncidentStatus.INVESTIGATING, confidence: 95, region: 'NA', threatActor: 'DDoS-Group', reputation: 100, score: 92, tags: ['Exploit', 'DDoS', 'Zero-Day'], origin: 'External' },
  { id: '8' as ThreatId, indicator: '4.4.4.4', type: 'IP Address', severity: Severity.HIGH, lastSeen: 'Just now', source: 'HONEYPOT-DECOY-01', description: 'Unauthorized access to decoy sensor', status: IncidentStatus.NEW, confidence: 100, region: 'Internal', threatActor: 'Unknown', reputation: 0, score: 100, tags: ['Honeypot', 'Recon'], origin: 'Internal' },
  { id: '9' as ThreatId, indicator: 'b4d...c3f1', type: 'File Hash', severity: Severity.HIGH, lastSeen: '2 days ago', source: 'EDR-East', description: 'CobaltStrike payload detected', status: IncidentStatus.CLOSED, confidence: 99, region: 'NA', threatActor: 'APT-29', reputation: 90, score: 95, tags: ['Malware', 'C2'], origin: 'Internal' },
];

export const MOCK_ACTORS: ThreatActor[] = [
  { id: 'a1' as ActorId, name: 'APT-29', aliases: ['Cozy Bear'], origin: 'Russia', description: 'SVR affiliated group known for stealthy and sophisticated operations against government and diplomatic targets.', sophistication: 'Advanced', targets: ['Gov', 'Energy'], campaigns: ['SolarWinds'], ttps: [{id:'ttp-1', code:'T1195', name:'Phishing'}], infrastructure: [], exploits: ['CVE-2023-23397'], references: [], history: [], evasionTechniques: ['Rootkit', 'Fileless Malware'] },
  { id: 'a2' as ActorId, name: 'Lazarus', aliases: ['Hidden Cobra'], origin: 'DPRK', description: 'State-sponsored cybercrime and espionage group, primarily targeting financial institutions.', sophistication: 'Advanced', targets: ['Finance'], campaigns: ['WannaCry', 'Operation GhostNet'], ttps: [], infrastructure: [], exploits: ['CVE-2023-34362'], references: [], history: [], evasionTechniques: ['Anti-VM'] },
  { id: 'a3' as ActorId, name: 'FIN7', aliases: [], origin: 'Eastern Europe', description: 'Financially motivated group known for targeting point-of-sale systems and deploying ransomware.', sophistication: 'Moderate', targets: ['Retail', 'Hospitality'], campaigns: [], ttps: [], infrastructure: [], exploits: [], references: [], history: [], evasionTechniques: [] },
  { id: 'a4' as ActorId, name: 'Insider-01', aliases: [], origin: 'Internal', description: 'Internal threat actor with privileged access.', sophistication: 'Low', targets: ['Finance'], campaigns: [], ttps: [], infrastructure: [], exploits: [], references: [], history: [], evasionTechniques: [] },
  { id: 'a5' as ActorId, name: 'LockBit', aliases: ['Bitwise Spider'], origin: 'Russia', description: 'Ransomware-as-a-Service (RaaS) group known for double extortion tactics.', sophistication: 'Advanced', targets: ['Finance', 'Healthcare'], campaigns: ['Operation Serpent Scale'], ttps: [], infrastructure: [], exploits: [], references: [], history: [], evasionTechniques: [] }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'CAM-001', name: 'SolarWinds Supply Chain', description: 'Widespread supply chain attack targeting government and tech sectors.', status: 'ARCHIVED', objective: 'ESPIONAGE', actors: ['APT-29'], firstSeen: '2020-03-01', lastSeen: '2021-02-28', targetSectors: ['Gov', 'Tech'], targetRegions: ['Global'], threatIds: ['1', '9'], ttps: ['T1195'] },
  { id: 'CAM-002', name: 'Operation Serpent Scale', description: 'Ongoing ransomware campaign targeting financial institutions using LockBit.', status: 'ACTIVE', objective: 'FINANCIAL_GAIN', actors: ['LockBit'], firstSeen: '2023-08-15', lastSeen: '2023-10-27', targetSectors: ['Finance'], targetRegions: ['Global'], threatIds: ['2'], ttps: ['T1486'] },
  { id: 'CAM-003', name: 'Operation GhostNet', description: 'Large-scale cyber espionage operation targeting government ministries and embassies.', status: 'ACTIVE', objective: 'ESPIONAGE', actors: ['Lazarus'], firstSeen: '2022-01-01', lastSeen: '2023-09-30', targetSectors: ['Gov'], targetRegions: ['APAC'], threatIds: [], ttps: ['T1204'] }
];

export const MOCK_CASES: Case[] = [
  { id: 'CASE-23-001' as CaseId, title: 'Operation Blue Horizon', description: 'Investigation into coordinated phishing campaign targeting executives.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Analyst.Doe', reporter: 'System', created: '2023-10-25', relatedThreatIds: ['1', '3', '6'], findings: 'Confirmed C2 activity from multiple endpoints.', 
    tasks: [{id: 't1', title: 'Isolate affected workstations', status: 'DONE'}, {id: 't2', title: 'Force password reset for HR group', status: 'PENDING'}], 
    notes: [{id:'n1', author: 'J. Doe', date: '10/26/23', content: 'Initial compromise vector appears to be spearphishing email.'}], 
    artifacts: [{id: 'art-1', name: 'phish.eml', type: 'EMAIL', size:'12KB', uploadedBy:'System', uploadDate: '10/25/23'}],
    timeline: [{id:'ev1', date:'10/25/23', title:'Initial Alert', type:'ALERT'}],
    agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Phishing'], tlp: 'AMBER' },
  { id: 'CASE-23-002' as CaseId, title: 'Internal Data Exfil - Finance', description: 'Anomalous outbound traffic from FIN-DB-CLUSTER to unknown external IP.', status: 'OPEN', priority: 'CRITICAL', assignee: 'admin.connor', reporter: 'system', created: '2023-10-26', relatedThreatIds: ['5'], findings: '', 
    tasks: [{id:'t3', title:'Block exfil IP on perimeter firewall', status: 'PENDING'}],
    notes: [], artifacts: [], timeline: [],
    agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: ['FBI_CYBER'], labels: ['Insider'], tlp: 'AMBER', slaBreach: true },
  { id: 'CASE-23-003' as CaseId, title: 'LockBit Ransomware on DC', description: 'Ransomware payload detected and quarantined on HQ-DC-01. No encryption reported yet.', status: 'OPEN', priority: 'CRITICAL', assignee: 'Analyst.Doe', reporter: 'EDR', created: '2023-10-27', relatedThreatIds: ['2'], findings: '', tasks: [], notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Ransomware'], tlp: 'RED' }
];

export const MOCK_INCIDENT_REPORTS: IncidentReport[] = [
  { id: 'RPT-884', title: 'Weekly Threat Summary', type: 'Executive', date: '2023-10-27', author: 'System', status: 'READY', content: 'Summary of all high-severity threats for the week.' },
  { id: 'RPT-885', title: 'Forensic Report: Op Blue Horizon', type: 'Forensic', date: '2023-10-26', author: 'AI-Assist', status: 'DRAFT', content: '...', relatedCaseId: 'CASE-23-001' as CaseId },
  { id: 'RPT-886', title: 'APT-29 Profile Update', type: 'Technical', date: '2023-10-25', author: 'Analyst.Doe', status: 'READY', content: 'New TTPs observed...', relatedActorId: 'a1' as ActorId }
];

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  { id: 'L-1001', action: 'LOGIN_SUCCESS', user: 'admin.connor', timestamp: new Date(Date.now() - 10000).toISOString(), details: 'Method: MFA', location: '10.0.0.5' },
  { id: 'L-1002', action: 'CASE_UPDATE', user: 'Analyst.Doe', timestamp: new Date(Date.now() - 60000).toISOString(), details: 'Set status of CASE-23-001 to IN_PROGRESS', location: '192.168.1.100' },
  { id: 'L-1003', action: 'LOGIN_FAIL', user: 'root', timestamp: new Date(Date.now() - 120000).toISOString(), details: 'Invalid credentials', location: '8.8.8.8' },
  { id: 'L-1004', action: 'FIREWALL_BLOCK', user: 'System', timestamp: new Date(Date.now() - 300000).toISOString(), details: 'Blocked 1.2.3.4 based on Threat Feed', location: 'FW-PROD-01' },
  { id: 'L-1005', action: 'REPORT_GEN', user: 'admin.connor', timestamp: new Date(Date.now() - 600000).toISOString(), details: 'Generated Executive report RPT-884', location: '10.0.0.5' },
  { id: 'L-1006', action: 'DATA_EXPORT', user: 'auditor.smith', timestamp: new Date(Date.now() - 720000).toISOString(), details: 'Exported 1500 records from Audit Log', location: '10.0.0.22' },
  { id: 'L-1007', action: 'PLAYBOOK_EXEC', user: 'System', timestamp: new Date(Date.now() - 800000).toISOString(), details: 'Executed Phishing Response on CASE-23-001', location: 'SOAR-ENGINE' },
  { id: 'L-1008', action: 'CONFIG_CHANGE', user: 'admin.connor', timestamp: new Date(Date.now() - 900000).toISOString(), details: 'Changed threat level to ELEVATED', location: '10.0.0.5' },
  { id: 'L-1009', action: 'USER_PROVISIONED', user: 'admin.connor', timestamp: new Date(Date.now() - 1200000).toISOString(), details: 'Created new user: temp.user', location: '10.0.0.5' },
  { id: 'L-1010', action: 'PERMISSION_FAIL', user: 'auditor.smith', timestamp: new Date(Date.now() - 1500000).toISOString(), details: 'Attempted to execute playbook', location: '10.0.0.22' },
  { id: 'L-1011', action: 'API_KEY_CREATED', user: 'admin.connor', timestamp: new Date(Date.now() - 1800000).toISOString(), details: 'Provisioned key for Splunk', location: '10.0.0.5' },
  { id: 'L-1012', action: 'THREAT_STATUS', user: 'Analyst.Doe', timestamp: new Date(Date.now() - 2000000).toISOString(), details: 'Set status of threat 2 to INVESTIGATING', location: '192.168.1.100' },
  { id: 'L-1013', action: 'EVIDENCE_CHECK_IN', user: 'Analyst.Doe', timestamp: new Date(Date.now() - 2200000).toISOString(), details: 'Checked in artifact art-1', location: '192.168.1.100' },
  { id: 'L-1014', action: 'SYSTEM_MAINTENANCE', user: 'System', timestamp: new Date(Date.now() - 3600000).toISOString(), details: 'DB Vacuum completed', location: 'localhost' },
  { id: 'L-1015', action: 'SIMULATION_RUN', user: 'admin.connor', timestamp: new Date(Date.now() - 4000000).toISOString(), details: 'Executed Breach Sim for APT-29', location: '10.0.0.5' },
];

export const MOCK_PLAYBOOKS: Playbook[] = [
  { id: 'pb1', name: 'Phishing Response', description: 'Standard procedure for phishing emails.', tasks: ['Analyze Email', 'Block Domain', 'Reset Creds'], triggerLabel: 'Phishing', riskLevel: 'LOW', usageCount: 12 },
  { id: 'pb2', name: 'Ransomware Isolation', description: 'Immediate network segregation and containment.', tasks: ['Sever Network', 'Snapshot VM', 'Page On-Call'], triggerLabel: 'Ransomware', riskLevel: 'HIGH', usageCount: 5 },
  { id: 'pb3', name: 'Lateral Movement Block', description: 'Blocks east-west traffic for compromised user.', tasks: ['Isolate User Account', 'Scan Adjacent Hosts', 'Analyze Firewall Logs'], triggerLabel: 'Lateral Movement', riskLevel: 'MEDIUM', usageCount: 2 }
];

export const MOCK_HONEYTOKENS: Honeytoken[] = [
  { id: 'h1', name: 'admin_creds_backup.txt', type: 'FILE', location: 'FileShare-01', status: 'ACTIVE', effectiveness: 85 },
  { id: 'h2', name: 'prod_db_connection.config', type: 'FILE', location: 'Dev-Server-04', status: 'TRIGGERED', effectiveness: 95, lastTriggered: '2023-10-27 10:00:00' },
  { id: 'h3', name: 'root@ssh-gateway', type: 'CREDENTIAL', location: 'Password Vault', status: 'DORMANT', effectiveness: 60 }
];

export const MOCK_CHAIN: ChainEvent[] = [
  { id: 'c1', date: '2023-10-27 08:30', artifactId: 'art-1', artifactName: 'phish.eml', action: 'CHECK_IN', user: 'J. Doe', notes: 'Recovered from Outlook' },
  { id: 'c2', date: '2023-10-27 09:15', artifactId: 'art-1', artifactName: 'phish.eml', action: 'CHECK_OUT', user: 'admin.connor', notes: 'Forensic analysis' }
];

export const MOCK_MALWARE: Malware[] = [
  { id: 'm1', name: 'invoice.exe', family: 'LockBit', hash: 'e3b0c442...', verdict: 'MALICIOUS', score: 100, associatedActor: 'LockBit' },
  { id: 'm2', name: 'update.dll', family: 'CobaltStrike', hash: 'a1b2c3d4...', verdict: 'MALICIOUS', score: 95, associatedActor: 'APT-29' },
  { id: 'm3', name: 'payload.js', family: 'WannaCry', hash: 'f5e6a7b8...', verdict: 'MALICIOUS', score: 98, associatedActor: 'Lazarus' }
];

export const MOCK_LAB_JOBS: ForensicJob[] = [ 
  { id: 'j1', type: 'Disk Imaging', target: 'Server-01', status: 'PROCESSING', progress: 45, technician: 'Stark' },
  { id: 'j2', type: 'Memory Dump', target: 'Workstation-HR-05', status: 'COMPLETED', progress: 100, technician: 'Banner' },
  { id: 'j3', type: 'Log Correlation', target: 'CASE-23-001', status: 'QUEUED', progress: 0, technician: 'System' }
];

export const MOCK_DEVICES: Device[] = [ 
  { id: 'd1', name: 'CEO iPhone', type: 'Mobile', serial: 'SN-9988', custodian: 'Vault', status: 'SECURE' },
  { id: 'd2', name: 'Compromised Laptop', type: 'Laptop', serial: 'SN-1234', custodian: 'Lab', status: 'QUARANTINED' }
];

export const MOCK_PCAPS: Pcap[] = [ 
  { id: 'p1', name: 'beacon.pcap', size: '15MB', date: '2023-10-27', source: 'FW', protocol: 'TCP', analysisStatus: 'ANALYZED', associatedActor: 'APT-29' },
  { id: 'p2', name: 'exfil.pcap', size: '152MB', date: '2023-10-26', source: 'IDS', protocol: 'DNS', analysisStatus: 'PENDING' }
];

export const MOCK_VENDOR_FEEDS: VendorFeedItem[] = [ { id: 'v1', vendor: 'Microsoft MSRC', date: '2023-10-25', title: 'Security Update Guide - October', severity: 'High' } ];
export const MOCK_SCANNERS: ScannerStatus[] = [ { id: 's1', name: 'Nessus Pro', status: 'ONLINE', lastScan: '2 hours ago', coverage: '98%', findings: 12 } ];
export const MOCK_TACTICS: MitreItem[] = [ { id: 'TA0001', name: 'Initial Access', description: 'Trying to get into your network.' } ];
export const MOCK_TECHNIQUES: MitreItem[] = [ { id: 'T1566', name: 'Phishing', tactic: 'Initial Access', description: 'Sends emails with malicious links.' } ];
export const MOCK_SUB_TECHNIQUES: MitreItem[] = [ { id: 'T1566.001', name: 'Spearphishing Attachment', parent: 'T1566', description: 'Phishing with attachment.' } ];
export const MOCK_GROUPS: MitreItem[] = [ { id: 'G0007', name: 'APT28', aliases: ['Fancy Bear'], description: 'Russian GRU.' } ];
export const MOCK_SOFTWARE: MitreItem[] = [ { id: 'S0002', name: 'Mimikatz', type: 'Tool', description: 'Credential dumper.' } ];
export const MOCK_MITIGATIONS: MitreItem[] = [ { id: 'M1050', name: 'Exploit Protection', description: 'Use ASLR and DEP.' } ];
export const MOCK_DOMAIN: OsintDomain[] = [ { id: 'd1', domain: 'evil.com', registrar: 'BadHost', created: '2023-10', expires: '2024-10', dns: '1.2.3.4', status: 'Active', subdomains: ['mail.'], ssl: 'Valid' } ];
export const MOCK_BREACH: OsintBreach[] = [ { id: 'br1', email: 'ceo@target.com', breach: 'LinkedIn', date: '2016', data: 'Pass', hash: '5f4d...', source: 'Leak' } ];
export const MOCK_SOCIAL: OsintSocial[] = [ { id: 'soc1', handle: '@threat', platform: 'Twitter', status: 'Active', followers: 1200, lastPost: '2h', sentiment: 'Neg', bio: 'Researcher' } ];
export const MOCK_GEO: OsintGeo[] = [ { id: 'geo1', ip: '185.200.1.1', city: 'Moscow', country: 'RU', isp: 'Tel', asn: 'AS123', coords: '55,37', ports: [80], threatScore: 85 } ];
export const MOCK_DARKWEB: OsintDarkWebItem[] = [ { id: 'dw1', source: 'Raid', title: 'DB Leak', date: '2023', author: 'GodSpeed', status: 'Verified', price: '$500' } ];
export const MOCK_META: OsintFileMeta[] = [ { id: 'meta-1', name: 'inv.pdf', size: '1MB', type: 'PDF', author: 'Unknown', created: '2023', gps: 'None' } ];
export const MOCK_INTEGRATIONS: Integration[] = [ { id: 'i1', name: 'CrowdStrike', status: 'Connected', type: 'EDR', desc: 'Endpoint detection and response.' } ];
export const MOCK_PATCH_STATUS: PatchStatus[] = [ { id: 'ps1', system: 'Workstations (Windows)', total: 450, patched: 442, compliance: 98, criticalPending: 2 } ];
export const MOCK_API_KEYS: ApiKey[] = [ { id: 'k1', name: 'VirusTotal Connector', prefix: 'vt-prod-***', created: '2023-01-15', lastUsed: '2m ago', scopes: ['READ', 'WRITE'], status: 'ACTIVE' } ];
export const MOCK_ENRICHMENT: EnrichmentModule[] = [ { id: 'e1', name: 'GeoIP Resolution', type: 'GEO', provider: 'MaxMind', costPerRequest: 0.0001, latencyMs: 5, enabled: true } ];
export const MOCK_PARSERS: ParserRule[] = [ { id: 'p1', name: 'Apache Access Log', sourceType: 'Web Server', pattern: '([\\d.]+) - - \\[.*\\] "(\\w+) (.*?) HTTP/1.1" (\\d+) (\\d+)', sampleLog: '192.168.1.50 - - [10/Oct/2023:13:55:36 -0700] "GET /admin/config.php HTTP/1.1" 200 2326', status: 'ACTIVE', performance: 'FAST' } ];
export const MOCK_NORMALIZATION: NormalizationRule[] = [ { id: 'n1', sourceField: 'c-ip', targetField: 'client.ip', transform: 'NONE', validation: 'VALID' } ];
export const MOCK_POLICIES: SegmentationPolicy[] = [ { id: 'pol-1', name: 'Isolate Payment DB', source: '*', destination: 'PROD-DB-PAYMENT', port: '5432', action: 'DENY', status: 'ACTIVE' } ];
export const MOCK_TRAFFIC_FLOWS: TrafficFlow[] = [ { id: 'fl-1', source: '192.168.1.5 (DEV)', dest: '10.0.0.50 (PROD-DB)', port: '5432', allowed: true, timestamp: '10:00:01' } ];
export const MOCK_RISK_FORECAST = [ { id: 'rf1', day: 'Today', risk: 3, label: 'High' }, { id: 'rf2', day: '+1 Day', risk: 4, label: 'Critical' } ];
// FIX: Export MOCK_NIST_CONTROLS, which was defined but not exported.
export const MOCK_NIST_CONTROLS: NistControl[] = [ { id: 'AC-1', family: 'Access Control', name: 'Access Control Policy', status: 'IMPLEMENTED', lastAudit: '2023-Q3', description: '...' } ];
