/**
 * Natural Language Processing for Threat Intelligence
 *
 * Time Complexity:
 * - Tokenization: O(n) where n is text length
 * - N-grams: O(n * k) where k is n-gram size
 * - Sentiment Analysis: O(n)
 * - Named Entity Recognition: O(n)
 *
 * Use Cases:
 * - Extracting IOCs from threat reports
 * - Analyzing sentiment in security blogs
 * - Named entity recognition for threat actors
 * - Keyword extraction from intelligence documents
 */

export interface Token {
  text: string;
  position: number;
  type?: string;
  score?: number;
}

export interface Entity {
  text: string;
  type: string;
  position: number;
  confidence: number;
}

export interface SentimentResult {
  score: number;
  label: 'positive' | 'negative' | 'neutral';
  confidence: number;
}

export interface KeywordResult {
  keyword: string;
  score: number;
  frequency: number;
  positions: number[];
}

export class NLP {
  private stopWords = new Set([
    'a', 'an', 'and', 'are', 'as', 'at', 'be', 'by', 'for', 'from',
    'has', 'he', 'in', 'is', 'it', 'its', 'of', 'on', 'that', 'the',
    'to', 'was', 'will', 'with', 'the', 'this', 'but', 'they', 'have',
    'had', 'what', 'when', 'where', 'who', 'which', 'why', 'how'
  ]);

  /**
   * Tokenize text into words
   */
  tokenize(text: string, options: { lowercase?: boolean; removeStopWords?: boolean } = {}): Token[] {
    const { lowercase = true, removeStopWords = false } = options;

    let processedText = text;
    if (lowercase) {
      processedText = processedText.toLowerCase();
    }

    // Split on word boundaries
    const words = processedText.match(/\b[\w]+\b/g) || [];
    const tokens: Token[] = [];
    let position = 0;

    for (const word of words) {
      if (!removeStopWords || !this.stopWords.has(word)) {
        tokens.push({
          text: word,
          position: position++
        });
      }
    }

    return tokens;
  }

  /**
   * Generate n-grams from text
   */
  ngrams(text: string, n: number = 2): string[] {
    const tokens = this.tokenize(text);
    const ngrams: string[] = [];

    for (let i = 0; i <= tokens.length - n; i++) {
      const ngram = tokens.slice(i, i + n).map(t => t.text).join(' ');
      ngrams.push(ngram);
    }

    return ngrams;
  }

  /**
   * Extract keywords using TF-IDF-like scoring
   */
  extractKeywords(text: string, topK: number = 10): KeywordResult[] {
    const tokens = this.tokenize(text, { lowercase: true, removeStopWords: true });
    const wordFreq = new Map<string, { count: number; positions: number[] }>();

    // Count frequencies and positions
    for (const token of tokens) {
      if (!wordFreq.has(token.text)) {
        wordFreq.set(token.text, { count: 0, positions: [] });
      }
      const entry = wordFreq.get(token.text)!;
      entry.count++;
      entry.positions.push(token.position);
    }

    // Calculate scores (simple frequency-based for now)
    const keywords: KeywordResult[] = [];
    const totalWords = tokens.length;

    for (const [word, data] of wordFreq.entries()) {
      if (word.length > 2) { // Filter out very short words
        keywords.push({
          keyword: word,
          score: data.count / totalWords,
          frequency: data.count,
          positions: data.positions
        });
      }
    }

    // Sort by score and return top K
    keywords.sort((a, b) => b.score - a.score);
    return keywords.slice(0, topK);
  }

