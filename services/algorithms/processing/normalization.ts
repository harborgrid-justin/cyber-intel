/**
 * Data Normalization Utilities
 *
 * Time Complexity: O(n) for most operations
 * Space Complexity: O(n)
 *
 * Use Cases:
 * - Normalizing IOC formats
 * - Feature scaling for ML
 * - Data standardization
 * - Score normalization
 */

export interface NormalizationResult {
  normalized: number[];
  min: number;
  max: number;
  mean?: number;
  stddev?: number;
}

export class Normalization {
  /**
   * Min-Max normalization to [0, 1]
   */
  minMax(values: number[], targetMin: number = 0, targetMax: number = 1): NormalizationResult {
    const min = Math.min(...values);
    const max = Math.max(...values);
    const range = max - min;

    const normalized = values.map(v =>
      range === 0 ? targetMin : targetMin + ((v - min) / range) * (targetMax - targetMin)
    );

    return { normalized, min, max };
  }

  /**
   * Z-score normalization (standardization)
   */
  zScore(values: number[]): NormalizationResult {
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((acc, v) => acc + Math.pow(v - mean, 2), 0) / values.length;
    const stddev = Math.sqrt(variance);

    const normalized = values.map(v => stddev === 0 ? 0 : (v - mean) / stddev);

    return {
      normalized,
      min: Math.min(...values),
      max: Math.max(...values),
      mean,
      stddev
    };
  }

  /**
   * Robust scaling using IQR
   */
  robustScaling(values: number[]): NormalizationResult {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = sorted[Math.floor(sorted.length * 0.25)];
    const q3 = sorted[Math.floor(sorted.length * 0.75)];
    const iqr = q3 - q1;
    const median = sorted[Math.floor(sorted.length * 0.5)];

    const normalized = values.map(v => iqr === 0 ? 0 : (v - median) / iqr);

    return {
      normalized,
      min: Math.min(...values),
      max: Math.max(...values)
    };
  }

  /**
   * Log normalization
   */
  log(values: number[], base: number = Math.E): number[] {
    return values.map(v => v > 0 ? Math.log(v) / Math.log(base) : 0);
  }

  /**
   * Decimal scaling
   */
  decimalScaling(values: number[]): number[] {
    const maxAbs = Math.max(...values.map(Math.abs));
    const digits = maxAbs > 0 ? Math.ceil(Math.log10(maxAbs)) : 0;
    const divisor = Math.pow(10, digits);

    return values.map(v => v / divisor);
  }

  /**
   * Normalize IP address to numeric value
   */
  normalizeIP(ip: string): number {
    const parts = ip.split('.').map(Number);
    return parts[0] * 16777216 + parts[1] * 65536 + parts[2] * 256 + parts[3];
  }

  /**
   * Normalize domain name
   */
  normalizeDomain(domain: string): string {
    return domain.toLowerCase().replace(/^www\./, '').trim();
  }

  /**
   * Normalize hash (uppercase, remove special chars)
   */
  normalizeHash(hash: string): string {
    return hash.toUpperCase().replace(/[^A-F0-9]/g, '');
  }

  /**
   * Normalize email
   */
  normalizeEmail(email: string): string {
    const [local, domain] = email.toLowerCase().split('@');
    return `${local.replace(/\./g, '')}@${domain}`;
  }

  /**
   * Normalize URL
   */
  normalizeURL(url: string): string {
    try {
      const parsed = new URL(url.toLowerCase());
      return `${parsed.protocol}//${parsed.hostname}${parsed.pathname}${parsed.search}`;
    } catch {
      return url.toLowerCase();
    }
  }

  /**
   * Normalize CVE ID
   */
  normalizeCVE(cve: string): string {
    const match = cve.match(/CVE-(\d{4})-(\d+)/i);
    return match ? `CVE-${match[1]}-${match[2].padStart(4, '0')}` : cve;
  }
}
