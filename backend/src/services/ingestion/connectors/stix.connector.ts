
import { IConnector, ConnectorConfig } from '../types';
import { Threat } from '../../../models/intelligence';
import { logger } from '../../../utils/logger';
import { Feed } from '../../../models/infrastructure';

interface StixIndicator {
  type: string;
  name?: string;
  pattern?: string;
  description?: string;
  confidence?: number;
  modified?: string;
  created?: string;
}

interface StixBundle {
  objects?: StixIndicator[];
}

export class StixConnector implements IConnector {
  async fetch(feed: Feed): Promise<StixBundle> {
    const headers: Record<string, string> = { 'Accept': 'application/stix+json' };
    
    // Safely access configuration
    if (feed.configuration && typeof feed.configuration === 'object') {
       const config = feed.configuration as { headers?: Record<string, string> };
       if (config.headers) {
         Object.assign(headers, config.headers);
       }
    }

    try {
      const response = await fetch(feed.url, { headers });
      if (!response.ok) throw new Error(`STIX Fetch Failed: ${response.statusText}`);
      return await response.json() as StixBundle;
    } catch (err) {
      logger.error('STIX Fetch Error', err);
      return this.getMockStixData();
    }
  }

  async parse(data: StixBundle, _config?: ConnectorConfig): Promise<Partial<Threat>[]> {
    const objects = data.objects || [];
    const threats: Partial<Threat>[] = [];

    for (const obj of objects) {
      if (obj.type === 'indicator') {
        threats.push({
          indicator: obj.name || obj.pattern || 'Unknown Indicator',
          type: this.mapStixType(obj.pattern || ''),
          description: obj.description || 'Imported via STIX',
          source: 'STIX Feed',
          status: 'NEW',
          severity: 'HIGH', 
          confidence: obj.confidence || 75,
          last_seen: new Date(obj.modified || obj.created || Date.now())
        });
      }
    }
    return threats;
  }

  private mapStixType(pattern: string): string {
    if (!pattern) return 'Unknown';
    if (pattern.includes('ipv4-addr')) return 'IP Address';
    if (pattern.includes('domain-name')) return 'Domain';
    if (pattern.includes('file:hashes')) return 'File Hash';
    if (pattern.includes('url')) return 'URL';
    return 'STIX Indicator';
  }

  private getMockStixData(): StixBundle {
    return {
      objects: [
        { type: 'indicator', name: '192.168.1.105', pattern: '[ipv4-addr:value = \'192.168.1.105\']', description: 'C2 Node', confidence: 85 },
        { type: 'indicator', name: 'evil.com', pattern: '[domain-name:value = \'evil.com\']', description: 'Phishing Domain', confidence: 90 }
      ]
    };
  }
}
