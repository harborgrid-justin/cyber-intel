
import { Threat, Case, ThreatActor, Campaign, MitreItem, SystemNode, Vulnerability, Vendor, SystemUser, Device, Playbook, OsintBreach, OsintDarkWebItem, OsintGeo, AuditLog, ChainEvent, Pcap, AssetAtRisk, TrafficFlow } from '../../types';
import { AssetCorrelation } from './interconnect/AssetCorrelation';
import { OperationalCorrelation } from './interconnect/OperationalCorrelation';

// Facade Class to maintain backward compatibility with existing imports
export class InterconnectLogic {
  
  // --- Delegated to AssetCorrelation ---
  static correlateIoCToAsset(threat: Threat, assets: SystemNode[]) { return AssetCorrelation.correlateIoCToAsset(threat, assets); }
  static shouldEscalateVuln(vuln: Vulnerability) { return AssetCorrelation.shouldEscalateVuln(vuln); }
  static detectShadowRisk(vendor: Vendor, vulns: Vulnerability[]) { return AssetCorrelation.detectShadowRisk(vendor, vulns); }
  static checkVendorSanctions(vendor: Vendor, threatGeo: string) { return AssetCorrelation.checkVendorSanctions(vendor, threatGeo); }
  static detectVendorLeakage(vendor: Vendor, items: OsintDarkWebItem[]) { return AssetCorrelation.detectVendorLeakage(vendor, items); }
  static getScanTargets(threats: Threat[]) { return AssetCorrelation.getScanTargets(threats); }
  static detectBotnetSurge(threats: Threat[], vol: number) { return AssetCorrelation.detectBotnetSurge(threats, vol); }
  static generateBlockRule(threat: Threat) { return AssetCorrelation.generateBlockRule(threat); }
  static adjustRiskFromSim(risk: number, prob: number) { return AssetCorrelation.adjustRiskFromSim(risk, prob); }
  static requiresSandboxing(threat: Threat) { return AssetCorrelation.requiresSandboxing(threat); }
  static mapDeviceToGeo(device: Device) { return AssetCorrelation.mapDeviceToGeo(device); }

  // --- Delegated to OperationalCorrelation ---
  static attributeCampaign(c: Campaign, a: ThreatActor[]) { return OperationalCorrelation.attributeCampaign(c, a); }
  static checkPlaybookCompatibility(p: Playbook, a: SystemNode) { return OperationalCorrelation.checkPlaybookCompatibility(p, a); }
  static checkUserCompromise(u: SystemUser, b: OsintBreach[]) { return OperationalCorrelation.checkUserCompromise(u, b); }
  static validateChatCommand(msg: string) { return OperationalCorrelation.validateChatCommand(msg); }
  static validateEvidenceIntegrity(e: ChainEvent[]) { return OperationalCorrelation.validateEvidenceIntegrity(e); }
  static detectInsiderBehavior(l: AuditLog[], t: string[]) { return OperationalCorrelation.detectInsiderBehavior(l, t); }
  static generateReportSummary(t: {title: string}[]) { return OperationalCorrelation.generateReportSummary(t); }
  static needsJitAccess(p: string) { return OperationalCorrelation.needsJitAccess(p); }
  static extractGraphContext(n: SystemNode[]) { return OperationalCorrelation.extractGraphContext(n); }
  static adjustVipRisk(risk: number, s: string) { return OperationalCorrelation.adjustVipRisk(risk, s); }
  static checkRetentionCompliance(d: string, s: 'NIST'|'GDPR') { return OperationalCorrelation.checkRetentionCompliance(d, s); }
  static checkPlaybookMitreCoverage(p: Playbook, m: MitreItem[]) { return OperationalCorrelation.checkPlaybookMitreCoverage(p, m); }
  static estimateCampaignLoss(c: Campaign) { return OperationalCorrelation.estimateCampaignLoss(c); }
  static validateSegmentation(p: any, f: any) { return OperationalCorrelation.validateSegmentation(p, f); }
  static generateSigmaFromPcap(pcap: Pcap) { return OperationalCorrelation.generateSigmaFromPcap(pcap); }
}
