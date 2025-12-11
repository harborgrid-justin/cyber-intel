
import { Permission, Role, SystemUser, UserId } from '../../types';

export const INITIAL_PERMISSIONS: Permission[] = [
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

export const INITIAL_ROLES: Role[] = [
  { id: 'ROLE-ADMIN', name: 'Administrator', description: 'Full system access.', permissions: ['*:*'] },
  { id: 'ROLE-ANALYST', name: 'Security Analyst', description: 'Standard SOC operations.', permissions: [ 'threat:read', 'case:read', 'case:create' ] },
  { id: 'ROLE-VIEWER', name: 'Read-Only Viewer', description: 'Audit and oversight.', permissions: ['threat:read', 'case:read', 'audit:read'] }
];
