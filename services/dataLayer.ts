
import { Threat, Case, SystemNode, ThreatActor, AppConfig, Severity, IncidentStatus, AIConfig, ScoringConfig, ThemeConfig, View, IoCFeed, AuditLog, Vulnerability, IncidentReport, SystemUser, Vendor, Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, VendorFeedItem, ScannerStatus, NistControl, ApiKey, PatchStatus, Integration, Channel, TeamMessage, EnrichmentModule, ParserRule, NormalizationRule, SegmentationPolicy, Honeytoken, TrafficFlow, RiskForecastItem, OsintDomain, OsintBreach, OsintGeo, OsintSocial, OsintDarkWebItem, OsintFileMeta, MitreItem, ThreatId, CaseId } from '../types';
import { createStores } from './stores/storeFactory';
import { DatabaseAdapter, MockAdapter } from './dbAdapter';
import { PrefixTrie } from './algorithms/Trie';
import { MOCK_MODULES_CONFIG } from '../constants';
import { Result } from '../types/result';

export class DataLayer {
  public adapter: DatabaseAdapter;
  public stores: ReturnType<typeof createStores>;
  
  public isOffline: boolean = true;
  public fullTextSearch: PrefixTrie;

  constructor() {
    this.adapter = new MockAdapter();
    this.stores = createStores(this.adapter);
    this.fullTextSearch = new PrefixTrie();
    this.initSearchIndex();
  }

  setProvider(adapter: DatabaseAdapter) {
      this.adapter = adapter;
      // Re-initialize stores with new adapter
      this.stores = createStores(this.adapter);
      this.isOffline = adapter.type === 'MEMORY';
  }

  private initSearchIndex() {
      // Index initial data
      this.getThreats().forEach(t => this.fullTextSearch.insert(t.indicator, t.id));
      this.getCases().forEach(c => this.fullTextSearch.insert(c.title, c.id));
      this.getActors().forEach(a => this.fullTextSearch.insert(a.name, a.id));
  }

  private unwrap<T>(res: Result<T>, fallback: T): T {
    return res.success ? res.data : fallback;
  }

  // --- Core Getters ---
  
  get threatStore() { return this.stores.threatStore; }
  get caseStore() { return this.stores.caseStore; }
  get actorStore() { return this.stores.actorStore; }
  get nodeStore() { return this.stores.nodeStore; }
  get campaignStore() { return this.stores.campaignStore; }
  get feedStore() { return this.stores.feedStore; }
  get logStore() { return this.stores.logStore; }
  get vulnStore() { return this.stores.vulnStore; }
  get reportStore() { return this.stores.reportStore; }
  get userStore() { return this.stores.userStore; }
  get vendorStore() { return this.stores.vendorStore; }
  get messagingStore() { return this.stores.messagingStore; }
  get deviceStore() { return this.stores.deviceStore; }
  
  // --- Accessors for UI Components (Facade Pattern) ---

  get config(): AppConfig {
      return this.getAppConfig();
  }

  get currentUser(): SystemUser | undefined {
      const users = this.unwrap(this.stores.userStore.getAll(), []);
      return users.find(u => u.role === 'Administrator') || users[0];
  }

  getAppConfig(): AppConfig {
      const configs = this.unwrap(this.stores.configStore.getAll(), []);
      return configs[0] as AppConfig;
  }
  
  updateAppConfig(config: AppConfig) {
      this.stores.configStore.update(config);
  }

  getAIConfig(): AIConfig {
      const configs = this.unwrap(this.stores.aiConfigStore.getAll(), []);
      return configs[0] as AIConfig;
  }

  getScoringConfig(): ScoringConfig {
      const configs = this.unwrap(this.stores.scoringConfigStore.getAll(), []);
      return configs[0] as ScoringConfig;
  }

  getThemeConfig(): ThemeConfig {
      const configs = this.unwrap(this.stores.themeConfigStore.getAll(), []);
      return configs[0] as ThemeConfig;
  }

  updateThemeConfig(config: ThemeConfig) {
      this.stores.themeConfigStore.update(config);
      window.dispatchEvent(new Event('theme-update'));
  }

  getModulesForView(view: View): string[] {
      // In a real app, this would check permissions
      return MOCK_MODULES_CONFIG[view] || [];
  }

  // Intelligence
  getThreats(sortByScore = true): Threat[] {
      const res = this.stores.threatStore.getAll();
      let threats = res.success ? res.data : [];
      if (sortByScore) threats.sort((a, b) => b.score - a.score);
      return threats;
  }

  getThreatCategories(): { name: string, value: number }[] {
      const threats = this.getThreats();
      const counts: Record<string, number> = {};
      threats.forEach(t => counts[t.type] = (counts[t.type] || 0) + 1);
      return Object.entries(counts).map(([name, value]) => ({ name, value }));
  }

