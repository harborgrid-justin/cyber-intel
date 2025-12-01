
import { MockAdapter, DatabaseAdapter } from './dbAdapter';
import { ThreatStore } from './stores/threatStore';
import { CaseStore } from './stores/caseStore';
import { ActorStore } from './stores/actorStore';
import { CampaignStore } from './stores/campaignStore';
import { FeedStore } from './stores/feedStore';
import { LogStore } from './stores/logStore';
import { VulnerabilityStore } from './stores/vulnerabilityStore';
import { SystemNodeStore } from './stores/systemNodeStore';
import { ReportStore } from './stores/reportStore';
import { UserStore } from './stores/userStore';
import { BaseStore } from './stores/baseStore';
import { VendorStore } from './stores/vendorStore';
import { MessagingStore } from './stores/messagingStore';
import { 
  IncidentStatus, Threat, Case, ThreatActor, Playbook, Artifact, ChainEvent, 
  Malware, ForensicJob, Device, Pcap, Vulnerability, SystemUser, IncidentReport, 
  Campaign, ChartDataPoint, VendorFeedItem, ScannerStatus, MitreItem, OsintDomain, 
  OsintBreach, OsintGeo, OsintSocial, Integration, PatchStatus, Vendor, Channel, TeamMessage 
} from '../../../types';
import { SupplyChainLogic } from './logic/SupplyChainLogic';
import { InitialDataFactory } from './initialData';
import { ThreatMapper, CaseMapper, ActorMapper } from './mappers';
import { SyncManager } from './syncManager';
import { MOCK_TEMPLATES, MOCK_DARKWEB, MOCK_META } from '@/constants';

export class DataLayer {
  public adapter: DatabaseAdapter = new MockAdapter();
  public syncManager: SyncManager;
  
  // Domain Specific Stores
  public threatStore: ThreatStore;
  public caseStore: CaseStore;
  public actorStore: ActorStore;
  public campaignStore: CampaignStore;
  public feedStore: FeedStore;
  public logStore: LogStore;
  public vulnStore: VulnerabilityStore;
  public nodeStore: SystemNodeStore;
  public reportStore: ReportStore;
  public userStore: UserStore;
  public vendorStore: VendorStore;
  public messagingStore: MessagingStore;
  
  // Generic Stores
  public playbookStore: BaseStore<Playbook>;
  public chainStore: BaseStore<ChainEvent>;
  public malwareStore: BaseStore<Malware>;
  public jobStore: BaseStore<ForensicJob>;
  public deviceStore: BaseStore<Device>;
  public pcapStore: BaseStore<Pcap>;
  public vendorFeedStore: BaseStore<VendorFeedItem>;
  public scannerStore: BaseStore<ScannerStatus>;
  
  // Knowledge Base Stores
  public mitreTacticStore: BaseStore<MitreItem>;
  public mitreTechniqueStore: BaseStore<MitreItem>;
  public mitreSubStore: BaseStore<MitreItem>;
  public mitreGroupStore: BaseStore<MitreItem>;
  public mitreSoftwareStore: BaseStore<MitreItem>;
  public mitreMitigationStore: BaseStore<MitreItem>;

  // OSINT Stores
  public osintDomainStore: BaseStore<OsintDomain>;
  public osintBreachStore: BaseStore<OsintBreach>;
  public osintGeoStore: BaseStore<OsintGeo>;
  public osintSocialStore: BaseStore<OsintSocial>;
  
  // Config Stores
  public integrationStore: BaseStore<Integration>;
  public patchStatusStore: BaseStore<PatchStatus>;

  // Legacy Getters/Setters for compatibility
  get threats() { return this.threatStore.getAll(); }
  set threats(val: Threat[]) { /* No-op */ }
  get cases() { return this.caseStore.getAll(); }
  set cases(val: Case[]) { /* No-op */ }
  get feeds() { return this.feedStore.getAll(); }
  set feeds(v: any[]) { /* No-op */ }
  get systemUsers() { return this.userStore.getAll(); }
  set systemUsers(v: SystemUser[]) { /* No-op */ }
  get devices() { return this.deviceStore.getAll(); }
  set devices(v: Device[]) { /* No-op */ }

