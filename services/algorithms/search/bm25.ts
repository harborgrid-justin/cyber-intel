/**
 * BM25 (Best Matching 25) Ranking Function
 *
 * Time Complexity: O(n * m) where n is documents, m is query terms
 * Space Complexity: O(n * v) where v is vocabulary size
 *
 * Use Cases:
 * - Advanced document ranking
 * - Search engine implementation
 * - Threat intelligence retrieval
 * - Relevance scoring
 */

export interface BM25Document {
  id: string;
  text: string;
  tokens?: string[];
  metadata?: any;
}

export interface BM25SearchResult {
  docId: string;
  score: number;
  matches: Map<string, number>;
  metadata?: any;
}

export class BM25 {
  private documents: Map<string, BM25Document> = new Map();
  private docLengths: Map<string, number> = new Map();
  private avgDocLength: number = 0;
  private termFreqs: Map<string, Map<string, number>> = new Map();
  private docFreqs: Map<string, number> = new Map();

  // BM25 parameters
  private k1: number = 1.5; // Term frequency saturation
  private b: number = 0.75; // Length normalization

  constructor(k1: number = 1.5, b: number = 0.75) {
    this.k1 = k1;
    this.b = b;
  }

  /**
   * Index documents
   */
  addDocuments(docs: BM25Document[]): void {
    let totalLength = 0;

    for (const doc of docs) {
      const tokens = this.tokenize(doc.text);
      doc.tokens = tokens;

      this.documents.set(doc.id, doc);
      this.docLengths.set(doc.id, tokens.length);
      totalLength += tokens.length;

      // Calculate term frequencies for this document
      const termFreq = new Map<string, number>();
      for (const token of tokens) {
        termFreq.set(token, (termFreq.get(token) || 0) + 1);

        // Update document frequency
        if (!this.docFreqs.has(token)) {
          this.docFreqs.set(token, 0);
        }
      }

      // Update document frequencies
      const uniqueTerms = new Set(tokens);
      for (const term of uniqueTerms) {
        this.docFreqs.set(term, (this.docFreqs.get(term) || 0) + 1);
      }

      this.termFreqs.set(doc.id, termFreq);
    }

    this.avgDocLength = this.documents.size > 0 ? totalLength / this.documents.size : 0;
  }

