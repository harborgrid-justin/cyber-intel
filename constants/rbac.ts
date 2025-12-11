
import { Permission, Role } from '../types';

export const MOCK_PERMISSIONS: Permission[] = [
  { id: 'threat:read', resource: 'threat', action: 'read', description: 'View threats' },
  { id: 'case:read', resource: 'case', action: 'read', description: 'View cases' },
  { id: 'case:create', resource: 'case', action: 'create', description: 'Create cases' },
  { id: 'audit:read', resource: 'audit', action: 'read', description: 'Read audit logs' },
  { id: 'system:config', resource: 'system', action: 'config', description: 'Configure system' },
  { id: 'ai:analyze', resource: 'ai', action: 'analyze', description: 'Use AI assistant' },
  { id: 'simulation:run', resource: 'simulation', action: 'run', description: 'Run simulations' },
  { id: 'playbook:execute', resource: 'playbook', action: 'execute', description: 'Execute playbooks' },
  { id: 'report:create', resource: 'report', action: 'create', description: 'Create reports' },
  { id: '*:*', resource: '*', action: '*', description: 'Super Admin - All permissions' },
];

export const MOCK_ROLES: Role[] = [
  { id: 'ROLE-ADMIN', name: 'Administrator', description: 'Full system access.', permissions: ['*:*'] },
  { id: 'ROLE-ANALYST', name: 'Analyst', description: 'Standard SOC operations.', permissions: [ 'threat:read', 'case:read', 'case:create', 'ai:analyze' ] },
  { id: 'ROLE-VIEWER', name: 'Viewer', description: 'Read-only access.', permissions: ['threat:read', 'case:read', 'audit:read'] }
];
