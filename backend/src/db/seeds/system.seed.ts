
export const INITIAL_PERMISSIONS = [
  // Super Admin
  { id: 'perm-superadmin', resource: '*', action: '*', description: 'Super Admin - All Permissions' },

  // Threat Intelligence
  { id: 'perm-threat-read', resource: 'threat', action: 'read', description: 'View threats' },
  { id: 'perm-threat-create', resource: 'threat', action: 'create', description: 'Create threats' },
  { id: 'perm-threat-update', resource: 'threat', action: 'update', description: 'Update threats' },
  { id: 'perm-threat-delete', resource: 'threat', action: 'delete', description: 'Delete threats' },
  { id: 'perm-threat-export', resource: 'threat', action: 'export', description: 'Export threat data' },

  // Case Management
  { id: 'perm-case-read', resource: 'case', action: 'read', description: 'View cases' },
  { id: 'perm-case-create', resource: 'case', action: 'create', description: 'Open cases' },
  { id: 'perm-case-update', resource: 'case', action: 'update', description: 'Update case details' },
  { id: 'perm-case-delete', resource: 'case', action: 'delete', description: 'Delete cases' },
  { id: 'perm-case-assign', resource: 'case', action: 'assign', description: 'Assign cases to analysts' },
  { id: 'perm-case-close', resource: 'case', action: 'close', description: 'Close cases' },

  // Actors & Campaigns
  { id: 'perm-actor-read', resource: 'actor', action: 'read', description: 'View threat actors' },
  { id: 'perm-actor-create', resource: 'actor', action: 'create', description: 'Create actor profiles' },
  { id: 'perm-actor-update', resource: 'actor', action: 'update', description: 'Update actor profiles' },
  { id: 'perm-actor-delete', resource: 'actor', action: 'delete', description: 'Delete actor profiles' },
  { id: 'perm-campaign-read', resource: 'campaign', action: 'read', description: 'View campaigns' },
  { id: 'perm-campaign-create', resource: 'campaign', action: 'create', description: 'Create campaigns' },
  { id: 'perm-campaign-update', resource: 'campaign', action: 'update', description: 'Update campaigns' },

  // Assets & Infrastructure
  { id: 'perm-asset-read', resource: 'asset', action: 'read', description: 'View assets' },
  { id: 'perm-asset-create', resource: 'asset', action: 'create', description: 'Add assets' },
  { id: 'perm-asset-update', resource: 'asset', action: 'update', description: 'Update assets' },
  { id: 'perm-asset-delete', resource: 'asset', action: 'delete', description: 'Delete assets' },

  // Vulnerabilities
  { id: 'perm-vuln-read', resource: 'vulnerability', action: 'read', description: 'View vulnerabilities' },
  { id: 'perm-vuln-create', resource: 'vulnerability', action: 'create', description: 'Add vulnerabilities' },
  { id: 'perm-vuln-update', resource: 'vulnerability', action: 'update', description: 'Update vulnerabilities' },

  // Evidence & Analysis
  { id: 'perm-evidence-read', resource: 'evidence', action: 'read', description: 'View evidence' },
  { id: 'perm-evidence-create', resource: 'evidence', action: 'create', description: 'Upload evidence' },
  { id: 'perm-evidence-delete', resource: 'evidence', action: 'delete', description: 'Delete evidence' },
  { id: 'perm-analysis-run', resource: 'analysis', action: 'run', description: 'Run analysis' },

  // OSINT
  { id: 'perm-osint-read', resource: 'osint', action: 'read', description: 'View OSINT data' },
  { id: 'perm-osint-collect', resource: 'osint', action: 'collect', description: 'Collect OSINT' },

  // Feeds & Integrations
  { id: 'perm-feed-read', resource: 'feed', action: 'read', description: 'View threat feeds' },
  { id: 'perm-feed-manage', resource: 'feed', action: 'manage', description: 'Manage threat feeds' },
  { id: 'perm-integration-read', resource: 'integration', action: 'read', description: 'View integrations' },
  { id: 'perm-integration-manage', resource: 'integration', action: 'manage', description: 'Manage integrations' },

  // Response & Playbooks
  { id: 'perm-response-read', resource: 'response', action: 'read', description: 'View incident responses' },
  { id: 'perm-response-execute', resource: 'response', action: 'execute', description: 'Execute responses' },
  { id: 'perm-playbook-read', resource: 'playbook', action: 'read', description: 'View playbooks' },
  { id: 'perm-playbook-execute', resource: 'playbook', action: 'execute', description: 'Run playbooks' },
  { id: 'perm-playbook-create', resource: 'playbook', action: 'create', description: 'Create playbooks' },

  // Reports & Dashboard
  { id: 'perm-report-read', resource: 'report', action: 'read', description: 'View reports' },
  { id: 'perm-report-create', resource: 'report', action: 'create', description: 'Generate reports' },
  { id: 'perm-dashboard-read', resource: 'dashboard', action: 'read', description: 'View dashboards' },
  { id: 'perm-dashboard-customize', resource: 'dashboard', action: 'customize', description: 'Customize dashboards' },

  // AI & Automation
  { id: 'perm-ai-analyze', resource: 'ai', action: 'analyze', description: 'Use AI analysis' },
  { id: 'perm-ai-train', resource: 'ai', action: 'train', description: 'Train AI models' },
  { id: 'perm-simulation-run', resource: 'simulation', action: 'run', description: 'Run breach simulations' },

  // Knowledge & Search
  { id: 'perm-knowledge-read', resource: 'knowledge', action: 'read', description: 'View knowledge base' },
  { id: 'perm-knowledge-write', resource: 'knowledge', action: 'write', description: 'Update knowledge base' },
  { id: 'perm-search-basic', resource: 'search', action: 'basic', description: 'Basic search' },
  { id: 'perm-search-advanced', resource: 'search', action: 'advanced', description: 'Advanced search' },

  // Messaging & Collaboration
  { id: 'perm-messaging-read', resource: 'messaging', action: 'read', description: 'View messages' },
  { id: 'perm-messaging-send', resource: 'messaging', action: 'send', description: 'Send messages' },
  { id: 'perm-channel-create', resource: 'channel', action: 'create', description: 'Create channels' },

  // System Administration
  { id: 'perm-user-read', resource: 'user', action: 'read', description: 'View users' },
  { id: 'perm-user-create', resource: 'user', action: 'create', description: 'Create users' },
  { id: 'perm-user-manage', resource: 'user', action: 'manage', description: 'Manage users' },
  { id: 'perm-user-delete', resource: 'user', action: 'delete', description: 'Delete users' },
  { id: 'perm-role-read', resource: 'role', action: 'read', description: 'View roles' },
  { id: 'perm-role-manage', resource: 'role', action: 'manage', description: 'Manage roles & permissions' },
  { id: 'perm-system-config', resource: 'system', action: 'config', description: 'Modify system settings' },
  { id: 'perm-system-maintenance', resource: 'system', action: 'maintenance', description: 'System maintenance' },
  { id: 'perm-audit-read', resource: 'audit', action: 'read', description: 'View audit logs' },
  { id: 'perm-audit-export', resource: 'audit', action: 'export', description: 'Export audit logs' },
  { id: 'perm-settings-read', resource: 'settings', action: 'read', description: 'View settings' },
  { id: 'perm-settings-write', resource: 'settings', action: 'write', description: 'Modify settings' },

  // Vendors
  { id: 'perm-vendor-read', resource: 'vendor', action: 'read', description: 'View vendors' },
  { id: 'perm-vendor-manage', resource: 'vendor', action: 'manage', description: 'Manage vendors' }
];

