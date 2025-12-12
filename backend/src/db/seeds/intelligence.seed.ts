
export const INITIAL_THREATS = [
  { id: 'THR-001', indicator: '192.168.1.105', type: 'IP Address', severity: 'CRITICAL', source: 'FW-01', description: 'C2 Beaconing Detected', status: 'active', confidence: 98, region: 'APAC', threat_actor: 'APT-29', reputation: 95, score: 96, tags: ['Botnet', 'C2'], tlp: 'RED', sanctioned: true, ml_retrain: true, origin: 'Russia', last_seen: new Date('2024-12-10') },
  { id: 'THR-002', indicator: '7a0d8f2b3c4e5d6f1a2b3c4d5e6f7a8b', type: 'hash', severity: 'HIGH', source: 'EDR-West', description: 'Ransomware.LockBit Variant', status: 'active', confidence: 85, region: 'NA', threat_actor: 'LockBit', reputation: 90, score: 88, tags: ['Ransomware', 'Malware'], tlp: 'AMBER', sanctioned: false, ml_retrain: true, origin: 'Unknown', last_seen: new Date('2024-12-11') },
  { id: 'THR-003', indicator: 'update-sys-win.com', type: 'domain', severity: 'MEDIUM', source: 'DNS-03', description: 'Typosquatting Domain', status: 'active', confidence: 72, region: 'EU', threat_actor: 'Unknown', reputation: 45, score: 55, tags: ['Phishing'], tlp: 'AMBER', sanctioned: false, ml_retrain: false, origin: 'External', last_seen: new Date('2024-12-09') },
  { id: 'THR-004', indicator: '10.20.0.55', type: 'ip', severity: 'HIGH', source: 'IDS-Core', description: 'Lateral Movement (SMB)', status: 'mitigated', confidence: 91, region: 'LATAM', threat_actor: 'Insider?', reputation: 10, score: 62, tags: ['Exploit', 'Lateral_Movement'], tlp: 'AMBER', sanctioned: false, ml_retrain: false, origin: 'Internal', last_seen: new Date('2024-12-08') },
  { id: 'THR-005', indicator: 'login-microsoft-auth.com', type: 'url', severity: 'HIGH', source: 'Email Gateway', description: 'Credential Harvesting Page', status: 'active', confidence: 88, region: 'Global', threat_actor: 'Unknown', reputation: 20, score: 75, tags: ['Phishing', 'Credential_Theft'], tlp: 'AMBER', sanctioned: false, ml_retrain: false, origin: 'External', last_seen: new Date('2024-12-12') },
  { id: 'THR-006', indicator: 'CVE-2023-44487', type: 'cve', severity: 'CRITICAL', source: 'WAF', description: 'HTTP/2 Rapid Reset Attack', status: 'active', confidence: 95, region: 'NA', threat_actor: 'DDoS-Group', reputation: 100, score: 92, tags: ['Exploit', 'DDoS', 'Zero-Day'], tlp: 'RED', sanctioned: false, ml_retrain: true, origin: 'External', last_seen: new Date('2024-12-11') },
  { id: 'THR-007', indicator: '45.142.212.61', type: 'ip', severity: 'HIGH', source: 'Threat_Feed_01', description: 'Known botnet C2 server', status: 'active', confidence: 92, region: 'EU', threat_actor: 'Emotet', reputation: 85, score: 89, tags: ['Botnet', 'Malware'], tlp: 'AMBER', sanctioned: false, ml_retrain: true, origin: 'External', last_seen: new Date('2024-12-12') },
  { id: 'THR-008', indicator: 'evil-phish-site.xyz', type: 'domain', severity: 'MEDIUM', source: 'Web_Proxy', description: 'Phishing campaign targeting employees', status: 'active', confidence: 78, region: 'Global', threat_actor: 'Unknown', reputation: 30, score: 65, tags: ['Phishing', 'Social_Engineering'], tlp: 'GREEN', sanctioned: false, ml_retrain: false, origin: 'External', last_seen: new Date('2024-12-12') },
  { id: 'THR-009', indicator: 'invoice_december_2024.exe', type: 'filename', severity: 'HIGH', source: 'Email_Security', description: 'Malicious attachment with trojan payload', status: 'active', confidence: 87, region: 'NA', threat_actor: 'TA505', reputation: 75, score: 82, tags: ['Malware', 'Trojan'], tlp: 'AMBER', sanctioned: false, ml_retrain: true, origin: 'External', last_seen: new Date('2024-12-11') },
  { id: 'THR-010', indicator: '172.16.50.200', type: 'ip', severity: 'MEDIUM', source: 'SIEM', description: 'Suspicious internal scanning activity', status: 'active', confidence: 65, region: 'NA', threat_actor: 'Unknown', reputation: 40, score: 58, tags: ['Reconnaissance', 'Scanning'], tlp: 'AMBER', sanctioned: false, ml_retrain: false, origin: 'Internal', last_seen: new Date('2024-12-12') },
  { id: 'THR-011', indicator: 'data-exfil-staging.onion', type: 'domain', severity: 'CRITICAL', source: 'Network_Monitor', description: 'Tor-based data exfiltration domain', status: 'active', confidence: 94, region: 'Global', threat_actor: 'APT-28', reputation: 95, score: 93, tags: ['Exfiltration', 'APT', 'C2'], tlp: 'RED', sanctioned: true, ml_retrain: true, origin: 'Russia', last_seen: new Date('2024-12-10') },
  { id: 'THR-012', indicator: 'fe80::1234:5678:90ab:cdef', type: 'ipv6', severity: 'LOW', source: 'IDS', description: 'Suspicious IPv6 traffic pattern', status: 'false_positive', confidence: 45, region: 'APAC', threat_actor: 'Unknown', reputation: 20, score: 35, tags: ['Anomaly'], tlp: 'WHITE', sanctioned: false, ml_retrain: false, origin: 'Internal', last_seen: new Date('2024-12-09') }
];

