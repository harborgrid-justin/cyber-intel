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
}
