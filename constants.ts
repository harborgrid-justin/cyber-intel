
import { Threat, Severity, IncidentStatus, SystemNode, AuditLog, Case, IoCFeed, ThreatActor, Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, Vulnerability, MitreItem, OsintDomain, OsintBreach, OsintSocial, OsintGeo, SystemUser, Integration, IncidentReport, Campaign, PatchStatus, ScannerStatus, VendorFeedItem, ReportSection, Vendor, NistControl } from './types';

// ... (Previous Constants)

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
  { id: 'CASE-23-001', title: 'Operation Blue Horizon', description: 'Investigation into coordinated phishing campaign.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Analyst.Doe', reporter: 'System', created: '2023-10-25', relatedThreatIds: ['1', '3'], findings: 'Confirmed C2 activity.', tasks: [{ id: 't1', title: 'Analyze headers', status: 'DONE' }, { id: 't2', title: 'Reset Credentials', status: 'DONE' }], notes: [], artifacts: [], timeline: [{ id: 'tl1', date: '2023-10-25 08:00', title: 'Initial Alert', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Phishing'], tlp: 'AMBER' },
  { id: 'CASE-23-002', title: 'Internal Data Exfil - Finance', description: 'Anomalous outbound traffic from Finance subnet.', status: 'OPEN', priority: 'CRITICAL', assignee: 'Analyst.Smith', reporter: 'DLP_System', created: '2023-10-27', relatedThreatIds: ['5'], findings: 'Possible insider threat.', tasks: [{ id: 't4', title: 'Isolate Host', status: 'DONE' }], notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'JOINT_TASK_FORCE', sharedWith: ['FBI_CYBER'], labels: ['Insider'], tlp: 'RED' },
];

export const MOCK_PLAYBOOKS: Playbook[] = [
  { id: 'pb1', name: 'Phishing Response', description: 'Standard procedure.', tasks: ['Analyze Email', 'Block Domain', 'Reset Creds'], triggerLabel: 'Phishing', riskLevel: 'LOW' },
  { id: 'pb2', name: 'Ransomware Containment', description: 'Isolation protocol.', tasks: ['Isolate Host', 'Snapshot', 'Identify Variant'], triggerLabel: 'Ransomware', riskLevel: 'HIGH' },
  { id: 'pb3', name: 'Critical Patch Deploy', description: 'Emergency patching.', tasks: ['Backup', 'Apply Patch', 'Reboot'], triggerLabel: 'Vulnerability', riskLevel: 'MODERATE' },
  { id: 'pb4', name: 'DDoS Mitigation', description: 'Traffic scrubbing.', tasks: ['Route to Scrubbing', 'Block IP Range'], triggerLabel: 'DDoS', riskLevel: 'MODERATE' },
];

export const MOCK_ACTORS: ThreatActor[] = [
  { id: 'a1', name: 'APT-29', aliases: ['Cozy Bear'], origin: 'Russia', description: 'SVR affiliated.', sophistication: 'Advanced', targets: ['Gov', 'Energy'], campaigns: ['SolarWinds'], ttps: [{id:'t1', code:'T1093', name:'Process Hollowing'}, {id:'t2', code:'T1027', name:'Obfuscated Files'}], infrastructure: [], exploits: ['CVE-2023-23397'], references: [], history: [], evasionTechniques: ['Rootkit', 'Fileless Malware'] },
  { id: 'a2', name: 'Lazarus', aliases: ['Hidden Cobra'], origin: 'DPRK', description: 'State-sponsored cybercrime.', sophistication: 'Advanced', targets: ['Finance'], campaigns: ['WannaCry'], ttps: [{id:'t4', code:'T1486', name:'Data Encrypted'}], infrastructure: [], exploits: ['CVE-2023-34362'], references: [], history: [], evasionTechniques: ['Anti-VM', 'Packers'] }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'CAM-001', name: 'SolarWinds Supply Chain', description: 'Widespread supply chain attack.', status: 'ARCHIVED', objective: 'ESPIONAGE', actors: ['APT-29'], firstSeen: '2020-03-01', lastSeen: '2021-02-28', targetSectors: ['Gov', 'Tech'], targetRegions: ['NA'], threatIds: ['1'], ttps: ['T1195'] },
  { id: 'CAM-002', name: 'Operation Dream Job', description: 'Lazarus job offer lures.', status: 'ACTIVE', objective: 'ESPIONAGE', actors: ['Lazarus'], firstSeen: '2022-06-15', lastSeen: '2023-10-27', targetSectors: ['Defense'], targetRegions: ['Global'], threatIds: [], ttps: ['T1566'] }
];

export const MOCK_FEEDS: IoCFeed[] = [
  { id: 'f1', name: 'AlienVault OTX', url: 'https://otx.alienvault.com', type: 'STIX/TAXII', status: 'ACTIVE', interval: 60, lastSync: '10 mins ago' },
  { id: 'f2', name: 'Microsoft MSRC', url: 'api.msrc.microsoft.com', type: 'VENDOR_ADVISORY', status: 'ACTIVE', interval: 1440, lastSync: '2 hours ago' },
  { id: 'f3', name: 'Nessus Pro Connector', url: '10.0.0.50:8834', type: 'VULN_SCANNER', status: 'ACTIVE', interval: 120, lastSync: '15 mins ago' },
  { id: 'f4', name: 'Splunk SIEM', url: 'splunk-cluster.local', type: 'SIEM_CONNECTOR', status: 'ACTIVE', interval: 5, lastSync: '1 min ago' },
  { id: 'f5', name: 'CISA KEV', url: 'cisa.gov/kev', type: 'JSON_FEED', status: 'ACTIVE', interval: 360, lastSync: '1 hour ago' }
];

export const MOCK_TEMPLATES = [
  { id: 'FEDRAMP', name: 'FedRAMP POAM', desc: 'Plan of Action and Milestones.', icon: '🏛️' },
  { id: 'NIST', name: 'NIST SSP', desc: 'System Security Plan (800-53).', icon: '📜' },
  { id: 'CISA', name: 'CISA Incident (72h)', desc: 'Mandatory Cyber Incident Reporting.', icon: '🚨' },
  { id: 'FBI', name: 'FBI Cyber Action Report', desc: 'Joint Cybersecurity Advisory format.', icon: '🇺🇸' },
  { id: 'EXEC', name: 'Board Executive Summary', desc: 'Financial impact and risk exposure.', icon: '💼' },
];

export const REPORT_BOILERPLATE: Record<string, ReportSection[]> = {
  FEDRAMP: [
    { id: 'h1', title: 'HEADER', content: 'FEDRAMP PLAN OF ACTION AND MILESTONES (POA&M)\nTEMPLATE VERSION 2.0' },
    { id: 's1', title: 'WEAKNESSES', content: '[List all deviation from controls]' },
    { id: 's2', title: 'MILESTONES', content: '[Scheduled remediation dates]' }
  ],
  NIST: [
    { id: 'h1', title: 'HEADER', content: 'SYSTEM SECURITY PLAN (SSP)\nNIST SP 800-53 REV 5' },
    { id: 's1', title: 'CONTROL FAMILY: AC', content: 'Access Control Implementation...' },
    { id: 's2', title: 'CONTROL FAMILY: AU', content: 'Audit and Accountability...' }
  ],
  CISA: [
    { id: 'h1', title: 'HEADER', content: 'CISA CYBER INCIDENT REPORTING FORM\nPURSUANT TO CIRCIA 2022' },
    { id: 's1', title: 'INCIDENT SUMMARY', content: '[Description of Incident]' },
    { id: 's2', title: 'IMPACT ASSESSMENT', content: '[Functional Impact]' }
  ],
  FBI: [
    { id: 'h1', title: 'HEADER', content: 'FEDERAL BUREAU OF INVESTIGATION\nCYBER DIVISION\nTLP:AMBER | CONFIDENTIAL' },
    { id: 's1', title: 'SUMMARY', content: 'The FBI is investigating activity related to...' },
    { id: 's2', title: 'TECHNICAL DETAILS', content: 'Preliminary analysis indicates...' },
    { id: 's3', title: 'INDICATORS OF COMPROMISE', content: '[Inject IoCs Here]' },
    { id: 's4', title: 'VICTIMOLOGY', content: 'Targeted sectors include...' },
    { id: 's5', title: 'RECOMMENDATIONS', content: '1. Preserve evidence.\n2. Review logs.' }
  ],
  EXEC: [
    { id: 'h1', title: 'HEADER', content: `EXECUTIVE BOARD BRIEFING\nDATE: ${new Date().toLocaleDateString()}` },
    { id: 's1', title: 'BOTTOM LINE UP FRONT', content: 'Current risk exposure is...' },
    { id: 's2', title: 'FINANCIAL IMPACT', content: 'Potential loss estimated at...' },
    { id: 's3', title: 'STRATEGIC RESPONSE', content: 'Security teams are currently...' }
  ]
};

export const MOCK_AUDIT_LOGS: AuditLog[] = [{ id: 'l1', action: 'LOGIN_SUCCESS', user: 'admin', timestamp: '10-27 08:00', details: 'IP: 10.0.0.2' }];
export const MOCK_VULNERABILITIES: Vulnerability[] = [
  { id: 'CVE-2023-23397', score: 9.8, name: 'Outlook EoP', status: 'PATCHED', vendor: 'Microsoft', vectors: 'Network', zeroDay: false, exploited: true },
  { id: 'CVE-2023-34362', score: 9.8, name: 'MOVEit SQLi', status: 'UNPATCHED', vendor: 'Progress', vectors: 'Web', zeroDay: true, exploited: true },
  { id: 'CVE-2023-4863', score: 8.8, name: 'WebP Overflow', status: 'MITIGATED', vendor: 'Google', vectors: 'Local', zeroDay: false, exploited: false }
];

export const MOCK_PATCH_STATUS: PatchStatus[] = [
  { system: 'Workstations (Windows)', total: 450, patched: 442, compliance: 98 },
  { system: 'Servers (Linux)', total: 120, patched: 110, compliance: 91 },
  { system: 'Database Clusters', total: 15, patched: 15, compliance: 100 },
  { system: 'Edge Devices', total: 60, patched: 45, compliance: 75 },
];

export const MOCK_SCANNERS: ScannerStatus[] = [
  { id: 's1', name: 'Nessus Pro', status: 'ONLINE', lastScan: '2 hours ago', coverage: '98%', findings: 12 },
  { id: 's2', name: 'Qualys Guard', status: 'ONLINE', lastScan: '1 day ago', coverage: '100%', findings: 45 },
  { id: 's3', name: 'OpenVAS', status: 'MAINTENANCE', lastScan: '3 days ago', coverage: '85%', findings: 8 },
];

export const MOCK_VENDOR_FEEDS: VendorFeedItem[] = [
  { id: 'v1', vendor: 'Microsoft MSRC', date: '2023-10-25', title: 'Security Update Guide - October', severity: 'High' },
  { id: 'v2', vendor: 'CISA KEV', date: '2023-10-24', title: 'Added CVE-2023-34362 to Known Exploited', severity: 'Critical' },
  { id: 'v3', vendor: 'Adobe Security', date: '2023-10-20', title: 'APSB23-50: Acrobat Update', severity: 'Medium' },
];

export const SYSTEM_NODES: SystemNode[] = [
    { 
      id: 'n1', name: 'SENSOR-ALPHA', status: 'ONLINE', load: 45, latency: 12, type: 'Sensor', vendor: 'Cisco', 
      securityControls: ['FIREWALL'], dataSensitivity: 'INTERNAL', dataVolumeGB: 5 
    }, 
    { 
      id: 'n2', name: 'DB-CLUSTER', status: 'DEGRADED', load: 88, latency: 120, type: 'Database', vendor: 'Oracle', vulnerabilities: ['CVE-2023-34362'], criticalProcess: 'PAYROLL_DB_SYNC', dependencies: [], 
      securityControls: ['EDR', 'DLP'], dataSensitivity: 'RESTRICTED', dataVolumeGB: 5000 
    },
    { 
      id: 'n3', name: 'HQ-DC-01', status: 'ONLINE', load: 32, latency: 4, type: 'Server', vendor: 'Microsoft', vulnerabilities: ['CVE-2023-23397'], criticalProcess: 'AUTH_SERVICE', dependencies: [], 
      securityControls: ['EDR', 'SIEM_AGENT'], dataSensitivity: 'CONFIDENTIAL', dataVolumeGB: 50 
    },
    { 
      id: 'n4', name: 'FIN-DB-02', status: 'ONLINE', load: 65, latency: 15, type: 'Database', vendor: 'Oracle', dependencies: ['n2'], 
      securityControls: ['EDR', 'DLP', 'AV'], dataSensitivity: 'RESTRICTED', dataVolumeGB: 2500 
    },
    { 
      id: 'n5', name: 'WEB-EXT-01', status: 'OFFLINE', load: 0, latency: 0, type: 'Server', vendor: 'Apache', dependencies: ['n3'], 
      securityControls: ['FIREWALL', 'AV'], dataSensitivity: 'PUBLIC', dataVolumeGB: 20 
    },
];
export const THREAT_TRENDS = [{ name: '00:00', value: 12 }, { name: '04:00', value: 35 }, { name: '08:00', value: 24 }, { name: '12:00', value: 89 }, { name: '16:00', value: 54 }, { name: '20:00', value: 18 }];
export const MOCK_CHAIN: ChainEvent[] = [{ id: 'c1', date: '2023-10-27 08:30', artifactId: 'a1', artifactName: 'payload.bin', action: 'CHECK_IN', user: 'Doe', notes: 'Recovered' }];
export const MOCK_MALWARE: Malware[] = [{ id: 'm1', name: 'invoice.exe', family: 'LockBit', hash: 'e3b0c442...', verdict: 'MALICIOUS', score: 100, associatedActor: 'LockBit' }];
export const MOCK_LAB_JOBS: ForensicJob[] = [{ id: 'j1', type: 'Disk Imaging', target: 'Server-01', status: 'PROCESSING', progress: 45, technician: 'Stark' }];
export const MOCK_DEVICES: Device[] = [{ id: 'd1', name: 'CEO iPhone', type: 'Mobile', serial: 'SN-9988', custodian: 'Vault', status: 'SECURE' }];
export const MOCK_PCAPS: Pcap[] = [{ id: 'p1', name: 'beacon.pcap', size: '15MB', date: '2023-10-27', source: 'FW', protocol: 'TCP', analysisStatus: 'ANALYZED', associatedActor: 'APT-29' }];
export const MOCK_INCIDENT_REPORTS: IncidentReport[] = [{ id: 'RPT-884', title: 'Weekly Threat', type: 'Executive', date: '2023-10-27', author: 'System', status: 'READY', content: '...' }];

export const MOCK_TACTICS: MitreItem[] = [{ id: 'TA0001', name: 'Initial Access', description: 'Trying to get into your network.' }];
export const MOCK_TECHNIQUES: MitreItem[] = [{ id: 'T1566', name: 'Phishing', tactic: 'Initial Access', description: 'Sends emails with malicious links.' }];
export const MOCK_SUB_TECHNIQUES: MitreItem[] = [{ id: 'T1566.001', name: 'Spearphishing Attachment', parent: 'T1566', description: 'Phishing with attachment.' }];
export const MOCK_GROUPS: MitreItem[] = [{ id: 'G0007', name: 'APT28', aliases: ['Fancy Bear'], description: 'Russian GRU.' }];
export const MOCK_SOFTWARE: MitreItem[] = [{ id: 'S0002', name: 'Mimikatz', type: 'Tool', description: 'Credential dumper.' }];
export const MOCK_MITIGATIONS: MitreItem[] = [{ id: 'M1050', name: 'Exploit Protection', description: 'Use ASLR and DEP.' }];

export const MOCK_DOMAIN: OsintDomain[] = [{ domain: 'evil.com', registrar: 'BadHost', created: '2023-10', expires: '2024-10', dns: '1.2.3.4', status: 'Active', subdomains: ['mail.'], ssl: 'Valid' }];
export const MOCK_BREACH: OsintBreach[] = [{ email: 'ceo@target.com', breach: 'LinkedIn', date: '2016', data: 'Pass', hash: '5f4d...', source: 'Leak' }, { email: 'adm.s.connor@sentinel.co', breach: 'Canva', date: '2019', data: 'Hash', hash: '...', source: 'Leak' }];
export const MOCK_SOCIAL: OsintSocial[] = [{ handle: '@threat', platform: 'Twitter', status: 'Active', followers: 1200, lastPost: '2h', sentiment: 'Neg', bio: 'Researcher' }, { handle: '@s_connor', platform: 'LinkedIn', status: 'Active', followers: 500, lastPost: '1d', sentiment: 'Neutral', bio: 'Sentinel Admin' }];
export const MOCK_GEO: OsintGeo[] = [{ ip: '185.200.1.1', city: 'Moscow', country: 'RU', isp: 'Tel', asn: 'AS123', coords: '55,37', ports: [80], threatScore: 85 }];
export const MOCK_DARKWEB = [{ source: 'Raid', title: 'DB Leak', date: '2023', author: 'GodSpeed', status: 'Verified', price: '$500' }];
export const MOCK_META = [{ name: 'inv.pdf', size: '1MB', type: 'PDF', author: 'Unknown', created: '2023', gps: 'None' }];
export const MOCK_USERS: SystemUser[] = [{ id: 'U1', name: 'Adm. S. Connor', role: 'Admin', clearance: 'TS', status: 'Online', isVIP: true }, { id: 'U2', name: 'J. Doe', role: 'Analyst', clearance: 'Secret', status: 'Busy' }];
export const MOCK_INTEGRATIONS: Integration[] = [{ name: 'CrowdStrike', status: 'Connected', type: 'EDR' }, { name: 'Splunk', status: 'Connected', type: 'SIEM' }];

// Enterprise Vendor Data
export const MOCK_VENDORS: Vendor[] = [
  { 
    id: 'v1', name: 'Microsoft', product: 'Azure & O365', riskScore: 15, tier: 'Strategic', category: 'Cloud', hqLocation: 'USA', website: 'microsoft.com',
    activeVulns: 2, campaignsTargeting: 5,
    sbom: [{ name: 'openssl', version: '1.1.1', license: 'Apache', vulnerabilities: 0, critical: false }],
    compliance: [{ standard: 'SOC2', status: 'VALID', expiry: '2024-12-01' }, { standard: 'FEDRAMP', status: 'VALID', expiry: '2025-01-01' }],
    access: [{ systemId: 'n3', accessLevel: 'ADMIN', accountCount: 3 }],
    subcontractors: ['Akamai', 'Intel'] 
  },
  { 
    id: 'v2', name: 'SolarWinds', product: 'Orion', riskScore: 85, tier: 'Tactical', category: 'Software', hqLocation: 'USA', website: 'solarwinds.com',
    activeVulns: 4, campaignsTargeting: 1,
    sbom: [{ name: 'log4j', version: '2.14.1', license: 'Apache', vulnerabilities: 1, critical: true }],
    compliance: [{ standard: 'ISO27001', status: 'EXPIRED', expiry: '2023-05-01' }],
    access: [{ systemId: 'n2', accessLevel: 'READ', accountCount: 1 }],
    subcontractors: ['Unknown_Offshore_Dev'] 
  },
  { 
    id: 'v3', name: 'Kaspersky', product: 'Endpoint Security', riskScore: 92, tier: 'Commodity', category: 'Software', hqLocation: 'Russia', website: 'kaspersky.com',
    activeVulns: 0, campaignsTargeting: 0,
    sbom: [],
    compliance: [{ standard: 'GDPR', status: 'PENDING', expiry: 'N/A' }],
    access: [],
    subcontractors: [] 
  }
];

export const MOCK_NIST_CONTROLS: NistControl[] = [
  { id: 'AC-2', family: 'AC', name: 'Account Management', status: 'IMPLEMENTED', lastAudit: '2023-10-01', description: 'The organization manages information system accounts.' },
  { id: 'AC-6', family: 'AC', name: 'Least Privilege', status: 'IMPLEMENTED', lastAudit: '2023-10-01', description: 'Employ the principle of least privilege.' },
  { id: 'AU-2', family: 'AU', name: 'Audit Events', status: 'PARTIAL', lastAudit: '2023-09-15', description: 'Determine that the information system is capable of auditing.' },
  { id: 'IR-4', family: 'IR', name: 'Incident Handling', status: 'IMPLEMENTED', lastAudit: '2023-10-25', description: 'Implement an incident handling capability.' },
  { id: 'SC-7', family: 'SC', name: 'Boundary Protection', status: 'PLANNED', lastAudit: 'Pending', description: 'Monitor and control communications at external managed interfaces.' },
];