  getThreatTrends(): { name: string, value: number }[] {
      // Mock trend data based on recent timestamps
      const threats = this.getThreats();
      // Group by hour (mock logic)
      return Array.from({ length: 24 }, (_, i) => ({
          name: `${i}:00`,
          value: Math.floor(Math.random() * 20) + 5 // Mock values
      }));
  }

  addThreat(t: Threat) {
      this.stores.threatStore.add(t);
  }

  deleteThreat(id: string) {
      this.stores.threatStore.delete(id);
  }

  updateStatus(id: string, status: IncidentStatus) {
      const res = this.stores.threatStore.getById(id);
      if (res.success && res.data) {
          this.stores.threatStore.update({ ...res.data, status });
      }
  }

  // Cases
  getCases(): Case[] {
      return this.unwrap(this.stores.caseStore.getAll(), []);
  }

  addCase(c: Case) {
      this.stores.caseStore.add(c);
  }

  updateCase(c: Case) {
      this.stores.caseStore.update(c);
  }

  createCaseFromThreat(threatId: string) {
      const res = this.stores.threatStore.getById(threatId);
      if (res.success && res.data) {
          const threat = res.data;
          const newCase: Case = {
              id: `CASE-${Date.now()}` as CaseId,
              title: `Investigation: ${threat.indicator}`,
              description: `Auto-generated case from threat ${threat.id}`,
              status: 'OPEN',
              priority: threat.severity,
              assignee: 'Unassigned',
              reporter: 'System',
              created: new Date().toISOString(),
              relatedThreatIds: [threat.id],
              findings: '',
              tasks: [],
              notes: [],
              artifacts: [],
              timeline: [],
              agency: 'SENTINEL_CORE',
              sharingScope: 'INTERNAL',
              sharedWith: [],
              labels: ['Auto'],
              tlp: 'AMBER'
          };
          this.stores.caseStore.add(newCase);
      }
  }

  reprioritizeCases() {
      // Mock logic
      const cases = this.getCases();
      cases.forEach(c => {
          if (c.relatedThreatIds.length > 2 && c.priority !== 'CRITICAL') {
              this.stores.caseStore.update({ ...c, priority: 'CRITICAL' });
          }
      });
  }
  
  transferCase(id: string, agency: string) {
      const res = this.stores.caseStore.getById(id);
      if(res.success && res.data) this.stores.caseStore.update({...res.data, agency});
  }

  shareCase(id: string, agency: string) {
      const res = this.stores.caseStore.getById(id);
      if(res.success && res.data && !res.data.sharedWith.includes(agency)) this.stores.caseStore.update({...res.data, sharedWith: [...res.data.sharedWith, agency]});
  }
  
  addTask(caseId: string, task: any) {
      const res = this.stores.caseStore.getById(caseId);
      if(res.success && res.data) this.stores.caseStore.update({...res.data, tasks: [...res.data.tasks, task]});
  }

