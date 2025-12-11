
import { Threat, Case, SystemNode, ThreatActor, AppConfig, Severity, IncidentStatus, AIConfig, ScoringConfig, ThemeConfig, View, IoCFeed, AuditLog, Vulnerability, IncidentReport, SystemUser, Vendor, Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, VendorFeedItem, ScannerStatus, NistControl, ApiKey, PatchStatus, Integration, Channel, TeamMessage, EnrichmentModule, ParserRule, NormalizationRule, SegmentationPolicy, Honeytoken, TrafficFlow, RiskForecastItem, OsintDomain, OsintBreach, OsintGeo, OsintSocial, OsintDarkWebItem, OsintFileMeta, MitreItem, ThreatId, CaseId, ActorId, UserId, AssetId, VendorId } from '../types';
import { createStores } from './stores/storeFactory';
import { DatabaseAdapter, MockAdapter } from './dbAdapter';
import { ThreatMapper, CaseMapper, ActorMapper, AssetMapper } from './mappers';
import { PrefixTrie } from './algorithms/Trie';
import { MOCK_NAVIGATION_CONFIG, MOCK_MODULES_CONFIG } from '../constants';

class DataLayer {
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
  
  // --- Accessors for UI Components (Facade Pattern) ---

  get config(): AppConfig {
      return this.getAppConfig();
  }

  get currentUser(): SystemUser | undefined {
      // Mock current user from store (first admin)
      return this.stores.userStore.getAll().data?.find(u => u.role === 'Administrator') || this.stores.userStore.getAll().data?.[0];
  }

  getAppConfig(): AppConfig {
      return this.stores.configStore.getAll().data?.[0] as AppConfig;
  }
  
  updateAppConfig(config: AppConfig) {
      this.stores.configStore.update(config);
  }

  getAIConfig(): AIConfig {
      return this.stores.aiConfigStore.getAll().data?.[0] as AIConfig;
  }

  getScoringConfig(): ScoringConfig {
      return this.stores.scoringConfigStore.getAll().data?.[0] as ScoringConfig;
  }

  getThemeConfig(): ThemeConfig {
      return this.stores.themeConfigStore.getAll().data?.[0] as ThemeConfig;
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
      // Access store directly via public method if available or generic getAll
      // Note: Store methods return Result<T>, we unwrap for UI simplicity here (or handle error)
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
      // Simple wrapper, real implementation in store might handle side effects
      const t = this.stores.threatStore.getById(id).data;
      if (t) {
          this.stores.threatStore.update({ ...t, status });
      }
  }

  // Cases
  getCases(): Case[] {
      return this.stores.caseStore.getAll().data || [];
  }

  addCase(c: Case) {
      this.stores.caseStore.add(c);
  }

  updateCase(c: Case) {
      this.stores.caseStore.update(c);
  }

  createCaseFromThreat(threatId: string) {
      const threat = this.stores.threatStore.getById(threatId).data;
      if (threat) {
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
      const c = this.stores.caseStore.getById(id).data;
      if(c) this.stores.caseStore.update({...c, agency});
  }

  shareCase(id: string, agency: string) {
      const c = this.stores.caseStore.getById(id).data;
      if(c && !c.sharedWith.includes(agency)) this.stores.caseStore.update({...c, sharedWith: [...c.sharedWith, agency]});
  }
  
  addTask(caseId: string, task: any) {
      const c = this.stores.caseStore.getById(caseId).data;
      if(c) this.stores.caseStore.update({...c, tasks: [...c.tasks, task]});
  }

  toggleTask(caseId: string, taskId: string) {
      const c = this.stores.caseStore.getById(caseId).data;
      if(c) {
          const tasks = c.tasks.map(t => t.id === taskId ? { ...t, status: t.status === 'DONE' ? 'PENDING' : 'DONE' } : t);
          this.stores.caseStore.update({ ...c, tasks: tasks as any[] });
      }
  }

  addArtifact(caseId: string, artifact: any) {
      const c = this.stores.caseStore.getById(caseId).data;
      if(c) this.stores.caseStore.update({...c, artifacts: [...c.artifacts, artifact]});
  }

  deleteArtifact(caseId: string, artifactId: string) {
      const c = this.stores.caseStore.getById(caseId).data;
      if(c) this.stores.caseStore.update({...c, artifacts: c.artifacts.filter(a => a.id !== artifactId)});
  }

  applyPlaybook(caseId: string, playbookId: string) {
     // Mock logic handled in store usually
     const pb = this.getPlaybooks().find(p => p.id === playbookId);
     const c = this.stores.caseStore.getById(caseId).data;
     if(c && pb) {
         const newTasks = pb.tasks.map((t, i) => ({ id: `task-${Date.now()}-${i}`, title: t, status: 'PENDING' }));
         this.stores.caseStore.update({ ...c, tasks: [...c.tasks, ...newTasks] as any[] });
     }
  }

  addNote(caseId: string, content: string) {
      const c = this.stores.caseStore.getById(caseId).data;
      if(c) {
          const note = { id: `note-${Date.now()}`, author: this.currentUser?.name || 'System', date: new Date().toISOString(), content };
          this.stores.caseStore.update({ ...c, notes: [note, ...c.notes] });
      }
  }

  linkCases(id1: string, id2: string) {
      this.stores.caseStore.linkCases(id1, id2);
  }

  unlinkCases(id1: string, id2: string) {
      this.stores.caseStore.unlinkCases(id1, id2);
  }

  // Actors
  getActors(): ThreatActor[] { return this.stores.actorStore.getAll().data || []; }
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
      // Mock logic: update threat with actor name
      const t = this.stores.threatStore.getById(threatId).data;
      if(t) this.stores.threatStore.update({...t, threatActor: actorName});
  }

