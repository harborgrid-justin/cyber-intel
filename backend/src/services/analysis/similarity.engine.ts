
import { Threat } from '../../models/intelligence';

interface SimilarityScore {
  threat1: Threat;
  threat2: Threat;
  overall_similarity: number;
  similarity_breakdown: {
    indicator: number;
    behavioral: number;
    temporal: number;
    contextual: number;
  };
  shared_attributes: string[];
  confidence: number;
}

interface IOCSimilarity {
  ioc1: string;
  ioc2: string;
  similarity: number;
  type: string;
  method: 'EXACT' | 'FUZZY' | 'PATTERN' | 'SEMANTIC';
}

export class SimilarityEngine {
  /**
   * Calculate similarity between two threats
   */
  static calculateThreatSimilarity(threat1: Threat, threat2: Threat): SimilarityScore {
    // Calculate different dimensions of similarity
    const indicatorSim = this.indicatorSimilarity(threat1.indicator, threat2.indicator, threat1.type);
    const behavioralSim = this.behavioralSimilarity(threat1, threat2);
    const temporalSim = this.temporalSimilarity(threat1.lastSeen, threat2.lastSeen);
    const contextualSim = this.contextualSimilarity(threat1, threat2);

    // Weighted average
    const weights = { indicator: 0.35, behavioral: 0.30, temporal: 0.15, contextual: 0.20 };
    const overall_similarity =
      indicatorSim * weights.indicator +
      behavioralSim * weights.behavioral +
      temporalSim * weights.temporal +
      contextualSim * weights.contextual;

    // Identify shared attributes
    const shared_attributes = this.identifySharedAttributes(threat1, threat2);

    // Calculate confidence based on data completeness
    const confidence = this.calculateConfidence(threat1, threat2);

    return {
      threat1,
      threat2,
      overall_similarity,
      similarity_breakdown: {
        indicator: indicatorSim,
        behavioral: behavioralSim,
        temporal: temporalSim,
        contextual: contextualSim
      },
      shared_attributes,
      confidence
    };
  }

  /**
   * Find similar threats in a dataset
   */
  static async findSimilarThreats(
    target: Threat,
    candidates: Threat[],
    threshold: number = 0.7
  ): Promise<SimilarityScore[]> {
    const similarities: SimilarityScore[] = [];

    candidates.forEach(candidate => {
      if (candidate.id !== target.id) {
        const score = this.calculateThreatSimilarity(target, candidate);
        if (score.overall_similarity >= threshold) {
          similarities.push(score);
        }
      }
    });

    return similarities.sort((a, b) => b.overall_similarity - a.overall_similarity);
  }

  /**
   * IOC similarity scoring with multiple methods
   */
  static calculateIOCSimilarity(
    ioc1: string,
    ioc2: string,
    type: string
  ): IOCSimilarity {
    let similarity: number;
    let method: 'EXACT' | 'FUZZY' | 'PATTERN' | 'SEMANTIC';

    // Exact match
    if (ioc1.toLowerCase() === ioc2.toLowerCase()) {
      similarity = 1.0;
      method = 'EXACT';
    }
    // Type-specific similarity
    else if (type.toLowerCase().includes('ip')) {
      similarity = this.ipSimilarity(ioc1, ioc2);
      method = 'PATTERN';
    }
    else if (type.toLowerCase().includes('domain')) {
      similarity = this.domainSimilarity(ioc1, ioc2);
      method = 'PATTERN';
    }
    else if (type.toLowerCase().includes('hash')) {
      similarity = this.hashSimilarity(ioc1, ioc2);
      method = 'FUZZY';
    }
    else if (type.toLowerCase().includes('email')) {
      similarity = this.emailSimilarity(ioc1, ioc2);
      method = 'PATTERN';
    }
    else {
      // Generic string similarity
      similarity = this.levenshteinSimilarity(ioc1, ioc2);
      method = 'FUZZY';
    }

    return { ioc1, ioc2, similarity, type, method };
  }