export const INITIAL_ROLES = [
  // Top-level roles
  { id: 'ROLE-SUPERADMIN', name: 'Super Administrator', description: 'Unrestricted system access - All permissions', parent_role_id: null },
  { id: 'ROLE-ADMIN', name: 'Administrator', description: 'Full system management except super admin functions', parent_role_id: null },
  { id: 'ROLE-MANAGER', name: 'SOC Manager', description: 'Team and case management', parent_role_id: null },
  { id: 'ROLE-SENIOR-ANALYST', name: 'Senior Security Analyst', description: 'Advanced threat analysis and response', parent_role_id: null },
  { id: 'ROLE-ANALYST', name: 'Security Analyst', description: 'Standard SOC operations and investigations', parent_role_id: null },
  { id: 'ROLE-JUNIOR-ANALYST', name: 'Junior Analyst', description: 'Basic threat monitoring and ticket handling', parent_role_id: 'ROLE-ANALYST' },
  { id: 'ROLE-INVESTIGATOR', name: 'Threat Investigator', description: 'Specialized threat hunting and OSINT', parent_role_id: null },
  { id: 'ROLE-RESPONDER', name: 'Incident Responder', description: 'Incident response and remediation', parent_role_id: null },
  { id: 'ROLE-AUDITOR', name: 'Security Auditor', description: 'Compliance and audit oversight', parent_role_id: null },
  { id: 'ROLE-VIEWER', name: 'Read-Only Viewer', description: 'View-only dashboard access', parent_role_id: null }
];

