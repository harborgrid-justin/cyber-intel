
import { SystemUser, Threat, IncidentStatus, Severity, ThreatId, UserId } from '../../types';

export const NullUser: SystemUser = {
  id: 'USR-NULL' as UserId,
  name: 'Guest User',
  username: 'guest',
  roleId: 'ROLE-VIEWER',
  role: 'Viewer',
  clearance: 'Unclassified',
  status: 'Offline',
  email: '',
  isVIP: false,
  effectivePermissions: []
};

export const NullThreat: Threat = {
  id: 'THREAT-NULL' as ThreatId,
  indicator: 'N/A',
  type: 'Unknown',
  severity: Severity.LOW,
  lastSeen: new Date().toISOString(),
  source: 'System',
  description: 'No threat selected or data unavailable.',
  status: IncidentStatus.CLOSED,
  confidence: 0,
  region: 'Unknown',
  threatActor: 'Unknown',
  reputation: 0,
  score: 0
};

export const safeUser = (u?: SystemUser | null): SystemUser => u || NullUser;
export const safeThreat = (t?: Threat | null): Threat => t || NullThreat;
    