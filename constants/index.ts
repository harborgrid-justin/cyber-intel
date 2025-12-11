
export * from './mockData';
import { 
    AppConfig, AIConfig, ScoringConfig, ThemeConfig, NavigationConfig, View, Permission, Role 
} from '../types';
import { Severity } from '../types';
import { TOKENS } from '../styles/theme';
export * from './config';

export const DEFAULT_APP_CONFIG: AppConfig = {
  id: 'GLOBAL_CONFIG',
  appName: 'SENTINEL',
  subtitle: 'CYBER INTELLIGENCE',
  version: '2.5.0',
  threatLevel: 'ELEVATED (DEFCON 3)',
  orgName: 'Default Organization',
  supportEmail: 'soc-support@sentinel.local',
  supportPhone: '555-0199'
};

export const MOCK_AI_CONFIG: AIConfig = {
  id: 'AI_CONFIG',
  modelName: 'gemini-2.5-flash',
  systemInstruction: 'You are a senior cyber security analyst providing threat intelligence summaries.',
  maxTokensBriefing: 150
};

export const MOCK_SCORING_CONFIG: ScoringConfig = {
  id: 'SCORING_CONFIG',
  weights: {
    severity: 0.5,
    confidence: 0.3,
    reputation: 0.2
  },
  severityValues: {
    [Severity.LOW]: 20,
    [Severity.MEDIUM]: 50,
    [Severity.HIGH]: 80,
    [Severity.CRITICAL]: 100
  }
};

export const MOCK_NAVIGATION_CONFIG: NavigationConfig = [
    {
        group: 'Core',
        items: [ { label: 'Dashboard', view: View.DASHBOARD, icon: 'Grid', perm: 'threat:read' }, { label: 'Threat Feed', view: View.FEED, icon: 'Activity', perm: 'threat:read' }, { label: 'Analysis', view: View.ANALYSIS, icon: 'Zap', perm: 'ai:analyze' },]
    },
    {
        group: 'Operations',
        items: [ { label: 'Incidents', view: View.INCIDENTS, icon: 'AlertTriangle', perm: 'case:read' }, { label: 'Cases', view: View.CASES, icon: 'Layers', perm: 'case:read' }, { label: 'Actors', view: View.ACTORS, icon: 'Users', perm: 'threat:read' }, { label: 'Campaigns', view: View.CAMPAIGNS, icon: 'Target', perm: 'threat:read' },]
    },
    {
        group: 'Intelligence',
        items: [ { label: 'Vulnerabilities', view: View.VULNERABILITIES, icon: 'Shield', perm: 'threat:read' }, { label: 'MITRE ATT&CK', view: View.MITRE, icon: 'Grid', perm: 'threat:read' }, { label: 'OSINT', view: View.OSINT, icon: 'Globe', perm: 'threat:read' }, { label: 'Supply Chain', view: View.SUPPLY_CHAIN, icon: 'Box', perm: 'threat:read' }, { label: 'VIP Protection', view: View.VIP_PROTECTION, icon: 'UserX', perm: 'threat:read' },]
    },
    {
        group: 'Lab',
        items: [ { label: 'Evidence', view: View.EVIDENCE, icon: 'Key', perm: 'case:read' }, { label: 'Simulation', view: View.SIMULATION, icon: 'Shuffle', perm: 'simulation:run' }, { label: 'Orchestrator', view: View.ORCHESTRATOR, icon: 'Zap', perm: 'playbook:execute' }, { label: 'Detection', view: View.DETECTION, icon: 'Monitor', perm: 'system:config' },]
    },
    {
        group: 'System',
        items: [ 
            { label: 'Ingestion', view: View.INGESTION, icon: 'Database', perm: 'system:config' }, 
            { label: 'Reports', view: View.REPORTS, icon: 'FileText', perm: 'report:create' }, 
            { label: 'Messaging', view: View.MESSAGING, icon: 'MessageSquare', perm: 'threat:read' }, 
            { label: 'Audit', view: View.AUDIT, icon: 'Eye', perm: 'audit:read' }, 
            { label: 'Platform', view: View.SYSTEM, icon: 'Server', perm: 'system:config' },
            { label: 'Theme Designer', view: View.THEME, icon: 'Tool', perm: 'system:config' },
        ]
    }
];

