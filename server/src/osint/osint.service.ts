import { Injectable } from '@nestjs/common';
import { OsintStore } from '../services/stores/osintStore';
import {
  OsintDomain,
  OsintBreach,
  OsintSocial,
  OsintGeo,
  OsintDarkWebItem,
  OsintFileMeta
} from '../../../types';
import {
  MOCK_DOMAIN,
  MOCK_BREACH,
  MOCK_SOCIAL,
  MOCK_GEO,
  MOCK_DARKWEB,
  MOCK_META
} from '../constants';

@Injectable()
export class OsintService {
  private osintStore: OsintStore;

  constructor() {
    this.osintStore = new OsintStore(
      MOCK_DOMAIN,
      MOCK_BREACH,
      MOCK_SOCIAL,
      MOCK_GEO,
      MOCK_DARKWEB,
      MOCK_META
    );
  }

  // Domain Intelligence
  getDomains(): OsintDomain[] {
    return this.osintStore.getDomains();
  }

  getDomain(id: string): OsintDomain | undefined {
    return this.osintStore.getDomain(id);
  }

  addDomain(domain: Omit<OsintDomain, 'id'>): OsintDomain {
    const newDomain: OsintDomain = {
      id: `domain-${Date.now()}`,
      ...domain
    };
    this.osintStore.addDomain(newDomain);
    return newDomain;
  }

  // Breach Data
  getBreaches(): OsintBreach[] {
    return this.osintStore.getBreaches();
  }

  getBreach(id: string): OsintBreach | undefined {
    return this.osintStore.getBreach(id);
  }

  getBreachesByEmail(email: string): OsintBreach[] {
    return this.osintStore.getBreachesByEmail(email);
  }

  addBreach(breach: Omit<OsintBreach, 'id'>): OsintBreach {
    const newBreach: OsintBreach = {
      id: `breach-${Date.now()}`,
      ...breach
    };
    this.osintStore.addBreach(newBreach);
    return newBreach;
  }

  // Social Media Monitoring
  getSocial(): OsintSocial[] {
    return this.osintStore.getSocial();
  }

  getSocialById(id: string): OsintSocial | undefined {
    return this.osintStore.getSocialById(id);
  }

  getSocialByPlatform(platform: string): OsintSocial[] {
    return this.osintStore.getSocialByPlatform(platform);
  }

  addSocial(social: Omit<OsintSocial, 'id'>): OsintSocial {
    const newSocial: OsintSocial = {
      id: `social-${Date.now()}`,
      ...social
    };
    this.osintStore.addSocial(newSocial);
    return newSocial;
  }

  // Geo-IP Analysis
  getGeo(): OsintGeo[] {
    return this.osintStore.getGeo();
  }

  getGeoById(id: string): OsintGeo | undefined {
    return this.osintStore.getGeoById(id);
  }

  getGeoByIP(ip: string): OsintGeo | undefined {
    return this.osintStore.getGeoByIP(ip);
  }

  addGeo(geo: Omit<OsintGeo, 'id'>): OsintGeo {
    const newGeo: OsintGeo = {
      id: `geo-${Date.now()}`,
      ...geo
    };
    this.osintStore.addGeo(newGeo);
    return newGeo;
  }

  // Dark Web Scanning
  getDarkWeb(): OsintDarkWebItem[] {
    return this.osintStore.getDarkWeb();
  }

  addDarkWebItem(item: OsintDarkWebItem): OsintDarkWebItem {
    this.osintStore.addDarkWebItem(item);
    return item;
  }

  // File Metadata Extraction
  getFileMeta(): OsintFileMeta[] {
    return this.osintStore.getFileMeta();
  }

  addFileMeta(meta: OsintFileMeta): OsintFileMeta {
    this.osintStore.addFileMeta(meta);
    return meta;
  }

  // Analytics
  getOsintStats() {
    return this.osintStore.getOsintStats();
  }

  getHighPriorityTargets() {
    return this.osintStore.getHighPriorityTargets();
  }

  // Advanced Queries
  searchByDomain(domain: string): any {
    const domainData = this.osintStore.getDomains().find(d => d.domain === domain);
    const breaches = this.osintStore.getBreaches().filter(b => b.email.includes(domain.split('.')[0]));
    const social = this.osintStore.getSocial().filter(s => s.bio?.toLowerCase().includes(domain.toLowerCase()));

    return {
      domain: domainData,
      relatedBreaches: breaches,
      relatedSocial: social
    };
  }

  getThreatLandscape(): any {
    const geoThreats = this.osintStore.getGeo().filter(g => g.threatScore > 50);
    const activeSocial = this.osintStore.getSocial().filter(s => s.status === 'Active');
    const recentBreaches = this.osintStore.getBreaches().filter(b =>
      new Date(b.date) > new Date(Date.now() - 365 * 24 * 60 * 60 * 1000)
    );

    return {
      highThreatLocations: geoThreats.length,
      activeSocialMonitoring: activeSocial.length,
      recentBreaches: recentBreaches.length,
      topThreatCountries: this.getTopThreatCountries(),
      sentimentAnalysis: this.getSentimentAnalysis()
    };
  }

  private getTopThreatCountries(): any[] {
    const countryThreats = this.osintStore.getGeo().reduce((acc, geo) => {
      acc[geo.country] = (acc[geo.country] || 0) + geo.threatScore;
      return acc;
    }, {} as Record<string, number>);

    return Object.entries(countryThreats)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .slice(0, 5)
      .map(([country, score]) => ({ country, totalThreatScore: score }));
  }

  private getSentimentAnalysis(): any {
    const sentiments = this.osintStore.getSocial().reduce((acc, social) => {
      acc[social.sentiment] = (acc[social.sentiment] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return sentiments;
  }
}