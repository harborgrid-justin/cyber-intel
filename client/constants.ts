
import { Threat, Severity, IncidentStatus, SystemNode, AuditLog, Case, IoCFeed, ThreatActor, Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, Vulnerability, MitreItem, OsintDomain, OsintBreach, OsintSocial, OsintGeo, SystemUser, Integration, IncidentReport, Campaign, PatchStatus, ScannerStatus, VendorFeedItem, ReportSection, Vendor, NistControl } from './types';

// ... (Previous Constants)

export const MOCK_THREATS: Threat[] = [
  // Existing threats
  { id: '1', indicator: '192.168.1.105', type: 'IP Address', severity: Severity.CRITICAL, lastSeen: '2 mins ago', source: 'FW-01', description: 'C2 Beaconing Detected', status: IncidentStatus.NEW, confidence: 98, region: 'APAC', threatActor: 'APT-29', reputation: 95, score: 96, tlp: 'RED', mlRetrain: true, tags: ['Botnet', 'C2'] },
  { id: '2', indicator: '7a0d...8f2b', type: 'File Hash', severity: Severity.HIGH, lastSeen: '15 mins ago', source: 'EDR-West', description: 'Ransomware.LockBit Variant', status: IncidentStatus.INVESTIGATING, confidence: 85, region: 'NA', threatActor: 'LockBit', reputation: 90, score: 88, tlp: 'AMBER', tags: ['Ransomware', 'Malware'] },
  { id: '3', indicator: 'update-sys-win.com', type: 'Domain', severity: Severity.MEDIUM, lastSeen: '1 hour ago', source: 'DNS-03', description: 'Typosquatting Domain', status: IncidentStatus.NEW, confidence: 72, region: 'EU', threatActor: 'Unknown', reputation: 45, score: 55, tlp: 'GREEN', tags: ['Phishing'] },
  { id: '5', indicator: '10.20.0.55', type: 'IP Address', severity: Severity.HIGH, lastSeen: '5 hours ago', source: 'IDS-Core', description: 'Lateral Movement (SMB)', status: IncidentStatus.CONTAINED, confidence: 91, region: 'LATAM', threatActor: 'Insider?', reputation: 10, score: 62, tlp: 'RED', tags: ['Exploit'] },
  { id: '6', indicator: 'login-microsoft-auth.com', type: 'URL', severity: Severity.HIGH, lastSeen: '10 mins ago', source: 'Email Gateway', description: 'Credential Harvesting Page', status: IncidentStatus.NEW, confidence: 88, region: 'Global', threatActor: 'Unknown', reputation: 20, score: 75, tlp: 'GREEN', tags: ['Phishing'] },
  { id: '7', indicator: 'CVE-2023-44487', type: 'Exploit', severity: Severity.CRITICAL, lastSeen: '30 mins ago', source: 'WAF', description: 'HTTP/2 Rapid Reset Attack', status: IncidentStatus.INVESTIGATING, confidence: 95, region: 'NA', threatActor: 'DDoS-Group', reputation: 100, score: 92, tlp: 'CLEAR', tags: ['Exploit', 'DDoS', 'Zero-Day'] },
  { id: '8', indicator: 'darkweb-leak-db.onion', type: 'Domain', severity: Severity.MEDIUM, lastSeen: '1 day ago', source: 'Dark Web Monitor', description: 'Employee Credential Dump', status: IncidentStatus.NEW, confidence: 100, region: 'Dark Web', threatActor: 'Broker', reputation: 60, score: 65, tlp: 'RED', tags: ['Dark Web', 'Leak'] },
  { id: '9', indicator: 'mirai-loader.sh', type: 'File Name', severity: Severity.HIGH, lastSeen: '2 hours ago', source: 'Honeypot', description: 'Mirai Botnet Dropper', status: IncidentStatus.NEW, confidence: 99, region: 'Asia', threatActor: 'Botnet Operator', reputation: 90, score: 85, tlp: 'GREEN', tags: ['Botnet', 'Malware'] },
  { id: '10', indicator: 'vuln-vpn-appliance', type: 'Vulnerability', severity: Severity.CRITICAL, lastSeen: 'Just now', source: 'Scanner', description: 'Unpatched Zero-Day in Edge Device', status: IncidentStatus.NEW, confidence: 60, region: 'Internal', threatActor: 'Unknown', reputation: 0, score: 95, tlp: 'RED', tags: ['Zero-Day', 'Exploit'] },

  // Additional comprehensive threats
  { id: '11', indicator: '185.220.101.45', type: 'IP Address', severity: Severity.HIGH, lastSeen: '45 mins ago', source: 'Tor Exit Node Monitor', description: 'Tor Exit Node Associated with Ransomware', status: IncidentStatus.INVESTIGATING, confidence: 78, region: 'EU', threatActor: 'Conti', reputation: 85, score: 79, tlp: 'AMBER', tags: ['Tor', 'Ransomware'] },
  { id: '12', indicator: 'malware-dropper.exe', type: 'File Hash', severity: Severity.CRITICAL, lastSeen: '1 hour ago', source: 'Sandbox', description: 'Emotet Banking Trojan Dropper', status: IncidentStatus.INVESTIGATING, confidence: 97, region: 'Global', threatActor: 'TA542', reputation: 95, score: 94, tlp: 'RED', tags: ['Banking', 'Trojan', 'Malware'] },
  { id: '13', indicator: 'api.stealcreds[.]com', type: 'Domain', severity: Severity.HIGH, lastSeen: '30 mins ago', source: 'Proxy Logs', description: 'Credential Stealing API Endpoint', status: IncidentStatus.NEW, confidence: 89, region: 'NA', threatActor: 'Unknown', reputation: 75, score: 82, tlp: 'AMBER', tags: ['Credential Theft', 'API'] },
  { id: '14', indicator: '203.0.113.195', type: 'IP Address', severity: Severity.MEDIUM, lastSeen: '3 hours ago', source: 'NetFlow', description: 'Suspicious RDP Connection Attempts', status: IncidentStatus.CONTAINED, confidence: 65, region: 'Asia', threatActor: 'Brute Force Actor', reputation: 40, score: 48, tlp: 'GREEN', tags: ['Brute Force', 'RDP'] },
  { id: '15', indicator: 'invoice_urgent.pdf.exe', type: 'File Name', severity: Severity.HIGH, lastSeen: '2 hours ago', source: 'Email AV', description: 'Qakbot Malware Disguised as Invoice', status: IncidentStatus.NEW, confidence: 92, region: 'EU', threatActor: 'Qakbot', reputation: 88, score: 87, tlp: 'AMBER', tags: ['Email', 'Malware', 'Invoice'] },
  { id: '16', indicator: 'zero-logon-exploit.dll', type: 'File Hash', severity: Severity.CRITICAL, lastSeen: '4 hours ago', source: 'EDR', description: 'ZeroLogon Exploitation Tool', status: IncidentStatus.CONTAINED, confidence: 99, region: 'Internal', threatActor: 'Insider', reputation: 20, score: 78, tlp: 'RED', tags: ['Privilege Escalation', 'Zero-Day'] },
  { id: '17', indicator: 'c2-server.darknet', type: 'Domain', severity: Severity.CRITICAL, lastSeen: '1 hour ago', source: 'DNS Sinkhole', description: 'Active C2 Server for APT Campaign', status: IncidentStatus.INVESTIGATING, confidence: 96, region: 'Global', threatActor: 'APT-41', reputation: 98, score: 95, tlp: 'RED', tags: ['APT', 'C2', 'Darknet'] },
  { id: '18', indicator: '192.168.100.50', type: 'IP Address', severity: Severity.HIGH, lastSeen: '6 hours ago', source: 'SIEM', description: 'Internal Host Scanning Subnet', status: IncidentStatus.INVESTIGATING, confidence: 73, region: 'Internal', threatActor: 'Insider?', reputation: 15, score: 52, tlp: 'AMBER', tags: ['Reconnaissance', 'Internal'] },
  { id: '19', indicator: 'powershell-empire.ps1', type: 'File Name', severity: Severity.HIGH, lastSeen: '8 hours ago', source: 'EDR', description: 'Empire Framework PowerShell Script', status: IncidentStatus.CONTAINED, confidence: 91, region: 'NA', threatActor: 'Red Team', reputation: 30, score: 69, tlp: 'GREEN', tags: ['PowerShell', 'Post-Exploitation'] },
  { id: '20', indicator: 'sql-injection-payload', type: 'Exploit', severity: Severity.MEDIUM, lastSeen: '12 hours ago', source: 'WAF', description: 'SQL Injection Attempt on Web App', status: IncidentStatus.NEW, confidence: 67, region: 'Global', threatActor: 'Script Kiddie', reputation: 25, score: 41, tlp: 'GREEN', tags: ['SQL Injection', 'Web Attack'] },
  { id: '21', indicator: 'ransomware-note.txt', type: 'File Name', severity: Severity.CRITICAL, lastSeen: '5 hours ago', source: 'File Monitor', description: 'Ryuk Ransomware Note', status: IncidentStatus.INVESTIGATING, confidence: 100, region: 'EU', threatActor: 'Ryuk', reputation: 95, score: 98, tlp: 'RED', tags: ['Ransomware', 'Encryption'] },
  { id: '22', indicator: '185.130.5.200', type: 'IP Address', severity: Severity.HIGH, lastSeen: '2 days ago', source: 'Threat Intel Feed', description: 'Known Cobalt Strike C2 Server', status: IncidentStatus.INVESTIGATING, confidence: 94, region: 'Global', threatActor: 'Multiple APTs', reputation: 90, score: 89, tlp: 'AMBER', tags: ['Cobalt Strike', 'C2'] },
  { id: '23', indicator: 'fake-update-service.com', type: 'Domain', severity: Severity.MEDIUM, lastSeen: '1 day ago', source: 'URL Scanner', description: 'Fake Software Update Site', status: IncidentStatus.NEW, confidence: 76, region: 'Global', threatActor: 'Unknown', reputation: 55, score: 61, tlp: 'GREEN', tags: ['Phishing', 'Fake Update'] },
  { id: '24', indicator: 'CVE-2021-34527', type: 'Exploit', severity: Severity.CRITICAL, lastSeen: '3 days ago', source: 'Vuln Scanner', description: 'PrintNightmare Vulnerability', status: IncidentStatus.CONTAINED, confidence: 98, region: 'Internal', threatActor: 'Multiple', reputation: 85, score: 91, tlp: 'RED', tags: ['Print Spooler', 'RCE'] },
  { id: '25', indicator: 'keylogger.dll', type: 'File Hash', severity: Severity.HIGH, lastSeen: '1 day ago', source: 'EDR', description: 'Commercial Keylogger Malware', status: IncidentStatus.NEW, confidence: 83, region: 'Asia', threatActor: 'Unknown', reputation: 70, score: 74, tlp: 'AMBER', tags: ['Keylogger', 'Spyware'] },
  { id: '26', indicator: '10.0.5.100', type: 'IP Address', severity: Severity.MEDIUM, lastSeen: '4 hours ago', source: 'Firewall', description: 'Blocked SMB EternalBlue Attempt', status: IncidentStatus.CONTAINED, confidence: 88, region: 'Internal', threatActor: 'WannaCry', reputation: 80, score: 76, tlp: 'GREEN', tags: ['SMB', 'EternalBlue'] },
  { id: '27', indicator: 'bitcoin-wallet-stealer.exe', type: 'File Name', severity: Severity.HIGH, lastSeen: '6 hours ago', source: 'AV', description: 'Cryptocurrency Wallet Stealer', status: IncidentStatus.INVESTIGATING, confidence: 79, region: 'Global', threatActor: 'Crypto Thief', reputation: 65, score: 68, tlp: 'AMBER', tags: ['Cryptocurrency', 'Theft'] },
  { id: '28', indicator: 'compromised-admin.onion', type: 'Domain', severity: Severity.CRITICAL, lastSeen: '2 days ago', source: 'Dark Web Intel', description: 'Stolen Admin Credentials Marketplace', status: IncidentStatus.INVESTIGATING, confidence: 95, region: 'Dark Web', threatActor: 'Credential Broker', reputation: 85, score: 87, tlp: 'RED', tags: ['Dark Web', 'Credentials'] },
  { id: '29', indicator: '204.79.197.200', type: 'IP Address', severity: Severity.LOW, lastSeen: '1 week ago', source: 'DNS Logs', description: 'Microsoft IP - Possible Domain Shadowing', status: IncidentStatus.CLOSED, confidence: 45, region: 'Global', threatActor: 'Unknown', reputation: 5, score: 28, tlp: 'GREEN', tags: ['Domain Shadowing'] },
  { id: '30', indicator: 'macro-enabled-doc.docm', type: 'File Name', severity: Severity.MEDIUM, lastSeen: '3 days ago', source: 'Email Filter', description: 'Malicious Word Document with Macros', status: IncidentStatus.NEW, confidence: 71, region: 'EU', threatActor: 'Unknown', reputation: 50, score: 56, tlp: 'GREEN', tags: ['Macro', 'Office Document'] }
];

