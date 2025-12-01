
import { Threat, Severity, IncidentStatus, SystemNode, AuditLog, Case, IoCFeed, ThreatActor, Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, Vulnerability, MitreItem, OsintDomain, OsintBreach, OsintSocial, OsintGeo, SystemUser, Integration, IncidentReport, Campaign } from './types';

// ... Existing Mocks ...
export const MOCK_THREATS: Threat[] = [
  { id: '1', indicator: '192.168.1.105', type: 'IP Address', severity: Severity.CRITICAL, lastSeen: '2 mins ago', source: 'FW-01', description: 'C2 Beaconing Detected', status: IncidentStatus.NEW, confidence: 98, region: 'APAC', threatActor: 'APT-29', reputation: 95, score: 96, tlp: 'RED', mlRetrain: true, tags: ['Botnet', 'C2'] },
  { id: '2', indicator: '7a0d...8f2b', type: 'File Hash', severity: Severity.HIGH, lastSeen: '15 mins ago', source: 'EDR-West', description: 'Ransomware.LockBit Variant', status: IncidentStatus.INVESTIGATING, confidence: 85, region: 'NA', threatActor: 'LockBit', reputation: 90, score: 88, tlp: 'AMBER', tags: ['Ransomware', 'Malware'] },
  { id: '3', indicator: 'update-sys-win.com', type: 'Domain', severity: Severity.MEDIUM, lastSeen: '1 hour ago', source: 'DNS-03', description: 'Typosquatting Domain', status: IncidentStatus.NEW, confidence: 72, region: 'EU', threatActor: 'Unknown', reputation: 45, score: 55, tlp: 'GREEN', tags: ['Phishing'] },
  { id: '5', indicator: '10.20.0.55', type: 'IP Address', severity: Severity.HIGH, lastSeen: '5 hours ago', source: 'IDS-Core', description: 'Lateral Movement (SMB)', status: IncidentStatus.CONTAINED, confidence: 91, region: 'LATAM', threatActor: 'Insider?', reputation: 10, score: 62, tlp: 'RED', tags: ['Exploit'] },
  { id: '6', indicator: 'login-microsoft-auth.com', type: 'URL', severity: Severity.HIGH, lastSeen: '10 mins ago', source: 'Email Gateway', description: 'Credential Harvesting Page', status: IncidentStatus.NEW, confidence: 88, region: 'Global', threatActor: 'Unknown', reputation: 20, score: 75, tlp: 'GREEN', tags: ['Phishing'] },
  { id: '7', indicator: 'CVE-2023-44487', type: 'Exploit', severity: Severity.CRITICAL, lastSeen: '30 mins ago', source: 'WAF', description: 'HTTP/2 Rapid Reset Attack', status: IncidentStatus.INVESTIGATING, confidence: 95, region: 'NA', threatActor: 'DDoS-Group', reputation: 100, score: 92, tlp: 'CLEAR', tags: ['Exploit', 'DDoS', 'Zero-Day'] },
  { id: '8', indicator: 'darkweb-leak-db.onion', type: 'Domain', severity: Severity.MEDIUM, lastSeen: '1 day ago', source: 'Dark Web Monitor', description: 'Employee Credential Dump', status: IncidentStatus.NEW, confidence: 100, region: 'Dark Web', threatActor: 'Broker', reputation: 60, score: 65, tlp: 'RED', tags: ['Dark Web', 'Leak'] },
  { id: '9', indicator: 'mirai-loader.sh', type: 'File Name', severity: Severity.HIGH, lastSeen: '2 hours ago', source: 'Honeypot', description: 'Mirai Botnet Dropper', status: IncidentStatus.NEW, confidence: 99, region: 'Asia', threatActor: 'Botnet Operator', reputation: 90, score: 85, tlp: 'GREEN', tags: ['Botnet', 'Malware'] },
  { id: '10', indicator: 'vuln-vpn-appliance', type: 'Vulnerability', severity: Severity.CRITICAL, lastSeen: 'Just now', source: 'Scanner', description: 'Unpatched Zero-Day in Edge Device', status: IncidentStatus.NEW, confidence: 60, region: 'Internal', threatActor: 'Unknown', reputation: 0, score: 95, tlp: 'RED', tags: ['Zero-Day', 'Exploit'] }
];

