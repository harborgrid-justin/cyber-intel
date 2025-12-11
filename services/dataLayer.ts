
import { MockAdapter, DatabaseAdapter, RemoteAdapter } from './dbAdapter';
import { SyncManager } from './syncManager';
import { createStores } from './stores/storeFactory';
import { SystemUser, Threat, Case, AssetAtRisk, Vulnerability, AppConfig, AIConfig, ScoringConfig, NavigationConfig, View, ThreatActor, Campaign, AuditLog, IncidentReport, IoCFeed, SystemNode, Vendor, Playbook, ChainEvent, Malware, ForensicJob, Device, Pcap, Integration, PatchStatus, ScannerStatus, ApiKey, EnrichmentModule, ParserRule, NormalizationRule, SegmentationPolicy, Honeytoken, NistControl, OsintBreach, OsintDomain, OsintSocial, OsintGeo, OsintDarkWebItem, OsintFileMeta, VendorFeedItem, TrafficFlow, MitreItem, Channel, TeamMessage, ThemeConfig } from '../types';
import { apiClient } from './apiClient';
import { CONFIG } from '../config';
import { InterconnectLogic } from './logic/InterconnectLogic';
import { AdvancedInterconnect } from './logic/AdvancedInterconnect';
import { DeepAnalytics } from './logic/DeepAnalytics';
import { VectorStore } from './data/VectorStore';
import { InvertedIndex } from './data/InvertedIndex';
import { QuadTree } from './data/QuadTree';
import { TimeSeriesStore } from './data/TimeSeriesStore';
import { ReadThroughCache } from './data/ReadThroughCache';
import { AclManager } from './data/AclManager';
import { SystemGuard } from './core/SystemGuard';
import { DEFAULT_APP_CONFIG, MOCK_AI_CONFIG, MOCK_SCORING_CONFIG, DEFAULT_THEME_CONFIG } from '../constants/index';

export class DataLayer {
  public adapter: DatabaseAdapter;
  public syncManager: SyncManager;
  public currentUser: SystemUser | null = null;
  public vectorSearch = new VectorStore();
  public fullTextSearch = new InvertedIndex();
  public geoIndex = new QuadTree({ x: 0, y: 0, w: 100, h: 50 });
  public trafficMetrics = new TimeSeriesStore();
  public threatCache: ReadThroughCache<Threat | null>;
  
  // Memoization for expensive getters
  private _filteredThreats: { data: Threat[], clearance: string, sourceLen: number } | null = null;

  // Dynamic store properties
  [key: string]: any;

  constructor() {
    this.adapter = new RemoteAdapter();
    const stores = createStores(this.adapter);
    Object.assign(this, stores);

    this.threatCache = new ReadThroughCache(async (id) => {
        const res = this.threatStore.getById(id);
        return res.success ? res.data : null;
    });
    
    // Register Core Dependency
    SystemGuard.registerDependency('DataLayer', 'Stores');
    
    this.initializeData();
    this.syncManager = new SyncManager(this);
    this.syncManager.start();
  }

  async initializeData() {
    const connected = await this.adapter.connect({});
    if (connected && this.adapter.type === 'REMOTE') {
      try {
        const userData = await apiClient.get<SystemUser>('/users/me');
        this.currentUser = { ...userData, effectivePermissions: userData.effectivePermissions || [] };
        window.dispatchEvent(new Event('user-update'));
      } catch (e) {
        console.warn('Failed to fetch user profile, using mock.');
        this.setMockUser();
      }
      // Core fetch with robust handling
      await Promise.allSettled(['threatStore','caseStore','actorStore','nodeStore','feedStore','userStore'].map(s => this[s].fetch()));
    } else {
      this.setProvider(new MockAdapter());
      this.setMockUser();
    }
    this.indexData();
  }

  private indexData() {
    // Unwrapping the Result<T[]> from stores
    const res = this.threatStore.getAll();
    const threats = res.success ? res.data : [];
    threats.forEach((t: Threat) => {
      this.fullTextSearch.add(t.id, t.description + ' ' + t.indicator);
      this.vectorSearch.add(t.id, Array.from({length: 5}, () => Math.random()));
    });
  }