  constructor() {
    // Initialize Domain Stores with Mappers
    this.threatStore = new ThreatStore('THREATS', InitialDataFactory.getThreats(), this.adapter, new ThreatMapper());
    this.caseStore = new CaseStore('CASES', InitialDataFactory.getCases(), this.adapter, new CaseMapper());
    this.actorStore = new ActorStore('ACTORS', InitialDataFactory.getActors(), this.adapter, new ActorMapper());
    
    // Initialize standard stores
    this.campaignStore = new CampaignStore('CAMPAIGNS', InitialDataFactory.getCampaigns(), this.adapter);
    this.feedStore = new FeedStore('FEEDS', InitialDataFactory.getFeeds(), this.adapter);
    this.logStore = new LogStore('LOGS', InitialDataFactory.getLogs(), this.adapter);
    this.vulnStore = new VulnerabilityStore('VULNS', InitialDataFactory.getVulns(), this.adapter);
    this.nodeStore = new SystemNodeStore('NODES', InitialDataFactory.getNodes(), this.adapter);
    this.reportStore = new ReportStore('REPORTS', InitialDataFactory.getReports(), this.adapter);
    this.userStore = new UserStore('USERS', InitialDataFactory.getUsers(), this.adapter);
    this.vendorStore = new VendorStore('VENDORS', InitialDataFactory.getVendors(), this.adapter);
    
    const { channels, messages } = InitialDataFactory.getMessagingData();
    this.messagingStore = new MessagingStore('CHANNELS', channels, messages, this.adapter);
    
    // Initialize Generic Stores
    this.playbookStore = new BaseStore('PLAYBOOKS', InitialDataFactory.getPlaybooks(), this.adapter);
    this.chainStore = new BaseStore('CHAIN', InitialDataFactory.getChain(), this.adapter);
    this.malwareStore = new BaseStore('MALWARE', InitialDataFactory.getMalware(), this.adapter);
    this.jobStore = new BaseStore('JOBS', InitialDataFactory.getJobs(), this.adapter);
    this.deviceStore = new BaseStore('DEVICES', InitialDataFactory.getDevices(), this.adapter);
    this.pcapStore = new BaseStore('PCAPS', InitialDataFactory.getPcaps(), this.adapter);
    this.vendorFeedStore = new BaseStore('VENDOR_FEEDS', InitialDataFactory.getVendorFeeds(), this.adapter);
    this.scannerStore = new BaseStore('SCANNERS', InitialDataFactory.getScanners(), this.adapter);

    // Knowledge Base Stores
    const mitre = InitialDataFactory.getMitreData();
    this.mitreTacticStore = new BaseStore('MITRE_TACTICS', mitre.tactics, this.adapter);
    this.mitreTechniqueStore = new BaseStore('MITRE_TECHNIQUES', mitre.techniques, this.adapter);
    this.mitreSubStore = new BaseStore('MITRE_SUB_TECHNIQUES', mitre.subTechniques, this.adapter);
    this.mitreGroupStore = new BaseStore('MITRE_GROUPS', mitre.groups, this.adapter);
    this.mitreSoftwareStore = new BaseStore('MITRE_SOFTWARE', mitre.software, this.adapter);
    this.mitreMitigationStore = new BaseStore('MITRE_MITIGATIONS', mitre.mitigations, this.adapter);

    // OSINT Stores
    const osint = InitialDataFactory.getOsintData();
    this.osintDomainStore = new BaseStore('OSINT_DOMAINS', osint.domains, this.adapter);
    this.osintBreachStore = new BaseStore('OSINT_BREACHES', osint.breaches, this.adapter);
    this.osintGeoStore = new BaseStore('OSINT_GEO', osint.geo, this.adapter);
    this.osintSocialStore = new BaseStore('OSINT_SOCIAL', osint.social, this.adapter);

    // Config Stores
    const config = InitialDataFactory.getConfigData();
    this.integrationStore = new BaseStore('INTEGRATIONS', config.integrations, this.adapter);
    this.patchStatusStore = new BaseStore('PATCH_STATUS', config.patchStatus, this.adapter);
    
    // Start Sync Engine
    this.syncManager = new SyncManager(this);
    this.syncManager.start();
  }

