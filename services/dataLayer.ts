
import { MockAdapter, DatabaseAdapter } from './dbAdapter';
import { ThreatStore } from './stores/threatStore';
import { CaseStore } from './stores/caseStore';
import { BaseStore } from './stores/baseStore';
import { CampaignStore } from './stores/campaignStore';
import { startBackgroundJobs } from './jobs';
import { 
  MOCK_THREATS, MOCK_CASES, MOCK_FEEDS, MOCK_ACTORS, MOCK_PLAYBOOKS, 
  MOCK_CHAIN, MOCK_MALWARE, MOCK_LAB_JOBS, MOCK_DEVICES, MOCK_PCAPS, 
  MOCK_VULNERABILITIES, MOCK_AUDIT_LOGS, MOCK_USERS, MOCK_INCIDENT_REPORTS,
  MOCK_TACTICS, MOCK_TECHNIQUES, MOCK_SUB_TECHNIQUES, MOCK_GROUPS, MOCK_SOFTWARE, MOCK_MITIGATIONS,
  MOCK_DOMAIN, MOCK_BREACH, MOCK_GEO, MOCK_DARKWEB, MOCK_META, MOCK_SOCIAL, MOCK_INTEGRATIONS, MOCK_CAMPAIGNS,
  SYSTEM_NODES
} from '../constants';
import { IncidentStatus, Threat, Case, IoCFeed, ThreatActor, Playbook, Artifact, ChainEvent, Malware, ForensicJob, Device, Pcap, Vulnerability, AuditLog, SystemUser, IncidentReport, Campaign, SystemNode } from '../types';

export class DataLayer {
  public adapter: DatabaseAdapter = new MockAdapter();
  
  // Stores
  public threatStore: ThreatStore;
  public caseStore: CaseStore;
  public feedStore: BaseStore<IoCFeed>;
  public actorStore: BaseStore<ThreatActor>;
  public campaignStore: CampaignStore;
  public playbookStore: BaseStore<Playbook>;
  public chainStore: BaseStore<ChainEvent>;
  public malwareStore: BaseStore<Malware>;
  public jobStore: BaseStore<ForensicJob>;
  public deviceStore: BaseStore<Device>;
  public pcapStore: BaseStore<Pcap>;
  public vulnStore: BaseStore<Vulnerability>;
  public logStore: BaseStore<AuditLog>;
  public userStore: BaseStore<SystemUser>;
  public reportStore: BaseStore<IncidentReport>;
  public nodeStore: BaseStore<SystemNode>;

  // Public accessors
  get threats() { return this.threatStore.getAll(); }
  set threats(val: Threat[]) { /* No-op, read via store */ }
  get cases() { return this.caseStore.getAll(); }
  set cases(val: Case[]) { /* No-op */ }
  get feeds() { return this.feedStore.getAll(); }
  set feeds(v: IoCFeed[]) { /* No-op */ }
  get systemUsers() { return this.userStore.getAll(); }
  set systemUsers(v: SystemUser[]) { /* No-op */ }
  get devices() { return this.deviceStore.getAll(); }
  set devices(v: Device[]) { /* No-op */ }

  constructor() {
    this.threatStore = new ThreatStore('THREATS', MOCK_THREATS, this.adapter);
    this.caseStore = new CaseStore('CASES', MOCK_CASES, this.adapter);
    this.feedStore = new BaseStore('FEEDS', MOCK_FEEDS, this.adapter);
    this.actorStore = new BaseStore('ACTORS', MOCK_ACTORS, this.adapter);
    this.campaignStore = new CampaignStore('CAMPAIGNS', MOCK_CAMPAIGNS, this.adapter);
    this.playbookStore = new BaseStore('PLAYBOOKS', MOCK_PLAYBOOKS, this.adapter);
    this.chainStore = new BaseStore('CHAIN', MOCK_CHAIN, this.adapter);
    this.malwareStore = new BaseStore('MALWARE', MOCK_MALWARE, this.adapter);
    this.jobStore = new BaseStore('JOBS', MOCK_LAB_JOBS, this.adapter);
    this.deviceStore = new BaseStore('DEVICES', MOCK_DEVICES, this.adapter);
    this.pcapStore = new BaseStore('PCAPS', MOCK_PCAPS, this.adapter);
    this.vulnStore = new BaseStore('VULNS', MOCK_VULNERABILITIES, this.adapter);
    this.logStore = new BaseStore('LOGS', MOCK_AUDIT_LOGS, this.adapter);
    this.userStore = new BaseStore('USERS', MOCK_USERS, this.adapter);
    this.reportStore = new BaseStore('REPORTS', MOCK_INCIDENT_REPORTS, this.adapter);
    this.nodeStore = new BaseStore('NODES', SYSTEM_NODES, this.adapter);
    
    startBackgroundJobs(this);
  }

