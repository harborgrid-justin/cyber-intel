/**
 * Seed Data for Communications & Integrations
 * Includes: Integrations, Channels, Messages
 */

export const INITIAL_INTEGRATIONS = [
  {
    id: 'INT-001',
    name: 'Splunk Enterprise SIEM',
    type: 'SIEM',
    url: 'https://splunk.sentinel.local:8089',
    api_key: 'encrypted_splunk_hec_token_1234567890abcdef',
    status: 'active',
    last_sync: new Date('2024-12-12T08:30:00Z')
  },
  {
    id: 'INT-002',
    name: 'CrowdStrike Falcon',
    type: 'EDR',
    url: 'https://api.crowdstrike.com',
    api_key: 'encrypted_falcon_client_id_secret',
    status: 'active',
    last_sync: new Date('2024-12-12T08:00:00Z')
  },
  {
    id: 'INT-003',
    name: 'TheHive SOAR',
    type: 'SOAR',
    url: 'https://thehive.sentinel.local',
    api_key: 'encrypted_thehive_bearer_token',
    status: 'active',
    last_sync: new Date('2024-12-12T07:45:00Z')
  },
  {
    id: 'INT-004',
    name: 'MISP Threat Sharing',
    type: 'Threat_Intel',
    url: 'https://misp.sentinel.local',
    api_key: 'encrypted_misp_authkey_uuid',
    status: 'active',
    last_sync: new Date('2024-12-12T08:15:00Z')
  },
  {
    id: 'INT-005',
    name: 'Jira Service Management',
    type: 'Ticketing',
    url: 'https://sentinel.atlassian.net',
    api_key: 'encrypted_jira_api_token_base64',
    status: 'active',
    last_sync: new Date('2024-12-12T06:00:00Z')
  },
  {
    id: 'INT-006',
    name: 'Slack Security Channel',
    type: 'Communications',
    url: 'https://hooks.slack.com/services/T00000000/B00000000/XXXXXXXXXXXXXXXXXXXX',
    api_key: 'encrypted_slack_webhook_url',
    status: 'active',
    last_sync: new Date('2024-12-12T08:45:00Z')
  },
  {
    id: 'INT-007',
    name: 'VirusTotal Intelligence',
    type: 'Threat_Intel',
    url: 'https://www.virustotal.com/api/v3',
    api_key: 'encrypted_virustotal_api_key',
    status: 'error',
    last_sync: new Date('2024-12-11T12:00:00Z')
  },
  {
    id: 'INT-008',
    name: 'Microsoft Defender ATP',
    type: 'EDR',
    url: 'https://api.securitycenter.microsoft.com',
    api_key: 'encrypted_defender_oauth_token',
    status: 'active',
    last_sync: new Date('2024-12-12T08:20:00Z')
  },
  {
    id: 'INT-009',
    name: 'Palo Alto Cortex XDR',
    type: 'EDR',
    url: 'https://api.xdr.us.paloaltonetworks.com',
    api_key: 'encrypted_cortex_api_key',
    status: 'active',
    last_sync: new Date('2024-12-12T07:30:00Z')
  },
  {
    id: 'INT-010',
    name: 'Recorded Future',
    type: 'Threat_Intel',
    url: 'https://api.recordedfuture.com/v2',
    api_key: 'encrypted_rf_api_token',
    status: 'inactive',
    last_sync: new Date('2024-12-01T00:00:00Z')
  }
];

