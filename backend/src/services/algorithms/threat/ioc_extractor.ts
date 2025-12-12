/**
 * IOC Extractor - Extract indicators of compromise from text
 * Supports: IPs, domains, URLs, emails, hashes, CVEs, file paths
 */

interface ExtractedIOC {
  type: 'IP' | 'DOMAIN' | 'URL' | 'EMAIL' | 'HASH_MD5' | 'HASH_SHA1' | 'HASH_SHA256' | 'CVE' | 'FILE_PATH' | 'REGISTRY' | 'MUTEX';
  value: string;
  context?: string;
  confidence: number;
  position: { start: number; end: number };
}

interface ExtractionResult {
  iocs: ExtractedIOC[];
  summary: {
    total: number;
    by_type: Record<string, number>;
    unique_count: number;
  };
  defanged_text?: string;
}

export class IOCExtractor {
  // Regex patterns for different IOC types
  private static readonly patterns = {
    ipv4: /\b(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\b/g,
    ipv6: /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b/g,
    domain: /\b(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z0-9][a-z0-9-]{0,61}[a-z0-9]\b/gi,
    url: /\b(?:https?|ftp):\/\/[^\s<>"{}|\\^`[\]]+/gi,
    email: /\b[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b/g,
    md5: /\b[a-fA-F0-9]{32}\b/g,
    sha1: /\b[a-fA-F0-9]{40}\b/g,
    sha256: /\b[a-fA-F0-9]{64}\b/g,
    cve: /CVE-\d{4}-\d{4,7}/gi,
    filePath: /\b[A-Za-z]:\\(?:[^\s<>:"|?*]+\\)*[^\s<>:"|?*]+\.[a-zA-Z0-9]+\b/g,
    registry: /\bHK(?:LM|CU|CR|U|CC)\\[^\s<>"|]+/gi,
    mutex: /\b(?:Global|Local)\\[A-Za-z0-9_-]+\b/g
  };

  /**
   * Extract all IOCs from text
   */
  static extract(text: string, options?: {
    types?: Array<'IP' | 'DOMAIN' | 'URL' | 'EMAIL' | 'HASH' | 'CVE' | 'FILE_PATH' | 'REGISTRY' | 'MUTEX'>;
    deduplicate?: boolean;
    includeContext?: boolean;
    contextWindow?: number;
  }): ExtractionResult {
    const iocs: ExtractedIOC[] = [];
    const types = options?.types || ['IP', 'DOMAIN', 'URL', 'EMAIL', 'HASH', 'CVE', 'FILE_PATH', 'REGISTRY', 'MUTEX'];
    const contextWindow = options?.contextWindow || 50;

    // Extract IPv4 addresses
    if (types.includes('IP')) {
      let match;
      while ((match = this.patterns.ipv4.exec(text)) !== null) {
        const value = match[0];
        if (this.isValidIP(value)) {
          iocs.push({
            type: 'IP',
            value,
            context: options?.includeContext ? this.extractContext(text, match.index, contextWindow) : undefined,
            confidence: this.calculateIPConfidence(value),
            position: { start: match.index, end: match.index + value.length }
          });
        }
      }
    }

    // Extract domains
    if (types.includes('DOMAIN')) {
      let match;
      while ((match = this.patterns.domain.exec(text)) !== null) {
        const value = match[0].toLowerCase();
        if (this.isValidDomain(value)) {
          iocs.push({
            type: 'DOMAIN',
            value,
            context: options?.includeContext ? this.extractContext(text, match.index, contextWindow) : undefined,
            confidence: this.calculateDomainConfidence(value),
            position: { start: match.index, end: match.index + value.length }
          });
        }
      }
    }

    // Extract URLs
    if (types.includes('URL')) {
      let match;
      while ((match = this.patterns.url.exec(text)) !== null) {
        const value = match[0];
        iocs.push({
          type: 'URL',
          value,
          context: options?.includeContext ? this.extractContext(text, match.index, contextWindow) : undefined,
          confidence: 0.95,
          position: { start: match.index, end: match.index + value.length }
        });
      }
    }

    // Extract emails
    if (types.includes('EMAIL')) {
      let match;
      while ((match = this.patterns.email.exec(text)) !== null) {
        const value = match[0].toLowerCase();
        iocs.push({
          type: 'EMAIL',
          value,
          context: options?.includeContext ? this.extractContext(text, match.index, contextWindow) : undefined,
          confidence: 0.90,
          position: { start: match.index, end: match.index + value.length }
        });
      }
    }

    // Extract hashes
    if (types.includes('HASH')) {
      this.extractHashes(text, iocs, options?.includeContext, contextWindow);
    }

    // Extract CVEs
    if (types.includes('CVE')) {
      let match;
      while ((match = this.patterns.cve.exec(text)) !== null) {
        const value = match[0].toUpperCase();
        iocs.push({
          type: 'CVE',
          value,
          context: options?.includeContext ? this.extractContext(text, match.index, contextWindow) : undefined,
          confidence: 1.0,
          position: { start: match.index, end: match.index + value.length }
        });
      }
    }

    // Extract file paths
    if (types.includes('FILE_PATH')) {
      let match;
      while ((match = this.patterns.filePath.exec(text)) !== null) {
        const value = match[0];
        iocs.push({
          type: 'FILE_PATH',
          value,
          context: options?.includeContext ? this.extractContext(text, match.index, contextWindow) : undefined,
          confidence: 0.85,
          position: { start: match.index, end: match.index + value.length }
        });
      }
    }

    // Extract registry keys
    if (types.includes('REGISTRY')) {
      let match;
      while ((match = this.patterns.registry.exec(text)) !== null) {
        const value = match[0];
        iocs.push({
          type: 'REGISTRY',
          value,
          context: options?.includeContext ? this.extractContext(text, match.index, contextWindow) : undefined,
          confidence: 0.90,
          position: { start: match.index, end: match.index + value.length }
        });
      }
    }

    // Extract mutexes
    if (types.includes('MUTEX')) {
      let match;
      while ((match = this.patterns.mutex.exec(text)) !== null) {
        const value = match[0];
        iocs.push({
          type: 'MUTEX',
          value,
          context: options?.includeContext ? this.extractContext(text, match.index, contextWindow) : undefined,
          confidence: 0.80,
          position: { start: match.index, end: match.index + value.length }
        });
      }
    }

    // Deduplicate if requested
    const finalIOCs = options?.deduplicate ? this.deduplicateIOCs(iocs) : iocs;

    // Generate summary
    const summary = this.generateSummary(finalIOCs);

    // Optionally defang the text
    const defanged_text = this.defangText(text, finalIOCs);

    return { iocs: finalIOCs, summary, defanged_text };
  }

  /**
   * Extract only specific IOC type
   */
  static extractType(text: string, type: 'IP' | 'DOMAIN' | 'URL' | 'EMAIL' | 'HASH'): string[] {
    const result = this.extract(text, { types: [type], deduplicate: true });
    return result.iocs.map(ioc => ioc.value);
  }

  /**
   * Refang (restore) defanged IOCs
   */
  static refang(text: string): string {
    return text
      .replace(/\[?\.\]?/g, '.')
      .replace(/\[@\]/g, '@')
      .replace(/hxxp/gi, 'http')
      .replace(/\[:\]/g, ':')
      .replace(/\\\./g, '.');
  }

  /**
   * Defang IOCs to make them safe to share
   */
  static defang(text: string): string {
    return text
      .replace(/\./g, '[.]')
      .replace(/@/g, '[@]')
      .replace(/http/gi, 'hxxp')
      .replace(/:/g, '[:]');
  }

  /**
   * Validate and enrich IOCs with threat intelligence
   */
  static async enrichIOCs(iocs: ExtractedIOC[]): Promise<Array<ExtractedIOC & {
    reputation?: number;
    threat_level?: string;
    known_bad?: boolean;
    tags?: string[];
  }>> {
    return iocs.map(ioc => {
      // Simplified enrichment (in production, query threat intel APIs)
      const enriched: any = { ...ioc };

      // Simulate reputation scoring
      enriched.reputation = Math.floor(Math.random() * 100);

      // Simulate threat level
      if (enriched.reputation < 30) enriched.threat_level = 'HIGH';
      else if (enriched.reputation < 60) enriched.threat_level = 'MEDIUM';
      else enriched.threat_level = 'LOW';

      // Simulate known bad indicator
      enriched.known_bad = enriched.reputation < 30;

      // Add tags
      enriched.tags = this.generateTags(ioc);

      return enriched;
    });
  }

  // Helper methods
  private static extractHashes(text: string, iocs: ExtractedIOC[], includeContext?: boolean, contextWindow?: number): void {
    // MD5
    let match;
    while ((match = this.patterns.md5.exec(text)) !== null) {
      const value = match[0].toLowerCase();
      iocs.push({
        type: 'HASH_MD5',
        value,
        context: includeContext ? this.extractContext(text, match.index, contextWindow!) : undefined,
        confidence: 0.95,
        position: { start: match.index, end: match.index + value.length }
      });
    }

    // SHA1
    while ((match = this.patterns.sha1.exec(text)) !== null) {
      const value = match[0].toLowerCase();
      iocs.push({
        type: 'HASH_SHA1',
        value,
        context: includeContext ? this.extractContext(text, match.index, contextWindow!) : undefined,
        confidence: 0.95,
        position: { start: match.index, end: match.index + value.length }
      });
    }

    // SHA256
    while ((match = this.patterns.sha256.exec(text)) !== null) {
      const value = match[0].toLowerCase();
      iocs.push({
        type: 'HASH_SHA256',
        value,
        context: includeContext ? this.extractContext(text, match.index, contextWindow!) : undefined,
        confidence: 0.95,
        position: { start: match.index, end: match.index + value.length }
      });
    }
  }

  private static isValidIP(ip: string): boolean {
    // Filter out common false positives
    if (ip.startsWith('0.') || ip.startsWith('255.255.')) return false;
    if (ip === '127.0.0.1' || ip === '0.0.0.0') return false;
    return true;
  }

  private static isValidDomain(domain: string): boolean {
    // Filter out common false positives
    if (domain.length < 4) return false;
    if (!domain.includes('.')) return false;
    if (/^\d+\.\d+$/.test(domain)) return false; // Version numbers
    const commonWords = ['example.com', 'localhost.com', 'test.com'];
    if (commonWords.includes(domain)) return false;
    return true;
  }

  private static calculateIPConfidence(ip: string): number {
    // Private IP ranges have lower confidence as IOCs
    if (ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.')) {
      return 0.5;
    }
    return 0.9;
  }

  private static calculateDomainConfidence(domain: string): number {
    // Common TLDs have higher confidence
    const commonTLDs = ['.com', '.net', '.org', '.ru', '.cn'];
    if (commonTLDs.some(tld => domain.endsWith(tld))) {
      return 0.9;
    }
    return 0.75;
  }

  private static extractContext(text: string, position: number, window: number): string {
    const start = Math.max(0, position - window);
    const end = Math.min(text.length, position + window);
    return text.substring(start, end).trim();
  }

  private static deduplicateIOCs(iocs: ExtractedIOC[]): ExtractedIOC[] {
    const seen = new Set<string>();
    return iocs.filter(ioc => {
      const key = `${ioc.type}:${ioc.value}`;
      if (seen.has(key)) return false;
      seen.add(key);
      return true;
    });
  }

  private static generateSummary(iocs: ExtractedIOC[]): {
    total: number;
    by_type: Record<string, number>;
    unique_count: number;
  } {
    const by_type: Record<string, number> = {};

    iocs.forEach(ioc => {
      by_type[ioc.type] = (by_type[ioc.type] || 0) + 1;
    });

    return {
      total: iocs.length,
      by_type,
      unique_count: new Set(iocs.map(ioc => ioc.value)).size
    };
  }

  private static defangText(text: string, iocs: ExtractedIOC[]): string {
    let defanged = text;

    // Sort IOCs by position (reverse order to maintain positions)
    const sorted = [...iocs].sort((a, b) => b.position.start - a.position.start);

    sorted.forEach(ioc => {
      const defangedValue = this.defang(ioc.value);
      defanged = defanged.substring(0, ioc.position.start) +
        defangedValue +
        defanged.substring(ioc.position.end);
    });

    return defanged;
  }

  private static generateTags(ioc: ExtractedIOC): string[] {
    const tags: string[] = [];

    switch (ioc.type) {
      case 'IP':
        if (ioc.value.startsWith('10.') || ioc.value.startsWith('192.168.')) {
          tags.push('private_ip');
        } else {
          tags.push('public_ip');
        }
        break;
      case 'DOMAIN':
        const tld = ioc.value.split('.').pop();
        tags.push(`tld_${tld}`);
        break;
      case 'URL':
        if (ioc.value.startsWith('https://')) tags.push('https');
        else tags.push('http');
        break;
      case 'HASH_MD5':
      case 'HASH_SHA1':
      case 'HASH_SHA256':
        tags.push('file_hash');
        break;
    }

    return tags;
  }
}