  setProvider(adapter: DatabaseAdapter) {
    this.adapter = adapter;
    [this.threatStore, this.caseStore, this.feedStore, this.actorStore, this.campaignStore, this.playbookStore, this.chainStore, this.malwareStore, this.jobStore, this.deviceStore, this.pcapStore, this.vulnStore, this.logStore, this.userStore, this.reportStore, this.nodeStore].forEach(s => s.setAdapter(adapter));
    window.dispatchEvent(new Event('db-adapter-changed'));
  }

  getAdapterInfo() { return { name: this.adapter.name, type: this.adapter.type }; }
  
  // Threat Delegates
  getThreats(sort = true) { return this.threatStore.getThreats(sort); }
  getThreatsByActor(name: string) { return this.threatStore.getByActor(name); }
  addThreat(t: Threat) { this.threatStore.addThreat(t, this.actorStore.getAll(), this.caseStore.getAll(), (c) => this.addCase(c)); }
  deleteThreat(id: string) { this.threatStore.delete(id); }
  updateStatus(id: string, s: IncidentStatus) { this.threatStore.updateStatus(id, s, this.caseStore.getAll(), (c) => this.addCase(c)); }
  updateThreat(t: Threat) { this.threatStore.update(t); }
  linkThreatToActor(tid: string, name: string) { const t = this.threatStore.getById(tid); if(t) { t.threatActor = name; this.threatStore.update(t); } }

  // Case Delegates
  getCases() { return this.caseStore.getCases(); }
  getCase(id: string) { return this.caseStore.getById(id); }
  addCase(c: Case) { this.caseStore.addCase(c, this.playbookStore.getAll(), (id, n) => this.caseStore.addNote(id, n)); }
  deleteCase(id: string) { this.caseStore.delete(id); }
  updateCase(c: Case) { this.caseStore.update(c); }
  addTask(cid: string, t: any) { this.caseStore.addTask(cid, t); }
  toggleTask(cid: string, tid: string) { const c = this.getCase(cid); const task = c?.tasks.find(t => t.id === tid); if(c && task) { task.status = task.status === 'DONE' ? 'PENDING' : 'DONE'; this.caseStore.update(c); } }
  applyPlaybook(cid: string, pid: string) { const pb = this.playbookStore.getById(pid); if(pb) { this.caseStore.applyPlaybook(cid, pb, (id, n) => this.caseStore.addNote(id, n)); pb.usageCount = (pb.usageCount || 0) + 1; this.playbookStore.update(pb); } }
  addNote(cid: string, n: string) { this.caseStore.addNote(cid, n); }
  addArtifact(cid: string, a: Artifact) { const c = this.getCase(cid); if(c) { c.artifacts.push(a); this.caseStore.update(c); } }
  deleteArtifact(cid: string, aid: string) { const c = this.getCase(cid); if(c) { c.artifacts = c.artifacts.filter(x => x.id !== aid); this.caseStore.update(c); } }
  reprioritizeCases() { this.caseStore.getCases(); }
  transferCase(cid: string, agency: string) { const c = this.getCase(cid); if(c) { c.agency = agency; this.caseStore.update(c); } }
  shareCase(cid: string, agency: string) { const c = this.getCase(cid); if(c) { c.sharedWith.push(agency); this.caseStore.update(c); } }

  // Campaign Delegates
  getCampaigns() { return this.campaignStore.getAll(); }
  addCampaign(c: Campaign): void;
  addCampaign(aid: string, c: string): void;
  addCampaign(arg1: Campaign | string, arg2?: string): void {
    if (typeof arg1 === 'string' && typeof arg2 === 'string') {
      this.addCampaignToActor(arg1, arg2);
    } else {
      this.campaignStore.addCampaign(arg1 as Campaign);
    }
  }
  updateCampaign(c: Campaign) { this.campaignStore.updateCampaign(c); }
  deleteCampaign(id: string) { this.campaignStore.delete(id); }

