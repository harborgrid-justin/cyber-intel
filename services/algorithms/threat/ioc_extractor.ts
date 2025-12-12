/**
 * IoC (Indicator of Compromise) Extractor
 *
 * Advanced pattern matching and extraction for cybersecurity indicators
 *
 * Time Complexity: O(n) where n is text length
 * Space Complexity: O(m) where m is number of extracted IoCs
 *
 * Use Cases:
 * - Extracting IoCs from threat reports
 * - Automated threat intelligence parsing
 * - CTI feed processing
 * - Incident response artifact collection
 */

export interface IoC {
  type: IoCType;
  value: string;
  confidence: number;
  context?: string;
  position: number;
  metadata?: Record<string, any>;
}

export type IoCType =
  | 'ipv4'
  | 'ipv6'
  | 'domain'
  | 'url'
  | 'email'
  | 'md5'
  | 'sha1'
  | 'sha256'
  | 'sha512'
  | 'ssdeep'
  | 'cve'
  | 'cpe'
  | 'file_path'
  | 'registry_key'
  | 'mutex'
  | 'user_agent'
  | 'bitcoin_address'
  | 'ethereum_address'
  | 'phone_number'
  | 'credit_card'
  | 'social_security';

export interface ExtractionResult {
  iocs: IoC[];
  summary: {
    total: number;
    byType: Record<string, number>;
    highConfidence: number;
  };
  defanged: boolean;
}

export interface ExtractionOptions {
  types?: IoCType[];
  minConfidence?: number;
  includeContext?: boolean;
  contextWindow?: number;
  autoDefang?: boolean;
  deduplication?: boolean;
}

/**
 * Advanced IoC Extraction Engine
 */
export class IoCExtractor {
  private patterns: Map<IoCType, RegExp>;

  constructor() {
    this.patterns = this.buildPatterns();
  }

  /**
   * Extract all IoCs from text
   */
  extract(text: string, options: ExtractionOptions = {}): ExtractionResult {
    const {
      types,
      minConfidence = 0.5,
      includeContext = true,
      contextWindow = 50,
      autoDefang = false,
      deduplication = true
    } = options;

    // Refang text if it was defanged
    const processedText = this.refangText(text);
    const iocs: IoC[] = [];

    // Extract each type of IoC
    const typesToExtract = types || Array.from(this.patterns.keys());

    for (const type of typesToExtract) {
      const extracted = this.extractType(processedText, type, includeContext, contextWindow);
      iocs.push(...extracted);
    }

    // Filter by confidence
    let filteredIocs = iocs.filter(ioc => ioc.confidence >= minConfidence);

    // Deduplicate
    if (deduplication) {
      filteredIocs = this.deduplicateIoCs(filteredIocs);
    }

    // Sort by position
    filteredIocs.sort((a, b) => a.position - b.position);

    // Generate summary
    const summary = this.generateSummary(filteredIocs);

    return {
      iocs: filteredIocs,
      summary,
      defanged: this.isDefanged(text)
    };
  }

  /**
   * Extract specific IoC type
   */
  private extractType(
    text: string,
    type: IoCType,
    includeContext: boolean,
    contextWindow: number
  ): IoC[] {
    const pattern = this.patterns.get(type);
    if (!pattern) return [];

    const iocs: IoC[] = [];
    let match: RegExpExecArray | null;

    // Reset regex state
    pattern.lastIndex = 0;

    while ((match = pattern.exec(text)) !== null) {
      const value = match[0];
      const position = match.index;

      // Validate and calculate confidence
      const validation = this.validateIoC(type, value);
      if (!validation.valid) continue;

      // Extract context
      const context = includeContext
        ? this.extractContext(text, position, value.length, contextWindow)
        : undefined;

      iocs.push({
        type,
        value: validation.normalized || value,
        confidence: validation.confidence,
        context,
        position,
        metadata: validation.metadata
      });
    }

    return iocs;
  }

  /**
   * Validate and normalize IoC
   */
  private validateIoC(type: IoCType, value: string): {
    valid: boolean;
    confidence: number;
    normalized?: string;
    metadata?: Record<string, any>;
  } {
    switch (type) {
      case 'ipv4':
        return this.validateIPv4(value);
      case 'ipv6':
        return this.validateIPv6(value);
      case 'domain':
        return this.validateDomain(value);
      case 'url':
        return this.validateURL(value);
      case 'email':
        return this.validateEmail(value);
      case 'md5':
      case 'sha1':
      case 'sha256':
      case 'sha512':
        return this.validateHash(type, value);
      case 'cve':
        return this.validateCVE(value);
      default:
        return { valid: true, confidence: 0.7 };
    }
  }

  /**
   * Validate IPv4 address
   */
  private validateIPv4(ip: string): { valid: boolean; confidence: number; normalized?: string; metadata?: any } {
    const octets = ip.split('.');
    if (octets.length !== 4) return { valid: false, confidence: 0 };

    for (const octet of octets) {
      const num = parseInt(octet, 10);
      if (isNaN(num) || num < 0 || num > 255) {
        return { valid: false, confidence: 0 };
      }
    }

    // Check if private/reserved
    const isPrivate = this.isPrivateIP(ip);
    const isReserved = this.isReservedIP(ip);

    let confidence = 0.95;
    if (isPrivate) confidence = 0.3;
    if (isReserved) confidence = 0.1;

    return {
      valid: true,
      confidence,
      normalized: ip,
      metadata: { isPrivate, isReserved }
    };
  }

