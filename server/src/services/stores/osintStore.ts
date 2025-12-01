import {
  OsintDomain,
  OsintBreach,
  OsintSocial,
  OsintGeo,
  OsintDarkWebItem,
  OsintFileMeta
} from '@/types';

export class OsintStore {
  private domains: OsintDomain[] = [];
  private breaches: OsintBreach[] = [];
  private social: OsintSocial[] = [];
  private geo: OsintGeo[] = [];
  private darkWeb: OsintDarkWebItem[] = [];
  private fileMeta: OsintFileMeta[] = [];

  constructor(
    domains: OsintDomain[],
    breaches: OsintBreach[],
    social: OsintSocial[],
    geo: OsintGeo[],
    darkWeb: OsintDarkWebItem[],
    fileMeta: OsintFileMeta[]
  ) {
    this.domains = domains;
    this.breaches = breaches;
    this.social = social;
    this.geo = geo;
    this.darkWeb = darkWeb;
    this.fileMeta = fileMeta;
  }

  // Domain Intelligence
  getDomains(): OsintDomain[] {
    return [...this.domains];
  }

  addDomain(domain: OsintDomain): void {
    this.domains.push(domain);
  }

  getDomain(id: string): OsintDomain | undefined {
    return this.domains.find(d => d.id === id);
  }

  // Breach Data
  getBreaches(): OsintBreach[] {
    return [...this.breaches];
  }

  addBreach(breach: OsintBreach): void {
    this.breaches.push(breach);
  }

  getBreach(id: string): OsintBreach | undefined {
    return this.breaches.find(b => b.id === id);
  }

  getBreachesByEmail(email: string): OsintBreach[] {
    return this.breaches.filter(b => b.email === email);
  }

  // Social Media Monitoring
  getSocial(): OsintSocial[] {
    return [...this.social];
  }

  addSocial(social: OsintSocial): void {
    this.social.push(social);
  }

  getSocialById(id: string): OsintSocial | undefined {
    return this.social.find(s => s.id === id);
  }

  getSocialByPlatform(platform: string): OsintSocial[] {
    return this.social.filter(s => s.platform === platform);
  }

  // Geo-IP Analysis
  getGeo(): OsintGeo[] {
    return [...this.geo];
  }

  addGeo(geo: OsintGeo): void {
    this.geo.push(geo);
  }

  getGeoById(id: string): OsintGeo | undefined {
    return this.geo.find(g => g.id === id);
  }

  getGeoByIP(ip: string): OsintGeo | undefined {
    return this.geo.find(g => g.ip === ip);
  }

  // Dark Web Scanning
  getDarkWeb(): OsintDarkWebItem[] {
    return [...this.darkWeb];
  }

  addDarkWebItem(item: OsintDarkWebItem): void {
    this.darkWeb.push(item);
  }

  // File Metadata Extraction
  getFileMeta(): OsintFileMeta[] {
    return [...this.fileMeta];
  }

  addFileMeta(meta: OsintFileMeta): void {
    this.fileMeta.push(meta);
  }

  // Analytics
  getOsintStats() {
    return {
      domains: this.domains.length,
      breaches: this.breaches.length,
      socialProfiles: this.social.length,
      geoLocations: this.geo.length,
      darkWebItems: this.darkWeb.length,
      fileMetadata: this.fileMeta.length,
      highThreatIPs: this.geo.filter(g => g.threatScore > 70).length,
      activeSocial: this.social.filter(s => s.status === 'Active').length,
      expiredDomains: this.domains.filter(d => new Date(d.expires) < new Date()).length
    };
  }

  getHighPriorityTargets(): any[] {
    const highThreatGeo = this.geo.filter(g => g.threatScore > 80);
    const negativeSocial = this.social.filter(s => s.sentiment === 'Negative' || s.sentiment === 'Hostile');
    const expiredDomains = this.domains.filter(d => new Date(d.expires) < new Date());

    return [
      ...highThreatGeo.map(g => ({ type: 'IP', data: g, priority: 'HIGH' })),
      ...negativeSocial.map(s => ({ type: 'Social', data: s, priority: 'MEDIUM' })),
      ...expiredDomains.map(d => ({ type: 'Domain', data: d, priority: 'LOW' }))
    ];
  }
}