  setProvider(adapter: DatabaseAdapter) {
    this.adapter = adapter;
    const stores = [
      this.threatStore, this.caseStore, this.actorStore, this.campaignStore,
      this.feedStore, this.logStore, this.vulnStore, this.nodeStore, this.reportStore, this.userStore, this.vendorStore, this.messagingStore,
      this.playbookStore, this.chainStore, this.malwareStore, this.jobStore, 
      this.deviceStore, this.pcapStore,
      this.vendorFeedStore, this.scannerStore,
      this.mitreTacticStore, this.mitreTechniqueStore, this.mitreSubStore, this.mitreGroupStore, this.mitreSoftwareStore, this.mitreMitigationStore,
      this.osintDomainStore, this.osintBreachStore, this.osintGeoStore, this.osintSocialStore,
      this.integrationStore, this.patchStatusStore
    ];
    stores.forEach(s => {
        s.setAdapter(adapter);
        s.fetch(); // Auto-fetch on provider switch
    });
    window.dispatchEvent(new Event('db-adapter-changed'));
  }

  getAdapterInfo() { return { name: this.adapter.name, type: this.adapter.type }; }
  
  // --- Facade Methods (Delegating to Stores) ---
  
  // Threat Management
  getThreats(sort = true) { return this.threatStore.getThreats(sort); }
  getThreatsByActor(name: string) { return this.threatStore.getByActor(name); }
  addThreat(t: Threat) { this.threatStore.addThreat(t, this.actorStore.getAll(), this.caseStore.getAll(), (c) => this.addCase(c)); }
  deleteThreat(id: string) { this.threatStore.delete(id); }
  updateStatus(id: string, s: IncidentStatus) { this.threatStore.updateStatus(id, s, this.caseStore.getAll(), (c) => this.addCase(c)); }
  updateThreat(t: Threat) { this.threatStore.update(t); }
  linkThreatToActor(tid: string, name: string) { const t = this.threatStore.getById(tid); if(t) { t.threatActor = name; this.threatStore.update(t); } }

  // Case Management
  getCases() { return this.caseStore.getCases(); }
  getCase(id: string) { return this.caseStore.getById(id); }
  addCase(c: Case) { this.caseStore.addCase(c, this.playbookStore.getAll(), (id, n) => this.caseStore.addNote(id, n)); }
  deleteCase(id: string) { this.caseStore.delete(id); }
  updateCase(c: Case) { this.caseStore.update(c); }
  addTask(cid: string, t: any) { this.caseStore.addTask(cid, t); }
  toggleTask(cid: string, tid: string) { 
    const c = this.getCase(cid); 
    const task = c?.tasks.find(t => t.id === tid); 
    if(c && task) { 
        task.status = task.status === 'DONE' ? 'PENDING' : 'DONE'; 
        this.caseStore.update(c); 
    } 
  }
  applyPlaybook(cid: string, pid: string) { 
    const pb = this.playbookStore.getById(pid); 
    if(pb) { 
        this.caseStore.applyPlaybook(cid, pb, (id, n) => this.caseStore.addNote(id, n)); 
        pb.usageCount = (pb.usageCount || 0) + 1; 
        this.playbookStore.update(pb); 
    } 
  }
  addNote(cid: string, n: string) { this.caseStore.addNote(cid, n); }
  addArtifact(cid: string, a: Artifact) { const c = this.getCase(cid); if(c) { c.artifacts.push(a); this.caseStore.update(c); } }
  deleteArtifact(cid: string, aid: string) { const c = this.getCase(cid); if(c) { c.artifacts = c.artifacts.filter(x => x.id !== aid); this.caseStore.update(c); } }
  reprioritizeCases() { this.caseStore.getCases(); }
  transferCase(cid: string, agency: string) { const c = this.getCase(cid); if(c) { c.agency = agency; this.caseStore.update(c); } }
  shareCase(cid: string, agency: string) { const c = this.getCase(cid); if(c) { c.sharedWith.push(agency); this.caseStore.update(c); } }
  linkCases(sourceId: string, targetId: string) { this.caseStore.linkCases(sourceId, targetId); }
  unlinkCases(sourceId: string, targetId: string) { this.caseStore.unlinkCases(sourceId, targetId); }