  /**
   * Search documents using BM25
   */
  search(query: string, topK: number = 10): BM25SearchResult[] {
    const queryTokens = this.tokenize(query);
    const results: BM25SearchResult[] = [];

    for (const [docId, doc] of this.documents.entries()) {
      const score = this.calculateScore(queryTokens, docId);
      const matches = this.getMatches(queryTokens, docId);

      if (score > 0) {
        results.push({
          docId,
          score,
          matches,
          metadata: doc.metadata
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Calculate BM25 score for a document
   */
  private calculateScore(queryTokens: string[], docId: string): number {
    const docLength = this.docLengths.get(docId) || 0;
    const termFreq = this.termFreqs.get(docId) || new Map();
    let score = 0;

    for (const term of queryTokens) {
      const tf = termFreq.get(term) || 0;
      const df = this.docFreqs.get(term) || 0;

      if (tf > 0) {
        const idf = this.calculateIDF(df);
        const numerator = tf * (this.k1 + 1);
        const denominator =
          tf + this.k1 * (1 - this.b + this.b * (docLength / this.avgDocLength));

        score += idf * (numerator / denominator);
      }
    }

    return score;
  }

  /**
   * Calculate IDF component
   */
  private calculateIDF(df: number): number {
    const N = this.documents.size;
    return Math.log((N - df + 0.5) / (df + 0.5) + 1);
  }

  /**
   * Get matching terms and their frequencies
   */
  private getMatches(queryTokens: string[], docId: string): Map<string, number> {
    const termFreq = this.termFreqs.get(docId) || new Map();
    const matches = new Map<string, number>();

    for (const term of queryTokens) {
      const freq = termFreq.get(term);
      if (freq) {
        matches.set(term, freq);
      }
    }

    return matches;
  }

  /**
   * Find documents with exact phrase
   */
  phraseSearch(phrase: string, topK: number = 10): BM25SearchResult[] {
    const phraseTokens = this.tokenize(phrase);
    const results: BM25SearchResult[] = [];

    for (const [docId, doc] of this.documents.entries()) {
      const tokens = doc.tokens || [];

      // Check for phrase occurrence
      let occurrences = 0;
      for (let i = 0; i <= tokens.length - phraseTokens.length; i++) {
        let match = true;
        for (let j = 0; j < phraseTokens.length; j++) {
          if (tokens[i + j] !== phraseTokens[j]) {
            match = false;
            break;
          }
        }
        if (match) occurrences++;
      }

      if (occurrences > 0) {
        const baseScore = this.calculateScore(phraseTokens, docId);
        const phraseBoost = occurrences * 2; // Boost for phrase matches
        const score = baseScore * phraseBoost;

        results.push({
          docId,
          score,
          matches: new Map([['__phrase__', occurrences]]),
          metadata: doc.metadata
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Boolean search with AND/OR/NOT
   */
  booleanSearch(
    mustHave: string[] = [],
    shouldHave: string[] = [],
    mustNotHave: string[] = [],
    topK: number = 10
  ): BM25SearchResult[] {
    const results: BM25SearchResult[] = [];

    const mustTokens = mustHave.flatMap(q => this.tokenize(q));
    const shouldTokens = shouldHave.flatMap(q => this.tokenize(q));
    const notTokens = mustNotHave.flatMap(q => this.tokenize(q));

    for (const [docId, doc] of this.documents.entries()) {
      const docTokenSet = new Set(doc.tokens || []);

      // Check MUST conditions
      const hasMust = mustTokens.every(token => docTokenSet.has(token));
      if (!hasMust && mustTokens.length > 0) continue;

      // Check MUST NOT conditions
      const hasNot = notTokens.some(token => docTokenSet.has(token));
      if (hasNot) continue;

      // Calculate score
      let score = 0;

      // Score MUST terms higher
      if (mustTokens.length > 0) {
        score += this.calculateScore(mustTokens, docId) * 2;
      }

      // Score SHOULD terms normally
      if (shouldTokens.length > 0) {
        score += this.calculateScore(shouldTokens, docId);
      }

      if (score > 0) {
        const matches = this.getMatches([...mustTokens, ...shouldTokens], docId);
        results.push({
          docId,
          score,
          matches,
          metadata: doc.metadata
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Get document statistics
   */
  getStats(): {
    numDocuments: number;
    avgDocLength: number;
    vocabularySize: number;
    totalTerms: number;
  } {
    return {
      numDocuments: this.documents.size,
      avgDocLength: this.avgDocLength,
      vocabularySize: this.docFreqs.size,
      totalTerms: Array.from(this.docLengths.values()).reduce((a, b) => a + b, 0)
    };
  }

  /**
   * Get term statistics
   */
  getTermStats(term: string): {
    documentFrequency: number;
    idf: number;
    totalOccurrences: number;
  } {
    const normalizedTerm = term.toLowerCase();
    const df = this.docFreqs.get(normalizedTerm) || 0;
    const idf = this.calculateIDF(df);

    let totalOccurrences = 0;
    for (const termFreq of this.termFreqs.values()) {
      totalOccurrences += termFreq.get(normalizedTerm) || 0;
    }

    return {
      documentFrequency: df,
      idf,
      totalOccurrences
    };
  }

  /**
   * Tokenize text
   */
  private tokenize(text: string): string[] {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, ' ')
      .match(/\b[\w]+\b/g) || [];
  }

  /**
   * Update BM25 parameters
   */
  setParameters(k1: number, b: number): void {
    this.k1 = k1;
    this.b = b;
  }
}