  toggleTask(caseId: string, taskId: string) {
      const res = this.stores.caseStore.getById(caseId);
      if(res.success && res.data) {
          const tasks = res.data.tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'DONE' ? 'PENDING' : 'DONE' } : t);
          this.stores.caseStore.update({ ...res.data, tasks: tasks as any[] });
      }
  }

  addArtifact(caseId: string, artifact: any) {
      const res = this.stores.caseStore.getById(caseId);
      if(res.success && res.data) this.stores.caseStore.update({...res.data, artifacts: [...res.data.artifacts, artifact]});
  }

  deleteArtifact(caseId: string, artifactId: string) {
      const res = this.stores.caseStore.getById(caseId);
      if(res.success && res.data) this.stores.caseStore.update({...res.data, artifacts: res.data.artifacts.filter(a => a.id !== artifactId)});
  }

  applyPlaybook(caseId: string, playbookId: string) {
     const pb = this.getPlaybooks().find(p => p.id === playbookId);
     const res = this.stores.caseStore.getById(caseId);
     if(res.success && res.data && pb) {
         const newTasks = pb.tasks.map((t, i) => ({ id: `task-${Date.now()}-${i}`, title: t, status: 'PENDING' }));
         this.stores.caseStore.update({ ...res.data, tasks: [...res.data.tasks, ...newTasks] as any[] });
     }
  }

  addNote(caseId: string, content: string) {
      const res = this.stores.caseStore.getById(caseId);
      if(res.success && res.data) {
          const note = { id: `note-${Date.now()}`, author: this.currentUser?.name || 'System', date: new Date().toISOString(), content };
          this.stores.caseStore.update({ ...res.data, notes: [note, ...res.data.notes] });
      }
  }

  linkCases(id1: string, id2: string) {
      this.stores.caseStore.linkCases(id1, id2);
  }

  unlinkCases(id1: string, id2: string) {
      this.stores.caseStore.unlinkCases(id1, id2);
  }

  // Actors
  getActors(): ThreatActor[] { return this.unwrap(this.stores.actorStore.getAll(), []); }
  addActor(a: ThreatActor) { this.stores.actorStore.add(a); }
  deleteActor(id: string) { this.stores.actorStore.delete(id); }
  updateActor(a: ThreatActor) { this.stores.actorStore.update(a); }
  
  addCampaignToActor(actorId: string, campaign: string) { this.stores.actorStore.linkCampaign(actorId, campaign); }
  addInfra(actorId: string, infra: any) { this.stores.actorStore.addInfrastructure(actorId, infra); }
  addExploit(actorId: string, exploit: string) { this.stores.actorStore.addExploit(actorId, exploit); }
  addTarget(actorId: string, target: string) { this.stores.actorStore.addTarget(actorId, target); }
  addTTP(actorId: string, ttp: any) { this.stores.actorStore.addTTP(actorId, ttp); }
  addReference(actorId: string, ref: string) { this.stores.actorStore.addReference(actorId, ref); }
  deleteReference(actorId: string, ref: string) { this.stores.actorStore.removeReference(actorId, ref); }
  addHistoryEvent(actorId: string, event: any) { this.stores.actorStore.addHistoryEvent(actorId, event); }
  linkThreatToActor(threatId: string, actorName: string) {
      const res = this.stores.threatStore.getById(threatId);
      if(res.success && res.data) this.stores.threatStore.update({...res.data, threatActor: actorName});
  }

  // Campaigns
  getCampaigns() { return this.unwrap(this.stores.campaignStore.getAll(), []); }
  addCampaign(c: any) { this.stores.campaignStore.add(c); }
  deleteCampaign(id: string) { this.stores.campaignStore.delete(id); }

  // Infrastructure
  getSystemNodes(): SystemNode[] { return this.unwrap(this.stores.nodeStore.getAll(), []); }
  getFeeds(): IoCFeed[] { return this.unwrap(this.stores.feedStore.getAll(), []); }
  toggleFeed(id: string) { this.stores.feedStore.toggleStatus(id); }
  deleteFeed(id: string) { this.stores.feedStore.delete(id); }
  addFeed(f: IoCFeed) { this.stores.feedStore.add(f); }

  getVulnerabilities(): Vulnerability[] { return this.unwrap(this.stores.vulnStore.getAll(), []); }
  updateVulnerabilityStatus(id: string, status: any) { this.stores.vulnStore.updateStatus(id, status); }
  
  getPatchStatus(): PatchStatus[] { return this.unwrap(this.stores.patchStatusStore.getAll(), []); }
  getScannerStatus(): ScannerStatus[] { return this.unwrap(this.stores.scannerStore.getAll(), []); }
  updateScannerStatus(status: Partial<ScannerStatus>) { 
     const scanners = this.getScannerStatus();
     if(scanners.length > 0) {
         this.stores.scannerStore.update({ ...scanners[0], ...status });
     }
  }
  getVendorFeedItems(): VendorFeedItem[] { return this.unwrap(this.stores.vendorFeedStore.getAll(), []); }
  addVendorFeedItem(item: VendorFeedItem) { this.stores.vendorFeedStore.add(item); }
  
  getVendors(): Vendor[] { return this.unwrap(this.stores.vendorStore.getAll(), []); }
  reassessVendorRisk() { 
      window.dispatchEvent(new Event('data-update'));
  }

  getNistControls(): NistControl[] { return this.unwrap(this.stores.nistControlStore.getAll(), []); }
  getApiKeys(): ApiKey[] { return this.unwrap(this.stores.apiKeyStore.getAll(), []); }
  addApiKey(key: ApiKey) { this.stores.apiKeyStore.add(key); }
  getIntegrations(): Integration[] { return this.unwrap(this.stores.integrationStore.getAll(), []); }

  // Operations
  getAuditLogs(): AuditLog[] { return this.unwrap(this.stores.logStore.getAll(), []); }
  getReports(): IncidentReport[] { return this.unwrap(this.stores.reportStore.getAll(), []); }
  addReport(r: IncidentReport) { this.stores.reportStore.add(r); }
  getReportsByCase(id: string) { return this.stores.reportStore.getByCase(id); }
  getReportsByActor(id: string) { return this.stores.reportStore.getByActor(id); }
  
  getPlaybooks(): Playbook[] { return this.unwrap(this.stores.playbookStore.getAll(), []); }
  
  getChainOfCustody(): ChainEvent[] { return this.unwrap(this.stores.chainStore.getAll(), []); }
  addChainEvent(e: ChainEvent) { this.stores.chainStore.add(e); }
  
  getMalwareSamples(): Malware[] { return this.unwrap(this.stores.malwareStore.getAll(), []); }
  getForensicJobs(): ForensicJob[] { return this.unwrap(this.stores.jobStore.getAll(), []); }
  addForensicJob(j: ForensicJob) { this.stores.jobStore.add(j); }
  
  getDevices(): Device[] { return this.unwrap(this.stores.deviceStore.getAll(), []); }
  getNetworkCaptures(): Pcap[] { return this.unwrap(this.stores.pcapStore.getAll(), []); }

  getHoneytokens(): Honeytoken[] { return this.unwrap(this.stores.honeytokenStore.getAll(), []); }
  getSegmentationPolicies(): SegmentationPolicy[] { return this.unwrap(this.stores.policyStore.getAll(), []); }
  addSegmentationPolicy(p: SegmentationPolicy) { this.stores.policyStore.add(p); }
  getTrafficFlows(): TrafficFlow[] { return this.unwrap(this.stores.trafficFlowStore.getAll(), []); }
  
  // OSINT
  getOsintDomains(): OsintDomain[] { return this.unwrap(this.stores.osintDomainStore.getAll(), []); }
  getOsintBreaches(): OsintBreach[] { return this.unwrap(this.stores.osintBreachStore.getAll(), []); }
  getOsintGeo(): OsintGeo[] { return this.unwrap(this.stores.osintGeoStore.getAll(), []); }
  getOsintSocial(): OsintSocial[] { return this.unwrap(this.stores.osintSocialStore.getAll(), []); }
  getOsintDarkWeb(): OsintDarkWebItem[] { return this.unwrap(this.stores.osintDarkWebStore.getAll(), []); }
  getOsintMeta(): OsintFileMeta[] { return this.unwrap(this.stores.osintMetaStore.getAll(), []); }
  getDarkWebStream(): string[] { return ["Connecting to TOR...", "Bridge established.", "Scanning marketplaces...", "Hit found on Hydra."]; }

  // Knowledge
  getMitreTactics(): MitreItem[] { return this.unwrap(this.stores.mitreTacticStore.getAll(), []); }
  getMitreTechniques(): MitreItem[] { return this.unwrap(this.stores.mitreTechniqueStore.getAll(), []); }
  getMitreSubTechniques(): MitreItem[] { return this.unwrap(this.stores.mitreSubStore.getAll(), []); }
  getMitreGroups(): MitreItem[] { return this.unwrap(this.stores.mitreGroupStore.getAll(), []); }
  getMitreSoftware(): MitreItem[] { return this.unwrap(this.stores.mitreSoftwareStore.getAll(), []); }
  getMitreMitigations(): MitreItem[] { return this.unwrap(this.stores.mitreMitigationStore.getAll(), []); }

  // System
  getSystemUsers(): SystemUser[] { return this.unwrap(this.stores.userStore.getAll(), []); }
  getParserRules(): ParserRule[] { return this.unwrap(this.stores.parserStore.getAll(), []); }
  updateParserRule(p: ParserRule) { this.stores.parserStore.update(p); }
  getEnrichmentModules(): EnrichmentModule[] { return this.unwrap(this.stores.enrichmentStore.getAll(), []); }
  toggleEnrichmentModule(id: string) { 
      const res = this.stores.enrichmentStore.getById(id);
      if(res.success && res.data) this.stores.enrichmentStore.update({ ...res.data, enabled: !res.data.enabled });
  }
  getNormalizationRules(): NormalizationRule[] { return this.unwrap(this.stores.normalizationStore.getAll(), []); }
  
  getRiskForecast(): RiskForecastItem[] { return this.unwrap(this.stores.riskForecastStore.getAll(), []); }
  
  // Messaging
  getChannels(): Channel[] { return this.unwrap(this.stores.messagingStore.getChannels(), []); }
  getMessages(channelId: string): TeamMessage[] { return this.stores.messagingStore.getMessages(channelId); }
  sendMessage(msg: TeamMessage) { this.stores.messagingStore.sendMessage(msg); }
  createChannel(c: Channel) { this.stores.messagingStore.createChannel(c); }

  // Misc
  getResearchCorpus(): string[] { return ["APT29", "Cobalt Strike", "Log4j", "Zero Logon", "DarkSide"]; }
  
  getCompromisedAssets() { return this.getSystemNodes().filter(n => n.status === 'COMPROMISED'); }
  getEscalatableVulns() { return this.getVulnerabilities().filter(v => v.score > 9 && v.status !== 'PATCHED'); }
  getThreatsByActor(name: string) { return this.stores.threatStore.getByActor(name); }

  sync(action: string, type: string, data: any) {
      window.dispatchEvent(new Event('data-update'));
  }
}

export const threatData = new DataLayer();