  // Campaign Management
  getCampaigns() { return this.campaignStore.getAll(); }
  addCampaign(arg1: Campaign | string, arg2?: string): void { 
    if (typeof arg1 === 'string' && typeof arg2 === 'string') { this.actorStore.linkCampaign(arg1, arg2); } 
    else { this.campaignStore.addCampaign(arg1 as Campaign); } 
  }
  updateCampaign(c: Campaign) { this.campaignStore.updateCampaign(c); }
  deleteCampaign(id: string) { this.campaignStore.delete(id); }

  // Actor Management
  getActors() { return this.actorStore.getAll(); }
  addActor(a: ThreatActor) { this.actorStore.add(a); }
  updateActor(a: ThreatActor) { this.actorStore.update(a); }
  deleteActor(id: string) { this.actorStore.delete(id); }
  addCampaignToActor(aid: string, c: string) { this.actorStore.linkCampaign(aid, c); }
  addInfra(aid: string, i: any) { this.actorStore.addInfrastructure(aid, i); }
  addExploit(aid: string, e: string) { this.actorStore.addExploit(aid, e); }
  addTarget(aid: string, t: string) { this.actorStore.addTarget(aid, t); }
  addTTP(aid: string, t: any) { this.actorStore.addTTP(aid, t); }
  addReference(aid: string, r: string) { this.actorStore.addReference(aid, r); }
  deleteReference(aid: string, r: string) { this.actorStore.removeReference(aid, r); }
  addHistoryEvent(aid: string, e: any) { this.actorStore.addHistoryEvent(aid, e); }

  // Feed & Ingestion
  getFeeds() { return this.feedStore.getAll(); }
  addFeed(f: any) { this.feedStore.add(f); }
  deleteFeed(id: string) { this.feedStore.delete(id); }
  toggleFeed(id: string) { this.feedStore.toggleStatus(id); }
  getVendorFeedItems() { return this.vendorFeedStore.getAll(); }
  addVendorFeedItem(i: VendorFeedItem) { this.vendorFeedStore.add(i); }

  // Vendor Management (SCRM)
  getVendors() { return this.vendorStore.getAll(); }
  addVendor(v: Vendor) { this.vendorStore.add(v); }
  updateVendor(v: Vendor) { this.vendorStore.update(v); }
  deleteVendor(id: string) { this.vendorStore.delete(id); }
  reassessVendorRisk() {
    const vendors = this.vendorStore.getAll();
    vendors.forEach(v => {
        const newScore = SupplyChainLogic.calculateHolisticRiskScore(v);
        if (newScore !== v.riskScore) {
            this.vendorStore.update({ ...v, riskScore: newScore });
        }
    });
  }

  // Messaging
  getChannels() { return this.messagingStore.getChannels(); }
  getMessages(channelId: string) { return this.messagingStore.getMessages(channelId); }
  sendMessage(msg: TeamMessage) { this.messagingStore.sendMessage(msg); }
  createChannel(c: Channel) { this.messagingStore.createChannel(c); }