// Helper function to generate deterministic permission mappings
const analystBasePermissions = [
  'perm-threat-read', 'perm-threat-create', 'perm-threat-update',
  'perm-case-read', 'perm-case-create', 'perm-case-update', 'perm-case-assign',
  'perm-actor-read', 'perm-actor-create', 'perm-actor-update',
  'perm-campaign-read', 'perm-campaign-create',
  'perm-asset-read', 'perm-vuln-read',
  'perm-evidence-read', 'perm-evidence-create', 'perm-analysis-run',
  'perm-playbook-read', 'perm-playbook-execute',
  'perm-report-read', 'perm-report-create',
  'perm-dashboard-read', 'perm-dashboard-customize',
  'perm-ai-analyze', 'perm-simulation-run',
  'perm-knowledge-read', 'perm-search-basic', 'perm-search-advanced',
  'perm-messaging-read', 'perm-messaging-send'
];

export const INITIAL_ROLE_PERMISSIONS = [
  // Super Admin - Has the super permission
  { role_id: 'ROLE-SUPERADMIN', permission_id: 'perm-superadmin' },

  // Admin - All permissions except superadmin
  ...INITIAL_PERMISSIONS
    .filter(p => p.id !== 'perm-superadmin')
    .map(p => ({ role_id: 'ROLE-ADMIN', permission_id: p.id })),

  // Manager - Management + most operational permissions
  ...analystBasePermissions.map(pid => ({ role_id: 'ROLE-MANAGER', permission_id: pid })),
  { role_id: 'ROLE-MANAGER', permission_id: 'perm-case-close' },
  { role_id: 'ROLE-MANAGER', permission_id: 'perm-user-read' },
  { role_id: 'ROLE-MANAGER', permission_id: 'perm-role-read' },
  { role_id: 'ROLE-MANAGER', permission_id: 'perm-audit-read' },
  { role_id: 'ROLE-MANAGER', permission_id: 'perm-playbook-create' },
  { role_id: 'ROLE-MANAGER', permission_id: 'perm-threat-delete' },
  { role_id: 'ROLE-MANAGER', permission_id: 'perm-case-delete' },

  // Senior Analyst - Extended analyst permissions
  ...analystBasePermissions.map(pid => ({ role_id: 'ROLE-SENIOR-ANALYST', permission_id: pid })),
  { role_id: 'ROLE-SENIOR-ANALYST', permission_id: 'perm-threat-delete' },
  { role_id: 'ROLE-SENIOR-ANALYST', permission_id: 'perm-case-close' },
  { role_id: 'ROLE-SENIOR-ANALYST', permission_id: 'perm-threat-export' },
  { role_id: 'ROLE-SENIOR-ANALYST', permission_id: 'perm-ai-train' },
  { role_id: 'ROLE-SENIOR-ANALYST', permission_id: 'perm-knowledge-write' },

  // Analyst - Standard operational permissions
  ...analystBasePermissions.map(pid => ({ role_id: 'ROLE-ANALYST', permission_id: pid })),

  // Junior Analyst inherits from Analyst (via parent_role_id) + limited permissions
  { role_id: 'ROLE-JUNIOR-ANALYST', permission_id: 'perm-threat-read' },
  { role_id: 'ROLE-JUNIOR-ANALYST', permission_id: 'perm-case-read' },
  { role_id: 'ROLE-JUNIOR-ANALYST', permission_id: 'perm-case-update' },
  { role_id: 'ROLE-JUNIOR-ANALYST', permission_id: 'perm-dashboard-read' },
  { role_id: 'ROLE-JUNIOR-ANALYST', permission_id: 'perm-messaging-read' },
  { role_id: 'ROLE-JUNIOR-ANALYST', permission_id: 'perm-messaging-send' },

  // Investigator - Specialized threat hunting
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-threat-read' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-threat-create' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-threat-update' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-threat-export' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-actor-read' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-actor-create' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-actor-update' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-campaign-read' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-osint-read' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-osint-collect' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-evidence-read' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-evidence-create' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-analysis-run' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-search-advanced' },
  { role_id: 'ROLE-INVESTIGATOR', permission_id: 'perm-ai-analyze' },

  // Responder - Incident response focus
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-case-read' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-case-create' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-case-update' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-response-read' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-response-execute' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-playbook-read' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-playbook-execute' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-asset-read' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-asset-update' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-evidence-read' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-evidence-create' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-messaging-read' },
  { role_id: 'ROLE-RESPONDER', permission_id: 'perm-messaging-send' },

  // Auditor - Compliance and oversight
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-audit-read' },
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-audit-export' },
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-user-read' },
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-role-read' },
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-threat-read' },
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-case-read' },
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-report-read' },
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-dashboard-read' },
  { role_id: 'ROLE-AUDITOR', permission_id: 'perm-settings-read' },

  // Viewer - Read-only access
  { role_id: 'ROLE-VIEWER', permission_id: 'perm-threat-read' },
  { role_id: 'ROLE-VIEWER', permission_id: 'perm-case-read' },
  { role_id: 'ROLE-VIEWER', permission_id: 'perm-dashboard-read' },
  { role_id: 'ROLE-VIEWER', permission_id: 'perm-report-read' },
  { role_id: 'ROLE-VIEWER', permission_id: 'perm-search-basic' }
];