export const INITIAL_CASES = [
  {
    id: 'CASE-2024-001',
    title: 'Operation Blue Horizon - APT-29 Campaign',
    description: 'Investigation into coordinated phishing campaign targeting government agencies. Multiple indicators suggest APT-29 involvement with sophisticated social engineering tactics.',
    status: 'investigating',
    priority: 'HIGH',
    assignee: 'USR-ANALYST',
    created_by: 'USR-ADMIN',
    agency: 'SENTINEL_CORE',
    related_threat_ids: ['THR-001', 'THR-003', 'THR-011'],
    shared_with: ['FBI_CYBER', 'CISA'],
    sla_breach: false,
    timeline: [
      { timestamp: '2024-12-08T10:00:00Z', event: 'Case created', user: 'admin.connor', type: 'creation' },
      { timestamp: '2024-12-08T11:30:00Z', event: 'Assigned to analyst.doe', user: 'admin.connor', type: 'assignment' },
      { timestamp: '2024-12-09T14:00:00Z', event: 'Threat indicators added', user: 'analyst.doe', type: 'update' }
    ],
    tasks: [
      { id: 'TSK-001', title: 'Analyze phishing emails', status: 'completed', assignee: 'analyst.doe', priority: 'high' },
      { id: 'TSK-002', title: 'Identify affected systems', status: 'in_progress', assignee: 'analyst.doe', priority: 'high' },
      { id: 'TSK-003', title: 'Coordinate with FBI Cyber', status: 'pending', assignee: 'admin.connor', priority: 'medium' }
    ]
  },
  {
    id: 'CASE-2024-002',
    title: 'Internal Data Exfiltration - Finance Department',
    description: 'Anomalous outbound traffic detected from Finance subnet. Large volumes of data transferred to external Tor endpoint. Potential insider threat or compromised credentials.',
    status: 'contained',
    priority: 'CRITICAL',
    assignee: 'USR-ADMIN',
    created_by: 'system',
    agency: 'SENTINEL_CORE',
    related_threat_ids: ['THR-004', 'THR-011'],
    shared_with: ['FBI_CYBER', 'INTERNAL_AUDIT'],
    sla_breach: true,
    timeline: [
      { timestamp: '2024-12-10T09:00:00Z', event: 'Automated detection - SIEM alert', user: 'system', type: 'detection' },
      { timestamp: '2024-12-10T09:15:00Z', event: 'Case auto-created', user: 'system', type: 'creation' },
      { timestamp: '2024-12-10T09:30:00Z', event: 'Network segment isolated', user: 'admin.connor', type: 'containment' }
    ],
    tasks: [
      { id: 'TSK-004', title: 'Isolate affected subnet', status: 'completed', assignee: 'admin.connor', priority: 'critical' },
      { id: 'TSK-005', title: 'Forensic analysis of workstations', status: 'in_progress', assignee: 'admin.connor', priority: 'critical' },
      { id: 'TSK-006', title: 'Interview affected users', status: 'pending', assignee: 'analyst.doe', priority: 'high' }
    ]
  },
  {
    id: 'CASE-2024-003',
    title: 'LockBit Ransomware Incident - Manufacturing Floor',
    description: 'Ransomware encryption detected on multiple manufacturing control systems. LockBit variant identified. Immediate containment and recovery operations initiated.',
    status: 'open',
    priority: 'CRITICAL',
    assignee: 'USR-ANALYST',
    created_by: 'USR-ADMIN',
    agency: 'SENTINEL_CORE',
    related_threat_ids: ['THR-002'],
    shared_with: ['FBI_CYBER', 'CISA', 'LOCAL_PD'],
    sla_breach: false,
    timeline: [
      { timestamp: '2024-12-11T16:00:00Z', event: 'Ransomware detected by EDR', user: 'system', type: 'detection' },
      { timestamp: '2024-12-11T16:05:00Z', event: 'Emergency response activated', user: 'admin.connor', type: 'escalation' }
    ],
    tasks: [
      { id: 'TSK-007', title: 'Isolate manufacturing network', status: 'completed', assignee: 'admin.connor', priority: 'critical' },
      { id: 'TSK-008', title: 'Activate backup recovery', status: 'in_progress', assignee: 'admin.connor', priority: 'critical' },
      { id: 'TSK-009', title: 'Analyze ransomware sample', status: 'pending', assignee: 'analyst.doe', priority: 'high' }
    ]
  },
  {
    id: 'CASE-2024-004',
    title: 'Emotet Botnet Activity - Corporate Network',
    description: 'Multiple workstations showing signs of Emotet botnet infection. C2 communications detected. Phishing email identified as initial vector.',
    status: 'investigating',
    priority: 'HIGH',
    assignee: 'USR-ANALYST',
    created_by: 'USR-ANALYST',
    agency: 'SENTINEL_CORE',
    related_threat_ids: ['THR-007', 'THR-008'],
    shared_with: [],
    sla_breach: false,
    timeline: [
      { timestamp: '2024-12-12T08:00:00Z', event: 'Initial phishing email reported', user: 'analyst.doe', type: 'detection' },
      { timestamp: '2024-12-12T09:00:00Z', event: 'C2 traffic identified', user: 'analyst.doe', type: 'investigation' }
    ],
    tasks: [
      { id: 'TSK-010', title: 'Identify infected hosts', status: 'in_progress', assignee: 'analyst.doe', priority: 'high' },
      { id: 'TSK-011', title: 'Block C2 domains', status: 'in_progress', assignee: 'analyst.doe', priority: 'high' },
      { id: 'TSK-012', title: 'User awareness training', status: 'pending', assignee: 'analyst.doe', priority: 'medium' }
    ]
  }
];

