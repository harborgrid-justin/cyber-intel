
import { DomainLogic } from './osint/DomainLogic';
import { IdentityLogic } from './osint/IdentityLogic';
import { NetworkLogic } from './osint/NetworkLogic';
import { OsintDomain, OsintBreach, OsintSocial, OsintGeo, Threat } from '@/types';

export class OsintLogic {
  
  // Re-export sub-modules for direct access if needed, or wrap methods
  static Domain = DomainLogic;
  static Identity = IdentityLogic;
  static Network = NetworkLogic;

  // Global Search Aggregator
  static globalSearch(query: string, allData: { domains: OsintDomain[], breaches: OsintBreach[], social: OsintSocial[], ips: OsintGeo[], threats: Threat[] }): any[] {
    const q = query.toLowerCase();
    const results = [];
    if (!q) return [];

    allData.threats.forEach(t => { if (t.indicator.includes(q) || t.threatActor.toLowerCase().includes(q)) results.push({ type: 'THREAT', val: t }); });
    allData.domains.forEach(d => { if (d.domain.includes(q)) results.push({ type: 'DOMAIN', val: d }); });
    allData.breaches.forEach(b => { if (b.email.includes(q) || b.breach.toLowerCase().includes(q)) results.push({ type: 'BREACH', val: b }); });
    allData.social.forEach(s => { if (s.handle.includes(q)) results.push({ type: 'SOCIAL', val: s }); });
    allData.ips.forEach(i => { if (i.ip.includes(q)) results.push({ type: 'IP', val: i }); });

    return results;
  }

  // --- Legacy Wrappers for backward compat if needed, simplified ---
  
  static calculateDomainRisk(domain: OsintDomain): number {
    return DomainLogic.checkDnsSecurity(domain).score + DomainLogic.calculateRegistrarRisk(domain.registrar);
  }

  static predictPhishingProb(domain: string): number {
    const squats = DomainLogic.generateTyposquats(domain);
    return squats.length * 10; // Simple heuristic
  }

  static checkBreachExposure(email: string, breaches: OsintBreach[]) {
    const hits = breaches.filter(b => b.email === email);
    let score = 0;
    const types = new Set<string>();
    hits.forEach(h => {
        score += h.data.includes('Pass') ? 40 : 20;
        types.add(h.data);
    });
    return { score: Math.min(100, score), types: Array.from(types) };
  }

  static detectBotProbability(profile: OsintSocial): number {
    return IdentityLogic.predictBot(profile);
  }

  static isProxyOrVpn(geo: OsintGeo): boolean {
    return NetworkLogic.classifyISP(geo.isp) === 'DATACENTER';
  }

  static getThreatContext(geo: OsintGeo): string {
    const type = NetworkLogic.classifyISP(geo.isp);
    const risk = NetworkLogic.calculatePortRisk(geo.ports);
    return `${type} - Risk: ${risk}/100`;
  }

  static calculateLeakSeverity(item: any): 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' {
    const inflation = NetworkLogic.analyzeDarkWebInflation(item);
    if (inflation.markup > 20) return 'CRITICAL';
    if (inflation.trend === 'UP') return 'HIGH';
    return 'MEDIUM';
  }

  static analyzeFileEntropy(size: number, type: string): string {
    return NetworkLogic.calculateMetadataEntropy({ size: size+'MB', type, name: '', author: '', created: '', gps: '' });
  }
}
