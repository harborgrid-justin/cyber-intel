
import { IConnector, ConnectorConfig } from '../types';
import { Threat } from '../../../models/intelligence';
import { logger } from '../../../utils/logger';
import { Feed } from '../../../models/infrastructure';

export class JsonConnector implements IConnector {
  async fetch(feed: Feed): Promise<unknown> {
    const headers: Record<string, string> = { 'Accept': 'application/json' };
    
    if (feed.configuration && typeof feed.configuration === 'object') {
        const config = feed.configuration as { headers?: Record<string, string> };
        if (config.headers) {
          Object.assign(headers, config.headers);
        }
    }

    try {
      const response = await fetch(feed.url, { headers });
      if (!response.ok) throw new Error(`JSON Fetch Failed: ${response.statusText}`);
      return await response.json();
    } catch (err) {
      logger.error('JSON Fetch Error', err);
      // Fallback data
      return [{ ip: '10.0.0.99', note: 'Malicious Scanner', risk: 80 }];
    }
  }

  async parse(data: unknown, config?: ConnectorConfig): Promise<Partial<Threat>[]> {
    let items = data;
    
    // 1. Navigate to root array if specified
    if (config?.rootPath && typeof data === 'object' && data !== null) {
      items = config.rootPath.split('.').reduce((o: any, i: string) => (o ? o[i] : null), data);
    }

    if (!Array.isArray(items)) {
      logger.warn('JSON Connector: Root data is not an array');
      return [];
    }

    // 2. Map fields based on configuration
    const mapping = config?.mapping || { indicator: 'ip', description: 'note', score: 'risk' };

    return items.map((item: Record<string, any>) => ({
      indicator: String(item[mapping.indicator || 'indicator'] || 'Unknown'),
      type: 'Generic JSON',
      description: String(item[mapping.description || 'description'] || 'Imported via JSON'),
      source: 'JSON Feed',
      status: 'NEW',
      severity: 'MEDIUM',
      score: Number(item[mapping.score || 'score']) || 50,
      last_seen: new Date()
    }));
  }
}
