
export const INITIAL_AUDIT_LOGS = [
  { id: 'AUDIT-001', user_id: 'USR-ADMIN', action: 'CREATE', details: 'Created case CASE-2024-001: Operation Blue Horizon', resource_id: 'CASE-2024-001', ip_address: '10.10.0.100', timestamp: new Date('2024-12-08T10:00:00Z') },
  { id: 'AUDIT-002', user_id: 'USR-ADMIN', action: 'UPDATE', details: 'Assigned case CASE-2024-001 to analyst.doe', resource_id: 'CASE-2024-001', ip_address: '10.10.0.100', timestamp: new Date('2024-12-08T11:30:00Z') },
  { id: 'AUDIT-003', user_id: 'USR-ANALYST', action: 'CREATE', details: 'Added threat indicator THR-003 to system', resource_id: 'THR-003', ip_address: '10.10.0.50', timestamp: new Date('2024-12-09T09:15:00Z') },
  { id: 'AUDIT-004', user_id: 'USR-ADMIN', action: 'EXECUTE', details: 'Executed playbook PB-002: Ransomware Isolation', resource_id: 'PB-002', ip_address: '10.10.0.100', timestamp: new Date('2024-12-10T09:30:00Z') },
  { id: 'AUDIT-005', user_id: 'USR-ADMIN', action: 'DELETE', details: 'Removed false positive threat THR-012', resource_id: 'THR-012', ip_address: '10.10.0.100', timestamp: new Date('2024-12-10T14:00:00Z') },
  { id: 'AUDIT-006', user_id: 'USR-ANALYST', action: 'READ', details: 'Accessed audit logs for compliance review', resource_id: 'AUDIT_LOGS', ip_address: '10.10.0.50', timestamp: new Date('2024-12-11T10:00:00Z') },
  { id: 'AUDIT-007', user_id: 'USR-ADMIN', action: 'UPDATE', details: 'Modified user permissions for analyst.doe', resource_id: 'USR-ANALYST', ip_address: '10.10.0.100', timestamp: new Date('2024-12-11T15:30:00Z') },
  { id: 'AUDIT-008', user_id: 'system', action: 'CREATE', details: 'Auto-created case from SIEM alert', resource_id: 'CASE-2024-002', ip_address: '127.0.0.1', timestamp: new Date('2024-12-10T09:15:00Z') }
];

export const INITIAL_REPORTS = [
  {
    id: 'REP-001',
    title: 'APT-29 Campaign Analysis - Q4 2024',
    type: 'threat_intel',
    author: 'USR-ANALYST',
    status: 'published',
    content: '# Executive Summary\n\nThis report provides an analysis of APT-29 activities observed in Q4 2024...\n\n## Key Findings\n- Increased phishing campaigns targeting government agencies\n- Use of sophisticated social engineering tactics\n- Exploitation of CVE-2023-23397\n\n## Recommendations\n1. Implement MFA across all systems\n2. Conduct user awareness training\n3. Apply security patches immediately',
    related_case_id: 'CASE-2024-001',
    related_actor_id: 'ACT-001',
    date: new Date('2024-12-10T00:00:00Z')
  },
  {
    id: 'REP-002',
    title: 'Internal Data Exfiltration Incident Report',
    type: 'incident',
    author: 'USR-ADMIN',
    status: 'review',
    content: '# Incident Report: Data Exfiltration\n\n## Incident Timeline\n- **2024-12-10 09:00**: Initial detection\n- **2024-12-10 09:30**: Network isolation\n- **2024-12-10 12:00**: Forensic analysis initiated\n\n## Impact Assessment\nApproximately 50GB of financial data was exfiltrated...',
    related_case_id: 'CASE-2024-002',
    related_actor_id: null,
    date: new Date('2024-12-11T00:00:00Z')
  },
  {
    id: 'REP-003',
    title: 'Weekly Threat Intelligence Summary',
    type: 'tactical',
    author: 'USR-ANALYST',
    status: 'published',
    content: '# Weekly TI Summary - Week 49, 2024\n\n## Highlights\n- 12 new threats identified\n- 4 active cases\n- 2 critical vulnerabilities disclosed\n\n## Threat Landscape\nEmotet botnet activity increased by 35%...',
    related_case_id: null,
    related_actor_id: null,
    date: new Date('2024-12-08T00:00:00Z')
  },
  {
    id: 'REP-004',
    title: 'Executive Cybersecurity Briefing - December 2024',
    type: 'executive',
    author: 'USR-ADMIN',
    status: 'draft',
    content: '# Executive Briefing\n\n## Current Threat Posture\n- **Overall Risk**: HIGH\n- **Active Threats**: 12\n- **Open Incidents**: 4\n\n## Key Concerns\n1. APT-29 campaign targeting our sector\n2. Ransomware threat landscape\n3. Third-party vendor risks',
    related_case_id: null,
    related_actor_id: null,
    date: new Date('2024-12-12T00:00:00Z')
  }
];