  private setMockUser() {
    this.currentUser = {
        id: 'USR-MOCK', name: CONFIG.USER.NAME, username: 'admin.local', roleId: 'ROLE-ADMIN', role: 'Administrator',
        clearance: CONFIG.USER.CLEARANCE, status: 'Online', isVIP: true, effectivePermissions: ['*:*']
    } as SystemUser;
    window.dispatchEvent(new Event('user-update'));
  }

  setProvider(adapter: DatabaseAdapter) {
    this.adapter = adapter;
    createStores(adapter); // Re-init stores with new adapter
    window.dispatchEvent(new Event('db-adapter-changed'));
  }

  getAdapterInfo() { return { name: this.adapter.name, type: this.adapter.type }; }
  
  // --- Core Intelligence ---
  getThreats(sort = true): Threat[] { 
    const res = this.threatStore.getAll();
    const raw = res.success ? (res.data as Threat[]) : [];
    
    const clearance = this.currentUser?.clearance || 'UNCLASSIFIED';
    
    if (this._filteredThreats && 
        this._filteredThreats.sourceLen === raw.length && 
        this._filteredThreats.clearance === clearance) {
          // Could return cached, but filtering is fast enough usually
    }

    const filtered = AclManager.filter<Threat>(raw, clearance);
    this._filteredThreats = { data: filtered, clearance, sourceLen: raw.length };
    return filtered;
  }

  getCases(): Case[] { 
      const res = this.caseStore.getAll();
      return res.success ? res.data : [];
  }
  
  getActors(): ThreatActor[] { return this.unwrap(this.actorStore.getAll()); }
  getCampaigns(): Campaign[] { return this.unwrap(this.campaignStore.getAll()); }
  
  // Helper to unwrap results for legacy compatibility
  private unwrap<T>(result: any): T[] {
      return (result && result.success && Array.isArray(result.data)) ? result.data : [];
  }

  // ... (Rest of getters updated to unwrap results or use helper) ...
  
  getAuditLogs(): AuditLog[] { return this.unwrap(this.logStore.getAll()); }
  getReports(): IncidentReport[] { return this.unwrap(this.reportStore.getAll()); }
  getPlaybooks(): Playbook[] { return this.unwrap(this.playbookStore.getAll()); }
  getChainOfCustody(): ChainEvent[] { return this.unwrap(this.chainStore.getAll()); }
  
  getSystemNodes(): SystemNode[] { return this.unwrap(this.nodeStore.getAll()); }
  getVulnerabilities(): Vulnerability[] { return this.unwrap(this.vulnStore.getAll()); }
  getVendors(): Vendor[] { return this.unwrap(this.vendorStore.getAll()); }
  getFeeds(): IoCFeed[] { return this.unwrap(this.feedStore.getAll()); }
  
  getSystemUsers(): SystemUser[] { return this.unwrap(this.userStore.getAll()); }
  getApiKeys(): ApiKey[] { return this.unwrap(this.apiKeyStore.getAll()); }
  getIntegrations(): Integration[] { return this.unwrap(this.integrationStore.getAll()); }
  
  getMalwareSamples(): Malware[] { return this.unwrap(this.malwareStore.getAll()); }
  getForensicJobs(): ForensicJob[] { return this.unwrap(this.jobStore.getAll()); }
  getDevices(): Device[] { return this.unwrap(this.deviceStore.getAll()); }
  getNetworkCaptures(): Pcap[] { return this.unwrap(this.pcapStore.getAll()); }
  
  getPatchStatus(): PatchStatus[] { return this.unwrap(this.patchStatusStore.getAll()); }
  getScannerStatus(): ScannerStatus[] { return this.unwrap(this.scannerStore.getAll()); }
  getEnrichmentModules(): EnrichmentModule[] { return this.unwrap(this.enrichmentStore.getAll()); }
  getParserRules(): ParserRule[] { return this.unwrap(this.parserStore.getAll()); }
  getNormalizationRules(): NormalizationRule[] { return this.unwrap(this.normalizationStore.getAll()); }
  getSegmentationPolicies(): SegmentationPolicy[] { return this.unwrap(this.policyStore.getAll()); }
  getHoneytokens(): Honeytoken[] { return this.unwrap(this.honeytokenStore.getAll()); }
  getNistControls(): NistControl[] { return this.unwrap(this.nistControlStore.getAll()); }
  
