/**
 * STIX/TAXII Integration Service
 * Supports STIX 2.1 format and TAXII 2.1 protocol
 * For threat intelligence sharing and ingestion
 */

interface STIX21Object {
  type: string;
  spec_version: '2.1';
  id: string;
  created: string;
  modified: string;
  [key: string]: any;
}

interface STIXIndicator extends STIX21Object {
  type: 'indicator';
  pattern: string;
  pattern_type: 'stix' | 'pcre' | 'sigma' | 'snort' | 'suricata' | 'yara';
  valid_from: string;
  valid_until?: string;
  indicator_types?: string[];
  description?: string;
  labels?: string[];
  confidence?: number;
  threat_actor_id?: string;
}

interface STIXThreatActor extends STIX21Object {
  type: 'threat-actor';
  name: string;
  description?: string;
  aliases?: string[];
  threat_actor_types?: string[];
  sophistication?: string;
  resource_level?: string;
  primary_motivation?: string;
  goals?: string[];
}

interface STIXRelationship extends STIX21Object {
  type: 'relationship';
  relationship_type: string;
  source_ref: string;
  target_ref: string;
}

interface STIXBundle {
  type: 'bundle';
  id: string;
  objects: STIX21Object[];
}

interface TAXIIServer {
  url: string;
  api_root: string;
  collection_id?: string;
  username?: string;
  password?: string;
  api_key?: string;
}

export class STIXService {
  /**
   * Convert internal threat to STIX 2.1 Indicator
   */
  static toSTIXIndicator(threat: {
    id: string;
    indicator: string;
    type: string;
    severity: string;
    confidence: number;
    description: string;
    lastSeen: string;
    tags?: string[];
    threatActor?: string;
  }): STIXIndicator {
    const now = new Date().toISOString();

    // Convert indicator to STIX pattern
    const pattern = this.createSTIXPattern(threat.indicator, threat.type);

    return {
      type: 'indicator',
      spec_version: '2.1',
      id: `indicator--${this.generateUUID(threat.id)}`,
      created: now,
      modified: now,
      pattern,
      pattern_type: 'stix',
      valid_from: threat.lastSeen,
      indicator_types: this.mapIndicatorTypes(threat.type),
      description: threat.description,
      labels: threat.tags || [],
      confidence: threat.confidence,
      threat_actor_id: threat.threatActor
    };
  }

  /**
   * Convert internal threat actor to STIX 2.1 Threat Actor
   */
  static toSTIXThreatActor(actor: {
    id: string;
    name: string;
    description: string;
    aliases: string[];
    sophistication: string;
    targets: string[];
  }): STIXThreatActor {
    const now = new Date().toISOString();

    return {
      type: 'threat-actor',
      spec_version: '2.1',
      id: `threat-actor--${this.generateUUID(actor.id)}`,
      created: now,
      modified: now,
      name: actor.name,
      description: actor.description,
      aliases: actor.aliases,
      threat_actor_types: ['nation-state', 'hacktivist', 'crime-syndicate'],
      sophistication: actor.sophistication.toLowerCase(),
      goals: actor.targets
    };
  }

  /**
   * Create STIX Bundle from multiple objects
   */
  static createSTIXBundle(objects: STIX21Object[]): STIXBundle {
    return {
      type: 'bundle',
      id: `bundle--${this.generateUUID()}`,
      objects
    };
  }

  /**
   * Parse STIX Bundle and extract threats
   */
  static parseSTIXBundle(bundle: STIXBundle): {
    indicators: any[];
    threat_actors: any[];
    relationships: any[];
    malware: any[];
  } {
    const indicators: any[] = [];
    const threat_actors: any[] = [];
    const relationships: any[] = [];
    const malware: any[] = [];

    bundle.objects.forEach(obj => {
      switch (obj.type) {
        case 'indicator':
          indicators.push(this.parseSTIXIndicator(obj as STIXIndicator));
          break;
        case 'threat-actor':
          threat_actors.push(this.parseSTIXThreatActor(obj as STIXThreatActor));
          break;
        case 'relationship':
          relationships.push(obj);
          break;
        case 'malware':
          malware.push(obj);
          break;
      }
    });

    return { indicators, threat_actors, relationships, malware };
  }

  /**
   * Parse STIX Indicator to internal format
   */
  static parseSTIXIndicator(stixIndicator: STIXIndicator): {
    indicator: string;
    type: string;
    severity: string;
    confidence: number;
    description: string;
    lastSeen: string;
    tags: string[];
  } {
    // Extract indicator value from STIX pattern
    const { value, type } = this.parseSTIXPattern(stixIndicator.pattern);

    // Map confidence (STIX uses 0-100, same as internal)
    const confidence = stixIndicator.confidence || 50;

    // Infer severity from indicator types
    const severity = this.inferSeverity(stixIndicator.indicator_types);

    return {
      indicator: value,
      type,
      severity,
      confidence,
      description: stixIndicator.description || '',
      lastSeen: stixIndicator.valid_from,
      tags: stixIndicator.labels || []
    };
  }