// Default password for all demo users: "Sentinel@2024!"
// Hash generated using PBKDF2 (salt:hash format)
// WARNING: Change these passwords immediately in production!
const DEFAULT_PASSWORD_HASH = 'a1b2c3d4e5f6g7h8:1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef';

export const INITIAL_USERS = [
  {
    id: 'USR-SUPERADMIN',
    username: 'superadmin',
    role_id: 'ROLE-SUPERADMIN',
    organization_id: 'ORG-ROOT',
    clearance: 'TS/SCI',
    email: 'superadmin@sentinel.local',
    is_vip: true,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-ADMIN',
    username: 'admin.connor',
    role_id: 'ROLE-ADMIN',
    organization_id: 'ORG-ROOT',
    clearance: 'TS',
    email: 'admin@sentinel.local',
    is_vip: true,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-MANAGER',
    username: 'manager.blake',
    role_id: 'ROLE-MANAGER',
    organization_id: 'ORG-SOC',
    clearance: 'SECRET',
    email: 'manager@sentinel.local',
    is_vip: true,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-SENIOR-ANALYST',
    username: 'senior.taylor',
    role_id: 'ROLE-SENIOR-ANALYST',
    organization_id: 'ORG-SOC',
    clearance: 'SECRET',
    email: 'senior.taylor@sentinel.local',
    is_vip: false,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-ANALYST',
    username: 'analyst.doe',
    role_id: 'ROLE-ANALYST',
    organization_id: 'ORG-SOC',
    clearance: 'SECRET',
    email: 'doe@sentinel.local',
    is_vip: false,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-JUNIOR-ANALYST',
    username: 'junior.morgan',
    role_id: 'ROLE-JUNIOR-ANALYST',
    organization_id: 'ORG-SOC',
    clearance: 'CONFIDENTIAL',
    email: 'junior.morgan@sentinel.local',
    is_vip: false,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-INVESTIGATOR',
    username: 'investigator.reed',
    role_id: 'ROLE-INVESTIGATOR',
    organization_id: 'ORG-THREAT-INTEL',
    clearance: 'SECRET',
    email: 'investigator.reed@sentinel.local',
    is_vip: false,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-RESPONDER',
    username: 'responder.cruz',
    role_id: 'ROLE-RESPONDER',
    organization_id: 'ORG-IR-TEAM',
    clearance: 'SECRET',
    email: 'responder.cruz@sentinel.local',
    is_vip: false,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-AUDITOR',
    username: 'auditor.smith',
    role_id: 'ROLE-AUDITOR',
    organization_id: 'ORG-COMPLIANCE',
    clearance: 'SECRET',
    email: 'audit@sentinel.local',
    is_vip: false,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  },
  {
    id: 'USR-VIEWER',
    username: 'viewer.jones',
    role_id: 'ROLE-VIEWER',
    organization_id: 'ORG-ROOT',
    clearance: 'UNCLASSIFIED',
    email: 'viewer@sentinel.local',
    is_vip: false,
    status: 'ACTIVE',
    password_hash: DEFAULT_PASSWORD_HASH,
    failed_login_attempts: 0,
    mfa_enabled: false
  }
];

// Organization hierarchy for testing
export const INITIAL_ORGANIZATIONS = [
  { id: 'ORG-ROOT', name: 'Sentinel HQ', parent_id: null, path: '/ROOT' },
  { id: 'ORG-SOC', name: 'Security Operations Center', parent_id: 'ORG-ROOT', path: '/ROOT/SOC' },
  { id: 'ORG-THREAT-INTEL', name: 'Threat Intelligence', parent_id: 'ORG-ROOT', path: '/ROOT/THREAT-INTEL' },
  { id: 'ORG-IR-TEAM', name: 'Incident Response Team', parent_id: 'ORG-ROOT', path: '/ROOT/IR-TEAM' },
  { id: 'ORG-COMPLIANCE', name: 'Compliance & Audit', parent_id: 'ORG-ROOT', path: '/ROOT/COMPLIANCE' }
];
