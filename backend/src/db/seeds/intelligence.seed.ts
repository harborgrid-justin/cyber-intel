
export const INITIAL_THREATS = [
  { id: '1', indicator: '192.168.1.105', type: 'IP Address', severity: 'CRITICAL', source: 'FW-01', description: 'C2 Beaconing Detected', status: 'NEW', confidence: 98, region: 'APAC', threat_actor: 'APT-29', reputation: 95, score: 96, tags: ['Botnet', 'C2'], origin: 'External' },
  { id: '2', indicator: '7a0d...8f2b', type: 'File Hash', severity: 'HIGH', source: 'EDR-West', description: 'Ransomware.LockBit Variant', status: 'INVESTIGATING', confidence: 85, region: 'NA', threat_actor: 'LockBit', reputation: 90, score: 88, tags: ['Ransomware', 'Malware'], origin: 'Internal' },
  { id: '3', indicator: 'update-sys-win.com', type: 'Domain', severity: 'MEDIUM', source: 'DNS-03', description: 'Typosquatting Domain', status: 'NEW', confidence: 72, region: 'EU', threat_actor: 'Unknown', reputation: 45, score: 55, tags: ['Phishing'], origin: 'External' },
  { id: '5', indicator: '10.20.0.55', type: 'IP Address', severity: 'HIGH', source: 'IDS-Core', description: 'Lateral Movement (SMB)', status: 'CONTAINED', confidence: 91, region: 'LATAM', threat_actor: 'Insider?', reputation: 10, score: 62, tags: ['Exploit'], origin: 'Internal' },
  { id: '6', indicator: 'login-microsoft-auth.com', type: 'URL', severity: 'HIGH', source: 'Email Gateway', description: 'Credential Harvesting Page', status: 'NEW', confidence: 88, region: 'Global', threat_actor: 'Unknown', reputation: 20, score: 75, tags: ['Phishing'], origin: 'External' },
  { id: '7', indicator: 'CVE-2023-44487', type: 'Exploit', severity: 'CRITICAL', source: 'WAF', description: 'HTTP/2 Rapid Reset Attack', status: 'INVESTIGATING', confidence: 95, region: 'NA', threat_actor: 'DDoS-Group', reputation: 100, score: 92, tags: ['Exploit', 'DDoS', 'Zero-Day'], origin: 'External' },
];

export const INITIAL_CASES = [
  { id: 'CASE-23-001', title: 'Operation Blue Horizon', description: 'Investigation into coordinated phishing campaign.', status: 'IN_PROGRESS', priority: 'HIGH', assignee: 'analyst.doe', created_by: 'admin.connor', agency: 'SENTINEL_CORE', related_threat_ids: ['1', '3'], shared_with: [], timeline: [], tasks: [] },
  { id: 'CASE-23-002', title: 'Internal Data Exfil - Finance', description: 'Anomalous outbound traffic from Finance subnet.', status: 'OPEN', priority: 'CRITICAL', assignee: 'admin.connor', created_by: 'system', agency: 'SENTINEL_CORE', related_threat_ids: ['5'], shared_with: ['FBI_CYBER'], timeline: [], tasks: [] }
];

export const INITIAL_ACTORS = [
  { 
    id: 'a1', name: 'APT-29', origin: 'Russia', description: 'SVR affiliated.', sophistication: 'Advanced', targets: ['Gov', 'Energy'], aliases: ['Cozy Bear'],
    evasion_techniques: ['Rootkit', 'Fileless Malware', 'Process Hollowing'], exploits: ['CVE-2023-23397'] 
  },
  { 
    id: 'a2', name: 'Lazarus', origin: 'DPRK', description: 'State-sponsored cybercrime.', sophistication: 'Advanced', targets: ['Finance'], aliases: ['Hidden Cobra'],
    evasion_techniques: ['Anti-VM', 'Packers'], exploits: ['CVE-2023-34362'] 
  }
];
