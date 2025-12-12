/**
 * TF-IDF (Term Frequency-Inverse Document Frequency)
 *
 * Time Complexity: O(n * m) where n is documents, m is avg terms
 * Space Complexity: O(n * m)
 *
 * Use Cases:
 * - Keyword extraction
 * - Document ranking
 * - Feature extraction for ML
 * - Information retrieval
 */

export interface TFIDFDocument {
  id: string;
  text: string;
  vector?: number[];
  metadata?: any;
}

export interface TFIDFScore {
  term: string;
  tf: number;
  idf: number;
  tfidf: number;
}

export interface SearchResult {
  docId: string;
  score: number;
  matches: string[];
  metadata?: any;
}

export class TFIDF {
  private documents: Map<string, TFIDFDocument> = new Map();
  private vocabulary: Set<string> = new Set();
  private idf: Map<string, number> = new Map();
  private docVectors: Map<string, Map<string, number>> = new Map();

  /**
   * Add documents to the corpus
   */
  addDocuments(docs: TFIDFDocument[]): void {
    for (const doc of docs) {
      this.documents.set(doc.id, doc);
      const terms = this.tokenize(doc.text);

      for (const term of terms) {
        this.vocabulary.add(term);
      }
    }

    this.calculateIDF();
    this.buildDocumentVectors();
  }

  /**
   * Calculate TF-IDF scores for a document
   */
  getDocumentScores(docId: string): TFIDFScore[] {
    const doc = this.documents.get(docId);
    if (!doc) return [];

    const terms = this.tokenize(doc.text);
    const tf = this.calculateTF(terms);
    const scores: TFIDFScore[] = [];

    for (const [term, tfScore] of tf.entries()) {
      const idfScore = this.idf.get(term) || 0;
      const tfidfScore = tfScore * idfScore;

      scores.push({
        term,
        tf: tfScore,
        idf: idfScore,
        tfidf: tfidfScore
      });
    }

    scores.sort((a, b) => b.tfidf - a.tfidf);
    return scores;
  }

  /**
   * Get top keywords from document
   */
  getKeywords(docId: string, topK: number = 10): string[] {
    const scores = this.getDocumentScores(docId);
    return scores.slice(0, topK).map(s => s.term);
  }

  /**
   * Search documents by query
   */
  search(query: string, topK: number = 10): SearchResult[] {
    const queryTerms = this.tokenize(query);
    const queryTF = this.calculateTF(queryTerms);

    // Build query vector
    const queryVector = new Map<string, number>();
    for (const [term, tf] of queryTF.entries()) {
      const idf = this.idf.get(term) || 0;
      queryVector.set(term, tf * idf);
    }

    // Calculate similarity with all documents
    const results: SearchResult[] = [];

    for (const [docId, docVector] of this.docVectors.entries()) {
      const score = this.cosineSimilarity(queryVector, docVector);
      const matches = queryTerms.filter(term => docVector.has(term));

      if (score > 0) {
        results.push({
          docId,
          score,
          matches,
          metadata: this.documents.get(docId)?.metadata
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Find similar documents
   */
  findSimilar(docId: string, topK: number = 5): SearchResult[] {
    const docVector = this.docVectors.get(docId);
    if (!docVector) return [];

    const results: SearchResult[] = [];

    for (const [otherDocId, otherVector] of this.docVectors.entries()) {
      if (otherDocId === docId) continue;

      const score = this.cosineSimilarity(docVector, otherVector);

      if (score > 0) {
        results.push({
          docId: otherDocId,
          score,
          matches: [],
          metadata: this.documents.get(otherDocId)?.metadata
        });
      }
    }

    results.sort((a, b) => b.score - a.score);
    return results.slice(0, topK);
  }

  /**
   * Build TF-IDF matrix
   */
  getMatrix(): { docIds: string[]; terms: string[]; matrix: number[][] } {
    const docIds = Array.from(this.documents.keys());
    const terms = Array.from(this.vocabulary);
    const matrix: number[][] = [];

    for (const docId of docIds) {
      const row: number[] = [];
      const docVector = this.docVectors.get(docId) || new Map();

      for (const term of terms) {
        row.push(docVector.get(term) || 0);
      }

      matrix.push(row);
    }

    return { docIds, terms, matrix };
  }

  /**
   * Calculate term frequency
   */
  private calculateTF(terms: string[]): Map<string, number> {
    const tf = new Map<string, number>();
    const total = terms.length;

    for (const term of terms) {
      tf.set(term, (tf.get(term) || 0) + 1);
    }

    // Normalize by total terms
    for (const [term, count] of tf.entries()) {
      tf.set(term, count / total);
    }

    return tf;
  }

  /**
   * Calculate inverse document frequency
   */
  private calculateIDF(): void {
    const numDocs = this.documents.size;

    for (const term of this.vocabulary) {
      let docCount = 0;

      for (const doc of this.documents.values()) {
        const terms = new Set(this.tokenize(doc.text));
        if (terms.has(term)) {
          docCount++;
        }
      }

      // IDF = log(N / (1 + df))
      const idfScore = Math.log(numDocs / (1 + docCount));
      this.idf.set(term, idfScore);
    }
  }

  /**
   * Build TF-IDF vectors for all documents
   */
  private buildDocumentVectors(): void {
    for (const [docId, doc] of this.documents.entries()) {
      const terms = this.tokenize(doc.text);
      const tf = this.calculateTF(terms);
      const vector = new Map<string, number>();

      for (const [term, tfScore] of tf.entries()) {
        const idfScore = this.idf.get(term) || 0;
        vector.set(term, tfScore * idfScore);
      }

      this.docVectors.set(docId, vector);
    }
  }

  /**
   * Cosine similarity between sparse vectors
   */
  private cosineSimilarity(
    vec1: Map<string, number>,
    vec2: Map<string, number>
  ): number {
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    // Calculate magnitudes and dot product
    for (const [term, value1] of vec1.entries()) {
      magnitude1 += value1 * value1;
      const value2 = vec2.get(term) || 0;
      dotProduct += value1 * value2;
    }

    for (const value of vec2.values()) {
      magnitude2 += value * value;
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
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
}