  /**
   * Validate IPv6 address
   */
  private validateIPv6(ip: string): { valid: boolean; confidence: number; normalized?: string } {
    // Simplified IPv6 validation
    const parts = ip.split(':');
    if (parts.length < 3 || parts.length > 8) {
      return { valid: false, confidence: 0 };
    }

    for (const part of parts) {
      if (part === '') continue; // Allow :: notation
      if (!/^[0-9a-fA-F]{1,4}$/.test(part)) {
        return { valid: false, confidence: 0 };
      }
    }

    return { valid: true, confidence: 0.9, normalized: ip.toLowerCase() };
  }

  /**
   * Validate domain name
   */
  private validateDomain(domain: string): { valid: boolean; confidence: number; normalized?: string; metadata?: any } {
    domain = domain.toLowerCase();

    // Check TLD
    const parts = domain.split('.');
    if (parts.length < 2) return { valid: false, confidence: 0 };

    const tld = parts[parts.length - 1];
    const validTLDs = new Set(['com', 'net', 'org', 'edu', 'gov', 'mil', 'io', 'co', 'ru', 'cn', 'de', 'uk', 'us']);

    let confidence = validTLDs.has(tld) ? 0.9 : 0.7;

    // Penalize localhost and common dev domains
    if (domain.includes('localhost') || domain.includes('example') || domain.includes('test')) {
      confidence = 0.2;
    }

    return {
      valid: true,
      confidence,
      normalized: domain,
      metadata: { tld, labels: parts.length }
    };
  }

  /**
   * Validate URL
   */
  private validateURL(url: string): { valid: boolean; confidence: number; normalized?: string; metadata?: any } {
    try {
      const parsed = new URL(url);
      const isSuspiciousProtocol = parsed.protocol === 'file:' || parsed.protocol === 'ftp:';
      const hasSuspiciousPort = ['8080', '8443', '1337', '31337'].includes(parsed.port);

      let confidence = 0.85;
      if (isSuspiciousProtocol) confidence += 0.1;
      if (hasSuspiciousPort) confidence += 0.05;
      if (parsed.hostname.match(/\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/)) confidence += 0.05; // IP-based URL

      return {
        valid: true,
        confidence: Math.min(confidence, 1.0),
        normalized: url,
        metadata: {
          protocol: parsed.protocol,
          hostname: parsed.hostname,
          port: parsed.port,
          path: parsed.pathname
        }
      };
    } catch {
      return { valid: false, confidence: 0 };
    }
  }

  /**
   * Validate email address
   */
  private validateEmail(email: string): { valid: boolean; confidence: number; normalized?: string; metadata?: any } {
    email = email.toLowerCase();
    const parts = email.split('@');
    if (parts.length !== 2) return { valid: false, confidence: 0 };

    const [localPart, domain] = parts;
    const domainValidation = this.validateDomain(domain);

    let confidence = domainValidation.valid ? domainValidation.confidence * 0.9 : 0.5;

    // Common disposable email domains
    const disposableDomains = new Set(['tempmail.com', 'guerrillamail.com', '10minutemail.com']);
    if (disposableDomains.has(domain)) {
      confidence = 0.95; // High confidence for IOC purposes
    }

    return {
      valid: true,
      confidence,
      normalized: email,
      metadata: { localPart, domain }
    };
  }

  /**
   * Validate hash
   */
  private validateHash(type: IoCType, hash: string): { valid: boolean; confidence: number; normalized?: string } {
    hash = hash.toLowerCase();
    const expectedLengths: Record<string, number> = {
      md5: 32,
      sha1: 40,
      sha256: 64,
      sha512: 128
    };

    const expectedLength = expectedLengths[type];
    if (hash.length !== expectedLength) {
      return { valid: false, confidence: 0 };
    }

    if (!/^[a-f0-9]+$/.test(hash)) {
      return { valid: false, confidence: 0 };
    }

    return { valid: true, confidence: 0.95, normalized: hash };
  }

  /**
   * Validate CVE identifier
   */
  private validateCVE(cve: string): { valid: boolean; confidence: number; normalized?: string; metadata?: any } {
    const match = cve.toUpperCase().match(/CVE-(\d{4})-(\d{4,})/);
    if (!match) return { valid: false, confidence: 0 };

    const year = parseInt(match[1], 10);
    const currentYear = new Date().getFullYear();

    let confidence = 0.99;
    if (year < 1999 || year > currentYear + 1) {
      confidence = 0.6;
    }

    return {
      valid: true,
      confidence,
      normalized: cve.toUpperCase(),
      metadata: { year, id: match[2] }
    };
  }

