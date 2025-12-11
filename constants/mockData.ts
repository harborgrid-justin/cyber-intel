
import { 
    Threat, Severity, IncidentStatus, SystemNode, AuditLog, Case, IoCFeed, ThreatActor, 
    Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, Vulnerability, MitreItem, 
    OsintDomain, OsintBreach, OsintSocial, OsintGeo, SystemUser, Integration, 
    IncidentReport, Campaign, PatchStatus, ScannerStatus, VendorFeedItem, ReportSection, 
    Vendor, NistControl, ApiKey, EnrichmentModule, ParserRule, NormalizationRule, 
    SegmentationPolicy, Honeytoken, TrafficFlow, OsintDarkWebItem, OsintFileMeta,
    ThreatId, CaseId, ActorId, UserId, AssetId, VendorId
} from '../types';

export const MOCK_THREATS: Threat[] = [
  { id: '1' as ThreatId, indicator: '192.168.1.105', type: 'IP Address', severity: Severity.CRITICAL, lastSeen: '2 mins ago', source: 'FW-01', description: 'C2 Beaconing Detected', status: IncidentStatus.NEW, confidence: 98, region: 'APAC', threatActor: 'APT-29', reputation: 95, score: 96, tags: ['Botnet', 'C2'], origin: 'External' },
  { id: '2' as ThreatId, indicator: '7a0d...8f2b', type: 'File Hash', severity: Severity.HIGH, lastSeen: '15 mins ago', source: 'EDR-West', description: 'Ransomware.LockBit Variant', status: IncidentStatus.INVESTIGATING, confidence: 85, region: 'NA', threatActor: 'LockBit', reputation: 90, score: 88, tags: ['Ransomware', 'Malware'], origin: 'Internal' },
  { id: '3' as ThreatId, indicator: 'update-sys-win.com', type: 'Domain', severity: Severity.MEDIUM, lastSeen: '1 hour ago', source: 'DNS-03', description: 'Typosquatting Domain', status: IncidentStatus.NEW, confidence: 72, region: 'EU', threatActor: 'Unknown', reputation: 45, score: 55, tags: ['Phishing'], origin: 'External' },
  { id: '5' as ThreatId, indicator: '10.20.0.55', type: 'IP Address', severity: Severity.HIGH, lastSeen: '3 hours ago', source: 'IDS-Core', description: 'Lateral Movement (SMB)', status: IncidentStatus.CONTAINED, confidence: 91, region: 'LATAM', threatActor: 'Insider?', reputation: 10, score: 62, tags: ['Exploit'], origin: 'Internal' },
  { id: '6' as ThreatId, indicator: 'login-microsoft-auth.com', type: 'URL', severity: Severity.HIGH, lastSeen: '5 hours ago', source: 'Email Gateway', description: 'Credential Harvesting Page', status: IncidentStatus.NEW, confidence: 88, region: 'Global', threatActor: 'Unknown', reputation: 20, score: 75, tags: ['Phishing'], origin: 'External' },
  { id: '7' as ThreatId, indicator: 'CVE-2023-44487', type: 'Exploit', severity: Severity.CRITICAL, lastSeen: '1 day ago', source: 'WAF', description: 'HTTP/2 Rapid Reset Attack', status: IncidentStatus.INVESTIGATING, confidence: 95, region: 'NA', threatActor: 'DDoS-Group', reputation: 100, score: 92, tags: ['Exploit', 'DDoS', 'Zero-Day'], origin: 'External' },
];