  /**
   * Batch similarity calculation with matrix output
   */
  static async calculateSimilarityMatrix(
    threats: Threat[]
  ): Promise<number[][]> {
    const n = threats.length;
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      matrix[i][i] = 1.0; // Self-similarity is always 1

      for (let j = i + 1; j < n; j++) {
        const score = this.calculateThreatSimilarity(threats[i], threats[j]);
        matrix[i][j] = score.overall_similarity;
        matrix[j][i] = score.overall_similarity; // Symmetric
      }
    }

    return matrix;
  }

  /**
   * Find duplicate or near-duplicate threats
   */
  static async findDuplicates(
    threats: Threat[],
    duplicateThreshold: number = 0.95
  ): Promise<Array<{ original: Threat; duplicates: Threat[]; similarity: number }>> {
    const duplicateGroups: Array<{ original: Threat; duplicates: Threat[]; similarity: number }> = [];
    const processed = new Set<string>();

    threats.forEach(threat1 => {
      if (processed.has(threat1.id)) return;

      const duplicates: Threat[] = [];

      threats.forEach(threat2 => {
        if (threat1.id !== threat2.id && !processed.has(threat2.id)) {
          const score = this.calculateThreatSimilarity(threat1, threat2);

          if (score.overall_similarity >= duplicateThreshold) {
            duplicates.push(threat2);
            processed.add(threat2.id);
          }
        }
      });

      if (duplicates.length > 0) {
        duplicateGroups.push({
          original: threat1,
          duplicates,
          similarity: duplicateThreshold
        });
        processed.add(threat1.id);
      }
    });

    return duplicateGroups;
  }

  /**
   * Semantic similarity using context and descriptions
   */
  static calculateSemanticSimilarity(text1: string, text2: string): number {
    // Simplified semantic similarity using word overlap
    const words1 = new Set(text1.toLowerCase().split(/\s+/));
    const words2 = new Set(text2.toLowerCase().split(/\s+/));

    const intersection = new Set([...words1].filter(w => words2.has(w)));
    const union = new Set([...words1, ...words2]);

    // Jaccard similarity
    return intersection.size / union.size;
  }

  /**
   * TTP-based similarity for threat actor attribution
   */
  static calculateTTPSimilarity(ttps1: string[], ttps2: string[]): number {
    if (ttps1.length === 0 || ttps2.length === 0) return 0;

    const set1 = new Set(ttps1.map(t => t.toLowerCase()));
    const set2 = new Set(ttps2.map(t => t.toLowerCase()));

    const intersection = new Set([...set1].filter(t => set2.has(t)));
    const union = new Set([...set1, ...set2]);

    return intersection.size / union.size;
  }

  /**
   * Network-based IOC similarity (IP ranges, domains)
   */
  static calculateNetworkSimilarity(
    iocs1: string[],
    iocs2: string[],
    type: 'IP' | 'DOMAIN'
  ): number {
    let totalSimilarity = 0;
    let comparisons = 0;

    iocs1.forEach(ioc1 => {
      iocs2.forEach(ioc2 => {
        if (type === 'IP') {
          totalSimilarity += this.ipSimilarity(ioc1, ioc2);
        } else {
          totalSimilarity += this.domainSimilarity(ioc1, ioc2);
        }
        comparisons++;
      });
    });

    return comparisons > 0 ? totalSimilarity / comparisons : 0;
  }

  // Indicator similarity methods
  private static indicatorSimilarity(ioc1: string, ioc2: string, type: string): number {
    return this.calculateIOCSimilarity(ioc1, ioc2, type).similarity;
  }

  private static ipSimilarity(ip1: string, ip2: string): number {
    // Check if IPs are in same subnet
    const octets1 = ip1.split('.').map(Number);
    const octets2 = ip2.split('.').map(Number);

    if (octets1.length !== 4 || octets2.length !== 4) return 0;

    let matches = 0;
    for (let i = 0; i < 4; i++) {
      if (octets1[i] === octets2[i]) {
        matches++;
      } else {
        break; // Stop at first difference
      }
    }

    // /24 subnet match = 0.75, /16 = 0.5, /8 = 0.25
    return matches / 4;
  }

  private static domainSimilarity(domain1: string, domain2: string): number {
    const parts1 = domain1.toLowerCase().split('.').reverse();
    const parts2 = domain2.toLowerCase().split('.').reverse();

    // Compare from TLD backwards
    let matches = 0;
    const minLength = Math.min(parts1.length, parts2.length);

    for (let i = 0; i < minLength; i++) {
      if (parts1[i] === parts2[i]) {
        matches++;
      } else {
        // Check fuzzy match for subdomain variations
        const fuzzy = this.levenshteinSimilarity(parts1[i], parts2[i]);
        if (fuzzy > 0.8) {
          matches += fuzzy;
        }
        break;
      }
    }

    return matches / Math.max(parts1.length, parts2.length);
  }

  private static hashSimilarity(hash1: string, hash2: string): number {
    // Hashes are either identical or completely different
    // But we can check for fuzzy hash similarity (ssdeep-like)
    if (hash1 === hash2) return 1.0;

    // For demonstration, use partial match
    if (hash1.length !== hash2.length) return 0;

    let matches = 0;
    for (let i = 0; i < hash1.length; i++) {
      if (hash1[i] === hash2[i]) matches++;
    }

    return matches / hash1.length;
  }

  private static emailSimilarity(email1: string, email2: string): number {
    const [local1, domain1] = email1.toLowerCase().split('@');
    const [local2, domain2] = email2.toLowerCase().split('@');

    if (!domain1 || !domain2) return 0;

    // Domain match is more important
    const domainSim = this.domainSimilarity(domain1, domain2);
    const localSim = this.levenshteinSimilarity(local1, local2);

    return domainSim * 0.7 + localSim * 0.3;
  }

  // Behavioral similarity
  private static behavioralSimilarity(threat1: Threat, threat2: Threat): number {
    let similarity = 0;
    let factors = 0;

    // Type match
    if (threat1.type === threat2.type) {
      similarity += 1.0;
    } else {
      // Partial match for related types
      similarity += this.typeRelatednesss(threat1.type, threat2.type);
    }
    factors++;

    // Severity match
    if (threat1.severity === threat2.severity) {
      similarity += 1.0;
    } else {
      similarity += 1 - Math.abs(
        this.severityToNumeric(threat1.severity) -
        this.severityToNumeric(threat2.severity)
      ) / 3;
    }
    factors++;

    // Source similarity
    similarity += this.levenshteinSimilarity(threat1.source, threat2.source);
    factors++;

    // Threat actor match
    if (threat1.threatActor && threat2.threatActor) {
      if (threat1.threatActor === threat2.threatActor) {
        similarity += 1.0;
      } else {
        similarity += this.levenshteinSimilarity(threat1.threatActor, threat2.threatActor);
      }
      factors++;
    }

    return similarity / factors;
  }

  // Temporal similarity
  private static temporalSimilarity(time1: string, time2: string): number {
    const date1 = new Date(time1).getTime();
    const date2 = new Date(time2).getTime();

    const diffHours = Math.abs(date1 - date2) / (1000 * 60 * 60);

    // Similarity decreases with time difference
    // Same day = 1.0, 1 week apart = 0.5, 1 month apart = 0.1
    if (diffHours < 24) return 1.0;
    if (diffHours < 168) return 0.9 - (diffHours / 168) * 0.4; // 1 week
    if (diffHours < 720) return 0.5 - (diffHours / 720) * 0.4; // 1 month
    return 0.1;
  }

  // Contextual similarity
  private static contextualSimilarity(threat1: Threat, threat2: Threat): number {
    let similarity = 0;
    let factors = 0;

    // Region match
    if (threat1.region && threat2.region) {
      similarity += threat1.region === threat2.region ? 1.0 : 0.0;
      factors++;
    }

    // Tags overlap
    if (threat1.tags && threat2.tags) {
      const tags1 = new Set(threat1.tags);
      const tags2 = new Set(threat2.tags);
      const intersection = new Set([...tags1].filter(t => tags2.has(t)));
      const union = new Set([...tags1, ...tags2]);
      similarity += intersection.size / union.size;
      factors++;
    }

    // Description similarity
    if (threat1.description && threat2.description) {
      similarity += this.calculateSemanticSimilarity(threat1.description, threat2.description);
      factors++;
    }

    // Confidence similarity
    const confDiff = Math.abs((threat1.confidence || 0) - (threat2.confidence || 0));
    similarity += 1 - (confDiff / 100);
    factors++;

    return factors > 0 ? similarity / factors : 0;
  }

  // Helper methods
  private static identifySharedAttributes(threat1: Threat, threat2: Threat): string[] {
    const shared: string[] = [];

    if (threat1.type === threat2.type) shared.push('Same type');
    if (threat1.severity === threat2.severity) shared.push('Same severity');
    if (threat1.source === threat2.source) shared.push('Same source');
    if (threat1.threatActor === threat2.threatActor) shared.push('Same threat actor');
    if (threat1.region === threat2.region) shared.push('Same region');

    // Check tag overlap
    if (threat1.tags && threat2.tags) {
      const commonTags = threat1.tags.filter(t => threat2.tags!.includes(t));
      if (commonTags.length > 0) {
        shared.push(`${commonTags.length} shared tags`);
      }
    }

    return shared;
  }

  private static calculateConfidence(threat1: Threat, threat2: Threat): number {
    // Confidence based on data completeness
    const completeness1 = this.dataCompleteness(threat1);
    const completeness2 = this.dataCompleteness(threat2);

    return (completeness1 + completeness2) / 2;
  }

  private static dataCompleteness(threat: Threat): number {
    const fields = [
      threat.indicator,
      threat.type,
      threat.severity,
      threat.source,
      threat.description,
      threat.threatActor,
      threat.region
    ];

    const filled = fields.filter(f => f && f !== '').length;
    return filled / fields.length;
  }

  private static levenshteinSimilarity(str1: string, str2: string): number {
    const distance = this.levenshteinDistance(str1.toLowerCase(), str2.toLowerCase());
    const maxLength = Math.max(str1.length, str2.length);

    return maxLength > 0 ? 1 - (distance / maxLength) : 1;
  }

  private static levenshteinDistance(str1: string, str2: string): number {
    const matrix: number[][] = [];

    for (let i = 0; i <= str2.length; i++) {
      matrix[i] = [i];
    }

    for (let j = 0; j <= str1.length; j++) {
      matrix[0][j] = j;
    }

    for (let i = 1; i <= str2.length; i++) {
      for (let j = 1; j <= str1.length; j++) {
        if (str2[i - 1] === str1[j - 1]) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1,
            matrix[i][j - 1] + 1,
            matrix[i - 1][j] + 1
          );
        }
      }
    }

    return matrix[str2.length][str1.length];
  }

  private static typeRelatednesss(type1: string, type2: string): number {
    // Define type relationships
    const related: Record<string, string[]> = {
      'IP': ['Domain', 'URL'],
      'Domain': ['IP', 'URL', 'Email'],
      'URL': ['IP', 'Domain'],
      'Email': ['Domain'],
      'Hash': ['File']
    };

    const type1Upper = type1.toUpperCase();
    const type2Upper = type2.toUpperCase();

    if (related[type1Upper]?.includes(type2)) return 0.5;
    if (related[type2Upper]?.includes(type1)) return 0.5;

    return 0;
  }

  private static severityToNumeric(severity: string): number {
    const map: Record<string, number> = {
      'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4
    };
    return map[severity?.toUpperCase()] || 2;
  }
}