  /**
   * Extract context around IoC
   */
  private extractContext(text: string, position: number, length: number, window: number): string {
    const start = Math.max(0, position - window);
    const end = Math.min(text.length, position + length + window);
    return text.substring(start, end).trim();
  }

  /**
   * Refang defanged IoCs
   */
  private refangText(text: string): string {
    return text
      .replace(/\[:\]/g, ':')
      .replace(/\[\.\]/g, '.')
      .replace(/hxxp/gi, 'http')
      .replace(/hXXp/gi, 'http')
      .replace(/meow/gi, 'com')
      .replace(/\[dot\]/gi, '.')
      .replace(/\[at\]/gi, '@')
      .replace(/\s+dot\s+/gi, '.')
      .replace(/\s+at\s+/gi, '@');
  }

  /**
   * Check if text contains defanged IoCs
   */
  private isDefanged(text: string): boolean {
    const defangPatterns = [/\[:\]/, /\[\.\]/, /hxxp/i, /\[dot\]/i, /\[at\]/i];
    return defangPatterns.some(pattern => pattern.test(text));
  }

  /**
   * Deduplicate IoCs
   */
  private deduplicateIoCs(iocs: IoC[]): IoC[] {
    const seen = new Map<string, IoC>();

    for (const ioc of iocs) {
      const key = `${ioc.type}:${ioc.value}`;
      const existing = seen.get(key);

      if (!existing || ioc.confidence > existing.confidence) {
        seen.set(key, ioc);
      }
    }

    return Array.from(seen.values());
  }

  /**
   * Generate extraction summary
   */
  private generateSummary(iocs: IoC[]): ExtractionResult['summary'] {
    const byType: Record<string, number> = {};
    let highConfidence = 0;

    for (const ioc of iocs) {
      byType[ioc.type] = (byType[ioc.type] || 0) + 1;
      if (ioc.confidence >= 0.8) highConfidence++;
    }

    return {
      total: iocs.length,
      byType,
      highConfidence
    };
  }

  /**
   * Check if IP is private
   */
  private isPrivateIP(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    return (
      parts[0] === 10 ||
      (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
      (parts[0] === 192 && parts[1] === 168) ||
      parts[0] === 127
    );
  }

  /**
   * Check if IP is reserved
   */
  private isReservedIP(ip: string): boolean {
    const parts = ip.split('.').map(Number);
    return (
      parts[0] === 0 ||
      parts[0] === 255 ||
      (parts[0] === 169 && parts[1] === 254) ||
      parts[0] >= 224
    );
  }

  /**
   * Build regex patterns for all IoC types
   */
  private buildPatterns(): Map<IoCType, RegExp> {
    return new Map<IoCType, RegExp>([
      ['ipv4', /\b(?:\d{1,3}\.){3}\d{1,3}\b/g],
      ['ipv6', /\b(?:[0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}\b|\b(?:[0-9a-fA-F]{1,4}:){1,7}:\b|\b::(?:[0-9a-fA-F]{1,4}:){0,6}[0-9a-fA-F]{1,4}\b/g],
      ['domain', /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g],
      ['url', /\b(?:https?|ftp|file):\/\/[-A-Za-z0-9+&@#\/%?=~_|!:,.;]*[-A-Za-z0-9+&@#\/%=~_|]/g],
      ['email', /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g],
      ['md5', /\b[a-fA-F0-9]{32}\b/g],
      ['sha1', /\b[a-fA-F0-9]{40}\b/g],
      ['sha256', /\b[a-fA-F0-9]{64}\b/g],
      ['sha512', /\b[a-fA-F0-9]{128}\b/g],
      ['cve', /CVE-\d{4}-\d{4,}/gi],
      ['cpe', /cpe:2\.3:[aho\*\-](?::[a-zA-Z0-9\._\-~%]*){10}/gi],
      ['file_path', /\b[a-zA-Z]:\\(?:[^\\\/:*?"<>|\r\n]+\\)*[^\\\/:*?"<>|\r\n]*\b/g],
      ['registry_key', /\b(?:HKEY_[A-Z_]+|HKLM|HKCU|HKCR|HKU|HKCC)\\[^\s]+/gi],
      ['mutex', /\b(?:Global|Local)\\[a-zA-Z0-9_\-]+\b/g],
      ['user_agent', /\b(?:Mozilla|Opera|Chrome|Safari|MSIE)\/[\d.]+[^\r\n]*/gi],
      ['bitcoin_address', /\b[13][a-km-zA-HJ-NP-Z1-9]{25,34}\b|bc1[a-z0-9]{39,59}\b/g],
      ['ethereum_address', /\b0x[a-fA-F0-9]{40}\b/g]
    ]);
  }

  /**
   * Enrich IoCs with threat intelligence
   */
  enrichIoCs(iocs: IoC[], threatIntel: Map<string, any>): IoC[] {
    return iocs.map(ioc => {
      const intel = threatIntel.get(ioc.value);
      if (intel) {
        return {
          ...ioc,
          confidence: Math.min(ioc.confidence + 0.1, 1.0),
          metadata: {
            ...ioc.metadata,
            ...intel
          }
        };
      }
      return ioc;
    });
  }
}