export const INITIAL_ACTORS = [
  {
    id: 'ACT-001',
    name: 'APT-29',
    origin: 'Russia',
    description: 'SVR-affiliated advanced persistent threat group. Known for sophisticated cyber espionage campaigns targeting government, defense, and critical infrastructure.',
    sophistication: 'EXPERT',
    targets: ['Government', 'Defense', 'Energy', 'Think_Tanks'],
    aliases: ['Cozy Bear', 'The Dukes', 'YTTRIUM'],
    evasion_techniques: ['Rootkit', 'Fileless Malware', 'Process Hollowing', 'Living off the Land', 'Certificate Spoofing'],
    history: [
      { date: '2015', event: 'DNC breach', impact: 'High' },
      { date: '2020', event: 'SolarWinds supply chain attack', impact: 'Critical' },
      { date: '2023', event: 'Microsoft Exchange exploitation', impact: 'High' }
    ],
    exploits: ['CVE-2023-23397', 'CVE-2021-44228', 'CVE-2020-0688']
  },
  {
    id: 'ACT-002',
    name: 'Lazarus Group',
    origin: 'North Korea',
    description: 'State-sponsored cybercrime and espionage group linked to North Korean government. Known for financially motivated attacks and destructive operations.',
    sophistication: 'EXPERT',
    targets: ['Finance', 'Cryptocurrency', 'Defense', 'Media'],
    aliases: ['Hidden Cobra', 'ZINC', 'Guardians of Peace'],
    evasion_techniques: ['Anti-VM', 'Packers', 'Code Obfuscation', 'Custom Malware'],
    history: [
      { date: '2014', event: 'Sony Pictures hack', impact: 'Critical' },
      { date: '2017', event: 'WannaCry ransomware', impact: 'Critical' },
      { date: '2021', event: 'Cryptocurrency exchange heists', impact: 'High' }
    ],
    exploits: ['CVE-2023-34362', 'CVE-2017-0144', 'CVE-2021-44228']
  },
  {
    id: 'ACT-003',
    name: 'APT-28',
    origin: 'Russia',
    description: 'GRU-affiliated threat group focused on political espionage and influence operations. Active since at least 2007.',
    sophistication: 'ADVANCED',
    targets: ['Government', 'Military', 'Political_Organizations', 'Media'],
    aliases: ['Fancy Bear', 'Sofacy', 'Pawn Storm', 'STRONTIUM'],
    evasion_techniques: ['Spear Phishing', 'Zero-day Exploits', 'Custom Backdoors', 'Credential Harvesting'],
    history: [
      { date: '2015', event: 'German Parliament cyberattack', impact: 'High' },
      { date: '2016', event: 'DNC email leak', impact: 'Critical' },
      { date: '2022', event: 'Ukraine critical infrastructure attacks', impact: 'Critical' }
    ],
    exploits: ['CVE-2023-23397', 'CVE-2019-0604', 'CVE-2018-8581']
  },
  {
    id: 'ACT-004',
    name: 'LockBit',
    origin: 'Russia',
    description: 'Ransomware-as-a-Service (RaaS) operation. One of the most prolific ransomware groups with continuous evolution of tactics.',
    sophistication: 'ADVANCED',
    targets: ['Healthcare', 'Manufacturing', 'Finance', 'Retail', 'Government'],
    aliases: ['LockBit 2.0', 'LockBit 3.0', 'LockBit Black'],
    evasion_techniques: ['Encryption', 'Data Exfiltration', 'Double Extortion', 'EDR Evasion'],
    history: [
      { date: '2019', event: 'Initial campaigns', impact: 'Medium' },
      { date: '2021', event: 'LockBit 2.0 release', impact: 'High' },
      { date: '2022', event: 'LockBit 3.0 and bug bounty program', impact: 'High' }
    ],
    exploits: ['CVE-2023-4966', 'CVE-2023-3519', 'Print Spooler vulnerabilities']
  },
  {
    id: 'ACT-005',
    name: 'TA505',
    origin: 'Eastern Europe',
    description: 'Financially motivated cybercrime group known for large-scale malspam campaigns and banking trojans.',
    sophistication: 'INTERMEDIATE',
    targets: ['Finance', 'Retail', 'Healthcare', 'Manufacturing'],
    aliases: ['Hive0065', 'SectorJ04'],
    evasion_techniques: ['Macro-based Malware', 'Email Spoofing', 'Chain Infections', 'RAT Deployment'],
    history: [
      { date: '2017', event: 'Locky ransomware distribution', impact: 'High' },
      { date: '2019', event: 'Clop ransomware campaigns', impact: 'High' },
      { date: '2023', event: 'ServHelper and FlawedGrace malware', impact: 'Medium' }
    ],
    exploits: ['Macro Exploits', 'CVE-2017-11882', 'CVE-2018-0802']
  },
  {
    id: 'ACT-006',
    name: 'Emotet',
    origin: 'Ukraine',
    description: 'Polymorphic banking trojan that evolved into a botnet infrastructure provider for other malware families.',
    sophistication: 'ADVANCED',
    targets: ['Finance', 'Government', 'Healthcare', 'Education'],
    aliases: ['Geodo', 'Mealybug'],
    evasion_techniques: ['Polymorphism', 'Email Thread Hijacking', 'Modular Architecture', 'Anti-Analysis'],
    history: [
      { date: '2014', event: 'Initial banking trojan', impact: 'Medium' },
      { date: '2018', event: 'Evolution to botnet provider', impact: 'High' },
      { date: '2021', event: 'Law enforcement takedown', impact: 'Critical' },
      { date: '2021', event: 'Resurgence after takedown', impact: 'High' }
    ],
    exploits: ['Macro-based Exploits', 'CVE-2017-11882']
  }
];

