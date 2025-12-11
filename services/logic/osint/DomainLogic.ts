

import { OsintDomain } from '../../../types';
import { OsintLogic } from '../OsintLogic';

export class DomainLogic {
  // Wrappers to maintain compatibility while migrating to async OsintLogic calls
  // Components should ideally call OsintLogic directly, but we keep this structural shim
  
  static async checkDnsSecurity(domain: OsintDomain) {
    const analysis = await OsintLogic.analyzeDomain(domain);
    return analysis.dnsSecurity;
  }

  static async generateTyposquats(domain: string): Promise<string[]> {
    const analysis = await OsintLogic.analyzeDomain({ domain } as OsintDomain);
    return analysis.typosquats;
  }

  static async calculateRegistrarRisk(registrar: string): Promise<number> {
    const analysis = await OsintLogic.analyzeDomain({ registrar, domain: 'placeholder.com' } as OsintDomain);
    return analysis.registrarRisk;
  }

  // Pure visual helpers can remain or move to backend if complex
  static assessSubdomainRisk(subdomains: string[]): number {
    const dga = subdomains.filter(s => s.length > 12 && /[0-9]/.test(s));
    return (dga.length / Math.max(subdomains.length, 1)) * 100;
  }

  static predictExpiryRisk(expires: string): boolean {
    const expDate = new Date(expires).getTime();
    const daysLeft = (expDate - Date.now()) / (1000 * 3600 * 24);
    return daysLeft < 30;
  }
}