  /**
   * Simple sentiment analysis
   * Uses predefined positive/negative word lists
   */
  analyzeSentiment(text: string): SentimentResult {
    const positiveWords = new Set([
      'good', 'great', 'excellent', 'positive', 'secure', 'protected',
      'successful', 'effective', 'strong', 'safe', 'reliable', 'trusted'
    ]);

    const negativeWords = new Set([
      'bad', 'poor', 'negative', 'vulnerable', 'compromised', 'attack',
      'malware', 'threat', 'breach', 'exploit', 'weak', 'insecure',
      'dangerous', 'malicious', 'infected', 'hacked', 'unauthorized'
    ]);

    const tokens = this.tokenize(text, { lowercase: true });
    let positiveCount = 0;
    let negativeCount = 0;

    for (const token of tokens) {
      if (positiveWords.has(token.text)) positiveCount++;
      if (negativeWords.has(token.text)) negativeCount++;
    }

    const totalSentiment = positiveCount + negativeCount;
    if (totalSentiment === 0) {
      return { score: 0, label: 'neutral', confidence: 0 };
    }

    const score = (positiveCount - negativeCount) / totalSentiment;
    const confidence = totalSentiment / tokens.length;

    let label: 'positive' | 'negative' | 'neutral' = 'neutral';
    if (score > 0.2) label = 'positive';
    else if (score < -0.2) label = 'negative';

    return { score, label, confidence };
  }

  /**
   * Named Entity Recognition for cybersecurity
   * Extracts IPs, domains, hashes, CVEs, etc.
   */
  extractEntities(text: string): Entity[] {
    const entities: Entity[] = [];

    // IP Address pattern
    const ipPattern = /\b(?:\d{1,3}\.){3}\d{1,3}\b/g;
    let match;
    while ((match = ipPattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'ip_address',
        position: match.index,
        confidence: 0.95
      });
    }

    // Domain pattern
    const domainPattern = /\b(?:[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?\.)+[a-zA-Z]{2,}\b/g;
    while ((match = domainPattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'domain',
        position: match.index,
        confidence: 0.85
      });
    }

