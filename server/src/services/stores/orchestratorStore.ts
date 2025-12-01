import {
  ResponsePlan,
  VIPProfile,
  Honeytoken,
  PatchPrioritization,
  SegmentationPolicy,
  TrafficFlow
} from '@/types';

export class OrchestratorStore {
  private responsePlans: ResponsePlan[] = [];
  private vipProfiles: VIPProfile[] = [];
  private honeytokens: Honeytoken[] = [];
  private patchPrioritizations: PatchPrioritization[] = [];
  private segmentationPolicies: SegmentationPolicy[] = [];
  private trafficFlows: TrafficFlow[] = [];

  constructor(
    responsePlans: ResponsePlan[],
    vipProfiles: VIPProfile[],
    honeytokens: Honeytoken[],
    patchPrioritizations: PatchPrioritization[],
    segmentationPolicies: SegmentationPolicy[],
    trafficFlows: TrafficFlow[]
  ) {
    this.responsePlans = responsePlans;
    this.vipProfiles = vipProfiles;
    this.honeytokens = honeytokens;
    this.patchPrioritizations = patchPrioritizations;
    this.segmentationPolicies = segmentationPolicies;
    this.trafficFlows = trafficFlows;
  }

  // Response Plan Execution
  getResponsePlans(): ResponsePlan[] {
    return [...this.responsePlans];
  }

  addResponsePlan(plan: ResponsePlan): void {
    this.responsePlans.push(plan);
  }

  getResponsePlan(id: string): ResponsePlan | undefined {
    return this.responsePlans.find(p => p.id === id);
  }

  updateResponsePlan(id: string, updates: Partial<ResponsePlan>): ResponsePlan | undefined {
    const index = this.responsePlans.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.responsePlans[index] = { ...this.responsePlans[index], ...updates };
    return this.responsePlans[index];
  }

  // VIP Protection
  getVipProfiles(): VIPProfile[] {
    return [...this.vipProfiles];
  }

  addVipProfile(profile: VIPProfile): void {
    this.vipProfiles.push(profile);
  }

  getVipProfile(userId: string): VIPProfile | undefined {
    return this.vipProfiles.find(p => p.userId === userId);
  }

  // Active Defense - Honeytokens
  getHoneytokens(): Honeytoken[] {
    return [...this.honeytokens];
  }

  addHoneytoken(token: Honeytoken): void {
    this.honeytokens.push(token);
  }

  getHoneytoken(id: string): Honeytoken | undefined {
    return this.honeytokens.find(t => t.id === id);
  }

  updateHoneytoken(id: string, updates: Partial<Honeytoken>): Honeytoken | undefined {
    const index = this.honeytokens.findIndex(t => t.id === id);
    if (index === -1) return undefined;
    this.honeytokens[index] = { ...this.honeytokens[index], ...updates };
    return this.honeytokens[index];
  }

  // Patch Prioritization
  getPatchPrioritizations(): PatchPrioritization[] {
    return [...this.patchPrioritizations];
  }

  addPatchPrioritization(prioritization: PatchPrioritization): void {
    this.patchPrioritizations.push(prioritization);
  }

  getPatchPrioritization(vulnId: string): PatchPrioritization | undefined {
    return this.patchPrioritizations.find(p => p.vulnId === vulnId);
  }

  // Segmentation Policy Management
  getSegmentationPolicies(): SegmentationPolicy[] {
    return [...this.segmentationPolicies];
  }

  addSegmentationPolicy(policy: SegmentationPolicy): void {
    this.segmentationPolicies.push(policy);
  }

  getSegmentationPolicy(id: string): SegmentationPolicy | undefined {
    return this.segmentationPolicies.find(p => p.id === id);
  }

  updateSegmentationPolicy(id: string, updates: Partial<SegmentationPolicy>): SegmentationPolicy | undefined {
    const index = this.segmentationPolicies.findIndex(p => p.id === id);
    if (index === -1) return undefined;
    this.segmentationPolicies[index] = { ...this.segmentationPolicies[index], ...updates };
    return this.segmentationPolicies[index];
  }

  // Traffic Flow Monitoring
  getTrafficFlows(): TrafficFlow[] {
    return [...this.trafficFlows];
  }

  addTrafficFlow(flow: TrafficFlow): void {
    this.trafficFlows.push(flow);
  }

  getTrafficFlow(id: string): TrafficFlow | undefined {
    return this.trafficFlows.find(f => f.id === id);
  }

  // Analytics
  getOrchestratorStats() {
    return {
      responsePlans: this.responsePlans.length,
      vipProfiles: this.vipProfiles.length,
      honeytokens: this.honeytokens.length,
      patchPrioritizations: this.patchPrioritizations.length,
      segmentationPolicies: this.segmentationPolicies.length,
      trafficFlows: this.trafficFlows.length,
      activePlans: this.responsePlans.filter(p => p.status === 'EXECUTING').length,
      triggeredTokens: this.honeytokens.filter(t => t.status === 'TRIGGERED').length,
      activePolicies: this.segmentationPolicies.filter(p => p.status === 'ACTIVE').length,
      blockedTraffic: this.trafficFlows.filter(f => !f.allowed).length
    };
  }

  getHighRiskVips(): VIPProfile[] {
    return this.vipProfiles.filter(p =>
      p.doxxingProb > 70 ||
      p.phishingSusceptibility > 70 ||
      p.exposedCreds > 5 ||
      p.sentiment === 'Hostile'
    );
  }

  getActiveResponsePlans(): ResponsePlan[] {
    return this.responsePlans.filter(p => p.status === 'EXECUTING');
  }
}