export const INITIAL_CHANNELS = [
  {
    id: 'CHN-001',
    name: 'general',
    type: 'public',
    topic: 'General discussion and team announcements',
    members: ['USR-ADMIN', 'USR-ANALYST', 'USR-SENIOR-ANALYST', 'USR-MANAGER', 'USR-INVESTIGATOR', 'USR-RESPONDER'],
    created_by: 'USR-ADMIN'
  },
  {
    id: 'CHN-002',
    name: 'incident-response',
    type: 'private',
    topic: 'Active incident coordination and emergency response',
    members: ['USR-ADMIN', 'USR-MANAGER', 'USR-RESPONDER', 'USR-SENIOR-ANALYST'],
    created_by: 'USR-MANAGER'
  },
  {
    id: 'CHN-003',
    name: 'threat-intelligence',
    type: 'private',
    topic: 'Threat research, IOC sharing, and intelligence analysis',
    members: ['USR-ADMIN', 'USR-INVESTIGATOR', 'USR-ANALYST', 'USR-SENIOR-ANALYST'],
    created_by: 'USR-INVESTIGATOR'
  },
  {
    id: 'CHN-004',
    name: 'case-2024-001-blue-horizon',
    type: 'case-specific',
    topic: 'Operation Blue Horizon - APT-29 Campaign Investigation',
    members: ['USR-ADMIN', 'USR-ANALYST', 'USR-INVESTIGATOR'],
    created_by: 'USR-ADMIN'
  },
  {
    id: 'CHN-005',
    name: 'case-2024-002-data-exfil',
    type: 'case-specific',
    topic: 'Internal Data Exfiltration - Finance Department',
    members: ['USR-ADMIN', 'USR-RESPONDER', 'USR-MANAGER'],
    created_by: 'USR-ADMIN'
  },
  {
    id: 'CHN-006',
    name: 'case-2024-003-ransomware',
    type: 'case-specific',
    topic: 'LockBit Ransomware - Manufacturing Floor',
    members: ['USR-ADMIN', 'USR-RESPONDER', 'USR-ANALYST'],
    created_by: 'USR-MANAGER'
  },
  {
    id: 'CHN-007',
    name: 'alerts',
    type: 'public',
    topic: 'Automated system alerts and threat notifications',
    members: ['USR-ADMIN', 'USR-ANALYST', 'USR-SENIOR-ANALYST', 'USR-MANAGER', 'USR-INVESTIGATOR', 'USR-RESPONDER', 'USR-JUNIOR-ANALYST'],
    created_by: 'system'
  },
  {
    id: 'CHN-008',
    name: 'apt-tracking',
    type: 'private',
    topic: 'Advanced Persistent Threat campaigns and actor tracking',
    members: ['USR-ADMIN', 'USR-INVESTIGATOR', 'USR-SENIOR-ANALYST'],
    created_by: 'USR-INVESTIGATOR'
  },
  {
    id: 'CHN-009',
    name: 'vulnerability-mgmt',
    type: 'public',
    topic: 'Vulnerability disclosures, patching, and remediation tracking',
    members: ['USR-ADMIN', 'USR-ANALYST', 'USR-SENIOR-ANALYST', 'USR-MANAGER'],
    created_by: 'USR-MANAGER'
  },
  {
    id: 'CHN-010',
    name: 'compliance-audit',
    type: 'private',
    topic: 'Compliance reviews and audit discussions',
    members: ['USR-ADMIN', 'USR-AUDITOR', 'USR-MANAGER'],
    created_by: 'USR-AUDITOR'
  }
];

