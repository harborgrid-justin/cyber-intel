
import { Severity } from './types';

export const CONFIG = {
  APP: {
    NAME: "SENTINEL",
    SUBTITLE: "CYBER INTELLIGENCE",
    VERSION: "2.5.0",
    THREAT_LEVEL: "ELEVATED (DEFCON 3)",
  },
  USER: {
    NAME: "ADM. S. CONNOR",
    INITIALS: "SC",
    CLEARANCE: "TS/SCI",
  },
  DATABASE: {
    DEFAULT_ADAPTER: 'MEMORY',
    POSTGRES: {
      HOST: 'db.prod.sentinel.internal',
      PORT: 5432,
      USER: 'admin_svc',
      DB_NAME: 'threat_intel_core',
      SSL: true
    },
    TIMEOUT_MS: 5000
  },
  AI: {
    MODEL_NAME: "gemini-2.5-flash",
    SYSTEM_INSTRUCTION: "You are an elite Cyber Threat Intelligence Analyst. Be specific, technical, and concise. Analyze IOCs, TTPs, and provide risk assessments.",
    MAX_TOKENS_BRIEFING: 150,
  },
  SCORING: {
    WEIGHTS: {
      SEVERITY: 0.4,
      CONFIDENCE: 0.3,
      REPUTATION: 0.3,
    },
    SEVERITY_VALUES: {
      [Severity.LOW]: 20,
      [Severity.MEDIUM]: 50,
      [Severity.HIGH]: 80,
      [Severity.CRITICAL]: 100,
    }
  },
  THEME: {
    CHARTS: {
      PRIMARY: "#06b6d4", // cyan-500
      SECONDARY: "#0f172a", // slate-900
      GRID: "#1e293b", // slate-800
      TEXT: "#64748b", // slate-500
      TOOLTIP_BG: "#0f172a",
      TOOLTIP_BORDER: "#334155",
      TOOLTIP_TEXT: "#f1f5f9",
    },
    GRAPH: {
      ACTOR_NODE: "#ef4444",
      THREAT_CRITICAL: "#ef4444",
      THREAT_HIGH: "#f97316",
      THREAT_MEDIUM: "#eab308",
      LINK: "#475569",
      TEXT: "#cbd5e1"
    }
  },
  MODULES: {
    INGESTION: ['Status', 'Sources', 'Schedule', 'Parsers', 'Enrichment', 'Normalization'],
    INCIDENTS: ['Triage', 'Kanban', 'Timeline', 'Evidence', 'Playbooks', 'War Room', 'Assets', 'Users', 'Network', 'Reports'],
    ACTORS: ['Profile', 'Threat Feed Links', 'IoC Associations', 'Related Malware Families', 'Infrastructure Details', 'Network Traffic Analysis', 'TTPs', 'Campaigns', 'Exploits', 'Industries', 'Timeline', 'Associations', 'References', 'Reports'],
    ACTOR_LIBRARY: ['Directory', 'Global Graph', 'Heatmap'],
    CAMPAIGNS: ['Overview', 'Strategic Impact', 'IOCs', 'Attribution', 'Timeline', 'TTP Matrix'],
    CAMPAIGN_LIBRARY: ['Active Campaigns', 'Archived', 'Strategic Impact'],
    VULNERABILITIES: ['Overview', 'Critical Watch', 'Zero-Days', 'Exploited', 'Patch Status', 'Scanners', 'Vendor Feeds'],
    OSINT: ['Central Search', 'Domain Intel', 'Email Breach', 'Social Graph', 'IP Geolocation', 'Metadata', 'Dark Web'],
    EVIDENCE: ['Inventory', 'Chain of Custody', 'Malware Vault', 'Forensics Lab', 'Network Captures', 'Device Locker', 'Storage'],
    REPORTS: ['Generated Reports', 'Templates', 'Scheduled'],
    SYSTEM: ['Database', 'Users', 'Integrations', 'Security Policy', 'System Logs'],
    DETECTION: ['Scanner', 'Log Analysis', 'YARA', 'Sigma', 'Network', 'Memory', 'Disk', 'User Behavior', 'Anomaly', 'Decryption'],
    THREAT_FEED: ['All Threats', 'Manage IoCs', 'APTs', 'Malware', 'Phishing', 'Ransomware', 'Botnets', 'Exploits', 'Zero-Days', 'Dark Web'],
    INTEL_ASSISTANT: ['Chat', 'Briefing', 'Triage', 'Research', 'Translation', 'Decryption', 'Summary', 'Correlation', 'Attribution', 'Report Gen'],
    DASHBOARD: ['Overview', 'Global Map', 'System Health', 'Compliance', 'Dark Web', 'Insider Threat', 'Network Ops', 'Cloud Security'],
    CASES: ['Ticket', 'Kill Chain', 'Timeline', 'Intelligence', 'Coordination', 'Evidence', 'Reports', 'Audit'],
    CASE_BOARD: ['Kanban Board', 'My Tickets', 'Critical Watch', 'Pending Review'],
    AUDIT: ['All Logs', 'Auth', 'Data', 'System', 'Network', 'Policy', 'Exports', 'Errors', 'Admin', 'Archives'],
    MITRE: ['Enterprise Matrix', 'Tactics', 'Techniques', 'Sub-Techniques', 'APT Groups', 'Software', 'Mitigations']
  }
};