export const MOCK_CASES: Case[] = [
  { id: 'CASE-23-001', title: 'Operation Blue Horizon', description: 'Investigation into coordinated phishing campaign.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Analyst.Doe', reporter: 'System', created: '2023-10-25', relatedThreatIds: ['1', '3'], findings: 'Confirmed C2 activity.', tasks: [{ id: 't1', title: 'Analyze headers', status: 'DONE' }, { id: 't2', title: 'Reset Credentials', status: 'DONE' }], notes: [], artifacts: [], timeline: [{ id: 'tl1', date: '2023-10-25 08:00', title: 'Initial Alert', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Phishing'], tlp: 'AMBER' },
  { id: 'CASE-23-002', title: 'Internal Data Exfil - Finance', description: 'Anomalous outbound traffic from Finance subnet.', status: 'OPEN', priority: 'CRITICAL', assignee: 'Analyst.Smith', reporter: 'DLP_System', created: '2023-10-27', relatedThreatIds: ['5'], findings: 'Possible insider threat.', tasks: [{ id: 't4', title: 'Isolate Host', status: 'DONE' }], notes: [], artifacts: [], timeline: [], agency: 'SENTINEL_CORE', sharingScope: 'JOINT_TASK_FORCE', sharedWith: ['FBI_CYBER'], labels: ['Insider'], tlp: 'RED' },
  { id: 'CASE-23-003', title: 'Ransomware Deployment - Legal', description: 'Ryuk ransomware detected in Legal department.', status: 'IN_PROGRESS', priority: 'CRITICAL', assignee: 'Analyst.Jones', reporter: 'EDR', created: '2023-10-28', relatedThreatIds: ['21'], findings: 'Encryption in progress.', tasks: [{ id: 't5', title: 'Isolate affected systems', status: 'DONE' }, { id: 't6', title: 'Contact incident response team', status: 'PENDING' }], notes: [], artifacts: [], timeline: [{ id: 'tl2', date: '2023-10-28 14:30', title: 'Ransomware Alert', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Ransomware'], tlp: 'RED' },
  { id: 'CASE-23-004', title: 'APT-29 Spear Phishing', description: 'Targeted spear phishing against executive team.', status: 'CLOSED', priority: 'HIGH', assignee: 'Analyst.Brown', reporter: 'Email_Gateway', created: '2023-10-20', relatedThreatIds: ['1', '15'], findings: 'APT-29 attribution confirmed.', tasks: [{ id: 't7', title: 'Forensic analysis', status: 'DONE' }, { id: 't8', title: 'Executive briefing', status: 'DONE' }], notes: [], artifacts: [], timeline: [{ id: 'tl3', date: '2023-10-20 09:15', title: 'Phishing Email Received', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'JOINT_TASK_FORCE', sharedWith: ['NSA', 'FBI'], labels: ['APT', 'Spear Phishing'], tlp: 'RED' },
  { id: 'CASE-23-005', title: 'Zero-Day Exploitation', description: 'Unknown vulnerability exploited in perimeter systems.', status: 'IN_PROGRESS', priority: 'CRITICAL', assignee: 'Analyst.Wilson', reporter: 'IDS', created: '2023-10-30', relatedThreatIds: ['10', '16'], findings: 'Zero-day in VPN appliance.', tasks: [{ id: 't9', title: 'Patch development', status: 'PENDING' }, { id: 't10', title: 'Asset isolation', status: 'DONE' }], notes: [], artifacts: [], timeline: [{ id: 'tl4', date: '2023-10-30 16:45', title: 'Zero-day Alert', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: ['VPN_VENDOR'], labels: ['Zero-Day'], tlp: 'RED' },
  { id: 'CASE-23-006', title: 'Insider Data Theft', description: 'Former employee accessing sensitive data.', status: 'OPEN', priority: 'MEDIUM', assignee: 'Analyst.Davis', reporter: 'HR', created: '2023-11-01', relatedThreatIds: ['18'], findings: 'Access logs show unauthorized downloads.', tasks: [{ id: 't11', title: 'Review access logs', status: 'DONE' }, { id: 't12', title: 'Legal consultation', status: 'PENDING' }], notes: [], artifacts: [], timeline: [{ id: 'tl5', date: '2023-11-01 11:20', title: 'HR Report', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Insider Threat'], tlp: 'AMBER' },
  { id: 'CASE-23-007', title: 'Supply Chain Attack', description: 'Compromised third-party vendor software.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'Analyst.Miller', reporter: 'Vuln_Scanner', created: '2023-11-02', relatedThreatIds: ['2', '24'], findings: 'Backdoor in vendor library.', tasks: [{ id: 't13', title: 'Vendor notification', status: 'DONE' }, { id: 't14', title: 'Software inventory', status: 'PENDING' }], notes: [], artifacts: [], timeline: [{ id: 'tl6', date: '2023-11-02 08:30', title: 'Vulnerability Scan', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'PUBLIC', sharedWith: ['SOFTWARE_ALLIANCE'], labels: ['Supply Chain'], tlp: 'AMBER' },
  { id: 'CASE-23-008', title: 'Dark Web Credential Sales', description: 'Company credentials found on dark web marketplace.', status: 'CLOSED', priority: 'HIGH', assignee: 'Analyst.Garcia', reporter: 'Dark_Web_Monitor', created: '2023-10-15', relatedThreatIds: ['28'], findings: 'Credentials from 2022 breach.', tasks: [{ id: 't15', title: 'Password reset campaign', status: 'DONE' }, { id: 't16', title: 'Credential monitoring', status: 'DONE' }], notes: [], artifacts: [], timeline: [{ id: 'tl7', date: '2023-10-15 14:10', title: 'Dark Web Alert', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Credential Stuffing'], tlp: 'RED' },
  { id: 'CASE-23-009', title: 'Nation-State Espionage', description: 'Advanced persistent threat targeting R&D data.', status: 'IN_PROGRESS', priority: 'CRITICAL', assignee: 'Analyst.Lee', reporter: 'SIEM', created: '2023-11-05', relatedThreatIds: ['17', '22'], findings: 'APT-41 infrastructure identified.', tasks: [{ id: 't17', title: 'Intelligence briefing', status: 'DONE' }, { id: 't18', title: 'Enhanced monitoring', status: 'PENDING' }], notes: [], artifacts: [], timeline: [{ id: 'tl8', date: '2023-11-05 22:15', title: 'APT Alert', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'JOINT_TASK_FORCE', sharedWith: ['NSA', 'CISA'], labels: ['APT', 'Espionage'], tlp: 'RED' },
  { id: 'CASE-23-010', title: 'Cryptocurrency Mining', description: 'Unauthorized crypto mining on cloud infrastructure.', status: 'OPEN', priority: 'LOW', assignee: 'Analyst.Taylor', reporter: 'Cloud_Monitor', created: '2023-11-08', relatedThreatIds: ['27'], findings: 'Miner deployed via compromised API key.', tasks: [{ id: 't19', title: 'Resource isolation', status: 'DONE' }, { id: 't20', title: 'API key rotation', status: 'PENDING' }], notes: [], artifacts: [], timeline: [{ id: 'tl9', date: '2023-11-08 06:45', title: 'Resource Alert', type: 'ALERT' }], agency: 'SENTINEL_CORE', sharingScope: 'INTERNAL', sharedWith: [], labels: ['Crypto Mining'], tlp: 'GREEN' }
];

export const MOCK_PLAYBOOKS: Playbook[] = [
  { id: 'pb1', name: 'Phishing Response', description: 'Standard procedure.', tasks: ['Analyze Email', 'Block Domain', 'Reset Creds'], triggerLabel: 'Phishing', riskLevel: 'LOW' },
  { id: 'pb2', name: 'Ransomware Containment', description: 'Isolation protocol.', tasks: ['Isolate Host', 'Snapshot', 'Identify Variant'], triggerLabel: 'Ransomware', riskLevel: 'HIGH' },
  { id: 'pb3', name: 'Critical Patch Deploy', description: 'Emergency patching.', tasks: ['Backup', 'Apply Patch', 'Reboot'], triggerLabel: 'Vulnerability', riskLevel: 'MODERATE' },
  { id: 'pb4', name: 'DDoS Mitigation', description: 'Traffic scrubbing.', tasks: ['Route to Scrubbing', 'Block IP Range'], triggerLabel: 'DDoS', riskLevel: 'MODERATE' },
];

export const MOCK_ACTORS: ThreatActor[] = [
  { id: 'a1', name: 'APT-29', aliases: ['Cozy Bear'], origin: 'Russia', description: 'SVR affiliated.', sophistication: 'Advanced', targets: ['Gov', 'Energy'], campaigns: ['SolarWinds'], ttps: [{id:'t1', code:'T1093', name:'Process Hollowing'}, {id:'t2', code:'T1027', name:'Obfuscated Files'}], infrastructure: [], exploits: ['CVE-2023-23397'], references: [], history: [], evasionTechniques: ['Rootkit', 'Fileless Malware'] },
  { id: 'a2', name: 'Lazarus', aliases: ['Hidden Cobra'], origin: 'DPRK', description: 'State-sponsored cybercrime.', sophistication: 'Advanced', targets: ['Finance'], campaigns: ['WannaCry'], ttps: [{id:'t4', code:'T1486', name:'Data Encrypted'}], infrastructure: [], exploits: ['CVE-2023-34362'], references: [], history: [], evasionTechniques: ['Anti-VM', 'Packers'] },
  { id: 'a3', name: 'APT-41', aliases: ['Double Dragon', 'Winnti'], origin: 'China', description: 'Chinese state-sponsored espionage and cybercrime.', sophistication: 'Advanced', targets: ['Tech', 'Gaming', 'Healthcare'], campaigns: ['Operation ShadowHammer'], ttps: [{id:'t5', code:'T1190', name:'Exploit Public-Facing Application'}, {id:'t6', code:'T1078', name:'Valid Accounts'}], infrastructure: [], exploits: ['CVE-2023-36884'], references: [], history: [], evasionTechniques: ['Living off the Land', 'Code Signing'] },
  { id: 'a4', name: 'FIN7', aliases: ['Carbanak'], origin: 'Russia', description: 'Financially motivated cybercrime group.', sophistication: 'Advanced', targets: ['Retail', 'Hospitality'], campaigns: ['Point-of-Sale Attacks'], ttps: [{id:'t7', code:'T1059', name:'Command and Scripting Interpreter'}, {id:'t8', code:'T1003', name:'OS Credential Dumping'}], infrastructure: [], exploits: ['CVE-2023-29360'], references: [], history: [], evasionTechniques: ['Anti-Forensic Techniques', 'Fast Flux DNS'] },
  { id: 'a5', name: 'APT-28', aliases: ['Fancy Bear', 'Sofacy'], origin: 'Russia', description: 'GRU military intelligence cyber operations.', sophistication: 'Advanced', targets: ['Defense', 'Politics'], campaigns: ['DNC Hack'], ttps: [{id:'t9', code:'T1566', name:'Phishing'}, {id:'t10', code:'T1059.001', name:'PowerShell'}], infrastructure: [], exploits: ['CVE-2023-36884'], references: [], history: [], evasionTechniques: ['Spear Phishing', 'Zero-Day Exploits'] },
  { id: 'a6', name: 'Sandworm', aliases: ['Voodoo Bear', 'Iron Viking'], origin: 'Russia', description: 'Russian GRU cyber warfare unit.', sophistication: 'Advanced', targets: ['Critical Infrastructure'], campaigns: ['NotPetya', 'Ukraine Power Grid'], ttps: [{id:'t11', code:'T1486', name:'Data Encrypted'}, {id:'t12', code:'T0827', name:'ICS Protocol'}], infrastructure: [], exploits: ['CVE-2021-34527'], references: [], history: [], evasionTechniques: ['Wiper Malware', 'False Flags'] },
  { id: 'a7', name: 'TA505', aliases: ['Hive0107'], origin: 'Eastern Europe', description: 'Cybercrime group specializing in ransomware and banking trojans.', sophistication: 'Intermediate', targets: ['Global Business'], campaigns: ['Clop Ransomware'], ttps: [{id:'t13', code:'T1566.001', name:'Spearphishing Attachment'}, {id:'t14', code:'T1055', name:'Process Injection'}], infrastructure: [], exploits: ['CVE-2023-36884'], references: [], history: [], evasionTechniques: ['Polymorphic Malware', 'Tor C2'] },
  { id: 'a8', name: 'LockBit', aliases: ['LockBit Gang'], origin: 'Unknown', description: 'Ransomware-as-a-Service operation.', sophistication: 'Intermediate', targets: ['Healthcare', 'Manufacturing'], campaigns: ['LockBit 2.0'], ttps: [{id:'t15', code:'T1486', name:'Data Encrypted'}, {id:'t16', code:'T1027.002', name:'Software Packing'}], infrastructure: [], exploits: ['CVE-2023-34362'], references: [], history: [], evasionTechniques: ['Double Extortion', 'Anti-Analysis'] },
  { id: 'a9', name: 'Conti', aliases: ['Wizard Spider'], origin: 'Russia', description: 'Former ransomware group, now defunct.', sophistication: 'Advanced', targets: ['Healthcare', 'Government'], campaigns: ['Colonial Pipeline'], ttps: [{id:'t17', code:'T1059.003', name:'Windows Command Shell'}, {id:'t18', code:'T1003.001', name:'LSASS Memory'}], infrastructure: [], exploits: ['CVE-2023-36884'], references: [], history: [], evasionTechniques: ['Living off the Land', 'Fileless Malware'] },
  { id: 'a10', name: 'REvil', aliases: ['Sodinokibi'], origin: 'Russia', description: 'Ransomware group, disrupted by law enforcement.', sophistication: 'Advanced', targets: ['Manufacturing', 'Tech'], campaigns: ['Kaseya Supply Chain'], ttps: [{id:'t19', code:'T1190', name:'Exploit Public-Facing Application'}, {id:'t20', code:'T1486', name:'Data Encrypted'}], infrastructure: [], exploits: ['CVE-2023-29360'], references: [], history: [], evasionTechniques: ['Zero-Day Exploits', 'Supply Chain Attacks'] }
];

export const MOCK_CAMPAIGNS: Campaign[] = [
  { id: 'CAM-001', name: 'SolarWinds Supply Chain', description: 'Widespread supply chain attack.', status: 'ARCHIVED', objective: 'ESPIONAGE', actors: ['APT-29'], firstSeen: '2020-03-01', lastSeen: '2021-02-28', targetSectors: ['Gov', 'Tech'], targetRegions: ['NA'], threatIds: ['1'], ttps: ['T1195'] },
  { id: 'CAM-002', name: 'Operation Dream Job', description: 'Lazarus job offer lures.', status: 'ACTIVE', objective: 'ESPIONAGE', actors: ['Lazarus'], firstSeen: '2022-06-15', lastSeen: '2023-10-27', targetSectors: ['Defense'], targetRegions: ['Global'], threatIds: [], ttps: ['T1566'] },
  { id: 'CAM-003', name: 'Operation ShadowHammer', description: 'Supply chain attack on ASUS software.', status: 'ARCHIVED', objective: 'ESPIONAGE', actors: ['APT-41'], firstSeen: '2018-06-01', lastSeen: '2019-03-15', targetSectors: ['Tech', 'Gaming'], targetRegions: ['Asia'], threatIds: [], ttps: ['T1195', 'T1566'] },
  { id: 'CAM-004', name: 'Carbanak Banking Attacks', description: 'ATM and banking system compromises.', status: 'ACTIVE', objective: 'FINANCIAL', actors: ['FIN7'], firstSeen: '2013-01-01', lastSeen: '2023-11-01', targetSectors: ['Finance', 'Retail'], targetRegions: ['Global'], threatIds: [], ttps: ['T1059', 'T1003'] },
  { id: 'CAM-005', name: 'DNC Email Hack', description: 'Political interference campaign.', status: 'ARCHIVED', objective: 'INFLUENCE', actors: ['APT-28'], firstSeen: '2016-03-01', lastSeen: '2016-11-08', targetSectors: ['Politics'], targetRegions: ['NA'], threatIds: [], ttps: ['T1566', 'T1059.001'] },
  { id: 'CAM-006', name: 'NotPetya Global Ransomware', description: 'Destructive wiper disguised as ransomware.', status: 'ARCHIVED', objective: 'DESTRUCTION', actors: ['Sandworm'], firstSeen: '2017-06-27', lastSeen: '2017-07-15', targetSectors: ['Global Business'], targetRegions: ['Global'], threatIds: ['21'], ttps: ['T1486', 'T0827'] },
  { id: 'CAM-007', name: 'Clop Ransomware Campaign', description: 'MOVEit Transfer exploitation.', status: 'ACTIVE', objective: 'FINANCIAL', actors: ['TA505'], firstSeen: '2023-05-01', lastSeen: '2023-11-01', targetSectors: ['Healthcare', 'Government'], targetRegions: ['Global'], threatIds: ['2'], ttps: ['T1566.001', 'T1055'] },
  { id: 'CAM-008', name: 'LockBit 2.0', description: 'Ransomware-as-a-Service operations.', status: 'ACTIVE', objective: 'FINANCIAL', actors: ['LockBit'], firstSeen: '2021-09-01', lastSeen: '2023-11-01', targetSectors: ['Healthcare', 'Manufacturing'], targetRegions: ['Global'], threatIds: ['2'], ttps: ['T1486', 'T1027.002'] },
  { id: 'CAM-009', name: 'Colonial Pipeline Attack', description: 'Critical infrastructure disruption.', status: 'ARCHIVED', objective: 'DESTRUCTION', actors: ['Conti'], firstSeen: '2021-05-06', lastSeen: '2021-05-08', targetSectors: ['Energy'], targetRegions: ['NA'], threatIds: [], ttps: ['T1059.003', 'T1003.001'] },
  { id: 'CAM-010', name: 'Kaseya Supply Chain', description: 'MSP software exploitation.', status: 'ARCHIVED', objective: 'FINANCIAL', actors: ['REvil'], firstSeen: '2021-07-02', lastSeen: '2021-07-05', targetSectors: ['Tech', 'MSP'], targetRegions: ['Global'], threatIds: [], ttps: ['T1190', 'T1486'] },
  { id: 'CAM-011', name: 'WannaCry Global Outbreak', description: 'EternalBlue exploitation campaign.', status: 'ARCHIVED', objective: 'FINANCIAL', actors: ['Lazarus'], firstSeen: '2017-05-12', lastSeen: '2017-05-15', targetSectors: ['Global'], targetRegions: ['Global'], threatIds: ['26'], ttps: ['T1210', 'T1486'] },
  { id: 'CAM-012', name: 'Emotet Banking Trojan', description: 'Modular malware distribution.', status: 'ACTIVE', objective: 'FINANCIAL', actors: ['TA542'], firstSeen: '2014-01-01', lastSeen: '2023-11-01', targetSectors: ['Finance'], targetRegions: ['Global'], threatIds: ['12'], ttps: ['T1566', 'T1055'] },
  { id: 'CAM-013', name: 'Ukraine Power Grid Attack', description: 'ICS targeting campaign.', status: 'ARCHIVED', objective: 'DESTRUCTION', actors: ['Sandworm'], firstSeen: '2015-12-23', lastSeen: '2016-01-01', targetSectors: ['Critical Infrastructure'], targetRegions: ['EU'], threatIds: [], ttps: ['T0827', 'T0855'] },
  { id: 'CAM-014', name: 'Qakbot Malware Distribution', description: 'Email-based malware campaign.', status: 'ACTIVE', objective: 'ESPIONAGE', actors: ['Qakbot'], firstSeen: '2007-01-01', lastSeen: '2023-11-01', targetSectors: ['Global Business'], targetRegions: ['Global'], threatIds: ['15'], ttps: ['T1566.001', 'T1055'] },
  { id: 'CAM-015', name: 'Ryuk Healthcare Attacks', description: 'Targeted ransomware against hospitals.', status: 'ACTIVE', objective: 'FINANCIAL', actors: ['Ryuk'], firstSeen: '2018-08-01', lastSeen: '2023-11-01', targetSectors: ['Healthcare'], targetRegions: ['Global'], threatIds: ['21'], ttps: ['T1486', 'T1027'] }
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

export const MOCK_AUDIT_LOGS: AuditLog[] = [
  // AUTH
  { id: 'L-1001', action: 'LOGIN_SUCCESS', user: 'admin', timestamp: '2023-10-27 08:00:01', details: 'Method: MFA', location: '10.0.0.5' },
  { id: 'L-1006', action: 'LOGIN_FAILURE', user: 'admin', timestamp: '2023-10-27 09:10:00', details: 'Bad Password (3rd attempt)', location: '203.0.113.55' },
  { id: 'L-1012', action: 'AUTH_MFA_FAIL', user: 'vendor_01', timestamp: '2023-10-27 13:45:10', details: 'Invalid Token', location: 'VPN-Gateway' },
  { id: 'L-1016', action: 'LOGOUT_SUCCESS', user: 'j.doe', timestamp: '2023-10-27 17:00:00', details: 'Session Terminated', location: '10.0.0.12' },
  
  // SYSTEM
  { id: 'L-1002', action: 'SYSTEM_STARTUP', user: 'SYSTEM', timestamp: '2023-10-27 08:00:05', details: 'Kernel init complete', location: 'Server-01' },
  { id: 'L-1013', action: 'SYSTEM_UPDATE', user: 'admin', timestamp: '2023-10-27 14:00:00', details: 'Applied Patch KB4056892', location: 'DC-01' },
  { id: 'L-1017', action: 'SERVICE_RESTART', user: 'SYSTEM', timestamp: '2023-10-27 03:00:00', details: 'Nginx Service Restarted', location: 'Web-01' },

  // NETWORK
  { id: 'L-1003', action: 'NETWORK_CONNECT', user: 'j.doe', timestamp: '2023-10-27 08:15:22', details: 'VPN Established', location: '192.168.1.50' },
  { id: 'L-1010', action: 'FIREWALL_DENY', user: 'SYSTEM', timestamp: '2023-10-27 10:15:33', details: 'Blocked inbound tcp/445 from 185.200.1.1', location: 'FW-Edge' },
  { id: 'L-1018', action: 'IPS_ALERT', user: 'SYSTEM', timestamp: '2023-10-27 11:20:00', details: 'SQL Injection Blocked', location: 'WAF-01' },

  // DATA
  { id: 'L-1004', action: 'DATA_ACCESS', user: 'analyst_01', timestamp: '2023-10-27 08:30:00', details: 'Viewed Case #23-001', location: 'Workstation-04' },
  { id: 'L-1009', action: 'DATA_EXPORT', user: 'j.doe', timestamp: '2023-10-27 10:00:00', details: 'Exported 500 records to CSV', location: 'Workstation-02' },
  { id: 'L-1014', action: 'DATA_DELETE', user: 'admin', timestamp: '2023-10-27 14:30:00', details: 'Purged temporary artifacts', location: 'File-Server' },

  // POLICY
  { id: 'L-1005', action: 'POLICY_VIOLATION', user: 'temp_user', timestamp: '2023-10-27 09:05:11', details: 'USB Mass Storage Detected', location: 'Kiosk-02' },
  { id: 'L-1019', action: 'DLP_BLOCK', user: 'j.doe', timestamp: '2023-10-27 15:10:00', details: 'Blocked SSN Pattern in Email', location: 'Mail-GW' },

  // ERROR
  { id: 'L-1007', action: 'ERROR_API', user: 'SYSTEM', timestamp: '2023-10-27 09:12:45', details: '500 Internal Server Error /api/v1/feeds', location: 'Gateway-01' },
  { id: 'L-1015', action: 'ERROR_DB', user: 'SYSTEM', timestamp: '2023-10-27 15:00:00', details: 'Connection Pool Exhausted', location: 'DB-Cluster' },

  // ADMIN
  { id: 'L-1008', action: 'ADMIN_ACTION', user: 'admin', timestamp: '2023-10-27 09:30:00', details: 'Promoted user j.doe to Handler', location: '10.0.0.5' },
  { id: 'L-1011', action: 'ARCHIVE_JOB', user: 'SYSTEM', timestamp: '2023-10-27 12:00:00', details: 'Daily log rotation completed', location: 'Archive-Svc' },
  { id: 'L-1020', action: 'CONFIG_CHANGE', user: 'admin', timestamp: '2023-10-27 16:00:00', details: 'Updated Retention Policy to 365 days', location: 'Sys-Config' },
];

export const MOCK_VULNERABILITIES: Vulnerability[] = [
  { id: 'CVE-2023-23397', score: 9.8, name: 'Outlook EoP', status: 'PATCHED', vendor: 'Microsoft', vectors: ['Network'], zeroDay: false, exploited: true },
  { id: 'CVE-2023-34362', score: 9.8, name: 'MOVEit SQLi', status: 'UNPATCHED', vendor: 'Progress', vectors: ['Web'], zeroDay: true, exploited: true },
  { id: 'CVE-2023-4863', score: 8.8, name: 'WebP Overflow', status: 'MITIGATED', vendor: 'Google', vectors: ['Local'], zeroDay: false, exploited: false },
  { id: 'CVE-2023-44487', score: 7.5, name: 'HTTP/2 Rapid Reset', status: 'PATCHED', vendor: 'Multiple', vectors: ['Network'], zeroDay: false, exploited: true },
  { id: 'CVE-2021-34527', score: 8.8, name: 'PrintNightmare', status: 'PATCHED', vendor: 'Microsoft', vectors: ['Network'], zeroDay: false, exploited: true },
  { id: 'CVE-2023-36884', score: 8.3, name: 'Office RCE', status: 'UNPATCHED', vendor: 'Microsoft', vectors: ['Local'], zeroDay: true, exploited: false },
  { id: 'CVE-2023-29360', score: 7.8, name: 'IIS EoP', status: 'MITIGATED', vendor: 'Microsoft', vectors: ['Network'], zeroDay: false, exploited: false },
  { id: 'CVE-2023-38180', score: 7.5, name: 'Windows CryptoAPI', status: 'PATCHED', vendor: 'Microsoft', vectors: ['Network'], zeroDay: false, exploited: true },
  { id: 'CVE-2023-35311', score: 8.1, name: 'Windows ALPC', status: 'UNPATCHED', vendor: 'Microsoft', vectors: ['Local'], zeroDay: false, exploited: false },
  { id: 'CVE-2023-32019', score: 7.8, name: 'Windows Kernel', status: 'PATCHED', vendor: 'Microsoft', vectors: ['Local'], zeroDay: false, exploited: true }
];

export const MOCK_PATCH_STATUS: PatchStatus[] = [
  { id: 'ps1', system: 'Workstations (Windows)', total: 450, patched: 442, compliance: 98, criticalPending: 2 },
  { id: 'ps2', system: 'Servers (Linux)', total: 120, patched: 110, compliance: 91, criticalPending: 3 },
  { id: 'ps3', system: 'Database Clusters', total: 15, patched: 15, compliance: 100, criticalPending: 0 },
  { id: 'ps4', system: 'Edge Devices', total: 60, patched: 45, compliance: 75, criticalPending: 5 },
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
      id: 'n3', name: 'HQ-DC-01', status: 'ONLINE', load: 32, latency: 4, type: 'Server', vendor: 'Microsoft', vulnerabilities: ['CVE-2023-23397'], criticalProcess: 'AUTH_SERVICE', dependencies: ['n2'], 
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
    { 
      id: 'n6', name: 'WS-ADMIN-01', status: 'ONLINE', load: 15, latency: 5, type: 'Workstation', vendor: 'Microsoft', dependencies: ['n5'], 
      securityControls: ['AV', 'EDR'], dataSensitivity: 'INTERNAL', dataVolumeGB: 250 
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

export const MOCK_DOMAIN: OsintDomain[] = [{ id: 'd1', domain: 'evil.com', registrar: 'BadHost', created: '2023-10', expires: '2024-10', dns: '1.2.3.4', status: 'Active', subdomains: ['mail.'], ssl: 'Valid' }];
export const MOCK_BREACH: OsintBreach[] = [{ id: 'br1', email: 'ceo@target.com', breach: 'LinkedIn', date: '2016', data: 'Pass', hash: '5f4d...', source: 'Leak' }, { id: 'br2', email: 'adm.s.connor@sentinel.co', breach: 'Canva', date: '2019', data: 'Hash', hash: '...', source: 'Leak' }];
export const MOCK_SOCIAL: OsintSocial[] = [{ id: 'soc1', handle: '@threat', platform: 'Twitter', status: 'Active', followers: 1200, lastPost: '2h', sentiment: 'Neg', bio: 'Researcher' }, { id: 'soc2', handle: '@s_connor', platform: 'LinkedIn', status: 'Active', followers: 500, lastPost: '1d', sentiment: 'Neutral', bio: 'Sentinel Admin' }];
export const MOCK_GEO: OsintGeo[] = [{ id: 'geo1', ip: '185.200.1.1', city: 'Moscow', country: 'RU', isp: 'Tel', asn: 'AS123', coords: '55,37', ports: [80], threatScore: 85 }];
export const MOCK_DARKWEB = [{ source: 'Raid', title: 'DB Leak', date: '2023', author: 'GodSpeed', status: 'Verified', price: '$500' }];
export const MOCK_META = [{ name: 'inv.pdf', size: '1MB', type: 'PDF', author: 'Unknown', created: '2023', gps: 'None' }];
export const MOCK_USERS: SystemUser[] = [{ id: 'U1', name: 'Adm. S. Connor', role: 'Admin', clearance: 'TS', status: 'Online', isVIP: true }, { id: 'U2', name: 'J. Doe', role: 'Analyst', clearance: 'Secret', status: 'Busy' }];
export const MOCK_INTEGRATIONS: Integration[] = [{ id: 'i1', name: 'CrowdStrike', status: 'Connected', type: 'EDR' }, { id: 'i2', name: 'Splunk', status: 'Connected', type: 'SIEM' }];

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