export const INITIAL_CAMPAIGNS = [
  {
    id: 'CAMP-001',
    name: 'Operation Aurora 2.0',
    description: 'Long-term espionage campaign targeting technology companies and defense contractors. Suspected APT-29 operation.',
    status: 'active',
    objective: 'Intellectual Property Theft and Long-term Access',
    actors: ['ACT-001'],
    target_sectors: ['Technology', 'Defense', 'Aerospace'],
    target_regions: ['North America', 'Europe', 'Asia Pacific'],
    threat_ids: ['THR-001', 'THR-011'],
    ttps: ['T1566.001', 'T1059.001', 'T1055', 'T1027', 'T1071.001'],
    first_seen: new Date('2024-01-15'),
    last_seen: new Date('2024-12-12')
  },
  {
    id: 'CAMP-002',
    name: 'LockBit Black Friday',
    description: 'Coordinated ransomware campaign targeting retail and e-commerce during holiday season.',
    status: 'active',
    objective: 'Financial Gain through Ransomware',
    actors: ['ACT-004'],
    target_sectors: ['Retail', 'E-commerce', 'Logistics'],
    target_regions: ['Global'],
    threat_ids: ['THR-002'],
    ttps: ['T1486', 'T1490', 'T1489', 'T1562.001', 'T1021.002'],
    first_seen: new Date('2024-11-01'),
    last_seen: new Date('2024-12-11')
  },
  {
    id: 'CAMP-003',
    name: 'Credential Harvest 2024',
    description: 'Large-scale phishing campaign using typosquatting domains to harvest corporate credentials.',
    status: 'active',
    objective: 'Credential Theft and Initial Access',
    actors: ['ACT-005'],
    target_sectors: ['Multiple', 'Finance', 'Technology'],
    target_regions: ['Global'],
    threat_ids: ['THR-003', 'THR-005', 'THR-008'],
    ttps: ['T1566.002', 'T1598.003', 'T1056.001', 'T1539'],
    first_seen: new Date('2024-09-01'),
    last_seen: new Date('2024-12-12')
  }
];