  // System & Evidence
  getChainOfCustody() { return this.chainStore.getAll(); }
  addChainEvent(e: ChainEvent) { this.chainStore.add(e); }
  getMalwareSamples() { return this.malwareStore.getAll(); }
  getForensicJobs() { return this.jobStore.getAll(); }
  addForensicJob(j: ForensicJob) { this.jobStore.add(j); }
  getDevices() { return this.deviceStore.getAll(); }
  getNetworkCaptures() { return this.pcapStore.getAll(); }
  getVulnerabilities() { return this.vulnStore.getAll(); }
  updateVulnerabilityStatus(id: string, s: any) { this.vulnStore.updateStatus(id, s); }
  getAuditLogs() { return this.logStore.getAll(); }
  getSystemUsers() { return this.userStore.getAll(); }
  getIntegrations() { return this.integrationStore.getAll(); }
  getReports() { return this.reportStore.getAll(); }
  getReportsByCase(cid: string) { return this.reportStore.getByCase(cid); }
  getReportsByActor(aid: string) { return this.reportStore.getByActor(aid); }
  addReport(r: IncidentReport) { this.reportStore.add(r); }
  getReportTemplates() { return MOCK_TEMPLATES; }
  getPlaybooks() { return this.playbookStore.getAll(); }
  getSystemNodes() { return this.nodeStore.getAll(); }
  getPatchStatus() { return this.patchStatusStore.getAll(); }
  getScannerStatus() { return this.scannerStore.getAll(); }
  updateScannerStatus(s: ScannerStatus) { this.scannerStore.update(s); }

  // Analytics & Helpers
  getThreatTrends(): ChartDataPoint[] {
    const total = this.threatStore.getAll().length;
    const base = Math.max(5, Math.floor(total / 6));
    return [
      { name: '00:00', value: base + Math.floor(Math.random() * 5) },
      { name: '04:00', value: base + Math.floor(Math.random() * 8) },
      { name: '08:00', value: base + Math.floor(Math.random() * 15) },
      { name: '12:00', value: base + Math.floor(Math.random() * 10) },
      { name: '16:00', value: base + Math.floor(Math.random() * 6) },
      { name: '20:00', value: base + Math.floor(Math.random() * 4) },
    ];
  }

  getThreatCategories(): ChartDataPoint[] { 
    const threats = this.threatStore.getAll();
    const counts: Record<string, number> = {};
    threats.forEach(t => {
      const type = t.type || 'Unknown';
      counts[type] = (counts[type] || 0) + 1;
    });
    if (Object.keys(counts).length === 0) return [{ name: 'No Data', value: 0, fullMark: 100 }];
    const maxVal = Math.max(...Object.values(counts));
    return Object.keys(counts).map(key => ({ name: key, value: counts[key], fullMark: maxVal * 1.2 })).slice(0, 6);
  }

  getMitreTactics() { return this.mitreTacticStore.getAll(); }
  getMitreTechniques() { return this.mitreTechniqueStore.getAll(); }
  getMitreSubTechniques() { return this.mitreSubStore.getAll(); }
  getMitreGroups() { return this.mitreGroupStore.getAll(); }
  getMitreSoftware() { return this.mitreSoftwareStore.getAll(); }
  getMitreMitigations() { return this.mitreMitigationStore.getAll(); }
  getOsintDomains() { return this.osintDomainStore.getAll(); }
  getOsintBreaches() { return this.osintBreachStore.getAll(); }
  getOsintGeo() { return this.osintGeoStore.getAll(); }
  getOsintSocial() { return this.osintSocialStore.getAll(); }
  getOsintDarkWeb() { return MOCK_DARKWEB; } 
  getOsintMeta() { return MOCK_META; } 
  
  sync(action: 'CREATE' | 'UPDATE' | 'DELETE', collection: string, data: any) { 
    this.adapter.execute(action, collection, data);
  }
}
export const threatData = new DataLayer();
