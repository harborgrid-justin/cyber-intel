/**
 * Deduplication Algorithms
 *
 * Time Complexity: O(n) to O(n log n) depending on method
 * Space Complexity: O(n)
 *
 * Use Cases:
 * - Removing duplicate IOCs
 * - Deduplicating threat reports
 * - Merging similar alerts
 * - Data quality improvement
 */

export interface DeduplicationResult<T> {
  unique: T[];
  duplicates: T[][];
  duplicateCount: number;
  uniqueCount: number;
}

export interface SimilarityThreshold {
  exact?: boolean;
  similarity?: number; // 0-1
  fields?: string[];
}

export class Deduplication {
  /**
   * Exact deduplication using hash
   */
  exact<T>(
    items: T[],
    getKey: (item: T) => string
  ): DeduplicationResult<T> {
    const seen = new Map<string, T[]>();

    for (const item of items) {
      const key = getKey(item);
      if (!seen.has(key)) {
        seen.set(key, []);
      }
      seen.get(key)!.push(item);
    }

    const unique: T[] = [];
    const duplicates: T[][] = [];

    for (const group of seen.values()) {
      unique.push(group[0]);
      if (group.length > 1) {
        duplicates.push(group);
      }
    }

    return {
      unique,
      duplicates,
      duplicateCount: items.length - unique.length,
      uniqueCount: unique.length
    };
  }

  /**
   * Fuzzy deduplication based on similarity
   */
  fuzzy<T>(
    items: T[],
    getSimilarity: (a: T, b: T) => number,
    threshold: number = 0.9
  ): DeduplicationResult<T> {
    const unique: T[] = [];
    const duplicates: T[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < items.length; i++) {
      if (processed.has(i)) continue;

      const group: T[] = [items[i]];
      processed.add(i);

      for (let j = i + 1; j < items.length; j++) {
        if (processed.has(j)) continue;

        const similarity = getSimilarity(items[i], items[j]);
        if (similarity >= threshold) {
          group.push(items[j]);
          processed.add(j);
        }
      }

      unique.push(items[i]);
      if (group.length > 1) {
        duplicates.push(group);
      }
    }

    return {
      unique,
      duplicates,
      duplicateCount: items.length - unique.length,
      uniqueCount: unique.length
    };
  }

  /**
   * Bloom filter-based approximate deduplication
   */
  bloomFilter<T>(
    items: T[],
    getKey: (item: T) => string,
    falsePositiveRate: number = 0.01
  ): T[] {
    const n = items.length;
    const p = falsePositiveRate;
    const m = Math.ceil(-(n * Math.log(p)) / Math.pow(Math.log(2), 2));
    const k = Math.ceil((m / n) * Math.log(2));

    const bitArray = new Array(m).fill(false);
    const unique: T[] = [];

    for (const item of items) {
      const key = getKey(item);
      const hashes = this.getHashes(key, k, m);

      let exists = true;
      for (const hash of hashes) {
        if (!bitArray[hash]) {
          exists = false;
          bitArray[hash] = true;
        }
      }

      if (!exists) {
        unique.push(item);
      }
    }

    return unique;
  }

  /**
   * MinHash-based deduplication for sets
   */
  minHash<T>(
    items: T[],
    getTokens: (item: T) => Set<string>,
    numHashes: number = 128,
    threshold: number = 0.7
  ): DeduplicationResult<T> {
    const signatures = items.map(item => this.computeMinHashSignature(getTokens(item), numHashes));

    const unique: T[] = [];
    const duplicates: T[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < items.length; i++) {
      if (processed.has(i)) continue;

      const group: T[] = [items[i]];
      processed.add(i);

      for (let j = i + 1; j < items.length; j++) {
        if (processed.has(j)) continue;

        const similarity = this.jaccardFromMinHash(signatures[i], signatures[j]);
        if (similarity >= threshold) {
          group.push(items[j]);
          processed.add(j);
        }
      }

      unique.push(items[i]);
      if (group.length > 1) {
        duplicates.push(group);
      }
    }

    return {
      unique,
      duplicates,
      duplicateCount: items.length - unique.length,
      uniqueCount: unique.length
    };
  }

