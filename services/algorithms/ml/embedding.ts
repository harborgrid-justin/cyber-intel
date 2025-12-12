/**
 * Text Embedding and Similarity Algorithms
 *
 * Time Complexity:
 * - Word2Vec Skip-gram: O(n * d * w) where w is window size
 * - Doc2Vec: O(n * d)
 * - Embedding similarity: O(d)
 *
 * Use Cases:
 * - Finding similar threat reports
 * - Clustering security advisories
 * - Semantic search for IOCs
 * - Threat intelligence recommendation
 */

export interface Embedding {
  vector: number[];
  dimension: number;
  metadata?: any;
}

export interface SimilarityResult {
  id: string;
  similarity: number;
  embedding?: Embedding;
}

export class TextEmbedding {
  private vocabulary: Map<string, number> = new Map();
  private embeddings: Map<string, number[]> = new Map();
  private dimension: number;

  constructor(dimension: number = 100) {
    this.dimension = dimension;
  }

  /**
   * Train Word2Vec Skip-gram model (simplified)
   */
  trainWord2Vec(
    corpus: string[],
    windowSize: number = 5,
    learningRate: number = 0.025,
    epochs: number = 5
  ): void {
    // Build vocabulary
    const wordFreq = new Map<string, number>();
    const allWords: string[] = [];

    for (const text of corpus) {
      const words = text.toLowerCase().match(/\b[\w]+\b/g) || [];
      for (const word of words) {
        wordFreq.set(word, (wordFreq.get(word) || 0) + 1);
        allWords.push(word);
      }
    }

    // Filter vocabulary (min frequency = 2)
    let idx = 0;
    for (const [word, freq] of wordFreq.entries()) {
      if (freq >= 2) {
        this.vocabulary.set(word, idx++);
      }
    }

    // Initialize embeddings randomly
    for (const word of this.vocabulary.keys()) {
      this.embeddings.set(word, this.randomVector(this.dimension));
    }

    // Training (simplified skip-gram)
    for (let epoch = 0; epoch < epochs; epoch++) {
      for (let i = 0; i < allWords.length; i++) {
        const centerWord = allWords[i];
        if (!this.vocabulary.has(centerWord)) continue;

        const centerEmb = this.embeddings.get(centerWord)!;

        // Context window
        for (let j = Math.max(0, i - windowSize); j < Math.min(allWords.length, i + windowSize + 1); j++) {
          if (i === j) continue;

          const contextWord = allWords[j];
          if (!this.vocabulary.has(contextWord)) continue;

          const contextEmb = this.embeddings.get(contextWord)!;

          // Update embeddings (simplified gradient descent)
          for (let d = 0; d < this.dimension; d++) {
            const gradient = (centerEmb[d] - contextEmb[d]) * learningRate;
            centerEmb[d] -= gradient;
            contextEmb[d] += gradient;
          }
        }
      }
    }
  }

  /**
   * Get embedding for a word
   */
  getWordEmbedding(word: string): Embedding | null {
    const normalizedWord = word.toLowerCase();
    const vector = this.embeddings.get(normalizedWord);

    if (!vector) return null;

    return {
      vector,
      dimension: this.dimension,
      metadata: { word: normalizedWord }
    };
  }

  /**
   * Get document embedding (average of word embeddings)
   */
  getDocumentEmbedding(text: string): Embedding {
    const words = text.toLowerCase().match(/\b[\w]+\b/g) || [];
    const vectors: number[][] = [];

    for (const word of words) {
      const embedding = this.embeddings.get(word);
      if (embedding) {
        vectors.push(embedding);
      }
    }

    if (vectors.length === 0) {
      return {
        vector: new Array(this.dimension).fill(0),
        dimension: this.dimension
      };
    }

    // Average pooling
    const avgVector = new Array(this.dimension).fill(0);
    for (const vector of vectors) {
      for (let i = 0; i < this.dimension; i++) {
        avgVector[i] += vector[i];
      }
    }

    for (let i = 0; i < this.dimension; i++) {
      avgVector[i] /= vectors.length;
    }

    return {
      vector: avgVector,
      dimension: this.dimension,
      metadata: { wordCount: vectors.length }
    };
  }

