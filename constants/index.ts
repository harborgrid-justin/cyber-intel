
export * from './mockData';
import { 
    AppConfig, AIConfig, ScoringConfig, ThemeConfig, NavigationConfig, View, Permission, Role 
} from '../types';
import { Severity } from '../types';
import { TOKENS } from '../styles/theme';
export * from './config';
export * from './navigation';
export * from './rbac';

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

export const CONFIG = {
  APP: {
    NAME: "SENTINEL",
    SUBTITLE: "CYBER INTELLIGENCE",
    VERSION: "2.5.0",
    THREAT_LEVEL: "ELEVATED (DEFCON 3)",
  },
  USER: {
    NAME: "Oscar Saadein",
    INITIALS: "OS",
    CLEARANCE: "TS/SCI",
  },
  DATABASE: {
    POSTGRES: {
      HOST: 'localhost',
      USER: 'admin',
      DB_NAME: 'sentinel_core',
      PORT: 5432
    }
  }
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

export const MOCK_MODULES_CONFIG: Record<View, string[]> = {
    [View.DASHBOARD]: ['Overview', 'Global Map', 'System Health', 'Network Ops', 'Cloud Security', 'Compliance', 'Insider Threat', 'Dark Web'],
    [View.FEED]: ['All Threats', 'APTs', 'Malware', 'Phishing', 'Ransomware', 'Critical', 'Manage IoCs'],
    [View.ANALYSIS]: ['Chat', 'Attribution', 'Triage', 'Decryption', 'Translation', 'Summary'],
    [View.INGESTION]: ['Status', 'Sources', 'Schedule', 'Parsers', 'Enrichment', 'Normalization'],
    [View.DETECTION]: ['Log Analysis', 'YARA', 'Sigma', 'Network', 'Memory', 'Disk', 'User Behavior', 'Anomaly', 'Decryption'],
    [View.INCIDENTS]: ['Triage', 'Kanban', 'War Room', 'Timeline', 'Assets', 'Users', 'Reports', 'Playbooks', 'Evidence', 'Network'],
    [View.CASES]: ['Workbench', 'Intelligence', 'Linked Cases', 'Response', 'Evidence'],
    [View.ACTORS]: ['Dossier', 'Technical Ops', 'Operations', 'Intelligence', 'Reports'],
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