    // Email pattern
    const emailPattern = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
    while ((match = emailPattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'email',
        position: match.index,
        confidence: 0.9
      });
    }

    // CVE pattern
    const cvePattern = /CVE-\d{4}-\d{4,}/gi;
    while ((match = cvePattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'cve',
        position: match.index,
        confidence: 0.99
      });
    }

    // MD5 hash pattern
    const md5Pattern = /\b[a-f0-9]{32}\b/gi;
    while ((match = md5Pattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'md5_hash',
        position: match.index,
        confidence: 0.8
      });
    }

    // SHA256 hash pattern
    const sha256Pattern = /\b[a-f0-9]{64}\b/gi;
    while ((match = sha256Pattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'sha256_hash',
        position: match.index,
        confidence: 0.9
      });
    }

    // URL pattern
    const urlPattern = /https?:\/\/[^\s]+/g;
    while ((match = urlPattern.exec(text)) !== null) {
      entities.push({
        text: match[0],
        type: 'url',
        position: match.index,
        confidence: 0.95
      });
    }

    return entities.sort((a, b) => a.position - b.position);
  }

  /**
   * Calculate text similarity using Jaccard index
   */
  jaccardSimilarity(text1: string, text2: string): number {
    const tokens1 = new Set(this.tokenize(text1).map(t => t.text));
    const tokens2 = new Set(this.tokenize(text2).map(t => t.text));

    const intersection = new Set([...tokens1].filter(t => tokens2.has(t)));
    const union = new Set([...tokens1, ...tokens2]);

    return intersection.size / union.size;
  }

  /**
   * Calculate cosine similarity between texts
   */
  cosineSimilarity(text1: string, text2: string): number {
    const tokens1 = this.tokenize(text1, { removeStopWords: true });
    const tokens2 = this.tokenize(text2, { removeStopWords: true });

    // Build vocabulary
    const vocab = new Set([
      ...tokens1.map(t => t.text),
      ...tokens2.map(t => t.text)
    ]);

    // Create frequency vectors
    const vector1 = this.createFrequencyVector(tokens1, vocab);
    const vector2 = this.createFrequencyVector(tokens2, vocab);

    // Calculate cosine similarity
    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vector1.length; i++) {
      dotProduct += vector1[i] * vector2[i];
      magnitude1 += vector1[i] * vector1[i];
      magnitude2 += vector2[i] * vector2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) return 0;

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Stemming - reduce words to root form
   */
  stem(word: string): string {
    // Simple Porter Stemmer-like rules
    word = word.toLowerCase();

    // Remove common suffixes
    const suffixes = ['ing', 'ed', 'es', 's', 'ly', 'er', 'est'];
    for (const suffix of suffixes) {
      if (word.endsWith(suffix) && word.length > suffix.length + 2) {
        return word.slice(0, -suffix.length);
      }
    }

    return word;
  }

  /**
   * Lemmatization helper (simplified)
   */
  lemmatize(word: string): string {
    const lemmaMap: { [key: string]: string } = {
      'running': 'run',
      'ran': 'run',
      'better': 'good',
      'best': 'good',
      'attacks': 'attack',
      'attacked': 'attack',
      'attacking': 'attack'
    };

    return lemmaMap[word.toLowerCase()] || this.stem(word);
  }

  /**
   * Calculate readability score (Flesch Reading Ease)
   */
  calculateReadability(text: string): number {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const words = this.tokenize(text);
    const syllables = words.reduce((sum, word) => sum + this.countSyllables(word.text), 0);

    if (sentences.length === 0 || words.length === 0) return 0;

    const avgWordsPerSentence = words.length / sentences.length;
    const avgSyllablesPerWord = syllables / words.length;

    // Flesch Reading Ease formula
    const score = 206.835 - 1.015 * avgWordsPerSentence - 84.6 * avgSyllablesPerWord;

    return Math.max(0, Math.min(100, score));
  }

  private createFrequencyVector(tokens: Token[], vocab: Set<string>): number[] {
    const freqMap = new Map<string, number>();
    for (const token of tokens) {
      freqMap.set(token.text, (freqMap.get(token.text) || 0) + 1);
    }

    return Array.from(vocab).map(word => freqMap.get(word) || 0);
  }

  private countSyllables(word: string): number {
    word = word.toLowerCase();
    if (word.length <= 3) return 1;

    const vowels = 'aeiouy';
    let count = 0;
    let previousWasVowel = false;

    for (let i = 0; i < word.length; i++) {
      const isVowel = vowels.includes(word[i]);
      if (isVowel && !previousWasVowel) {
        count++;
      }
      previousWasVowel = isVowel;
    }

    // Silent 'e' at end
    if (word.endsWith('e')) {
      count--;
    }

    return Math.max(1, count);
  }

  /**
   * Advanced TF-IDF keyword extraction
   * Better than simple frequency for document analysis
   */
  extractKeywordsTFIDF(
    documents: string[],
    docIndex: number,
    topK: number = 10
  ): KeywordResult[] {
    const allTokens = documents.map(doc => this.tokenize(doc, { lowercase: true, removeStopWords: true }));
    const currentTokens = allTokens[docIndex];

    // Calculate term frequencies for current document
    const tf = new Map<string, number>();
    for (const token of currentTokens) {
      tf.set(token.text, (tf.get(token.text) || 0) + 1);
    }

    // Calculate document frequencies
    const df = new Map<string, number>();
    for (const tokens of allTokens) {
      const uniqueWords = new Set(tokens.map(t => t.text));
      for (const word of uniqueWords) {
        df.set(word, (df.get(word) || 0) + 1);
      }
    }

    // Calculate TF-IDF scores
    const N = documents.length;
    const keywords: KeywordResult[] = [];

    for (const [word, freq] of tf.entries()) {
      if (word.length > 2) {
        const termFreq = freq / currentTokens.length;
        const docFreq = df.get(word) || 1;
        const idf = Math.log(N / docFreq);
        const tfidf = termFreq * idf;

        const positions = currentTokens
          .filter(t => t.text === word)
          .map(t => t.position);

        keywords.push({
          keyword: word,
          score: tfidf,
          frequency: freq,
          positions
        });
      }
    }

    keywords.sort((a, b) => b.score - a.score);
    return keywords.slice(0, topK);
  }

  /**
   * TextRank algorithm for keyword extraction
   * Graph-based approach for finding important words
   */
  textRank(text: string, topK: number = 10, windowSize: number = 5): KeywordResult[] {
    const tokens = this.tokenize(text, { lowercase: true, removeStopWords: true });
    const words = tokens.map(t => t.text);

    if (words.length === 0) return [];

    // Build co-occurrence graph
    const graph = new Map<string, Map<string, number>>();

    for (let i = 0; i < words.length; i++) {
      const word = words[i];
      if (!graph.has(word)) {
        graph.set(word, new Map());
      }

      const windowEnd = Math.min(i + windowSize, words.length);
      for (let j = i + 1; j < windowEnd; j++) {
        const neighbor = words[j];
        const edges = graph.get(word)!;
        edges.set(neighbor, (edges.get(neighbor) || 0) + 1);

        if (!graph.has(neighbor)) {
          graph.set(neighbor, new Map());
        }
        const reverseEdges = graph.get(neighbor)!;
        reverseEdges.set(word, (reverseEdges.get(word) || 0) + 1);
      }
    }

    // Run PageRank
    const scores = new Map<string, number>();
    for (const word of graph.keys()) {
      scores.set(word, 1.0);
    }

    const dampingFactor = 0.85;
    const iterations = 20;

    for (let iter = 0; iter < iterations; iter++) {
      const newScores = new Map<string, number>();

      for (const [word, edges] of graph.entries()) {
        let score = 1 - dampingFactor;

        for (const [neighbor, weight] of edges.entries()) {
          const neighborEdges = graph.get(neighbor)!;
          const totalWeight = Array.from(neighborEdges.values()).reduce((a, b) => a + b, 0);
          score += dampingFactor * (scores.get(neighbor) || 0) * weight / totalWeight;
        }

        newScores.set(word, score);
      }

      for (const [word, score] of newScores.entries()) {
        scores.set(word, score);
      }
    }

    // Convert to keywords
    const keywords: KeywordResult[] = [];
    const wordFreq = new Map<string, number>();
    const wordPositions = new Map<string, number[]>();

    for (const token of tokens) {
      wordFreq.set(token.text, (wordFreq.get(token.text) || 0) + 1);
      if (!wordPositions.has(token.text)) {
        wordPositions.set(token.text, []);
      }
      wordPositions.get(token.text)!.push(token.position);
    }

    for (const [word, score] of scores.entries()) {
      keywords.push({
        keyword: word,
        score,
        frequency: wordFreq.get(word) || 0,
        positions: wordPositions.get(word) || []
      });
    }

    keywords.sort((a, b) => b.score - a.score);
    return keywords.slice(0, topK);
  }

  /**
   * Topic modeling using simplified LDA approach
   * Extracts main topics from text
   */
  extractTopics(
    documents: string[],
    numTopics: number = 5,
    wordsPerTopic: number = 10
  ): Array<{ topic: number; words: Array<{ word: string; weight: number }> }> {
    const allTokens = documents.map(doc =>
      this.tokenize(doc, { lowercase: true, removeStopWords: true })
    );

    // Build vocabulary
    const vocab = new Set<string>();
    for (const tokens of allTokens) {
      for (const token of tokens) {
        vocab.set(token.text);
      }
    }

    // Calculate term frequencies per document
    const docTermMatrix: Map<string, number>[] = [];

    for (const tokens of allTokens) {
      const termFreq = new Map<string, number>();
      for (const token of tokens) {
        termFreq.set(token.text, (termFreq.get(token.text) || 0) + 1);
      }
      docTermMatrix.push(termFreq);
    }

    // Simplified topic extraction using clustering
    // Group words that frequently co-occur
    const topics: Array<{ topic: number; words: Array<{ word: string; weight: number }> }> = [];

    for (let t = 0; t < numTopics; t++) {
      const topicWords: Array<{ word: string; weight: number }> = [];

      // Find top words for this topic
      const wordScores = new Map<string, number>();

      for (const word of vocab) {
        let score = 0;
        for (const termFreq of docTermMatrix) {
          score += termFreq.get(word) || 0;
        }
        wordScores.set(word, score);
      }

      const sortedWords = Array.from(wordScores.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(t * wordsPerTopic, (t + 1) * wordsPerTopic);

      for (const [word, score] of sortedWords) {
        topicWords.push({ word, weight: score });
      }

      topics.push({ topic: t, words: topicWords });
    }

    return topics;
  }

  /**
   * Enhanced entity extraction with context and relationships
   */
  extractEntitiesAdvanced(text: string): Array<Entity & { context?: string; related?: string[] }> {
    const baseEntities = this.extractEntities(text);
    const enhanced = baseEntities.map(entity => {
      // Extract context window
      const contextStart = Math.max(0, entity.position - 50);
      const contextEnd = Math.min(text.length, entity.position + entity.text.length + 50);
      const context = text.substring(contextStart, contextEnd);

      // Find related entities nearby
      const related = baseEntities
        .filter(other =>
          other !== entity &&
          Math.abs(other.position - entity.position) < 100
        )
        .map(e => e.text)
        .slice(0, 3);

      return {
        ...entity,
        context,
        related: related.length > 0 ? related : undefined
      };
    });

    return enhanced;
  }

  /**
   * Language detection (simplified)
   */
  detectLanguage(text: string): {
    language: string;
    confidence: number;
  } {
    const tokens = this.tokenize(text, { lowercase: true });

    // Simple heuristics based on common words
    const englishWords = new Set(['the', 'is', 'and', 'to', 'of', 'a', 'in', 'that', 'it', 'for']);
    const spanishWords = new Set(['el', 'la', 'de', 'que', 'y', 'es', 'en', 'los', 'del', 'por']);
    const frenchWords = new Set(['le', 'de', 'un', 'et', 'est', 'une', 'dans', 'que', 'pour', 'les']);

    let englishCount = 0;
    let spanishCount = 0;
    let frenchCount = 0;

    for (const token of tokens.slice(0, 100)) {
      if (englishWords.has(token.text)) englishCount++;
      if (spanishWords.has(token.text)) spanishCount++;
      if (frenchWords.has(token.text)) frenchCount++;
    }

    const maxCount = Math.max(englishCount, spanishCount, frenchCount);
    let language = 'unknown';
    let confidence = 0;

    if (maxCount > 0) {
      confidence = maxCount / Math.min(100, tokens.length);

      if (maxCount === englishCount) language = 'en';
      else if (maxCount === spanishCount) language = 'es';
      else if (maxCount === frenchCount) language = 'fr';
    }

    return { language, confidence };
  }

  /**
   * Text summarization using extractive approach
   */
  summarize(text: string, numSentences: number = 3): string[] {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

    if (sentences.length <= numSentences) {
      return sentences.map(s => s.trim());
    }

    // Score sentences based on keyword importance
    const allKeywords = this.extractKeywords(text, 20);
    const keywordSet = new Set(allKeywords.map(k => k.keyword));

    const sentenceScores = sentences.map(sentence => {
      const tokens = this.tokenize(sentence, { lowercase: true, removeStopWords: true });
      let score = 0;

      for (const token of tokens) {
        if (keywordSet.has(token.text)) {
          score += allKeywords.find(k => k.keyword === token.text)?.score || 0;
        }
      }

      return { sentence: sentence.trim(), score: score / Math.max(1, tokens.length) };
    });

    sentenceScores.sort((a, b) => b.score - a.score);
    return sentenceScores.slice(0, numSentences).map(s => s.sentence);
  }

  /**
   * Question answering (simple pattern matching)
   */
  answerQuestion(question: string, context: string): {
    answer: string | null;
    confidence: number;
  } {
    const questionLower = question.toLowerCase();
    const sentences = context.split(/[.!?]+/).filter(s => s.trim().length > 0);

    // Extract question keywords
    const questionTokens = this.tokenize(question, { lowercase: true, removeStopWords: true });
    const keywords = new Set(questionTokens.map(t => t.text));

    // Find best matching sentence
    let bestSentence: string | null = null;
    let bestScore = 0;

    for (const sentence of sentences) {
      const sentenceTokens = this.tokenize(sentence, { lowercase: true, removeStopWords: true });
      let matches = 0;

      for (const token of sentenceTokens) {
        if (keywords.has(token.text)) {
          matches++;
        }
      }

      const score = matches / Math.max(keywords.size, 1);
      if (score > bestScore) {
        bestScore = score;
        bestSentence = sentence.trim();
      }
    }

    return {
      answer: bestSentence,
      confidence: bestScore
    };
  }
}