  /**
   * Calculate cosine similarity between embeddings
   */
  cosineSimilarity(emb1: Embedding, emb2: Embedding): number {
    if (emb1.dimension !== emb2.dimension) {
      throw new Error('Embeddings must have same dimension');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < emb1.dimension; i++) {
      dotProduct += emb1.vector[i] * emb2.vector[i];
      magnitude1 += emb1.vector[i] * emb1.vector[i];
      magnitude2 += emb2.vector[i] * emb2.vector[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Find k most similar documents
   */
  findSimilar(
    queryEmbedding: Embedding,
    documentEmbeddings: Map<string, Embedding>,
    k: number = 5
  ): SimilarityResult[] {
    const similarities: SimilarityResult[] = [];

    for (const [id, docEmb] of documentEmbeddings.entries()) {
      const similarity = this.cosineSimilarity(queryEmbedding, docEmb);
      similarities.push({ id, similarity, embedding: docEmb });
    }

    similarities.sort((a, b) => b.similarity - a.similarity);
    return similarities.slice(0, k);
  }

  /**
   * TF-IDF embeddings
   */
  tfidfEmbedding(
    document: string,
    corpus: string[]
  ): Embedding {
    const docWords = document.toLowerCase().match(/\b[\w]+\b/g) || [];
    const vocabulary = new Set<string>();
    const docFreq = new Map<string, number>();

    // Build vocabulary and document frequencies
    for (const text of corpus) {
      const words = new Set(text.toLowerCase().match(/\b[\w]+\b/g) || []);
      for (const word of words) {
        vocabulary.add(word);
        docFreq.set(word, (docFreq.get(word) || 0) + 1);
      }
    }

    // Calculate TF
    const tf = new Map<string, number>();
    for (const word of docWords) {
      tf.set(word, (tf.get(word) || 0) + 1);
    }

    // Normalize TF
    for (const [word, count] of tf.entries()) {
      tf.set(word, count / docWords.length);
    }

    // Calculate TF-IDF vector
    const vocabArray = Array.from(vocabulary);
    const vector = new Array(vocabArray.length).fill(0);
    const N = corpus.length;

    for (let i = 0; i < vocabArray.length; i++) {
      const word = vocabArray[i];
      const termFreq = tf.get(word) || 0;
      const docCount = docFreq.get(word) || 0;
      const idf = Math.log(N / (1 + docCount));

      vector[i] = termFreq * idf;
    }

    return {
      vector,
      dimension: vocabArray.length,
      metadata: { vocabulary: vocabArray }
    };
  }

  /**
   * One-hot encoding for categorical features
   */
  oneHotEncode(categories: string[]): Map<string, Embedding> {
    const encodings = new Map<string, Embedding>();
    const dimension = categories.length;

    categories.forEach((category, idx) => {
      const vector = new Array(dimension).fill(0);
      vector[idx] = 1;

      encodings.set(category, {
        vector,
        dimension,
        metadata: { category, index: idx }
      });
    });

    return encodings;
  }

  /**
   * Hash embedding for high-cardinality features
   */
  hashEmbedding(text: string, dimension: number = 128): Embedding {
    const vector = new Array(dimension).fill(0);
    const words = text.toLowerCase().match(/\b[\w]+\b/g) || [];

    for (const word of words) {
      const hash = this.simpleHash(word);
      const idx = hash % dimension;
      vector[idx] += 1;
    }

    // Normalize
    const magnitude = Math.sqrt(vector.reduce((sum, val) => sum + val * val, 0));
    if (magnitude > 0) {
      for (let i = 0; i < dimension; i++) {
        vector[i] /= magnitude;
      }
    }

    return { vector, dimension };
  }

  /**
   * Dimensionality reduction using random projection
   */
  randomProjection(embedding: Embedding, targetDim: number): Embedding {
    if (targetDim >= embedding.dimension) {
      return embedding;
    }

    const projectionMatrix: number[][] = [];
    for (let i = 0; i < targetDim; i++) {
      projectionMatrix[i] = this.randomVector(embedding.dimension);
    }

    const newVector = new Array(targetDim).fill(0);
    for (let i = 0; i < targetDim; i++) {
      for (let j = 0; j < embedding.dimension; j++) {
        newVector[i] += embedding.vector[j] * projectionMatrix[i][j];
      }
    }

    return {
      vector: newVector,
      dimension: targetDim,
      metadata: { originalDimension: embedding.dimension }
    };
  }

  /**
   * Save embeddings to JSON
   */
  export(): string {
    const data = {
      dimension: this.dimension,
      vocabulary: Array.from(this.vocabulary.entries()),
      embeddings: Array.from(this.embeddings.entries())
    };
    return JSON.stringify(data);
  }

  /**
   * Load embeddings from JSON
   */
  import(jsonData: string): void {
    const data = JSON.parse(jsonData);
    this.dimension = data.dimension;
    this.vocabulary = new Map(data.vocabulary);
    this.embeddings = new Map(data.embeddings);
  }

  // Helper methods

  private randomVector(dimension: number): number[] {
    const vector = new Array(dimension);
    for (let i = 0; i < dimension; i++) {
      vector[i] = (Math.random() - 0.5) * 0.1;
    }
    return vector;
  }

  private simpleHash(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
}
