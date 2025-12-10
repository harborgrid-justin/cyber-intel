
export const INITIAL_PERMISSIONS = [
  // Threat Intelligence
  { id: 'perm-threat-read', resource: 'threat', action: 'read', description: 'View threats' },
  { id: 'perm-threat-create', resource: 'threat', action: 'create', description: 'Create threats' },
  { id: 'perm-threat-update', resource: 'threat', action: 'update', description: 'Update threats' },
  { id: 'perm-threat-delete', resource: 'threat', action: 'delete', description: 'Delete threats' },
  
  // Case Management
  { id: 'perm-case-read', resource: 'case', action: 'read', description: 'View cases' },
  { id: 'perm-case-create', resource: 'case', action: 'create', description: 'Open cases' },
  { id: 'perm-case-update', resource: 'case', action: 'update', description: 'Update case details' },
  { id: 'perm-case-delete', resource: 'case', action: 'delete', description: 'Delete cases' },
  
  // System Admin
  { id: 'perm-user-read', resource: 'user', action: 'read', description: 'View users' },
  { id: 'perm-user-manage', resource: 'user', action: 'manage', description: 'Create/Edit users' },
  { id: 'perm-system-config', resource: 'system', action: 'config', description: 'Modify system settings' },
  { id: 'perm-audit-read', resource: 'audit', action: 'read', description: 'View audit logs' },

  // Operations & Advanced
  { id: 'perm-playbook-exec', resource: 'playbook', action: 'execute', description: 'Run playbooks' },
  { id: 'perm-report-gen', resource: 'report', action: 'create', description: 'Generate reports' },
  { id: 'perm-ai-analyze', resource: 'ai', action: 'analyze', description: 'Use AI analysis' },
  { id: 'perm-sim-run', resource: 'simulation', action: 'run', description: 'Run breach simulations' }
];

export const INITIAL_ROLES = [
  { id: 'ROLE-ADMIN', name: 'Administrator', description: 'Full system access', parent_role_id: null },
  { id: 'ROLE-ANALYST', name: 'Security Analyst', description: 'Standard SOC operations', parent_role_id: null },
  { id: 'ROLE-VIEWER', name: 'Read-Only Viewer', description: 'Audit and oversight', parent_role_id: null }
];

export const INITIAL_ROLE_PERMISSIONS = [
  ...INITIAL_PERMISSIONS.map(p => ({ role_id: 'ROLE-ADMIN', permission_id: p.id })),
  
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-threat-read' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-threat-create' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-threat-update' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-case-read' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-case-create' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-case-update' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-playbook-exec' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-report-gen' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-ai-analyze' },
  { role_id: 'ROLE-ANALYST', permission_id: 'perm-sim-run' },

  { role_id: 'ROLE-VIEWER', permission_id: 'perm-threat-read' },
  { role_id: 'ROLE-VIEWER', permission_id: 'perm-case-read' },
  { role_id: 'ROLE-VIEWER', permission_id: 'perm-audit-read' }
];

export const INITIAL_USERS = [
  { id: 'USR-ADMIN', username: 'admin.connor', role_id: 'ROLE-ADMIN', role: 'ADMIN', clearance: 'TS', email: 'admin@sentinel.local', is_vip: true, status: 'ACTIVE' },
  { id: 'USR-ANALYST', username: 'analyst.doe', role_id: 'ROLE-ANALYST', role: 'ANALYST', clearance: 'SECRET', email: 'doe@sentinel.local', is_vip: false, status: 'ACTIVE' },
  { id: 'USR-VIEWER', username: 'auditor.smith', role_id: 'ROLE-VIEWER', role: 'VIEWER', clearance: 'UNCLASSIFIED', email: 'audit@sentinel.local', is_vip: false, status: 'ACTIVE' }
];