export const MOCK_CASES: Case[] = [
  { 
    id: 'CASE-23-001', 
    title: 'Operation Blue Horizon', 
    description: 'Investigation into coordinated phishing campaign targeting executive leadership.', 
    status: 'IN_PROGRESS', 
    priority: 'HIGH', 
    assignee: 'Analyst.Doe', 
    reporter: 'System', 
    created: '2023-10-25', 
    relatedThreatIds: ['1', '3'], 
    findings: 'Confirmed C2 activity and successful credential harvest.', 
    tasks: [{ id: 't1', title: 'Analyze headers', status: 'DONE' }, { id: 't2', title: 'Reset Credentials', status: 'DONE' }, { id: 't3', title: 'Sweep Mailboxes', status: 'PENDING' }], 
    notes: [], 
    artifacts: [
        { id: 'a1', name: 'phish_email.eml', type: 'EMAIL', size: '24KB', hash: 'a1b2...', uploadedBy: 'System', uploadDate: '2023-10-25' },
        { id: 'a2', name: 'payload.js', type: 'SCRIPT', size: '12KB', hash: 'c3d4...', uploadedBy: 'Analyst.Doe', uploadDate: '2023-10-25' }
    ], 
    timeline: [
        { id: 'tl1', date: '2023-10-25 08:00', title: 'Initial Alert Triggered', type: 'ALERT' },
        { id: 'tl2', date: '2023-10-25 08:15', title: 'Case Opened by System', type: 'SYSTEM' },
        { id: 'tl3', date: '2023-10-25 08:45', title: 'Artifacts Extracted', type: 'ACTION' },
        { id: 'tl4', date: '2023-10-25 09:30', title: 'Threat Actor Attributed: APT-29', type: 'SYSTEM' }
    ], 
    agency: 'SENTINEL_CORE', 
    sharingScope: 'INTERNAL', 
    sharedWith: [], 
    labels: ['Phishing', 'Executive'], 
    tlp: 'AMBER' 
  },
  { 
    id: 'CASE-23-002', 
    title: 'Internal Data Exfil - Finance', 
    description: 'Anomalous outbound traffic detected from Finance subnet via non-standard ports.', 
    status: 'OPEN', 
    priority: 'CRITICAL', 
    assignee: 'Analyst.Smith', 
    reporter: 'DLP_System', 
    created: '2023-10-27', 
    relatedThreatIds: ['5'], 
    findings: 'Initial evidence suggests insider threat using USB storage and cloud upload.', 
    tasks: [{ id: 't4', title: 'Isolate Workstation', status: 'DONE' }, { id: 't5', title: 'Interview Employee', status: 'PENDING' }], 
    notes: [], 
    artifacts: [
        { id: 'a3', name: 'usb_logs.evtx', type: 'LOG', size: '2MB', hash: 'e5f6...', uploadedBy: 'Analyst.Smith', uploadDate: '2023-10-27' }
    ], 
    timeline: [
        { id: 'tl5', date: '2023-10-27 14:00', title: 'DLP Anomaly Detected', type: 'ALERT' },
        { id: 'tl6', date: '2023-10-27 14:05', title: 'Workstation Isolated', type: 'ACTION' }
    ], 
    agency: 'SENTINEL_CORE', 
    sharingScope: 'JOINT_TASK_FORCE', 
    sharedWith: ['FBI_CYBER'], 
    labels: ['Insider', 'DLP'], 
    tlp: 'RED' 
  },
  {
    id: 'CASE-23-003',
    title: 'Ransomware Containment - Server Farm B',
    description: 'LockBit ransomware variant detected on backup servers. Encryption process halted.',
    status: 'IN_PROGRESS',
    priority: 'CRITICAL',
    assignee: 'Hunter.Wayne',
    reporter: 'EDR-West',
    created: '2023-10-26',
    relatedThreatIds: ['2'],
    findings: 'Lateral movement confirmed via SMB.',
    tasks: [{id: 't6', title: 'Verify Backups', status: 'PENDING'}, {id: 't7', title: 'Network Segmentation', status: 'DONE'}],
    notes: [],
    artifacts: [
        { id: 'a4', name: 'ransom_note.txt', type: 'TEXT', size: '1KB', hash: 'ffff...', uploadedBy: 'Hunter.Wayne', uploadDate: '2023-10-26' },
        { id: 'a5', name: 'encryptor_sample.bin', type: 'BINARY', size: '4MB', hash: '1234...', uploadedBy: 'Hunter.Wayne', uploadDate: '2023-10-26' }
    ],
    timeline: [
        { id: 'tl7', date: '2023-10-26 03:00', title: 'File entropy spike detected', type: 'ALERT' },
        { id: 'tl8', date: '2023-10-26 03:01', title: 'EDR Auto-Kill Process', type: 'SYSTEM' },
        { id: 'tl9', date: '2023-10-26 03:15', title: 'Subnet Isolated', type: 'ACTION' }
    ],
    agency: 'SENTINEL_CORE',
    sharingScope: 'INTERNAL',
    sharedWith: [],
    labels: ['Ransomware', 'Crisis'],
    tlp: 'RED'
  }
];