export const INITIAL_PLAYBOOKS = [
  {
    id: 'PB-001',
    name: 'Phishing Email Response',
    description: 'Standard operating procedure for responding to reported phishing emails. Includes email analysis, user notification, and IOC extraction.',
    tasks: [
      'Isolate reported email in quarantine',
      'Analyze email headers and attachments',
      'Extract IOCs (URLs, IPs, domains, hashes)',
      'Check if other users received similar emails',
      'Reset credentials for affected users',
      'Block sender domain/IP at gateway',
      'Update threat intelligence feeds',
      'Send awareness notification to all users'
    ],
    trigger_label: 'Phishing',
    status: 'active',
    usage_count: 47,
    skip_count: 3,
    risk_level: 'LOW'
  },
  {
    id: 'PB-002',
    name: 'Ransomware Containment and Recovery',
    description: 'Immediate response protocol for ransomware incidents. Critical time-sensitive actions to prevent spread and enable recovery.',
    tasks: [
      'Immediately disconnect affected systems from network',
      'Identify ransomware variant and capabilities',
      'Take forensic snapshots of infected systems',
      'Isolate backup systems to prevent encryption',
      'Page on-call incident response team',
      'Activate incident command structure',
      'Assess extent of encryption',
      'Begin recovery from clean backups',
      'Do NOT pay ransom without executive approval',
      'Report to law enforcement (FBI IC3)'
    ],
    trigger_label: 'Ransomware',
    status: 'active',
    usage_count: 8,
    skip_count: 0,
    risk_level: 'CRITICAL'
  },
  {
    id: 'PB-003',
    name: 'Data Exfiltration Response',
    description: 'Response playbook for suspected or confirmed data exfiltration events.',
    tasks: [
      'Block external connections from affected systems',
      'Capture network traffic for analysis',
      'Identify exfiltrated data volume and sensitivity',
      'Determine exfiltration method and destination',
      'Preserve evidence for legal proceedings',
      'Notify legal and compliance teams',
      'Assess regulatory reporting requirements',
      'Begin damage assessment'
    ],
    trigger_label: 'Data_Exfiltration',
    status: 'active',
    usage_count: 5,
    skip_count: 1,
    risk_level: 'HIGH'
  },
  {
    id: 'PB-004',
    name: 'Malware Analysis and Containment',
    description: 'Structured approach to analyzing and containing malware infections.',
    tasks: [
      'Isolate infected system',
      'Collect malware sample safely',
      'Submit to sandbox for automated analysis',
      'Perform manual static analysis',
      'Execute controlled dynamic analysis',
      'Extract IOCs',
      'Update EDR signatures',
      'Hunt for additional infections',
      'Remediate all infected systems'
    ],
    trigger_label: 'Malware',
    status: 'active',
    usage_count: 23,
    skip_count: 2,
    risk_level: 'MEDIUM'
  },
  {
    id: 'PB-005',
    name: 'Insider Threat Investigation',
    description: 'Sensitive playbook for investigating potential insider threats while maintaining operational security.',
    tasks: [
      'Engage HR and Legal immediately',
      'Enable covert monitoring if authorized',
      'Review access logs and activity',
      'Analyze data access patterns',
      'Check for policy violations',
      'Document all findings',
      'Coordinate with management',
      'Prepare evidence for HR action'
    ],
    trigger_label: 'Insider_Threat',
    status: 'active',
    usage_count: 2,
    skip_count: 0,
    risk_level: 'HIGH'
  },
  {
    id: 'PB-006',
    name: 'Zero-Day Vulnerability Response',
    description: 'Emergency response protocol for zero-day vulnerability disclosure affecting organizational assets.',
    tasks: [
      'Assess organizational exposure',
      'Identify all affected systems',
      'Implement temporary mitigations',
      'Monitor vendor for patch release',
      'Test patches in isolated environment',
      'Coordinate emergency change control',
      'Deploy patches to production',
      'Verify remediation',
      'Update vulnerability management system'
    ],
    trigger_label: 'Zero_Day',
    status: 'active',
    usage_count: 3,
    skip_count: 0,
    risk_level: 'CRITICAL'
  }
];

