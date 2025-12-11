
import { NavigationConfig, View } from '../types';

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