export const MOCK_PLAYBOOKS: Playbook[] = [
  { id: 'pb1', name: 'Phishing Response', description: 'Standard procedure.', tasks: ['Analyze Email', 'Block Domain', 'Reset Creds'], triggerLabel: 'Phishing' },
  { id: 'pb2', name: 'Ransomware Containment', description: 'Isolation protocol.', tasks: ['Isolate Host', 'Snapshot', 'Identify Variant'], triggerLabel: 'Ransomware' },
];
export const MOCK_ACTORS: ThreatActor[] = [
  { 
    id: 'a1', 
    name: 'APT-29', 
    aliases: ['Cozy Bear', 'The Dukes'], 
    origin: 'Russia', 
    description: 'State-sponsored threat actor associated with Russian Foreign Intelligence Service (SVR).', 
    sophistication: 'Advanced', 
    targets: ['Government', 'Energy', 'Think Tanks', 'Healthcare'], 
    campaigns: ['SolarWinds Supply Chain', 'Operation Ghost'], 
    ttps: [{id:'t1', code:'T1093', name:'Process Hollowing'}, {id:'t2', code:'T1021', name:'Remote Services'}, {id:'t3', code:'T1190', name:'Exploit Public-Facing Application'}], 
    infrastructure: [{id: 'i1', value: '185.100.1.1', type: 'C2', status: 'ACTIVE'}], 
    exploits: ['CVE-2021-40444', 'CVE-2020-1472'], 
    references: ['https://attack.mitre.org/groups/G0016/'], 
    history: [
      { date: '2023-09-15', title: 'Embassy Phishing Campaign', description: 'Targeted diplomats.' },
      { date: '2021-04-15', title: 'SolarWinds Attribution', description: 'Officially attributed to SVR.' }
    ] 
  },
  { 
    id: 'a2', 
    name: 'Lazarus', 
    aliases: ['Hidden Cobra'], 
    origin: 'DPRK', 
    description: 'North Korean state-sponsored cybercrime group.', 
    sophistication: 'Advanced', 
    targets: ['Finance', 'Cryptocurrency', 'Defense'], 
    campaigns: ['WannaCry', 'Operation Dream Job'], 
    ttps: [{id:'t4', code:'T1486', name:'Data Encrypted for Impact'}], 
    infrastructure: [], 
    exploits: [], 
    references: [], 
    history: [
      { date: '2022-03-29', title: 'Ronin Bridge Heist', description: 'Stole $625M in cryptocurrency.' },
      { date: '2017-05-12', title: 'WannaCry Outbreak', description: 'Global ransomware worm.' }
    ] 
  }
];
export const MOCK_CAMPAIGNS: Campaign[] = [
  {
    id: 'CAM-001',
    name: 'SolarWinds Supply Chain',
    description: 'Widespread supply chain attack compromising SolarWinds Orion software updates to distribute SUNBURST backdoor.',
    status: 'ARCHIVED',
    objective: 'ESPIONAGE',
    actors: ['APT-29'],
    firstSeen: '2020-03-01',
    lastSeen: '2021-02-28',
    targetSectors: ['Government', 'Technology', 'Telecom'],
    targetRegions: ['NA', 'EU'],
    threatIds: ['1'],
    ttps: ['T1195.002', 'T1021.002']
  },
  {
    id: 'CAM-002',
    name: 'Operation Dream Job',
    description: 'Lazarus Group campaign targeting defense and aerospace employees with fake job offers to deploy malware.',
    status: 'ACTIVE',
    objective: 'ESPIONAGE',
    actors: ['Lazarus'],
    firstSeen: '2022-06-15',
    lastSeen: '2023-10-27',
    targetSectors: ['Defense', 'Aerospace'],
    targetRegions: ['Global'],
    threatIds: [],
    ttps: ['T1566.002', 'T1204.002']
  }
];