export const MOCK_MODULES_CONFIG: Record<View, string[]> = {
    [View.DASHBOARD]: ['Overview', 'Global Map', 'System Health', 'Network Ops', 'Cloud Security', 'Compliance', 'Insider Threat', 'Dark Web'],
    [View.FEED]: ['All Threats', 'APTs', 'Malware', 'Phishing', 'Ransomware', 'Botnets', 'Exploits', 'Zero-Days', 'Dark Web', 'Manage IoCs'],
    [View.ANALYSIS]: ['Chat', 'Attribution', 'Triage', 'Decryption', 'Translation', 'Summary'],
    [View.INGESTION]: ['Status', 'Sources', 'Schedule', 'Parsers', 'Enrichment', 'Normalization'],
    [View.DETECTION]: ['Log Analysis', 'YARA', 'Sigma', 'Network', 'Memory', 'Disk', 'User Behavior', 'Anomaly', 'Decryption'],
    [View.INCIDENTS]: ['Triage', 'Kanban', 'War Room', 'Timeline', 'Assets', 'Users', 'Reports', 'Playbooks', 'Evidence', 'Network'],
    [View.CASES]: ['Workbench', 'Intelligence', 'Linked Cases', 'Response', 'Evidence'],
    [View.ACTORS]: ['Dossier', 'Technical Ops', 'Operations', 'Intelligence', 'Reports', 'Global Graph'],
    [View.VULNERABILITIES]: ['Overview', 'Critical Watch', 'Zero-Days', 'Exploited', 'Patch Status', 'Scanners', 'Vendor Feeds'],
    [View.MITRE]: ['Enterprise Matrix', 'Tactics', 'Techniques', 'Sub-Techniques', 'APT Groups', 'Software', 'Mitigations'],
    [View.OSINT]: ['Central Search', 'Domain Intel', 'Email Breach', 'Social Graph', 'IP Geolocation', 'Metadata', 'Dark Web'],
    [View.EVIDENCE]: ['Inventory', 'Chain of Custody', 'Malware Vault', 'Forensics Lab', 'Device Locker', 'Network Captures', 'Storage'],
    [View.REPORTS]: ['Library', 'Templates', 'Scheduled'],
    [View.CAMPAIGNS]: ['Active Campaigns', 'Archived'],
    [View.SUPPLY_CHAIN]: ['Risk Radar', 'Vendor Inventory', 'SBOM Inspector', 'N-Tier Graph', 'Access Gov', 'Compliance', 'Geopolitics', 'Incidents'],
    [View.SIMULATION]: ['Breach Simulation', 'Campaign Builder'],
    [View.ORCHESTRATOR]: ['Response Topology', 'Deception Ops', 'Segmentation', 'Patch Strategy'],
    [View.VIP_PROTECTION]: [],
    [View.MESSAGING]: [],
    [View.SYSTEM]: ['Database', 'Users', 'Integrations', 'Security Policy', 'System Logs', 'Compliance Ops', 'Theme Designer'],
    [View.AUDIT]: ['Overview', 'Authentication', 'Network', 'Data', 'Policy', 'Admin', 'Errors'],
    [View.SETTINGS]: ['Profile', 'Notifications', 'API Keys', 'Integrations', 'System'],
    [View.THEME]: [],
};

export const MOCK_PERMISSIONS: Permission[] = [
  { id: 'threat:read', resource: 'threat', description: 'View threats' },
  { id: 'threat:create', resource: 'threat', description: 'Create threats' },
  { id: 'threat:update', resource: 'threat', description: 'Update threats' },
  { id: 'threat:delete', resource: 'threat', description: 'Delete threats' },
  { id: 'case:read', resource: 'case', description: 'View cases' },
  { id: 'case:create', resource: 'case', description: 'Create cases' },
  { id: 'case:update', resource: 'case', description: 'Update cases' },
  { id: 'user:read', resource: 'user', description: 'View users' },
  { id: 'user:manage', resource: 'user', description: 'Manage users' },
  { id: 'system:config', resource: 'system', description: 'Configure system' },
  { id: 'audit:read', resource: 'audit', description: 'Read audit logs' },
  { id: 'playbook:execute', resource: 'playbook', description: 'Execute playbooks' },
  { id: 'report:create', resource: 'report', description: 'Create reports' },
  { id: 'ai:analyze', resource: 'ai', description: 'Use AI assistant' },
  { id: 'simulation:run', resource: 'simulation', description: 'Run simulations' },
  { id: '*:*', resource: '*', description: 'Super Admin - All permissions' },
];

export const MOCK_ROLES: Role[] = [
  { id: 'ROLE-ADMIN', name: 'Administrator', description: 'Full system access.', permissions: ['*:*'] },
  { id: 'ROLE-ANALYST', name: 'Analyst', description: 'Standard SOC operations.', permissions: [ 'threat:read', 'threat:create', 'threat:update', 'case:read', 'case:create', 'case:update', 'playbook:execute', 'report:create', 'ai:analyze', 'simulation:run' ] },
  { id: 'ROLE-VIEWER', name: 'Viewer', description: 'Read-only access.', permissions: ['threat:read', 'case:read', 'audit:read'] }
];