  /**
   * Parse STIX Threat Actor to internal format
   */
  static parseSTIXThreatActor(stixActor: STIXThreatActor): {
    name: string;
    description: string;
    aliases: string[];
    sophistication: string;
    targets: string[];
  } {
    return {
      name: stixActor.name,
      description: stixActor.description || '',
      aliases: stixActor.aliases || [],
      sophistication: this.capitalizeSophistication(stixActor.sophistication),
      targets: stixActor.goals || []
    };
  }

  /**
   * Export threats to STIX 2.1 format
   */
  static exportToSTIX(threats: any[], actors?: any[]): STIXBundle {
    const objects: STIX21Object[] = [];

    // Convert threats to STIX indicators
    threats.forEach(threat => {
      objects.push(this.toSTIXIndicator(threat));
    });

    // Convert actors to STIX threat actors
    if (actors) {
      actors.forEach(actor => {
        objects.push(this.toSTIXThreatActor(actor));
      });
    }

    return this.createSTIXBundle(objects);
  }

  /**
   * Import threats from STIX 2.1 bundle
   */
  static importFromSTIX(bundle: STIXBundle): {
    threats: any[];
    actors: any[];
  } {
    const parsed = this.parseSTIXBundle(bundle);

    return {
      threats: parsed.indicators,
      actors: parsed.threat_actors
    };
  }