  // Campaigns
  getCampaigns() { return this.stores.campaignStore.getAll().data || []; }
  addCampaign(c: any) { this.stores.campaignStore.add(c); }
  deleteCampaign(id: string) { this.stores.campaignStore.delete(id); }

  // Infrastructure
  getSystemNodes(): SystemNode[] { return this.stores.nodeStore.getAll().data || []; }
  getFeeds(): IoCFeed[] { return this.stores.feedStore.getAll().data || []; }
  toggleFeed(id: string) { this.stores.feedStore.toggleStatus(id); }
  deleteFeed(id: string) { this.stores.feedStore.delete(id); }
  addFeed(f: IoCFeed) { this.stores.feedStore.add(f); }

  getVulnerabilities(): Vulnerability[] { return this.stores.vulnStore.getAll().data || []; }
  updateVulnerabilityStatus(id: string, status: any) { this.stores.vulnStore.updateStatus(id, status); }
  
  getPatchStatus(): PatchStatus[] { return this.stores.patchStatusStore.getAll().data || []; }
  getScannerStatus(): ScannerStatus[] { return this.stores.scannerStore.getAll().data || []; }
  updateScannerStatus(status: Partial<ScannerStatus>) { 
     // Logic to find and update scanner status
     const scanners = this.getScannerStatus();
     if(scanners.length > 0) {
         this.stores.scannerStore.update({ ...scanners[0], ...status });
     }
  }
  getVendorFeedItems(): VendorFeedItem[] { return this.stores.vendorFeedStore.getAll().data || []; }
  
  getVendors(): Vendor[] { return this.stores.vendorStore.getAll().data || []; }
  reassessVendorRisk() { 
      // Trigger recalculation logic in vendorStore if implemented, or just notify
      window.dispatchEvent(new Event('data-update'));
  }

  getNistControls(): NistControl[] { return this.stores.nistControlStore.getAll().data || []; }
  getApiKeys(): ApiKey[] { return this.stores.apiKeyStore.getAll().data || []; }
  addApiKey(key: ApiKey) { this.stores.apiKeyStore.add(key); }
  getIntegrations(): Integration[] { return this.stores.integrationStore.getAll().data || []; }

  // Operations
  getAuditLogs(): AuditLog[] { return this.stores.logStore.getAll().data || []; }
  getReports(): IncidentReport[] { return this.stores.reportStore.getAll().data || []; }
  addReport(r: IncidentReport) { this.stores.reportStore.add(r); }
  getReportsByCase(id: string) { return this.stores.reportStore.getByCase(id); }
  getReportsByActor(id: string) { return this.stores.reportStore.getByActor(id); }
  
  getPlaybooks(): Playbook[] { return this.stores.playbookStore.getAll().data || []; }
  
  getChainOfCustody(): ChainEvent[] { return this.stores.chainStore.getAll().data || []; }
  addChainEvent(e: ChainEvent) { this.stores.chainStore.add(e); }
  