export const INITIAL_ARTIFACTS = [
  {
    id: 'ART-001',
    name: 'ransomware_sample.exe',
    type: 'file',
    hash: '7a0d8f2b3c4e5d6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    original_hash: '7a0d8f2b3c4e5d6f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f',
    size: '2.4 MB',
    uploaded_by: 'USR-ANALYST',
    upload_date: new Date('2024-12-11T16:30:00Z'),
    status: 'malicious',
    case_id: 'CASE-2024-003'
  },
  {
    id: 'ART-002',
    name: 'phishing_email.eml',
    type: 'email',
    hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    original_hash: 'a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2',
    size: '45 KB',
    uploaded_by: 'USR-ANALYST',
    upload_date: new Date('2024-12-09T10:00:00Z'),
    status: 'analyzed',
    case_id: 'CASE-2024-001'
  },
  {
    id: 'ART-003',
    name: 'network_capture.pcap',
    type: 'network_capture',
    hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    original_hash: 'b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3',
    size: '1.2 GB',
    uploaded_by: 'USR-ADMIN',
    upload_date: new Date('2024-12-10T09:45:00Z'),
    status: 'analyzed',
    case_id: 'CASE-2024-002'
  },
  {
    id: 'ART-004',
    name: 'memory_dump.dmp',
    type: 'memory_dump',
    hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    original_hash: 'c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4',
    size: '4.8 GB',
    uploaded_by: 'USR-ADMIN',
    upload_date: new Date('2024-12-11T17:00:00Z'),
    status: 'pending',
    case_id: 'CASE-2024-003'
  },
  {
    id: 'ART-005',
    name: 'firewall_logs_2024-12-10.log',
    type: 'log',
    hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    original_hash: 'd4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5',
    size: '156 MB',
    uploaded_by: 'USR-ANALYST',
    upload_date: new Date('2024-12-10T23:00:00Z'),
    status: 'clean',
    case_id: 'CASE-2024-002'
  }
];

export const INITIAL_CHAIN_EVENTS = [
  {
    id: 'CHN-001',
    artifact_id: 'ART-001',
    artifact_name: 'ransomware_sample.exe',
    action: 'collected',
    user_id: 'USR-ANALYST',
    timestamp: new Date('2024-12-11T16:30:00Z'),
    notes: 'Sample collected from infected manufacturing workstation using forensic toolkit'
  },
  {
    id: 'CHN-002',
    artifact_id: 'ART-001',
    artifact_name: 'ransomware_sample.exe',
    action: 'transferred',
    user_id: 'USR-ANALYST',
    timestamp: new Date('2024-12-11T16:45:00Z'),
    notes: 'Transferred to isolated analysis environment via secure USB'
  },
  {
    id: 'CHN-003',
    artifact_id: 'ART-001',
    artifact_name: 'ransomware_sample.exe',
    action: 'analyzed',
    user_id: 'USR-ANALYST',
    timestamp: new Date('2024-12-11T17:30:00Z'),
    notes: 'Automated sandbox analysis completed. Hash matched to LockBit variant.'
  },
  {
    id: 'CHN-004',
    artifact_id: 'ART-002',
    artifact_name: 'phishing_email.eml',
    action: 'collected',
    user_id: 'USR-ANALYST',
    timestamp: new Date('2024-12-09T10:00:00Z'),
    notes: 'Email exported from user mailbox after phishing report'
  },
  {
    id: 'CHN-005',
    artifact_id: 'ART-002',
    artifact_name: 'phishing_email.eml',
    action: 'analyzed',
    user_id: 'USR-ANALYST',
    timestamp: new Date('2024-12-09T11:00:00Z'),
    notes: 'Header analysis complete. Malicious URLs and sender information extracted.'
  },
  {
    id: 'CHN-006',
    artifact_id: 'ART-003',
    artifact_name: 'network_capture.pcap',
    action: 'collected',
    user_id: 'USR-ADMIN',
    timestamp: new Date('2024-12-10T09:45:00Z'),
    notes: 'PCAP captured from network tap during suspected exfiltration event'
  },
  {
    id: 'CHN-007',
    artifact_id: 'ART-003',
    artifact_name: 'network_capture.pcap',
    action: 'analyzed',
    user_id: 'USR-ADMIN',
    timestamp: new Date('2024-12-10T14:00:00Z'),
    notes: 'Analysis reveals 50GB data transfer to Tor exit node. Evidence preserved.'
  }
];