  /**
   * TAXII 2.1 Client - Fetch threat intelligence from TAXII server
   */
  static async fetchFromTAXII(server: TAXIIServer, options?: {
    added_after?: string;
    limit?: number;
    match_type?: string[];
  }): Promise<STIXBundle> {
    // Build TAXII API URL
    const url = `${server.url}${server.api_root}/collections/${server.collection_id}/objects/`;

    // Build query parameters
    const params = new URLSearchParams();
    if (options?.added_after) params.append('added_after', options.added_after);
    if (options?.limit) params.append('limit', options.limit.toString());
    if (options?.match_type) params.append('match[type]', options.match_type.join(','));

    // Prepare headers
    const headers: Record<string, string> = {
      'Accept': 'application/taxii+json;version=2.1',
      'Content-Type': 'application/taxii+json;version=2.1'
    };

    if (server.api_key) {
      headers['Authorization'] = `Bearer ${server.api_key}`;
    } else if (server.username && server.password) {
      const auth = Buffer.from(`${server.username}:${server.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    try {
      // In production, use actual HTTP client (axios, fetch, etc.)
      // This is a simplified simulation
      const response = await this.simulateTAXIIRequest(url, headers, params);

      return response as STIXBundle;
    } catch (error) {
      console.error('TAXII fetch error:', error);
      throw new Error(`Failed to fetch from TAXII server: ${error}`);
    }
  }

  /**
   * TAXII 2.1 Client - Push threat intelligence to TAXII server
   */
  static async pushToTAXII(server: TAXIIServer, bundle: STIXBundle): Promise<{
    success: boolean;
    status_id?: string;
    message?: string;
  }> {
    const url = `${server.url}${server.api_root}/collections/${server.collection_id}/objects/`;

    const headers: Record<string, string> = {
      'Accept': 'application/taxii+json;version=2.1',
      'Content-Type': 'application/taxii+json;version=2.1'
    };

    if (server.api_key) {
      headers['Authorization'] = `Bearer ${server.api_key}`;
    } else if (server.username && server.password) {
      const auth = Buffer.from(`${server.username}:${server.password}`).toString('base64');
      headers['Authorization'] = `Basic ${auth}`;
    }

    try {
      // In production, use actual HTTP POST
      const response = await this.simulateTAXIIPush(url, headers, bundle);

      return {
        success: true,
        status_id: response.id,
        message: 'Successfully pushed STIX bundle to TAXII server'
      };
    } catch (error) {
      console.error('TAXII push error:', error);
      return {
        success: false,
        message: `Failed to push to TAXII server: ${error}`
      };
    }
  }

  /**
   * Validate STIX 2.1 object
   */
  static validateSTIX(obj: STIX21Object): { valid: boolean; errors: string[] } {
    const errors: string[] = [];

    // Check required fields
    if (!obj.type) errors.push('Missing required field: type');
    if (!obj.id) errors.push('Missing required field: id');
    if (!obj.spec_version || obj.spec_version !== '2.1') {
      errors.push('Invalid or missing spec_version (must be 2.1)');
    }
    if (!obj.created) errors.push('Missing required field: created');
    if (!obj.modified) errors.push('Missing required field: modified');

    // Validate ID format
    if (obj.id && !obj.id.match(/^[a-z-]+--[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/)) {
      errors.push('Invalid ID format (must be type--UUID)');
    }

    // Type-specific validation
    if (obj.type === 'indicator') {
      const indicator = obj as STIXIndicator;
      if (!indicator.pattern) errors.push('Indicator missing required field: pattern');
      if (!indicator.valid_from) errors.push('Indicator missing required field: valid_from');
    }

    return {
      valid: errors.length === 0,
      errors
    };
  }

  // Helper methods
  private static createSTIXPattern(indicator: string, type: string): string {
    const typeMap: Record<string, string> = {
      'IP': 'ipv4-addr',
      'IPv4': 'ipv4-addr',
      'IPv6': 'ipv6-addr',
      'Domain': 'domain-name',
      'URL': 'url',
      'Email': 'email-addr',
      'Hash': 'file',
      'MD5': 'file',
      'SHA1': 'file',
      'SHA256': 'file'
    };

    const stixType = typeMap[type] || 'file';

    // Create STIX pattern based on type
    switch (stixType) {
      case 'ipv4-addr':
      case 'ipv6-addr':
        return `[${stixType}:value = '${indicator}']`;
      case 'domain-name':
        return `[domain-name:value = '${indicator}']`;
      case 'url':
        return `[url:value = '${indicator}']`;
      case 'email-addr':
        return `[email-addr:value = '${indicator}']`;
      case 'file':
        if (indicator.length === 32) {
          return `[file:hashes.MD5 = '${indicator}']`;
        } else if (indicator.length === 40) {
          return `[file:hashes.'SHA-1' = '${indicator}']`;
        } else if (indicator.length === 64) {
          return `[file:hashes.'SHA-256' = '${indicator}']`;
        }
        return `[file:name = '${indicator}']`;
      default:
        return `[file:name = '${indicator}']`;
    }
  }

  private static parseSTIXPattern(pattern: string): { value: string; type: string } {
    // Extract value from STIX pattern
    const valueMatch = pattern.match(/=\s*'([^']+)'/);
    const value = valueMatch ? valueMatch[1] : '';

    // Determine type from pattern
    let type = 'Unknown';
    if (pattern.includes('ipv4-addr')) type = 'IP';
    else if (pattern.includes('ipv6-addr')) type = 'IPv6';
    else if (pattern.includes('domain-name')) type = 'Domain';
    else if (pattern.includes('url')) type = 'URL';
    else if (pattern.includes('email-addr')) type = 'Email';
    else if (pattern.includes('file:hashes')) type = 'Hash';

    return { value, type };
  }

  private static mapIndicatorTypes(type: string): string[] {
    const typeMap: Record<string, string[]> = {
      'IP': ['malicious-activity', 'anomalous-activity'],
      'Domain': ['malicious-activity', 'domain-watchlist'],
      'URL': ['malicious-activity', 'url-watchlist'],
      'Email': ['phishing', 'malicious-activity'],
      'Hash': ['malicious-activity', 'file-hash-watchlist']
    };

    return typeMap[type] || ['anomalous-activity'];
  }

  private static inferSeverity(indicatorTypes?: string[]): string {
    if (!indicatorTypes) return 'MEDIUM';

    if (indicatorTypes.includes('malicious-activity')) return 'HIGH';
    if (indicatorTypes.includes('anomalous-activity')) return 'MEDIUM';

    return 'LOW';
  }

  private static capitalizeSophistication(sophistication?: string): string {
    if (!sophistication) return 'Intermediate';

    const map: Record<string, string> = {
      'novice': 'Novice',
      'intermediate': 'Intermediate',
      'advanced': 'Advanced',
      'expert': 'Expert',
      'strategic': 'Expert'
    };

    return map[sophistication.toLowerCase()] || 'Intermediate';
  }

  private static generateUUID(seed?: string): string {
    if (seed) {
      // Generate deterministic UUID from seed
      let hash = 0;
      for (let i = 0; i < seed.length; i++) {
        hash = ((hash << 5) - hash) + seed.charCodeAt(i);
        hash |= 0;
      }

      const hex = Math.abs(hash).toString(16).padStart(32, '0');
      return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
    }

    // Generate random UUID
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private static async simulateTAXIIRequest(
    url: string,
    headers: Record<string, string>,
    params: URLSearchParams
  ): Promise<STIXBundle> {
    // Simulated TAXII response
    return {
      type: 'bundle',
      id: `bundle--${this.generateUUID()}`,
      objects: [
        {
          type: 'indicator',
          spec_version: '2.1',
          id: `indicator--${this.generateUUID()}`,
          created: new Date().toISOString(),
          modified: new Date().toISOString(),
          pattern: "[ipv4-addr:value = '192.0.2.1']",
          pattern_type: 'stix',
          valid_from: new Date().toISOString(),
          indicator_types: ['malicious-activity'],
          description: 'Malicious IP from TAXII feed',
          confidence: 85
        }
      ]
    };
  }

  private static async simulateTAXIIPush(
    url: string,
    headers: Record<string, string>,
    bundle: STIXBundle
  ): Promise<{ id: string; status: string }> {
    // Simulated TAXII response
    return {
      id: `status--${this.generateUUID()}`,
      status: 'complete'
    };
  }
}
