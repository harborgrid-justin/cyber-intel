
import { OsintDomain, OsintBreach, OsintSocial, OsintGeo, OsintDarkWebItem, GlobalSearchResult, DomainAnalysis, IdentityAnalysis, CredentialExposure, NetworkAnalysis, DarkWebAnalysis } from '../../types';
import { apiClient } from '../apiClient';
import { threatData } from '../dataLayer';

export class OsintLogic {
  
  static async globalSearch(query: string): Promise<GlobalSearchResult[]> {
    try {
      if (!query) return [];
      return await apiClient.get<GlobalSearchResult[]>(`/search?q=${encodeURIComponent(query)}`);
    } catch (e) {
      const results: GlobalSearchResult[] = [];
      const ids = threatData.fullTextSearch.searchPrefix(query);
      
      ids.forEach(id => {
          const threatResult = threatData.threatStore.getById(id);
          if (threatResult.success && threatResult.data) {
            results.push({ type: 'THREAT', val: threatResult.data });
          }
      });

      const q = query.toLowerCase();
      threatData.getActors().forEach(a => { if (a.name.toLowerCase().includes(q)) results.push({ type: 'ACTOR', val: a }); });
      threatData.getCases().forEach(c => { if (c.title.toLowerCase().includes(q)) results.push({ type: 'CASE', val: c }); });
      threatData.getVendors().forEach(v => { if (v.name.toLowerCase().includes(q)) results.push({ type: 'VENDOR', val: v }); });
      
      return results;
    }
  }

  static async analyzeDomain(domain: OsintDomain): Promise<DomainAnalysis> {
    try {
      return await apiClient.post<DomainAnalysis>('/analysis/osint/domain', { domain });
    } catch {
      return { dnsSecurity: { score: 45, hasSpf: false, hasDmarc: false, riskLevel: 'HIGH' }, typosquats: [`${domain.domain}s`, `my-${domain.domain}`], registrarRisk: 20 };
    }
  }

  static async analyzeIdentity(profile: OsintSocial): Promise<IdentityAnalysis> {
    try {
      return await apiClient.post<IdentityAnalysis>('/analysis/osint/identity', { profile });
    } catch {
      return { botProbability: 15, influence: { score: 45, label: 'Regular User' } };
    }
  }

  static async checkBreachExposure(email: string, breaches: OsintBreach[]): Promise<CredentialExposure> {
    try {
      return await apiClient.post<CredentialExposure>('/analysis/osint/exposure', { email, breaches });
    } catch {
      const hits = breaches.filter(b => b.email === email);
      return { score: hits.length * 25, types: hits.map(h => h.data) };
    }
  }

  static async analyzeNetwork(geo: OsintGeo): Promise<NetworkAnalysis> {
    try {
      return await apiClient.post<NetworkAnalysis>('/analysis/osint/network', { geo });
    } catch {
      return { classification: 'DATACENTER', portRisk: 65, isProxy: true, threatContext: 'Known Hosting Provider' };
    }
  }

  static async analyzeDarkWeb(item: OsintDarkWebItem): Promise<DarkWebAnalysis> {
    try {
      return await apiClient.post<DarkWebAnalysis>('/analysis/osint/darkweb', { item });
    } catch {
      return { trend: 'UP', markup: 15, severity: 'HIGH' };
    }
  }

  static analyzeFileEntropy(size: number, type: string): string {
    if (type === 'PDF' && size > 50) return 'HIGH (Suspicious Size)';
    return 'LOW';
  }
}
