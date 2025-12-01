
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001';

export interface ApiResponse<T> {
  data?: T;
  error?: string;
  message?: string;
}

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = API_BASE_URL) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    
    const config: RequestInit = {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
    };

    try {
      const response = await fetch(url, config);
      
      if (!response.ok) {
        const error = await response.json().catch(() => ({ message: response.statusText }));
        throw new Error(error.message || `HTTP ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`API Error [${endpoint}]:`, error);
      throw error;
    }
  }

  // GET request
  async get<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'GET' });
  }

  // POST request
  async post<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // PUT request
  async put<T>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  // DELETE request
  async delete<T>(endpoint: string): Promise<T> {
    return this.request<T>(endpoint, { method: 'DELETE' });
  }

  // Threats
  threats = {
    getAll: (sort?: boolean) => this.get(`/api/threats${sort ? '?sort=true' : ''}`),
    getById: (id: string) => this.get(`/api/threats/${id}`),
    create: (data: any) => this.post('/api/threats', data),
    update: (id: string, data: any) => this.put(`/api/threats/${id}`, data),
    delete: (id: string) => this.delete(`/api/threats/${id}`),
    updateStatus: (id: string, status: string) => this.put(`/api/threats/${id}/status`, { status }),
    getByActor: (name: string) => this.get(`/api/threats/actor/${name}`),
    getBySeverity: (severity: string) => this.get(`/api/threats/severity/${severity}`),
    getByType: (type: string) => this.get(`/api/threats/type/${type}`),
  };

  // Cases
  cases = {
    getAll: () => this.get('/api/cases'),
    getById: (id: string) => this.get(`/api/cases/${id}`),
    create: (data: any) => this.post('/api/cases', data),
    update: (id: string, data: any) => this.put(`/api/cases/${id}`, data),
    delete: (id: string) => this.delete(`/api/cases/${id}`),
    getByStatus: (status: string) => this.get(`/api/cases/status/${status}`),
    getByPriority: (priority: string) => this.get(`/api/cases/priority/${priority}`),
    getByAssignedTo: (assignedTo: string) => this.get(`/api/cases/assigned/${assignedTo}`),
  };

  // Actors
  actors = {
    getAll: () => this.get('/api/actors'),
    getById: (id: string) => this.get(`/api/actors/${id}`),
    create: (data: any) => this.post('/api/actors', data),
    update: (id: string, data: any) => this.put(`/api/actors/${id}`, data),
    delete: (id: string) => this.delete(`/api/actors/${id}`),
    getByCountry: (country: string) => this.get(`/api/actors/country/${country}`),
    getByMotivation: (motivation: string) => this.get(`/api/actors/motivation/${motivation}`),
    getBySophistication: (level: string) => this.get(`/api/actors/sophistication/${level}`),
  };

  // Campaigns
  campaigns = {
    getAll: (params?: { status?: string; actor?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.get(`/api/campaigns${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.get(`/api/campaigns/${id}`),
    create: (data: any) => this.post('/api/campaigns', data),
    update: (id: string, data: any) => this.put(`/api/campaigns/${id}`, data),
    delete: (id: string) => this.delete(`/api/campaigns/${id}`),
    getStats: () => this.get('/api/campaigns/stats'),
    getThreats: (id: string) => this.get(`/api/campaigns/${id}/threats`),
    getActors: (id: string) => this.get(`/api/campaigns/${id}/actors`),
    getByObjective: (objective: string) => this.get(`/api/campaigns/objective/${objective}`),
    getBySector: (sector: string) => this.get(`/api/campaigns/sector/${sector}`),
  };

  // Vulnerabilities
  vulnerabilities = {
    getAll: (params?: { status?: string; severity?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.get(`/api/vulnerabilities${query ? `?${query}` : ''}`);
    },
    getById: (id: string) => this.get(`/api/vulnerabilities/${id}`),
    create: (data: any) => this.post('/api/vulnerabilities', data),
    update: (id: string, data: any) => this.put(`/api/vulnerabilities/${id}`, data),
    delete: (id: string) => this.delete(`/api/vulnerabilities/${id}`),
    getStats: () => this.get('/api/vulnerabilities/stats/overview'),
    getHighRisk: () => this.get('/api/vulnerabilities/high-risk/list'),
    getByCveId: (cveId: string) => this.get(`/api/vulnerabilities/cve/${cveId}`),
    getAffectedProducts: (id: string) => this.get(`/api/vulnerabilities/${id}/affected-products`),
    mitigate: (id: string, data: any) => this.post(`/api/vulnerabilities/${id}/mitigate`, data),
  };

  // System
  system = {
    getNodes: (params?: { status?: string; segment?: string }) => {
      const query = new URLSearchParams(params as any).toString();
      return this.get(`/api/system/nodes${query ? `?${query}` : ''}`);
    },
    getNodeById: (id: string) => this.get(`/api/system/nodes/${id}`),
    createNode: (data: any) => this.post('/api/system/nodes', data),
    updateNode: (id: string, data: any) => this.put(`/api/system/nodes/${id}`, data),
    deleteNode: (id: string) => this.delete(`/api/system/nodes/${id}`),
    getHealth: () => this.get('/api/system/health'),
    getVulnerabilitySummary: () => this.get('/api/system/vulnerabilities/summary'),
    getNodesBySegment: (segment: string) => this.get(`/api/system/segments/${segment}`),
    isolateNode: (id: string, data: any) => this.post(`/api/system/nodes/${id}/isolate`, data),
    restoreNode: (id: string) => this.post(`/api/system/nodes/${id}/restore`, {}),
  };

  // Incidents
  incidents = {
    getAll: () => this.get('/api/incidents'),
    getById: (id: string) => this.get(`/api/incidents/${id}`),
    create: (data: any) => this.post('/api/incidents', data),
    update: (id: string, data: any) => this.put(`/api/incidents/${id}`, data),
    updateStatus: (id: string, status: string) => this.put(`/api/incidents/${id}/status`, { status }),
  };

  // Detection
  detection = {
    getForensicJobs: () => this.get('/api/detection/forensic-jobs'),
    getForensicJob: (id: string) => this.get(`/api/detection/forensic-jobs/${id}`),
    createForensicJob: (data: any) => this.post('/api/detection/forensic-jobs', data),
    updateForensicJob: (id: string, data: any) => this.put(`/api/detection/forensic-jobs/${id}`, data),
    getParserRules: () => this.get('/api/detection/parser-rules'),
    createParserRule: (data: any) => this.post('/api/detection/parser-rules', data),
    getEnrichmentModules: () => this.get('/api/detection/enrichment-modules'),
    updateEnrichmentModule: (id: string, status: string) => this.put(`/api/detection/enrichment-modules/${id}`, { status }),
    getNormalizationRules: () => this.get('/api/detection/normalization-rules'),
    createNormalizationRule: (data: any) => this.post('/api/detection/normalization-rules', data),
  };

  // OSINT
  osint = {
    getDomains: () => this.get('/api/osint/domains'),
    getDomain: (id: string) => this.get(`/api/osint/domains/${id}`),
    addDomain: (data: any) => this.post('/api/osint/domains', data),
    getBreaches: (email?: string) => this.get(`/api/osint/breaches${email ? `?email=${email}` : ''}`),
    getBreach: (id: string) => this.get(`/api/osint/breaches/${id}`),
    addBreach: (data: any) => this.post('/api/osint/breaches', data),
    getSocial: (platform?: string) => this.get(`/api/osint/social${platform ? `?platform=${platform}` : ''}`),
    getSocialById: (id: string) => this.get(`/api/osint/social/${id}`),
    addSocial: (data: any) => this.post('/api/osint/social', data),
    getGeo: () => this.get('/api/osint/geo'),
    getGeoById: (id: string) => this.get(`/api/osint/geo/${id}`),
    getGeoByIP: (ip: string) => this.get(`/api/osint/geo/ip/${ip}`),
    addGeo: (data: any) => this.post('/api/osint/geo', data),
    getDarkWeb: () => this.get('/api/osint/darkweb'),
    addDarkWebItem: (data: any) => this.post('/api/osint/darkweb', data),
    getFileMeta: () => this.get('/api/osint/files'),
    addFileMeta: (data: any) => this.post('/api/osint/files', data),
    getStats: () => this.get('/api/osint/stats/overview'),
    getThreatLandscape: () => this.get('/api/osint/threat-landscape'),
    getHighPriorityTargets: () => this.get('/api/osint/high-priority-targets'),
    searchByDomain: (domain: string) => this.get(`/api/osint/search/domain/${domain}`),
  };

  // Users
  users = {
    getAll: () => this.get('/api/users'),
    getById: (id: string) => this.get(`/api/users/${id}`),
    create: (data: any) => this.post('/api/users', data),
    update: (id: string, data: any) => this.put(`/api/users/${id}`, data),
    delete: (id: string) => this.delete(`/api/users/${id}`),
    getStats: () => this.get('/api/users/stats/overview'),
    getActive: () => this.get('/api/users/active/list'),
    lock: (id: string) => this.post(`/api/users/${id}/lock`, {}),
    unlock: (id: string) => this.post(`/api/users/${id}/unlock`, {}),
    updateLastLogin: (id: string) => this.post(`/api/users/${id}/last-login`, {}),
  };

  // Tasks
  tasks = {
    getAll: () => this.get('/api/tasks'),
    getById: (id: string) => this.get(`/api/tasks/${id}`),
    create: (data: any) => this.post('/api/tasks', data),
    update: (id: string, data: any) => this.put(`/api/tasks/${id}`, data),
    updateStatus: (id: string, status: string) => this.put(`/api/tasks/${id}/status`, { status }),
    delete: (id: string) => this.delete(`/api/tasks/${id}`),
    getStats: () => this.get('/api/tasks/stats/overview'),
    getOverdue: () => this.get('/api/tasks/overdue/list'),
    getByCase: (caseId: string) => this.get(`/api/tasks/case/${caseId}`),
    getByAssignee: (assignee: string) => this.get(`/api/tasks/assignee/${assignee}`),
  };

  // Notes
  notes = {
    getAll: () => this.get('/api/notes'),
    getById: (id: string) => this.get(`/api/notes/${id}`),
    create: (data: any) => this.post('/api/notes', data),
    update: (id: string, data: any) => this.put(`/api/notes/${id}`, data),
    delete: (id: string) => this.delete(`/api/notes/${id}`),
    getStats: () => this.get('/api/notes/stats/overview'),
    getByCase: (caseId: string) => this.get(`/api/notes/case/${caseId}`),
    getByAuthor: (author: string) => this.get(`/api/notes/author/${author}`),
  };

  // Artifacts
  artifacts = {
    getAll: () => this.get('/api/artifacts'),
    getById: (id: string) => this.get(`/api/artifacts/${id}`),
    create: (data: any) => this.post('/api/artifacts', data),
    update: (id: string, data: any) => this.put(`/api/artifacts/${id}`, data),
    delete: (id: string) => this.delete(`/api/artifacts/${id}`),
    getStats: () => this.get('/api/artifacts/stats/overview'),
    getByCase: (caseId: string) => this.get(`/api/artifacts/case/${caseId}`),
    getByType: (type: string) => this.get(`/api/artifacts/type/${type}`),
  };

  // Evidence
  evidence = {
    getChain: () => this.get('/api/evidence/chain'),
    getChainById: (id: string) => this.get(`/api/evidence/chain/${id}`),
    addChainEvent: (data: any) => this.post('/api/evidence/chain', data),
    getMalware: () => this.get('/api/evidence/malware'),
    getMalwareById: (id: string) => this.get(`/api/evidence/malware/${id}`),
    addMalware: (data: any) => this.post('/api/evidence/malware', data),
    getForensics: () => this.get('/api/evidence/forensics'),
    getForensicById: (id: string) => this.get(`/api/evidence/forensics/${id}`),
    createForensic: (data: any) => this.post('/api/evidence/forensics', data),
    updateForensic: (id: string, data: any) => this.put(`/api/evidence/forensics/${id}`, data),
    getDevices: () => this.get('/api/evidence/devices'),
    getDeviceById: (id: string) => this.get(`/api/evidence/devices/${id}`),
    createDevice: (data: any) => this.post('/api/evidence/devices', data),
    updateDevice: (id: string, data: any) => this.put(`/api/evidence/devices/${id}`, data),
    quarantineDevice: (id: string, data: any) => this.post(`/api/evidence/devices/${id}/quarantine`, data),
    releaseDevice: (id: string) => this.post(`/api/evidence/devices/${id}/release`, {}),
    getPcaps: () => this.get('/api/evidence/pcaps'),
    getPcapById: (id: string) => this.get(`/api/evidence/pcaps/${id}`),
    createPcap: (data: any) => this.post('/api/evidence/pcaps', data),
    updatePcap: (id: string, data: any) => this.put(`/api/evidence/pcaps/${id}`, data),
    analyzePcap: (id: string, data: any) => this.post(`/api/evidence/pcaps/${id}/analyze`, data),
    getStats: () => this.get('/api/evidence/stats/overview'),
  };

  // Reports
  reports = {
    getAll: () => this.get('/api/reports'),
    getById: (id: string) => this.get(`/api/reports/${id}`),
    create: (data: any) => this.post('/api/reports', data),
    update: (id: string, data: any) => this.put(`/api/reports/${id}`, data),
    delete: (id: string) => this.delete(`/api/reports/${id}`),
    getStats: () => this.get('/api/reports/stats/overview'),
    getTemplates: (type: string) => this.get(`/api/reports/templates/${type}`),
    getSections: (id: string) => this.get(`/api/reports/${id}/sections`),
    addSection: (id: string, data: any) => this.post(`/api/reports/${id}/sections`, data),
    updateSection: (id: string, sectionId: string, data: any) => this.put(`/api/reports/${id}/sections/${sectionId}`, data),
    publish: (id: string, data: any) => this.post(`/api/reports/${id}/publish`, data),
    archive: (id: string) => this.post(`/api/reports/${id}/archive`, {}),
  };

  // Messaging
  messaging = {
    getChannels: () => this.get('/api/messaging/channels'),
    getChannelById: (id: string) => this.get(`/api/messaging/channels/${id}`),
    createChannel: (data: any) => this.post('/api/messaging/channels', data),
    updateChannel: (id: string, data: any) => this.put(`/api/messaging/channels/${id}`, data),
    deleteChannel: (id: string) => this.delete(`/api/messaging/channels/${id}`),
    joinChannel: (id: string, data: any) => this.post(`/api/messaging/channels/${id}/join`, data),
    leaveChannel: (id: string, data: any) => this.post(`/api/messaging/channels/${id}/leave`, data),
    getChannelActivity: (id: string) => this.get(`/api/messaging/channels/${id}/activity`),
    getMessages: (channelId: string) => this.get(`/api/messaging/channels/${channelId}/messages`),
    sendMessage: (channelId: string, data: any) => this.post(`/api/messaging/channels/${channelId}/messages`, data),
    updateMessage: (id: string, data: any) => this.put(`/api/messaging/messages/${id}`, data),
    deleteMessage: (id: string) => this.delete(`/api/messaging/messages/${id}`),
    sendDM: (data: any) => this.post('/api/messaging/dm', data),
    getDMs: (userId: string) => this.get(`/api/messaging/dm/${userId}`),
    getStats: () => this.get('/api/messaging/stats/overview'),
  };

  // Team Messages
  teamMessages = {
    getAll: () => this.get('/api/team-messages'),
    getById: (id: string) => this.get(`/api/team-messages/${id}`),
    create: (data: any) => this.post('/api/team-messages', data),
    update: (id: string, data: any) => this.put(`/api/team-messages/${id}`, data),
    delete: (id: string) => this.delete(`/api/team-messages/${id}`),
  };

  // Channels
  channels = {
    getAll: () => this.get('/api/channels'),
    getById: (id: string) => this.get(`/api/channels/${id}`),
    create: (data: any) => this.post('/api/channels', data),
    update: (id: string, data: any) => this.put(`/api/channels/${id}`, data),
    delete: (id: string) => this.delete(`/api/channels/${id}`),
  };

  // Feeds
  feeds = {
    getAll: () => this.get('/api/feeds'),
    getById: (id: string) => this.get(`/api/feeds/${id}`),
    create: (data: any) => this.post('/api/feeds', data),
    update: (id: string, data: any) => this.put(`/api/feeds/${id}`, data),
    delete: (id: string) => this.delete(`/api/feeds/${id}`),
    sync: (id: string) => this.post(`/api/feeds/${id}/sync`, {}),
    toggle: (id: string) => this.post(`/api/feeds/${id}/toggle`, {}),
  };

  // Analysis
  analysis = {
    chat: (data: any) => this.post('/api/analysis/chat', data),
    briefing: (data: any) => this.post('/api/analysis/briefing', data),
  };

  // Ingestion
  ingestion = {
    getJobs: () => this.get('/api/ingestion/jobs'),
    getActiveJobs: () => this.get('/api/ingestion/jobs/active'),
    getJob: (id: string) => this.get(`/api/ingestion/jobs/${id}`),
    createJob: (data: any) => this.post('/api/ingestion/jobs', data),
    updateJob: (id: string, data: any) => this.put(`/api/ingestion/jobs/${id}`, data),
    startJob: (id: string) => this.post(`/api/ingestion/jobs/${id}/start`, {}),
    completeJob: (id: string, data: any) => this.post(`/api/ingestion/jobs/${id}/complete`, data),
    failJob: (id: string, data: any) => this.post(`/api/ingestion/jobs/${id}/fail`, data),
    getParserRules: () => this.get('/api/ingestion/parser-rules'),
    getFailedParsers: () => this.get('/api/ingestion/parser-rules/failed'),
    getParserRule: (id: string) => this.get(`/api/ingestion/parser-rules/${id}`),
    createParserRule: (data: any) => this.post('/api/ingestion/parser-rules', data),
    updateParserRule: (id: string, data: any) => this.put(`/api/ingestion/parser-rules/${id}`, data),
    validateParser: (id: string, data: any) => this.post(`/api/ingestion/parser-rules/${id}/validate`, data),
    getEnrichmentModules: () => this.get('/api/ingestion/enrichment-modules'),
    getEnrichmentModule: (id: string) => this.get(`/api/ingestion/enrichment-modules/${id}`),
    createEnrichmentModule: (data: any) => this.post('/api/ingestion/enrichment-modules', data),
    updateEnrichmentModule: (id: string, data: any) => this.put(`/api/ingestion/enrichment-modules/${id}`, data),
    enableEnrichment: (id: string) => this.post(`/api/ingestion/enrichment-modules/${id}/enable`, {}),
    disableEnrichment: (id: string) => this.post(`/api/ingestion/enrichment-modules/${id}/disable`, {}),
    testEnrichment: (id: string, data: any) => this.post(`/api/ingestion/enrichment-modules/${id}/test`, data),
    getNormalizationRules: () => this.get('/api/ingestion/normalization-rules'),
    getNormalizationRule: (id: string) => this.get(`/api/ingestion/normalization-rules/${id}`),
    createNormalizationRule: (data: any) => this.post('/api/ingestion/normalization-rules', data),
    updateNormalizationRule: (id: string, data: any) => this.put(`/api/ingestion/normalization-rules/${id}`, data),
    getStats: () => this.get('/api/ingestion/stats/overview'),
    process: (data: any) => this.post('/api/ingestion/process', data),
  };

  // Orchestrator
  orchestrator = {
    getResponsePlans: () => this.get('/api/orchestrator/response-plans'),
    getActiveResponsePlans: () => this.get('/api/orchestrator/response-plans/active'),
    getResponsePlan: (id: string) => this.get(`/api/orchestrator/response-plans/${id}`),
    createResponsePlan: (data: any) => this.post('/api/orchestrator/response-plans', data),
    updateResponsePlan: (id: string, data: any) => this.put(`/api/orchestrator/response-plans/${id}`, data),
    executeResponsePlan: (id: string, data: any) => this.post(`/api/orchestrator/response-plans/${id}/execute`, data),
    getVIPProfiles: () => this.get('/api/orchestrator/vip-profiles'),
    getHighRiskVIPs: () => this.get('/api/orchestrator/vip-profiles/high-risk'),
    getVIPProfile: (userId: string) => this.get(`/api/orchestrator/vip-profiles/${userId}`),
    createVIPProfile: (data: any) => this.post('/api/orchestrator/vip-profiles', data),
    getHoneytokens: () => this.get('/api/orchestrator/honeytokens'),
    getHoneytoken: (id: string) => this.get(`/api/orchestrator/honeytokens/${id}`),
    createHoneytoken: (data: any) => this.post('/api/orchestrator/honeytokens', data),
    updateHoneytoken: (id: string, data: any) => this.put(`/api/orchestrator/honeytokens/${id}`, data),
    triggerHoneytoken: (id: string, data: any) => this.post(`/api/orchestrator/honeytokens/${id}/trigger`, data),
    getPatchPrioritization: () => this.get('/api/orchestrator/patch-prioritization'),
    createPatchPrioritization: (data: any) => this.post('/api/orchestrator/patch-prioritization', data),
    getSegmentationPolicies: () => this.get('/api/orchestrator/segmentation-policies'),
    getSegmentationPolicy: (id: string) => this.get(`/api/orchestrator/segmentation-policies/${id}`),
    createSegmentationPolicy: (data: any) => this.post('/api/orchestrator/segmentation-policies', data),
    updateSegmentationPolicy: (id: string, data: any) => this.put(`/api/orchestrator/segmentation-policies/${id}`, data),
    getTrafficFlows: () => this.get('/api/orchestrator/traffic-flows'),
    analyzeTrafficFlows: (data: any) => this.post('/api/orchestrator/traffic-flows', data),
    getStats: () => this.get('/api/orchestrator/stats/overview'),
    automatedResponse: (data: any) => this.post('/api/orchestrator/automated-response', data),
    enforceSegmentation: (nodeId: string, data: any) => this.post(`/api/orchestrator/segmentation/enforce/${nodeId}`, data),
  };

  // Compliance Items
  complianceItems = {
    getAll: () => this.get('/api/compliance-items'),
    getById: (id: string) => this.get(`/api/compliance-items/${id}`),
    create: (data: any) => this.post('/api/compliance-items', data),
    update: (id: string, data: any) => this.put(`/api/compliance-items/${id}`, data),
    delete: (id: string) => this.delete(`/api/compliance-items/${id}`),
    getStats: () => this.get('/api/compliance-items/stats/overview'),
  };

  // OSINT Results
  osintResults = {
    getAll: () => this.get('/api/osint-results'),
    getById: (id: string) => this.get(`/api/osint-results/${id}`),
    create: (data: any) => this.post('/api/osint-results', data),
    update: (id: string, data: any) => this.put(`/api/osint-results/${id}`, data),
    delete: (id: string) => this.delete(`/api/osint-results/${id}`),
  };
}

// Export a singleton instance
export const apiClient = new ApiClient();
export default apiClient;