  getOsintBreaches(): OsintBreach[] { return this.unwrap(this.osintBreachStore.getAll()); }
  getOsintDomains(): OsintDomain[] { return this.unwrap(this.osintDomainStore.getAll()); }
  getOsintSocial(): OsintSocial[] { return this.unwrap(this.osintSocialStore.getAll()); }
  getOsintGeo(): OsintGeo[] { return this.unwrap(this.osintGeoStore.getAll()); }
  getOsintDarkWeb(): OsintDarkWebItem[] { return this.unwrap(this.osintDarkWebStore.getAll()); }
  getOsintMeta(): OsintFileMeta[] { return this.unwrap(this.osintMetaStore.getAll()); }

  getVendorFeedItems(): VendorFeedItem[] { return this.unwrap(this.vendorFeedStore.getAll()); }
  getRiskForecast(): any[] { return this.unwrap(this.riskForecastStore.getAll()); }
  getTrafficFlows(): TrafficFlow[] { return this.unwrap(this.trafficFlowStore.getAll()); }
  
  getMitreTactics(): MitreItem[] { return this.unwrap(this.mitreTacticStore.getAll()); }
  getMitreTechniques(): MitreItem[] { return this.unwrap(this.mitreTechniqueStore.getAll()); }
  getMitreSubTechniques(): MitreItem[] { return this.unwrap(this.mitreSubStore.getAll()); }
  getMitreGroups(): MitreItem[] { return this.unwrap(this.mitreGroupStore.getAll()); }
  getMitreSoftware(): MitreItem[] { return this.unwrap(this.mitreSoftwareStore.getAll()); }
  getMitreMitigations(): MitreItem[] { return this.unwrap(this.mitreMitigationStore.getAll()); }
  
  getAppConfig(): AppConfig { return (this.unwrap(this.configStore.getAll())[0] as AppConfig) || DEFAULT_APP_CONFIG; }
  getAIConfig(): AIConfig { return (this.unwrap(this.aiConfigStore.getAll())[0] as AIConfig) || MOCK_AI_CONFIG; }
  getScoringConfig(): ScoringConfig { return (this.unwrap(this.scoringConfigStore.getAll())[0] as ScoringConfig) || MOCK_SCORING_CONFIG; }
  getThemeConfig(): ThemeConfig { return (this.unwrap(this.themeConfigStore?.getAll())[0] as ThemeConfig) || DEFAULT_THEME_CONFIG; }
  getNavigationConfig() { return this.navigationConfig; }
  getModulesForView(view: View) { return this.modulesConfig[view] || []; }

  // ... (Logic helpers remain mostly the same, ensuring they call .data on result objects)
  getCompromisedAssets(): AssetAtRisk[] {
    const assets = this.getSystemNodes();
    const threats = this.getThreats();
    return assets.map((a: any) => InterconnectLogic.correlateIoCToAsset(
      threats.find((t: Threat) => t.indicator === a.name || t.indicator === a.ip_address) || { indicator: '', type: '' } as any, 
      [a]
    )).filter(Boolean) as AssetAtRisk[];
  }

  getEscalatableVulns(): Vulnerability[] {
    return this.getVulnerabilities().filter((v: Vulnerability) => InterconnectLogic.shouldEscalateVuln(v));
  }

  getActiveBotnets(): boolean {
    return InterconnectLogic.detectBotnetSurge(this.getThreats(), 1000); 
  }
  
  getAdvancedMetrics() {
     return {
         spearphishingRisk: AdvancedInterconnect.calcSpearphishingRisk(this.currentUser!, this.getThreats()),
         killChainVelocity: this.getCampaigns().map((c: any) => DeepAnalytics.calculateKillChainVelocity(c)),
         rogueDevices: this.getDevices().filter((d: any) => DeepAnalytics.isRogueDevice(d.macAddress || '', this.getDevices())).length
     };
  }

