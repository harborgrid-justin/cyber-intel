
import { 
  MOCK_THREATS, MOCK_CASES, MOCK_ACTORS, MOCK_CAMPAIGNS, MOCK_FEEDS, 
  MOCK_AUDIT_LOGS, MOCK_VULNERABILITIES, SYSTEM_NODES, MOCK_INCIDENT_REPORTS, 
  MOCK_USERS, MOCK_VENDORS, MOCK_PLAYBOOKS, MOCK_CHAIN, MOCK_MALWARE, 
  MOCK_LAB_JOBS, MOCK_DEVICES, MOCK_PCAPS, MOCK_VENDOR_FEEDS, MOCK_SCANNERS,
  MOCK_TACTICS, MOCK_TECHNIQUES, MOCK_SUB_TECHNIQUES, MOCK_GROUPS, MOCK_SOFTWARE, MOCK_MITIGATIONS,
  MOCK_DOMAIN, MOCK_BREACH, MOCK_GEO, MOCK_SOCIAL, MOCK_INTEGRATIONS, MOCK_PATCH_STATUS
} from '@/constants';
import { Channel, TeamMessage } from '../../../types';

export class InitialDataFactory {
  static getThreats() { return MOCK_THREATS; }
  static getCases() { return MOCK_CASES; }
  static getActors() { return MOCK_ACTORS; }
  static getCampaigns() { return MOCK_CAMPAIGNS; }
  static getFeeds() { return MOCK_FEEDS; }
  static getLogs() { return MOCK_AUDIT_LOGS; }
  static getVulns() { return MOCK_VULNERABILITIES; }
  static getNodes() { return SYSTEM_NODES; }
  static getReports() { return MOCK_INCIDENT_REPORTS; }
  static getUsers() { return MOCK_USERS; }
  static getVendors() { return MOCK_VENDORS; }
  static getPlaybooks() { return MOCK_PLAYBOOKS; }
  static getChain() { return MOCK_CHAIN; }
  static getMalware() { return MOCK_MALWARE; }
  static getJobs() { return MOCK_LAB_JOBS; }
  static getDevices() { return MOCK_DEVICES; }
  static getPcaps() { return MOCK_PCAPS; }
  static getVendorFeeds() { return MOCK_VENDOR_FEEDS; }
  static getScanners() { return MOCK_SCANNERS; }
  
  static getMitreData() {
    return {
      tactics: MOCK_TACTICS,
      techniques: MOCK_TECHNIQUES,
      subTechniques: MOCK_SUB_TECHNIQUES,
      groups: MOCK_GROUPS,
      software: MOCK_SOFTWARE,
      mitigations: MOCK_MITIGATIONS
    };
  }

  static getOsintData() {
    return {
      domains: MOCK_DOMAIN,
      breaches: MOCK_BREACH,
      geo: MOCK_GEO,
      social: MOCK_SOCIAL
    };
  }

  static getConfigData() {
    return {
      integrations: MOCK_INTEGRATIONS,
      patchStatus: MOCK_PATCH_STATUS
    };
  }

  static getMessagingData() {
    const channels: Channel[] = [
        { id: 'C1', name: 'general', type: 'PUBLIC', members: ['ALL'], topic: 'Company-wide announcements' },
        { id: 'C2', name: 'incidents-critical', type: 'WAR_ROOM', members: ['SOC', 'ADMIN'], topic: 'Active P1 Incidents' },
        { id: 'C3', name: 'intel-sharing', type: 'PUBLIC', members: ['ALL'], topic: 'IOCs and OSINT findings' },
        { id: 'C4', name: 'shift-handoff', type: 'PRIVATE', members: ['SOC'], topic: 'Shift logs' }
    ];
    
    const messages: TeamMessage[] = [
        { id: 'M1', channelId: 'C1', userId: 'System', content: 'Welcome to Sentinel Chat. All comms are logged.', timestamp: new Date(Date.now() - 86400000).toISOString(), type: 'SYSTEM' },
        { id: 'M2', channelId: 'C2', userId: 'J. Doe', content: 'Tracking lateral movement on FIN-DB-02.', timestamp: new Date(Date.now() - 3600000).toISOString(), type: 'TEXT' }
    ];

    return { channels, messages };
  }
}