export const MOCK_FEEDS: IoCFeed[] = [{ id: 'f1', name: 'AlienVault OTX', url: 'https://otx.alienvault.com', type: 'STIX/TAXII', status: 'ACTIVE', interval: 60, lastSync: '10 mins ago' }];
export const MOCK_AUDIT_LOGS: AuditLog[] = [{ id: 'l1', action: 'LOGIN_SUCCESS', user: 'admin', timestamp: '10-27 08:00', details: 'IP: 10.0.0.2' }];
export const MOCK_VULNERABILITIES: Vulnerability[] = [
  { id: 'CVE-2023-23397', score: 9.8, name: 'Outlook EoP', status: 'PATCHED', vendor: 'Microsoft', vectors: 'Network', zeroDay: false, exploited: true },
  { id: 'CVE-2023-34362', score: 9.8, name: 'MOVEit SQLi', status: 'UNPATCHED', vendor: 'Progress', vectors: 'Web', zeroDay: true, exploited: true },
  { id: 'CVE-2023-4863', score: 8.8, name: 'WebP Overflow', status: 'MITIGATED', vendor: 'Google', vectors: 'Local', zeroDay: false, exploited: false }
];
export const SYSTEM_NODES: SystemNode[] = [
    { id: 'n1', name: 'SENSOR-ALPHA', status: 'ONLINE', load: 45, latency: 12, type: 'Sensor' }, 
    { id: 'n2', name: 'DB-CLUSTER', status: 'DEGRADED', load: 88, latency: 120, type: 'Database' },
    { id: 'n3', name: 'HQ-DC-01', status: 'ONLINE', load: 32, latency: 4, type: 'Server' },
    { id: 'n4', name: 'FIN-DB-02', status: 'ONLINE', load: 65, latency: 15, type: 'Database' },
    { id: 'n5', name: 'WEB-EXT-01', status: 'OFFLINE', load: 0, latency: 0, type: 'Server' },
    { id: 'n6', name: 'HUNT-SENSOR-04', status: 'ONLINE', load: 12, latency: 45, type: 'Sensor' },
    { id: 'n7', name: 'EDR-AGGR-01', status: 'ONLINE', load: 78, latency: 8, type: 'Server' },
    { id: 'n8', name: 'CLOUD-GW-01', status: 'ONLINE', load: 22, latency: 60, type: 'Server' },
    { id: 'n9', name: 'BACKUP-COLD', status: 'ONLINE', load: 5, latency: 2, type: 'Database' },
    { id: 'n10', name: 'AI-INFERENCE', status: 'ONLINE', load: 92, latency: 200, type: 'Server' }
];
export const THREAT_TRENDS = [{ name: '00:00', value: 12 }, { name: '08:00', value: 24 }];
export const MOCK_CHAIN: ChainEvent[] = [{ id: 'c1', date: '2023-10-27 08:30', artifactId: 'a1', artifactName: 'payload.bin', action: 'CHECK_IN', user: 'Doe', notes: 'Recovered' }];
export const MOCK_MALWARE: Malware[] = [{ id: 'm1', name: 'invoice.exe', family: 'LockBit', hash: 'e3b0c442...', verdict: 'MALICIOUS', score: 100, associatedActor: 'LockBit' }];
export const MOCK_LAB_JOBS: ForensicJob[] = [{ id: 'j1', type: 'Disk Imaging', target: 'Server-01', status: 'PROCESSING', progress: 45, technician: 'Stark' }];
export const MOCK_DEVICES: Device[] = [{ id: 'd1', name: 'CEO iPhone', type: 'Mobile', serial: 'SN-9988', custodian: 'Vault', status: 'SECURE' }];
export const MOCK_PCAPS: Pcap[] = [{ id: 'p1', name: 'beacon.pcap', size: '15MB', date: '2023-10-27', source: 'FW', protocol: 'TCP', analysisStatus: 'ANALYZED', associatedActor: 'APT-29' }];