export const INITIAL_MESSAGES = [
  // General Channel
  {
    id: 'MSG-001',
    channel_id: 'CHN-001',
    user_id: 'USR-ADMIN',
    content: 'Welcome to the SENTINEL Cyber Intelligence Platform! This is our main coordination channel. Please review the SOPs document in the knowledge base.',
    type: 'text',
    createdAt: new Date('2024-12-01T09:00:00Z'),
    updatedAt: new Date('2024-12-01T09:00:00Z')
  },
  {
    id: 'MSG-002',
    channel_id: 'CHN-001',
    user_id: 'USR-MANAGER',
    content: 'Team: We have a busy week ahead. 4 active cases and multiple high-severity threats. Daily standup at 09:00.',
    type: 'text',
    createdAt: new Date('2024-12-08T08:00:00Z'),
    updatedAt: new Date('2024-12-08T08:00:00Z')
  },

  // Case 2024-001: Blue Horizon
  {
    id: 'MSG-003',
    channel_id: 'CHN-004',
    user_id: 'USR-ADMIN',
    content: 'Case CASE-2024-001 created. Initial indicators suggest APT-29 spear phishing campaign targeting government agencies. @analyst.doe taking lead on analysis.',
    type: 'text',
    createdAt: new Date('2024-12-08T10:05:00Z'),
    updatedAt: new Date('2024-12-08T10:05:00Z')
  },
  {
    id: 'MSG-004',
    channel_id: 'CHN-004',
    user_id: 'USR-ANALYST',
    content: 'Confirmed. Email analysis shows spoofed government domain with malicious PDF attachment. Extracting IOCs and running through VT.',
    type: 'text',
    createdAt: new Date('2024-12-08T10:30:00Z'),
    updatedAt: new Date('2024-12-08T10:30:00Z')
  },
  {
    id: 'MSG-005',
    channel_id: 'CHN-004',
    user_id: 'USR-INVESTIGATOR',
    content: 'Cross-referencing with known APT-29 TTPs. Pattern matches Operation Ghost Writer from 2023. They\'re evolving their lures.',
    type: 'text',
    createdAt: new Date('2024-12-08T11:15:00Z'),
    updatedAt: new Date('2024-12-08T11:15:00Z')
  },
  {
    id: 'MSG-006',
    channel_id: 'CHN-004',
    user_id: 'USR-ANALYST',
    content: 'IOC extraction complete. Found 3 C2 domains and 2 IP addresses. Pushing to threat feeds now.',
    type: 'text',
    createdAt: new Date('2024-12-09T14:00:00Z'),
    updatedAt: new Date('2024-12-09T14:00:00Z')
  },

  // Case 2024-002: Data Exfiltration
  {
    id: 'MSG-007',
    channel_id: 'CHN-005',
    user_id: 'system',
    content: 'AUTOMATED ALERT: Unusual outbound traffic detected from Finance subnet. 50GB transferred to Tor exit node over 2 hours. Case auto-created.',
    type: 'alert',
    createdAt: new Date('2024-12-10T09:00:00Z'),
    updatedAt: new Date('2024-12-10T09:00:00Z')
  },
  {
    id: 'MSG-008',
    channel_id: 'CHN-005',
    user_id: 'USR-ADMIN',
    content: 'Taking immediate action. Isolating Finance subnet now. @responder.cruz - activate containment playbook.',
    type: 'text',
    createdAt: new Date('2024-12-10T09:05:00Z'),
    updatedAt: new Date('2024-12-10T09:05:00Z')
  },
  {
    id: 'MSG-009',
    channel_id: 'CHN-005',
    user_id: 'USR-RESPONDER',
    content: 'Network isolation complete. No additional egress detected. Beginning forensic analysis on FINANCE-WS-001.',
    type: 'text',
    createdAt: new Date('2024-12-10T09:30:00Z'),
    updatedAt: new Date('2024-12-10T09:30:00Z')
  },
  {
    id: 'MSG-010',
    channel_id: 'CHN-005',
    user_id: 'USR-ADMIN',
    content: 'Legal and HR notified. Potential insider threat or compromised credentials. Full investigation authorized.',
    type: 'text',
    createdAt: new Date('2024-12-10T10:00:00Z'),
    updatedAt: new Date('2024-12-10T10:00:00Z')
  },

  // Case 2024-003: Ransomware
  {
    id: 'MSG-011',
    channel_id: 'CHN-006',
    user_id: 'USR-RESPONDER',
    content: 'CRITICAL INCIDENT: Ransomware encryption detected on manufacturing systems. LockBit variant confirmed. Initiating emergency response.',
    type: 'alert',
    createdAt: new Date('2024-12-11T16:05:00Z'),
    updatedAt: new Date('2024-12-11T16:05:00Z')
  },
  {
    id: 'MSG-012',
    channel_id: 'CHN-006',
    user_id: 'USR-MANAGER',
    content: 'Incident command activated. All hands on deck. @admin.connor - coordinate with OT team. @analyst.doe - analyze ransomware sample.',
    type: 'text',
    createdAt: new Date('2024-12-11T16:10:00Z'),
    updatedAt: new Date('2024-12-11T16:10:00Z')
  },
  {
    id: 'MSG-013',
    channel_id: 'CHN-006',
    user_id: 'USR-ADMIN',
    content: 'Manufacturing network isolated. Backup systems secured and verified clean. Recovery team standing by.',
    type: 'text',
    createdAt: new Date('2024-12-11T16:20:00Z'),
    updatedAt: new Date('2024-12-11T16:20:00Z')
  },
  {
    id: 'MSG-014',
    channel_id: 'CHN-006',
    user_id: 'USR-ANALYST',
    content: 'Sample analysis complete. LockBit 3.0 variant. No new evasion techniques. Known decryption available from Europol takedown.',
    type: 'text',
    createdAt: new Date('2024-12-11T17:30:00Z'),
    updatedAt: new Date('2024-12-11T17:30:00Z')
  },

  // Incident Response Channel
  {
    id: 'MSG-015',
    channel_id: 'CHN-002',
    user_id: 'USR-MANAGER',
    content: 'IR Team: We have 3 concurrent critical incidents. Prioritize ransomware > data exfil > APT campaign. Resource allocation updated.',
    type: 'text',
    createdAt: new Date('2024-12-11T18:00:00Z'),
    updatedAt: new Date('2024-12-11T18:00:00Z')
  },
  {
    id: 'MSG-016',
    channel_id: 'CHN-002',
    user_id: 'USR-RESPONDER',
    content: 'Acknowledged. Ransomware containment is my priority. Manufacturing systems being restored from backups now.',
    type: 'text',
    createdAt: new Date('2024-12-11T18:05:00Z'),
    updatedAt: new Date('2024-12-11T18:05:00Z')
  },

  // Threat Intelligence Channel
  {
    id: 'MSG-017',
    channel_id: 'CHN-003',
    user_id: 'USR-INVESTIGATOR',
    content: 'New intelligence: Emotet botnet activity increased 35% this week. Expect increased phishing volumes. Updated hunting queries attached.',
    type: 'file',
    createdAt: new Date('2024-12-12T08:00:00Z'),
    updatedAt: new Date('2024-12-12T08:00:00Z')
  },
  {
    id: 'MSG-018',
    channel_id: 'CHN-003',
    user_id: 'USR-SENIOR-ANALYST',
    content: 'Cross-correlating with our email gateway logs. Already seeing uptick in macro-enabled documents. Blocking at perimeter.',
    type: 'text',
    createdAt: new Date('2024-12-12T08:30:00Z'),
    updatedAt: new Date('2024-12-12T08:30:00Z')
  },

  // Alerts Channel
  {
    id: 'MSG-019',
    channel_id: 'CHN-007',
    user_id: 'system',
    content: 'ALERT [HIGH]: CVE-2024-XXXXX zero-day disclosed affecting SCADA systems. CVSS 9.5. Impact assessment required for AST-009.',
    type: 'system',
    createdAt: new Date('2024-12-12T09:00:00Z'),
    updatedAt: new Date('2024-12-12T09:00:00Z')
  },
  {
    id: 'MSG-020',
    channel_id: 'CHN-007',
    user_id: 'system',
    content: 'ALERT [MEDIUM]: Unusual login from new location detected for user admin.connor. 2FA verification required.',
    type: 'system',
    createdAt: new Date('2024-12-12T07:15:00Z'),
    updatedAt: new Date('2024-12-12T07:15:00Z')
  },

  // APT Tracking Channel
  {
    id: 'MSG-021',
    channel_id: 'CHN-008',
    user_id: 'USR-INVESTIGATOR',
    content: 'APT-29 infrastructure update: 5 new C2 domains registered. DNS patterns match previous campaigns. Adding to blocklist.',
    type: 'text',
    createdAt: new Date('2024-12-10T15:00:00Z'),
    updatedAt: new Date('2024-12-10T15:00:00Z')
  },
  {
    id: 'MSG-022',
    channel_id: 'CHN-008',
    user_id: 'USR-SENIOR-ANALYST',
    content: 'Tracking APT-28 activity in Ukraine conflict. TTPs evolving. Updated YARA rules for new malware variants.',
    type: 'text',
    createdAt: new Date('2024-12-11T10:00:00Z'),
    updatedAt: new Date('2024-12-11T10:00:00Z')
  },

  // Vulnerability Management Channel
  {
    id: 'MSG-023',
    channel_id: 'CHN-009',
    user_id: 'USR-MANAGER',
    content: 'Vulnerability remediation update: CVE-2023-23397 patches deployed to all Exchange servers. Testing complete. No issues.',
    type: 'text',
    createdAt: new Date('2024-12-09T16:00:00Z'),
    updatedAt: new Date('2024-12-09T16:00:00Z')
  },
  {
    id: 'MSG-024',
    channel_id: 'CHN-009',
    user_id: 'USR-ANALYST',
    content: 'Still have 3 critical CVEs pending patches on legacy systems. Risk accepted by management. Compensating controls in place.',
    type: 'text',
    createdAt: new Date('2024-12-10T11:00:00Z'),
    updatedAt: new Date('2024-12-10T11:00:00Z')
  }
];