  // --- Actions & Mutations (Pass-through) ---
  addThreat(t: Threat) { this.threatStore.addThreat(t, this.getActors(), this.getCases(), (c: any) => this.addCase(c)); }
  deleteThreat(id: string) { this.threatStore.delete(id); }
  updateStatus(id: string, s: any) { this.threatStore.updateStatus(id, s, this.getCases(), (c: any) => this.addCase(c)); }
  addCase(c: any) { this.caseStore.addCase(c, this.getPlaybooks(), (id: string, n: string) => this.caseStore.addNote(id, n)); }
  updateCase(c: any) { this.caseStore.update(c); }
  updateAppConfig(c: AppConfig) { this.configStore.update(c); window.dispatchEvent(new Event('config-update')); }
  
  updateThemeConfig(c: ThemeConfig) {
      if (this.themeConfigStore) {
          this.themeConfigStore.update(c);
          window.dispatchEvent(new Event('theme-update')); 
      }
  }

  // Messaging
  getMessages(channelId: string) { return this.messagingStore.getMessages(channelId); }
  getChannels() { return this.unwrap(this.messagingStore.getAll()); } // Explicit unwrapping for channels
  sendMessage(msg: any) { this.messagingStore.sendMessage(msg); }
  createChannel(c: any) { this.messagingStore.createChannel(c); }

  // Sync
  sync(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: unknown) { 
    this.adapter.execute(action, collection, data as Record<string, any>);
  }

  // Static Data Helpers
  getDarkWebStream() {
    return [
      "CONNECTING TO TOR NETWORK...", "HANDSHAKE_ESTABLISHED [RELAY_22]", "INDEXING HIDDEN WIKI...",
      "ALERT: NEW HASH DETECTED ON RAIDFORUMS", "STREAMING_DATA: 44KB/s", "PARSING .ONION LISTING...",
      "WARNING: EXIT NODE UNTRUSTED", "CREDENTIAL_DUMP FOUND: COLLECTION_1 (PART 4)",
      "MONITORING CHATTER: #ZERO_DAY", "PING: 80ms"
    ];
  }
  
  getResearchCorpus() {
      return ['APT-29', 'Cobalt Strike', 'Emotet', 'Lazarus Group', 'Zero Logon', 'Log4Shell', 'Mimikatz', 'BloodHound', 'DarkSide', 'Conti', 'Ryuk'];
  }
  
  getThreatsByActor(actor: string) { return this.threatStore.getByActor(actor); }
  getReportsByActor(actorId: string) { return this.reportStore.getByActor(actorId); }
  getReportsByCase(caseId: string) { return this.reportStore.getByCase(caseId); }
  
  getThreatCategories() {
      const threats = this.getThreats();
      const categories: Record<string, number> = {};
      threats.forEach(t => categories[t.type] = (categories[t.type] || 0) + 1);
      return Object.keys(categories).map(k => ({ name: k, value: categories[k] }));
  }
  getThreatTrends() {
      // Mock trends for charts
      return Array.from({length: 24}, (_, i) => ({ name: `${i}:00`, value: Math.floor(Math.random() * 100) }));
  }