export const MOCK_INCIDENT_REPORTS: IncidentReport[] = [
  { id: 'RPT-2023-884', title: 'Weekly Threat Landscape', type: 'Executive', date: '2023-10-27', author: 'System', status: 'READY', content: 'Weekly analysis...' },
  { id: 'RPT-2023-883', title: 'Incident Response: CASE-23-001', type: 'Forensic', date: '2023-10-26', author: 'Analyst.Doe', status: 'READY', content: 'Forensic breakdown...', relatedCaseId: 'CASE-23-001' },
];

export const MOCK_TACTICS: MitreItem[] = [{ id: 'TA0001', name: 'Initial Access', description: 'Trying to get into your network.' }, { id: 'TA0002', name: 'Execution', description: 'Trying to run malicious code.' }, { id: 'TA0003', name: 'Persistence', description: 'Trying to maintain their foothold.' }];
export const MOCK_TECHNIQUES: MitreItem[] = [{ id: 'T1566', name: 'Phishing', tactic: 'Initial Access', description: 'Sends emails with malicious links.' }, { id: 'T1059', name: 'Command & Scripting', tactic: 'Execution', description: 'Abuse of interpreters.' }];
export const MOCK_SUB_TECHNIQUES: MitreItem[] = [{ id: 'T1566.001', name: 'Spearphishing Attachment', parent: 'T1566', description: 'Phishing with attachment.' }];
export const MOCK_GROUPS: MitreItem[] = [{ id: 'G0007', name: 'APT28', aliases: ['Fancy Bear'], description: 'Russian GRU.' }];
export const MOCK_SOFTWARE: MitreItem[] = [{ id: 'S0002', name: 'Mimikatz', type: 'Tool', description: 'Credential dumper.' }];
export const MOCK_MITIGATIONS: MitreItem[] = [{ id: 'M1050', name: 'Exploit Protection', description: 'Use ASLR and DEP.' }];

export const MOCK_DOMAIN: OsintDomain[] = [{ domain: 'evil.com', registrar: 'BadHost', created: '2023-10', expires: '2024-10', dns: '1.2.3.4', status: 'Active', subdomains: ['mail.'], ssl: 'Valid' }];
export const MOCK_BREACH: OsintBreach[] = [{ email: 'ceo@target.com', breach: 'LinkedIn', date: '2016', data: 'Pass', hash: '5f4d...', source: 'Leak' }];
export const MOCK_SOCIAL: OsintSocial[] = [{ handle: '@threat', platform: 'Twitter', status: 'Active', followers: 1200, lastPost: '2h', sentiment: 'Neg', bio: 'Researcher' }];
export const MOCK_GEO: OsintGeo[] = [{ ip: '185.200.1.1', city: 'Moscow', country: 'RU', isp: 'Tel', asn: 'AS123', coords: '55,37', ports: [80], threatScore: 85 }];
export const MOCK_DARKWEB = [{ source: 'Raid', title: 'DB Leak', date: '2023', author: 'GodSpeed', status: 'Verified', price: '$500' }];
export const MOCK_META = [{ name: 'inv.pdf', size: '1MB', type: 'PDF', author: 'Unknown', created: '2023', gps: 'None' }];

export const MOCK_USERS: SystemUser[] = [
    { id: 'U1', name: 'Adm. S. Connor', role: 'Admin', clearance: 'TS', status: 'Online' }, 
    { id: 'U2', name: 'Analyst Doe', role: 'Analyst', clearance: 'Secret', status: 'Offline' },
    { id: 'U3', name: 'Analyst Smith', role: 'Analyst', clearance: 'Secret', status: 'Busy' },
    { id: 'U4', name: 'Hunter Wayne', role: 'Threat Hunter', clearance: 'TS', status: 'Online' },
    { id: 'U5', name: 'Dir. Fury', role: 'Director', clearance: 'TS/SCI', status: 'Online' },
    { id: 'U6', name: 'Ops Team Lead', role: 'Operations', clearance: 'Secret', status: 'Online' },
    { id: 'U7', name: 'Sec. Engineer A', role: 'Engineer', clearance: 'Top Secret', status: 'Busy' },
    { id: 'U8', name: 'Audit User', role: 'Auditor', clearance: 'Confidential', status: 'Offline' }
];
export const MOCK_INTEGRATIONS: Integration[] = [{ name: 'CrowdStrike', status: 'Connected', type: 'EDR' }, { name: 'Splunk', status: 'Connected', type: 'SIEM' }];
