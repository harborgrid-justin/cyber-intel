

import { OsintGeo, OsintDarkWebItem, OsintFileMeta } from '../../../types';

export class NetworkLogic {
  static classifyISP(ispName: string): 'RESIDENTIAL' | 'DATACENTER' | 'MOBILE' | 'BUSINESS' {
    const lower = ispName.toLowerCase();
    if (lower.includes('amazon') || lower.includes('google') || lower.includes('digitalocean')) return 'DATACENTER';
    if (lower.includes('comcast') || lower.includes('verizon') || lower.includes('at&t')) return 'RESIDENTIAL';
    if (lower.includes('t-mobile') || lower.includes('vodafone')) return 'MOBILE';
    return 'BUSINESS';
  }

  static calculatePortRisk(ports: number[]): number {
    let risk = 0;
    const criticalPorts = [22, 3389, 445, 1433, 3306];
    ports.forEach(p => {
      if (criticalPorts.includes(p)) risk += 20;
      else risk += 5;
    });
    return Math.min(100, risk);
  }

  static detectTorExit(ip: string): boolean {
    // Mock check against known TOR list
    return ip.startsWith('185.') || ip.startsWith('104.');
  }

  static analyzeDarkWebInflation(item: OsintDarkWebItem): { trend: 'UP' | 'DOWN' | 'STABLE', markup: number } {
    const price = parseInt(item.price.replace('$', '')) || 0;
    // Heuristic: Higher price for verified/recent data
    if (item.status === 'Verified' && price > 500) return { trend: 'UP', markup: 25 };
    if (price < 50) return { trend: 'DOWN', markup: -10 };
    return { trend: 'STABLE', markup: 0 };
  }

  static calculateMetadataEntropy(meta: OsintFileMeta): string {
    // Check for anomalies in file size vs type
    const sizeMB = parseFloat(meta.size);
    if (meta.type === 'PDF' && sizeMB > 50) return 'HIGH (Suspicious Size)';
    if (meta.type === 'JPG' && meta.gps !== 'None') return 'MEDIUM (Privacy Leak)';
    return 'LOW';
  }
}