  // Other Stores Facades
  getActors() { return this.actorStore.getAll(); }
  addActor(a: ThreatActor) { this.actorStore.add(a); }
  updateActor(a: ThreatActor) { this.actorStore.update(a); }
  deleteActor(id: string) { this.actorStore.delete(id); }
  addCampaignToActor(aid: string, c: string) { const a = this.actorStore.getById(aid); if(a) { a.campaigns.push(c); this.actorStore.update(a); } }
  
  addInfra(aid: string, i: any) { const a = this.actorStore.getById(aid); if(a) { a.infrastructure.push(i); this.actorStore.update(a); } }
  addExploit(aid: string, e: string) { const a = this.actorStore.getById(aid); if(a) { a.exploits.push(e); this.actorStore.update(a); } }
  addTarget(aid: string, t: string) { const a = this.actorStore.getById(aid); if(a) { a.targets.push(t); this.actorStore.update(a); } }
  addTTP(aid: string, t: any) { const a = this.actorStore.getById(aid); if(a) { a.ttps.push(t); this.actorStore.update(a); } }
  addReference(aid: string, r: string) { const a = this.actorStore.getById(aid); if(a) { a.references.push(r); this.actorStore.update(a); } }
  deleteReference(aid: string, r: string) { const a = this.actorStore.getById(aid); if(a) { a.references = a.references.filter(x=>x!==r); this.actorStore.update(a); } }
  addHistoryEvent(aid: string, e: any) { const a = this.actorStore.getById(aid); if(a) { a.history.unshift(e); this.actorStore.update(a); } }

  getFeeds() { return this.feedStore.getAll(); }
  addFeed(f: IoCFeed) { this.feedStore.add(f); }
  deleteFeed(id: string) { this.feedStore.delete(id); }
  toggleFeed(id: string) { const f = this.feedStore.getById(id); if(f) { f.status = f.status === 'ACTIVE' ? 'DISABLED' : 'ACTIVE'; this.feedStore.update(f); } }

  getChainOfCustody() { return this.chainStore.getAll(); }
  addChainEvent(e: ChainEvent) { this.chainStore.add(e); }
  getMalwareSamples() { return this.malwareStore.getAll(); }
  getForensicJobs() { return this.jobStore.getAll(); }
  addForensicJob(j: ForensicJob) { this.jobStore.add(j); }
  getDevices() { return this.deviceStore.getAll(); }
  getNetworkCaptures() { return this.pcapStore.getAll(); }
  
  getVulnerabilities() { return this.vulnStore.getAll(); }
  updateVulnerabilityStatus(id: string, s: any) { const v = this.vulnStore.getById(id); if(v) { v.status = s; this.vulnStore.update(v); } }
  
  getAuditLogs() { return this.logStore.getAll(); }
  getSystemUsers() { return this.userStore.getAll(); }
  getIntegrations() { return MOCK_INTEGRATIONS; }
  
  getReports() { return this.reportStore.getAll(); }
  getReportsByCase(cid: string) { return this.reportStore.getAll().filter(r => r.relatedCaseId === cid); }
  getReportsByActor(aid: string) { return this.reportStore.getAll().filter(r => r.relatedActorId === aid); }
  addReport(r: IncidentReport) { this.reportStore.add(r); }
  
  getPlaybooks() { return this.playbookStore.getAll(); }

  getSystemNodes() { return this.nodeStore.getAll(); }
  
  // Consts
  getMitreTactics() { return MOCK_TACTICS; }
  getMitreTechniques() { return MOCK_TECHNIQUES; }
  getMitreSubTechniques() { return MOCK_SUB_TECHNIQUES; }
  getMitreGroups() { return MOCK_GROUPS; }
  getMitreSoftware() { return MOCK_SOFTWARE; }
  getMitreMitigations() { return MOCK_MITIGATIONS; }
  getOsintDomains() { return MOCK_DOMAIN; }
  getOsintBreaches() { return MOCK_BREACH; }
  getOsintGeo() { return MOCK_GEO; }
  getOsintSocial() { return MOCK_SOCIAL; }
  getOsintDarkWeb() { return MOCK_DARKWEB; }
  getOsintMeta() { return MOCK_META; }
  sync(a:any, t:any, d:any) { /* Legacy shim */ }
}
export const threatData = new DataLayer();
