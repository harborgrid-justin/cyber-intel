/**
 * Text Similarity Algorithms
 *
 * Time Complexity: O(n) for most methods
 * Space Complexity: O(n)
 *
 * Use Cases:
 * - Finding similar threat reports
 * - Duplicate detection
 * - Content-based recommendation
 * - Plagiarism detection
 */

export interface SimilarityScore {
  method: string;
  score: number;
  metadata?: any;
}

export class Similarity {
  /**
   * Jaccard Similarity - intersection over union
   */
  jaccard(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Jaccard similarity for text
   */
  jaccardText(text1: string, text2: string): number {
    const words1 = new Set(text1.toLowerCase().match(/\b[\w]+\b/g) || []);
    const words2 = new Set(text2.toLowerCase().match(/\b[\w]+\b/g) || []);

    return this.jaccard(words1, words2);
  }

  /**
   * Cosine Similarity for vectors
   */
  cosine(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have same length');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Cosine similarity for text using word frequency vectors
   */
  cosineText(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().match(/\b[\w]+\b/g) || [];
    const words2 = text2.toLowerCase().match(/\b[\w]+\b/g) || [];

    const vocab = new Set([...words1, ...words2]);
    const vec1 = this.createFrequencyVector(words1, vocab);
    const vec2 = this.createFrequencyVector(words2, vocab);

    return this.cosine(vec1, vec2);
  }

  /**
   * Dice Coefficient (Sørensen–Dice)
   */
  dice(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    return (2 * intersection.size) / (set1.size + set2.size);
  }

  /**
   * Overlap Coefficient
   */
  overlap(set1: Set<string>, set2: Set<string>): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const minSize = Math.min(set1.size, set2.size);

    return minSize === 0 ? 0 : intersection.size / minSize;
  }

  /**
   * Euclidean Distance
   */
  euclidean(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have same length');
    }

    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      sum += Math.pow(vec1[i] - vec2[i], 2);
    }

    return Math.sqrt(sum);
  }

  /**
   * Manhattan Distance (L1 distance)
   */
  manhattan(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have same length');
    }

    let sum = 0;
    for (let i = 0; i < vec1.length; i++) {
      sum += Math.abs(vec1[i] - vec2[i]);
    }

    return sum;
  }

  /**
   * Pearson Correlation Coefficient
   */
  pearson(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have same length');
    }

    const n = vec1.length;
    const mean1 = vec1.reduce((a, b) => a + b, 0) / n;
    const mean2 = vec2.reduce((a, b) => a + b, 0) / n;

    let numerator = 0;
    let sum1 = 0;
    let sum2 = 0;

    for (let i = 0; i < n; i++) {
      const diff1 = vec1[i] - mean1;
      const diff2 = vec2[i] - mean2;
      numerator += diff1 * diff2;
      sum1 += diff1 * diff1;
      sum2 += diff2 * diff2;
    }

    const denominator = Math.sqrt(sum1 * sum2);
    return denominator === 0 ? 0 : numerator / denominator;
  }

  /**
   * Tversky Index - asymmetric similarity measure
   */
  tversky(set1: Set<string>, set2: Set<string>, alpha: number = 0.5, beta: number = 0.5): number {
    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const diff1 = new Set([...set1].filter(x => !set2.has(x)));
    const diff2 = new Set([...set2].filter(x => !set1.has(x)));

    const denominator = intersection.size + alpha * diff1.size + beta * diff2.size;
    return denominator === 0 ? 0 : intersection.size / denominator;
  }

  /**
   * Semantic similarity using word overlap and position
   */
  semantic(text1: string, text2: string): number {
    const words1 = text1.toLowerCase().match(/\b[\w]+\b/g) || [];
    const words2 = text2.toLowerCase().match(/\b[\w]+\b/g) || [];

    // Word order matters - compare sequences
    let matches = 0;
    const minLen = Math.min(words1.length, words2.length);

    for (let i = 0; i < minLen; i++) {
      if (words1[i] === words2[i]) {
        matches += 2; // Exact position match
      } else if (words2.includes(words1[i])) {
        matches += 1; // Word exists but different position
      }
    }

    const maxScore = Math.max(words1.length, words2.length) * 2;
    return maxScore === 0 ? 0 : matches / maxScore;
  }

  /**
   * Calculate multiple similarity scores
   */
  multiSimilarity(text1: string, text2: string): SimilarityScore[] {
    return [
      { method: 'jaccard', score: this.jaccardText(text1, text2) },
      { method: 'cosine', score: this.cosineText(text1, text2) },
      { method: 'semantic', score: this.semantic(text1, text2) }
    ];
  }

  /**
   * Find most similar items
   */
  findMostSimilar<T>(
    query: T,
    candidates: T[],
    getText: (item: T) => string,
    method: 'jaccard' | 'cosine' | 'semantic' = 'cosine',
    topK: number = 5
  ): Array<{ item: T; score: number }> {
    const queryText = getText(query);
    const scores: Array<{ item: T; score: number }> = [];

    for (const candidate of candidates) {
      const candidateText = getText(candidate);
      let score: number;

      switch (method) {
        case 'jaccard':
          score = this.jaccardText(queryText, candidateText);
          break;
        case 'semantic':
          score = this.semantic(queryText, candidateText);
          break;
        case 'cosine':
        default:
          score = this.cosineText(queryText, candidateText);
          break;
      }

      scores.push({ item: candidate, score });
    }

    scores.sort((a, b) => b.score - a.score);
    return scores.slice(0, topK);
  }

  private createFrequencyVector(words: string[], vocab: Set<string>): number[] {
    const freqMap = new Map<string, number>();
    for (const word of words) {
      freqMap.set(word, (freqMap.get(word) || 0) + 1);
    }

    return Array.from(vocab).map(word => freqMap.get(word) || 0);
  }
}
