
import { Threat, SystemNode, Vulnerability, Vendor, Device, OsintDarkWebItem, AssetAtRisk, OsintGeo } from '../../../types';

export class AssetCorrelation {
  static correlateIoCToAsset(threat: Threat, assets: SystemNode[]): AssetAtRisk | null {
    if (threat.type !== 'IP Address' && threat.type !== 'Domain') return null;
    const victim = assets.find(a => (a.name === threat.indicator || a.ip_address === threat.indicator));
    if (!victim) return null;
    return { ...victim, activeThreats: [threat], exploitableVulns: [], riskFactor: 100 };
  }

  static shouldEscalateVuln(vuln: Vulnerability): boolean {
    return vuln.score >= 9.0 && vuln.status !== 'PATCHED' && !vuln.zeroDay;
  }

  static detectShadowRisk(vendor: Vendor, vulns: Vulnerability[]): number {
    return vulns.filter(v => v.vendor.toLowerCase() === vendor.name.toLowerCase() && v.status !== 'PATCHED').length;
  }

  static checkVendorSanctions(vendor: Vendor, threatGeo: string): boolean {
    return vendor.hqLocation === threatGeo && ['Russia', 'North Korea', 'Iran'].includes(threatGeo);
  }

  static detectVendorLeakage(vendor: Vendor, darkWebItems: OsintDarkWebItem[]): boolean {
    return darkWebItems.some(item => item.title.toLowerCase().includes(vendor.name.toLowerCase()));
  }

  static getScanTargets(threats: Threat[]): string[] {
    return threats.filter(t => t.type === 'IP Address').map(t => t.indicator);
  }

  static detectBotnetSurge(threats: Threat[], netFlowVolume: number): boolean {
    const botnetActivity = threats.filter(t => t.tags?.includes('Botnet') && t.status === 'NEW').length;
    return botnetActivity > 5 && netFlowVolume > 800;
  }

  static generateBlockRule(threat: Threat): string | null {
    if (threat.confidence < 90) return null;
    return threat.type === 'IP Address' ? `BLOCK ${threat.indicator}` : null;
  }

  static adjustRiskFromSim(assetRisk: number, simSuccessProb: number): number {
    return simSuccessProb > 0.7 ? Math.min(100, assetRisk + 20) : assetRisk;
  }

  static requiresSandboxing(threat: Threat): boolean {
    return threat.type === 'File Hash' && threat.status === 'NEW';
  }

  static mapDeviceToGeo(device: Device): OsintGeo | null {
     if (device.type === 'Mobile') {
         return { id: `geo-${device.id}`, ip: '0.0.0.0', city: 'Mobile', country: 'Unknown', isp: 'Cellular', asn: 'AS000', coords: '34.05, -118.25', ports: [], threatScore: 0 };
     }
     return null;
  }
}