  /**
   * Locality Sensitive Hashing (LSH) for near-duplicate detection
   */
  lsh<T>(
    items: T[],
    getSignature: (item: T) => number[],
    bandSize: number = 4,
    threshold: number = 0.7
  ): DeduplicationResult<T> {
    const buckets = new Map<string, number[]>();

    // Hash items into buckets
    for (let i = 0; i < items.length; i++) {
      const signature = getSignature(items[i]);
      const numBands = Math.floor(signature.length / bandSize);

      for (let band = 0; band < numBands; band++) {
        const start = band * bandSize;
        const bandSignature = signature.slice(start, start + bandSize);
        const bucketKey = `${band}-${bandSignature.join(',')}`;

        if (!buckets.has(bucketKey)) {
          buckets.set(bucketKey, []);
        }
        buckets.get(bucketKey)!.push(i);
      }
    }

    // Find candidates and deduplicate
    const candidates = new Map<number, Set<number>>();
    for (const indices of buckets.values()) {
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          if (!candidates.has(indices[i])) {
            candidates.set(indices[i], new Set());
          }
          candidates.get(indices[i])!.add(indices[j]);
        }
      }
    }

    const unique: T[] = [];
    const duplicates: T[][] = [];
    const processed = new Set<number>();

    for (let i = 0; i < items.length; i++) {
      if (processed.has(i)) continue;

      const group: T[] = [items[i]];
      processed.add(i);

      const candidateSet = candidates.get(i) || new Set();
      for (const j of candidateSet) {
        if (processed.has(j)) continue;

        const sig1 = getSignature(items[i]);
        const sig2 = getSignature(items[j]);
        const similarity = this.cosineSimilarity(sig1, sig2);

        if (similarity >= threshold) {
          group.push(items[j]);
          processed.add(j);
        }
      }

      unique.push(items[i]);
      if (group.length > 1) {
        duplicates.push(group);
      }
    }

    return {
      unique,
      duplicates,
      duplicateCount: items.length - unique.length,
      uniqueCount: unique.length
    };
  }

  /**
   * Merge duplicates with conflict resolution
   */
  merge<T>(
    duplicateGroups: T[][],
    resolveFn: (group: T[]) => T
  ): T[] {
    return duplicateGroups.map(group => resolveFn(group));
  }

  // Helper methods

  private getHashes(key: string, k: number, m: number): number[] {
    const hashes: number[] = [];
    for (let i = 0; i < k; i++) {
      let hash = 0;
      for (let j = 0; j < key.length; j++) {
        hash = (hash * 31 + key.charCodeAt(j) + i) % m;
      }
      hashes.push(Math.abs(hash));
    }
    return hashes;
  }

  private computeMinHashSignature(tokens: Set<string>, numHashes: number): number[] {
    const signature = new Array(numHashes).fill(Infinity);
    const tokenArray = Array.from(tokens);

    for (let i = 0; i < numHashes; i++) {
      for (const token of tokenArray) {
        const hash = this.hashString(token, i);
        signature[i] = Math.min(signature[i], hash);
      }
    }

    return signature;
  }

  private jaccardFromMinHash(sig1: number[], sig2: number[]): number {
    let matches = 0;
    for (let i = 0; i < sig1.length; i++) {
      if (sig1[i] === sig2[i]) matches++;
    }
    return matches / sig1.length;
  }

  private hashString(str: string, seed: number): number {
    let hash = seed;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash);
  }

  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    let dot = 0;
    let mag1 = 0;
    let mag2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dot += vec1[i] * vec2[i];
      mag1 += vec1[i] * vec1[i];
      mag2 += vec2[i] * vec2[i];
    }

    return mag1 === 0 || mag2 === 0 ? 0 : dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }
}