  // Operation Actions
  addSegmentationPolicy(p: any) { this.policyStore.add(p); }
  reassessVendorRisk() { /* Mock trigger */ }
  toggleFeed(id: string) { 
      const res = this.feedStore.getById(id);
      if(res.success && res.data) { 
          const f = res.data;
          f.status = f.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'; 
          this.feedStore.update(f); 
      } 
  }
  deleteFeed(id: string) { this.feedStore.delete(id); }
  deleteCampaign(id: string) { this.campaignStore.delete(id); }
  deleteActor(id: string) { this.actorStore.delete(id); }
  addCampaign(c: any) { this.campaignStore.add(c); }
  addActor(a: any) { this.actorStore.add(a); }
  addApiKey(k: any) { this.apiKeyStore.add(k); }
  addReport(r: any) { this.reportStore.add(r); }
  addArtifact(caseId: string, a: any) { 
      const res = this.caseStore.getById(caseId);
      if(res.success && res.data) { 
          const kase = res.data;
          kase.artifacts.push(a); 
          this.caseStore.update(kase); 
      }
  }
  deleteArtifact(caseId: string, aId: string) {
      const res = this.caseStore.getById(caseId);
      if(res.success && res.data) { 
          const kase = res.data;
          kase.artifacts = kase.artifacts.filter((x: any) => x.id !== aId); 
          this.caseStore.update(kase); 
      }
  }
  addChainEvent(e: any) { this.chainStore.add(e); }
  addForensicJob(j: any) { this.jobStore.add(j); }
  updateVulnerabilityStatus(id: string, s: string) { this.vulnStore.updateStatus(id, s as any); }
  toggleEnrichmentModule(id: string) { 
      const res = this.enrichmentStore.getById(id);
      if(res.success && res.data) { 
          const m = res.data;
          m.enabled = !m.enabled; 
          this.enrichmentStore.update(m); 
      } 
  }
  updateParserRule(p: any) { this.parserStore.update(p); }
  addVendorFeedItem(i: any) { this.vendorFeedStore.add(i); }
  updateScannerStatus(s: any) { /* Mock */ }
  reprioritizeCases() { /* Mock */ }
  transferCase(id: string, agency: string) { 
      const res = this.caseStore.getById(id);
      if(res.success && res.data) { 
          const c = res.data;
          c.agency = agency; 
          this.caseStore.update(c); 
      } 
  }
  shareCase(id: string, agency: string) { 
      const res = this.caseStore.getById(id);
      if(res.success && res.data) { 
          const c = res.data;
          if (!c.sharedWith.includes(agency)) { 
              c.sharedWith.push(agency); 
              this.caseStore.update(c); 
          }
      } 
  }
  toggleTask(caseId: string, taskId: string) {
      const res = this.caseStore.getById(caseId);
      if(res.success && res.data) { 
          const c = res.data;
          const t = c.tasks.find((x: any) => x.id === taskId); 
          if(t) { 
              t.status = t.status === 'DONE' ? 'PENDING' : 'DONE'; 
              this.caseStore.update(c); 
          } 
      }
  }
  addTask(caseId: string, task: any) { this.caseStore.addTask(caseId, task); }
  linkCases(s: string, t: string) { this.caseStore.linkCases(s, t); }
  unlinkCases(s: string, t: string) { this.caseStore.unlinkCases(s, t); }
  applyPlaybook(cid: string, pid: string) { 
      const res = this.playbookStore.getById(pid);
      if(res.success && res.data) {
          const pb = res.data;
          this.caseStore.applyPlaybook(cid, pb, (id: string, n: string) => this.caseStore.addNote(id, n)); 
      }
  }
  addNote(cid: string, content: string) { this.caseStore.addNote(cid, content); }
  
  // Actor Helpers
  addCampaignToActor(aid: string, c: string) { this.actorStore.linkCampaign(aid, c); }
  addInfra(aid: string, i: any) { this.actorStore.addInfrastructure(aid, i); }
  updateActor(a: any) { this.actorStore.update(a); }
  addExploit(aid: string, e: string) { this.actorStore.addExploit(aid, e); }
  addTarget(aid: string, t: string) { this.actorStore.addTarget(aid, t); }
  addTTP(aid: string, t: any) { this.actorStore.addTTP(aid, t); }
  addReference(aid: string, r: string) { this.actorStore.addReference(aid, r); }
  deleteReference(aid: string, r: string) { this.actorStore.removeReference(aid, r); }
  addHistoryEvent(aid: string, e: any) { this.actorStore.addHistoryEvent(aid, e); }
  linkThreatToActor(tid: string, aname: string) { 
      const res = this.threatStore.getById(tid);
      if(res.success && res.data) { 
          const t = res.data;
          t.threatActor = aname; 
          this.threatStore.update(t); 
      } 
  }
  addFeed(feed: IoCFeed) { this.feedStore.add(feed); }
}

export const threatData = new DataLayer();
