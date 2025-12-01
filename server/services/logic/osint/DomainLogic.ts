
import { OsintDomain } from '../../../types';

export class DomainLogic {
  static checkDnsSecurity(domain: OsintDomain) {
    const hasSpf = domain.dns.includes('v=spf1');
    const hasDmarc = domain.dns.includes('v=DMARC1');
    const score = (hasSpf ? 30 : 0) + (hasDmarc ? 40 : 0) + (domain.ssl === 'Valid' ? 30 : 0);
    return { score, hasSpf, hasDmarc, riskLevel: score < 50 ? 'HIGH' : 'LOW' };
  }

  static generateTyposquats(domain: string): string[] {
    const parts = domain.split('.');
    if (parts.length < 2) return [];
    const name = parts[0];
    const tld = parts.slice(1).join('.');
    
    // Homoglyphs and common typos
    const squats = [
      `${name.replace('l', '1').replace('o', '0')}.${tld}`,
      `${name}s.${tld}`,
      `${name}-login.${tld}`,
      `${name}${name.charAt(name.length-1)}.${tld}`, // Double char
      `my-${name}.${tld}`
    ];
    return squats.filter(s => s !== domain);
  }

  static detectFastFlux(domain: OsintDomain): boolean {
    // Heuristic: Short TTL + Multiple distinct IPs in DNS history
    // Simulated via existing properties for now
    return domain.dns.split(',').length > 3;
  }

  static calculateRegistrarRisk(registrar: string): number {
    const risky = ['CheapName', 'AnonReg', 'BadHost', 'OffshoreDyn'];
    return risky.includes(registrar) ? 85 : 10;
  }

  static assessSubdomainRisk(subdomains: string[]): number {
    // High entropy subdomains often indicate DGA (Domain Generation Algorithms)
    const dga = subdomains.filter(s => s.length > 12 && /[0-9]/.test(s));
    return (dga.length / Math.max(subdomains.length, 1)) * 100;
  }

  static predictExpiryRisk(expires: string): boolean {
    const expDate = new Date(expires).getTime();
    const daysLeft = (expDate - Date.now()) / (1000 * 3600 * 24);
    return daysLeft < 30; // Risk of takeover if expiring soon
  }
}