  getMalwareSamples(): Malware[] { return this.stores.malwareStore.getAll().data || []; }
  getForensicJobs(): ForensicJob[] { return this.stores.jobStore.getAll().data || []; }
  addForensicJob(j: ForensicJob) { this.stores.jobStore.add(j); }
  
  getDevices(): Device[] { return this.stores.deviceStore.getAll().data || []; }
  getNetworkCaptures(): Pcap[] { return this.stores.pcapStore.getAll().data || []; }

  getHoneytokens(): Honeytoken[] { return this.stores.honeytokenStore.getAll().data || []; }
  getSegmentationPolicies(): SegmentationPolicy[] { return this.stores.policyStore.getAll().data || []; }
  addSegmentationPolicy(p: SegmentationPolicy) { this.stores.policyStore.add(p); }
  getTrafficFlows(): TrafficFlow[] { return this.stores.trafficFlowStore.getAll().data || []; }
  
  // OSINT
  getOsintDomains(): OsintDomain[] { return this.stores.osintDomainStore.getAll().data || []; }
  getOsintBreaches(): OsintBreach[] { return this.stores.osintBreachStore.getAll().data || []; }
  getOsintGeo(): OsintGeo[] { return this.stores.osintGeoStore.getAll().data || []; }
  getOsintSocial(): OsintSocial[] { return this.stores.osintSocialStore.getAll().data || []; }
  getOsintDarkWeb(): OsintDarkWebItem[] { return this.stores.osintDarkWebStore.getAll().data || []; }
  getOsintMeta(): OsintFileMeta[] { return this.stores.osintMetaStore.getAll().data || []; }
  getDarkWebStream(): string[] { return ["Connecting to TOR...", "Bridge established.", "Scanning marketplaces...", "Hit found on Hydra."]; }

  // Knowledge
  getMitreTactics(): MitreItem[] { return this.stores.mitreTacticStore.getAll().data || []; }
  getMitreTechniques(): MitreItem[] { return this.stores.mitreTechniqueStore.getAll().data || []; }
  getMitreSubTechniques(): MitreItem[] { return this.stores.mitreSubStore.getAll().data || []; }
  getMitreGroups(): MitreItem[] { return this.stores.mitreGroupStore.getAll().data || []; }
  getMitreSoftware(): MitreItem[] { return this.stores.mitreSoftwareStore.getAll().data || []; }
  getMitreMitigations(): MitreItem[] { return this.stores.mitreMitigationStore.getAll().data || []; }

  // System
  getSystemUsers(): SystemUser[] { return this.stores.userStore.getAll().data || []; }
  getParserRules(): ParserRule[] { return this.stores.parserStore.getAll().data || []; }
  updateParserRule(p: ParserRule) { this.stores.parserStore.update(p); }
  getEnrichmentModules(): EnrichmentModule[] { return this.stores.enrichmentStore.getAll().data || []; }
  toggleEnrichmentModule(id: string) { 
      const m = this.stores.enrichmentStore.getById(id).data;
      if(m) this.stores.enrichmentStore.update({ ...m, enabled: !m.enabled });
  }
  getNormalizationRules(): NormalizationRule[] { return this.stores.normalizationStore.getAll().data || []; }
  
  getRiskForecast(): RiskForecastItem[] { return this.stores.riskForecastStore.getAll().data || []; }
  
  // Messaging
  getChannels(): Channel[] { return this.stores.messagingStore.getChannels().data || []; }
  getMessages(channelId: string): TeamMessage[] { return this.stores.messagingStore.getMessages(channelId); }
  sendMessage(msg: TeamMessage) { this.stores.messagingStore.sendMessage(msg); }
  createChannel(c: Channel) { this.stores.messagingStore.createChannel(c); }

  // Misc
  getResearchCorpus(): string[] { return ["APT29", "Cobalt Strike", "Log4j", "Zero Logon", "DarkSide"]; }
  
  getCompromisedAssets() { return this.getSystemNodes().filter(n => n.status === 'COMPROMISED'); }
  getEscalatableVulns() { return this.getVulnerabilities().filter(v => v.score > 9 && v.status !== 'PATCHED'); }
  getThreatsByActor(name: string) { return this.stores.threatStore.getByActor(name); }

  sync(action: string, type: string, data: any) {
      // Generic sync handler for external triggers
      window.dispatchEvent(new Event('data-update'));
  }
}

export const threatData = new DataLayer();