export const MOCK_CASES: Case[] = [
  { id: 'CASE-23-001' as CaseId, title: 'Operation Blue Horizon', description: 'Investigation into coordinated phishing campaign.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Analyst.Doe', reporter: 'System', created: '2023-10-25', relatedThreatIds: ['1', '3'], findings: 'Confirmed C2 activity.', tasks: [], notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Phishing'], tlp: 'AMBER' },
  { id: 'CASE-23-002' as CaseId, title: 'Internal Data Exfil - Finance', description: 'Anomalous outbound traffic from Finance subnet.', status: 'OPEN', priority: 'CRITICAL', assignee: 'admin.connor', reporter: 'system', created: '2023-10-26', relatedThreatIds: ['5'], findings: '', tasks: [], notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: ['FBI_CYBER'], labels: ['Insider'], tlp: 'AMBER' }
];

export const MOCK_PLAYBOOKS: Playbook[] = [ { id: 'pb1', name: 'Phishing Response', description: 'Standard procedure.', tasks: ['Analyze Email', 'Block Domain', 'Reset Creds'], triggerLabel: 'Phishing', riskLevel: 'LOW' } ];
export const MOCK_ACTORS: ThreatActor[] = [ { id: 'a1' as ActorId, name: 'APT-29', aliases: ['Cozy Bear'], origin: 'Russia', description: 'SVR affiliated.', sophistication: 'Advanced', targets: ['Gov', 'Energy'], campaigns: ['SolarWinds'], ttps: [], infrastructure: [], exploits: [], references: [], history: [], evasionTechniques: [] } ];
export const MOCK_CAMPAIGNS: Campaign[] = [ { id: 'CAM-001', name: 'SolarWinds Supply Chain', description: 'Widespread supply chain attack.', status: 'ARCHIVED', objective: 'ESPIONAGE', actors: ['APT-29'], firstSeen: '2020-03-01', lastSeen: '2021-02-28', targetSectors: ['Gov', 'Tech'], targetRegions: ['NA'], threatIds: ['1'], ttps: ['T1195'] } ];
export const MOCK_FEEDS: IoCFeed[] = [ { id: 'f1', name: 'AlienVault OTX', url: 'https://otx.alienvault.com', type: 'STIX/TAXII', status: 'ACTIVE', interval: 60, lastSync: '10 mins ago' } ];
export const MOCK_AUDIT_LOGS: AuditLog[] = [ { id: 'L-1001', action: 'LOGIN_SUCCESS', user: 'admin', timestamp: '2023-10-27 08:00:01', details: 'Method: MFA', location: '10.0.0.5' } ];
export const MOCK_VULNERABILITIES: Vulnerability[] = [ { id: 'CVE-2023-23397', score: 9.8, name: 'Outlook EoP', status: 'PATCHED', vendor: 'Microsoft', vectors: 'Network', zeroDay: false, exploited: true } ];
export const SYSTEM_NODES: SystemNode[] = [ { id: 'n1' as AssetId, name: 'SENSOR-ALPHA', status: 'ONLINE', load: 45, latency: 12, type: 'Sensor', vendor: 'Cisco', securityControls: ['FIREWALL'], dataSensitivity: 'INTERNAL', dataVolumeGB: 5 } ];
export const MOCK_USERS: SystemUser[] = [ { id: 'U1' as UserId, name: 'Adm. S. Connor', username: 'admin.connor', roleId: 'ROLE-ADMIN', role: 'Administrator', clearance: 'TS', status: 'Online', isVIP: true, effectivePermissions: ['*:*'] }, { id: 'U2' as UserId, name: 'J. Doe', username: 'j.doe', roleId: 'ROLE-ANALYST', role: 'Analyst', clearance: 'Secret', status: 'Busy', effectivePermissions: ['threat:read', 'case:read'] } ];
export const MOCK_VENDORS: Vendor[] = [ { id: 'v1' as VendorId, name: 'Microsoft', product: 'Azure & O365', riskScore: 15, tier: 'Strategic', category: 'Cloud', hqLocation: 'USA', activeVulns: 2, campaignsTargeting: 5, sbom: [], compliance: [], access: [], subcontractors: [] } ];
export const MOCK_NIST_CONTROLS: NistControl[] = [ { id: 'AC-2', family: 'AC', name: 'Account Management', status: 'IMPLEMENTED', lastAudit: '2023-10-01', description: 'The organization manages information system accounts.' } ];
export const MOCK_API_KEYS: ApiKey[] = [ { id: 'k1', name: 'VirusTotal Connector', prefix: 'vt-prod-***', created: '2023-01-15', lastUsed: '2m ago', scopes: ['READ', 'WRITE'], status: 'ACTIVE' } ];
export const MOCK_ENRICHMENT: EnrichmentModule[] = [ { id: 'e1', name: 'GeoIP Resolution', type: 'GEO', provider: 'MaxMind', costPerRequest: 0.0001, latencyMs: 5, enabled: true } ];
export const MOCK_PARSERS: ParserRule[] = [ { id: 'p1', name: 'Apache Access Log', sourceType: 'Web Server', pattern: '([\\d.]+) - - \\[.*\\] "(\\w+) (.*?) HTTP/1.1" (\\d+) (\\d+)', sampleLog: '192.168.1.50 - - [10/Oct/2023:13:55:36 -0700] "GET /admin/config.php HTTP/1.1" 200 2326', status: 'ACTIVE', performance: 'FAST' } ];
export const MOCK_NORMALIZATION: NormalizationRule[] = [ { id: 'n1', sourceField: 'c-ip', targetField: 'client.ip', transform: 'NONE', validation: 'VALID' } ];
export const MOCK_POLICIES: SegmentationPolicy[] = [ { id: 'pol-1', name: 'Isolate Payment DB', source: '*', destination: 'PROD-DB-PAYMENT', port: '5432', action: 'DENY', status: 'ACTIVE' } ];
export const MOCK_HONEYTOKENS: Honeytoken[] = [ { id: 'h1', name: 'admin_creds_backup.txt', type: 'FILE', location: 'FileShare-01', status: 'ACTIVE', effectiveness: 85 } ];
export const MOCK_TRAFFIC_FLOWS: TrafficFlow[] = [ { id: 'fl-1', source: '192.168.1.5 (DEV)', dest: '10.0.0.50 (PROD-DB)', port: '5432', allowed: true, timestamp: '10:00:01' } ];
export const MOCK_RISK_FORECAST = [ { id: 'rf1', day: 'Today', risk: 3, label: 'High' }, { id: 'rf2', day: '+1 Day', risk: 4, label: 'Critical' } ];
export const MOCK_INTEGRATIONS: Integration[] = [ { id: 'i1', name: 'CrowdStrike', status: 'Connected', type: 'EDR', desc: 'Endpoint detection and response.' } ];
export const MOCK_PATCH_STATUS: PatchStatus[] = [ { id: 'ps1', system: 'Workstations (Windows)', total: 450, patched: 442, compliance: 98, criticalPending: 2 } ];
export const MOCK_SCANNERS: ScannerStatus[] = [ { id: 's1', name: 'Nessus Pro', status: 'ONLINE', lastScan: '2 hours ago', coverage: '98%', findings: 12 } ];
export const MOCK_VENDOR_FEEDS: VendorFeedItem[] = [ { id: 'v1', vendor: 'Microsoft MSRC', date: '2023-10-25', title: 'Security Update Guide - October', severity: 'High' } ];
export const REPORT_BOILERPLATE: Record<string, ReportSection[]> = { FEDRAMP: [ { id: 'h1', title: 'HEADER', content: 'FEDRAMP PLAN OF ACTION AND MILESTONES (POA&M)\nTEMPLATE VERSION 2.0' } ] };
export const MOCK_TEMPLATES = [ { id: 'FEDRAMP', name: 'FedRAMP POAM', desc: 'Plan of Action and Milestones.', icon: '🏛️' } ];
export const MOCK_CHAIN: ChainEvent[] = [ { id: 'c1', date: '2023-10-27 08:30', artifactId: 'a1', artifactName: 'payload.bin', action: 'CHECK_IN', user: 'Doe', notes: 'Recovered' } ];
export const MOCK_MALWARE: Malware[] = [ { id: 'm1', name: 'invoice.exe', family: 'LockBit', hash: 'e3b0c442...', verdict: 'MALICIOUS', score: 100 } ];
export const MOCK_LAB_JOBS: ForensicJob[] = [ { id: 'j1', type: 'Disk Imaging', target: 'Server-01', status: 'PROCESSING', progress: 45, technician: 'Stark' } ];
export const MOCK_DEVICES: Device[] = [ { id: 'd1', name: 'CEO iPhone', type: 'Mobile', serial: 'SN-9988', custodian: 'Vault', status: 'SECURE' } ];
export const MOCK_PCAPS: Pcap[] = [ { id: 'p1', name: 'beacon.pcap', size: '15MB', date: '2023-10-27', source: 'FW', protocol: 'TCP', analysisStatus: 'ANALYZED' } ];
export const MOCK_INCIDENT_REPORTS: IncidentReport[] = [ { id: 'RPT-884', title: 'Weekly Threat', type: 'Executive', date: '2023-10-27', author: 'System', status: 'READY', content: '...' } ];
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
