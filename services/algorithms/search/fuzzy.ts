/**
 * Fuzzy String Matching
 *
 * Time Complexity:
 * - Levenshtein: O(m * n)
 * - Damerau-Levenshtein: O(m * n)
 * - Jaro-Winkler: O(m * n)
 *
 * Use Cases:
 * - IOC matching with typos
 * - Domain name similarity
 * - Threat actor name variations
 * - Approximate string search
 */

export interface FuzzyMatch {
  value: string;
  score: number;
  distance: number;
  method: string;
}

export class FuzzyMatching {
  /**
   * Levenshtein Distance - minimum edits to transform one string to another
   */
  levenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;

    const dp: number[][] = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(0));

    for (let i = 0; i <= m; i++) dp[i][0] = i;
    for (let j = 0; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        if (s1[i - 1] === s2[j - 1]) {
          dp[i][j] = dp[i - 1][j - 1];
        } else {
          dp[i][j] = 1 + Math.min(dp[i - 1][j], dp[i][j - 1], dp[i - 1][j - 1]);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Levenshtein similarity score (0-1)
   */
  levenshteinSimilarity(s1: string, s2: string): number {
    const distance = this.levenshteinDistance(s1, s2);
    const maxLen = Math.max(s1.length, s2.length);
    return maxLen === 0 ? 1 : 1 - distance / maxLen;
  }

  /**
   * Damerau-Levenshtein Distance - includes transpositions
   */
  damerauLevenshteinDistance(s1: string, s2: string): number {
    const m = s1.length;
    const n = s2.length;

    const dp: number[][] = Array(m + 1)
      .fill(0)
      .map(() => Array(n + 1).fill(Infinity));

    dp[0][0] = 0;
    for (let i = 1; i <= m; i++) dp[i][0] = i;
    for (let j = 1; j <= n; j++) dp[0][j] = j;

    for (let i = 1; i <= m; i++) {
      for (let j = 1; j <= n; j++) {
        const cost = s1[i - 1] === s2[j - 1] ? 0 : 1;

        dp[i][j] = Math.min(
          dp[i - 1][j] + 1, // deletion
          dp[i][j - 1] + 1, // insertion
          dp[i - 1][j - 1] + cost // substitution
        );

        // Transposition
        if (
          i > 1 &&
          j > 1 &&
          s1[i - 1] === s2[j - 2] &&
          s1[i - 2] === s2[j - 1]
        ) {
          dp[i][j] = Math.min(dp[i][j], dp[i - 2][j - 2] + cost);
        }
      }
    }

    return dp[m][n];
  }

  /**
   * Jaro Similarity
   */
  jaroSimilarity(s1: string, s2: string): number {
    if (s1 === s2) return 1;
    if (s1.length === 0 || s2.length === 0) return 0;

    const matchDistance = Math.floor(Math.max(s1.length, s2.length) / 2) - 1;
    const s1Matches = new Array(s1.length).fill(false);
    const s2Matches = new Array(s2.length).fill(false);

    let matches = 0;
    for (let i = 0; i < s1.length; i++) {
      const start = Math.max(0, i - matchDistance);
      const end = Math.min(i + matchDistance + 1, s2.length);

      for (let j = start; j < end; j++) {
        if (s2Matches[j] || s1[i] !== s2[j]) continue;
        s1Matches[i] = true;
        s2Matches[j] = true;
        matches++;
        break;
      }
    }

    if (matches === 0) return 0;

    let transpositions = 0;
    let k = 0;
    for (let i = 0; i < s1.length; i++) {
      if (!s1Matches[i]) continue;
      while (!s2Matches[k]) k++;
      if (s1[i] !== s2[k]) transpositions++;
      k++;
    }

    return (
      (matches / s1.length +
        matches / s2.length +
        (matches - transpositions / 2) / matches) /
      3
    );
  }

  /**
   * Jaro-Winkler Similarity - gives more weight to common prefixes
   */
  jaroWinklerSimilarity(s1: string, s2: string, prefixScale: number = 0.1): number {
    const jaroScore = this.jaroSimilarity(s1, s2);

    let prefixLen = 0;
    const maxPrefix = Math.min(4, Math.min(s1.length, s2.length));

    for (let i = 0; i < maxPrefix; i++) {
      if (s1[i] === s2[i]) {
        prefixLen++;
      } else {
        break;
      }
    }

    return jaroScore + prefixLen * prefixScale * (1 - jaroScore);
  }

  /**
   * Hamming Distance - for equal length strings
   */
  hammingDistance(s1: string, s2: string): number {
    if (s1.length !== s2.length) {
      throw new Error('Hamming distance requires equal length strings');
    }

    let distance = 0;
    for (let i = 0; i < s1.length; i++) {
      if (s1[i] !== s2[i]) distance++;
    }

    return distance;
  }

  /**
   * Fuzzy search in array - find best matches
   */
  fuzzySearch(
    query: string,
    candidates: string[],
    threshold: number = 0.6,
    topK: number = 10,
    method: 'levenshtein' | 'jaro-winkler' | 'damerau' = 'jaro-winkler'
  ): FuzzyMatch[] {
    const matches: FuzzyMatch[] = [];

    for (const candidate of candidates) {
      let score: number;
      let distance: number;

      switch (method) {
        case 'levenshtein':
          distance = this.levenshteinDistance(query.toLowerCase(), candidate.toLowerCase());
          score = this.levenshteinSimilarity(query.toLowerCase(), candidate.toLowerCase());
          break;
        case 'damerau':
          distance = this.damerauLevenshteinDistance(query.toLowerCase(), candidate.toLowerCase());
          score = 1 - distance / Math.max(query.length, candidate.length);
          break;
        case 'jaro-winkler':
        default:
          score = this.jaroWinklerSimilarity(query.toLowerCase(), candidate.toLowerCase());
          distance = 1 - score;
          break;
      }

      if (score >= threshold) {
        matches.push({
          value: candidate,
          score,
          distance,
          method
        });
      }
    }

    matches.sort((a, b) => b.score - a.score);
    return matches.slice(0, topK);
  }

  /**
   * N-gram similarity
   */
  ngramSimilarity(s1: string, s2: string, n: number = 2): number {
    const ngrams1 = this.getNgrams(s1, n);
    const ngrams2 = this.getNgrams(s2, n);

    const set1 = new Set(ngrams1);
    const set2 = new Set(ngrams2);

    const intersection = new Set([...set1].filter(x => set2.has(x)));
    const union = new Set([...set1, ...set2]);

    return union.size === 0 ? 0 : intersection.size / union.size;
  }

  /**
   * Soundex encoding for phonetic matching
   */
  soundex(s: string): string {
    const code = s.toUpperCase().replace(/[^A-Z]/g, '');
    if (code.length === 0) return '0000';

    const first = code[0];
    const mapping: { [key: string]: string } = {
      B: '1', F: '1', P: '1', V: '1',
      C: '2', G: '2', J: '2', K: '2', Q: '2', S: '2', X: '2', Z: '2',
      D: '3', T: '3',
      L: '4',
      M: '5', N: '5',
      R: '6'
    };

    let soundexCode = first;
    for (let i = 1; i < code.length; i++) {
      const digit = mapping[code[i]] || '0';
      if (digit !== '0' && digit !== soundexCode[soundexCode.length - 1]) {
        soundexCode += digit;
      }
      if (soundexCode.length === 4) break;
    }

    while (soundexCode.length < 4) {
      soundexCode += '0';
    }

    return soundexCode;
  }

  /**
   * Metaphone algorithm for phonetic encoding
   */
  metaphone(s: string): string {
    let word = s.toUpperCase().replace(/[^A-Z]/g, '');
    if (word.length === 0) return '';

    // Initial transformations
    if (word.startsWith('PN') || word.startsWith('KN') || word.startsWith('GN') || word.startsWith('AE')) {
      word = word.substring(1);
    }
    if (word.startsWith('WR')) {
      word = 'R' + word.substring(2);
    }
    if (word.startsWith('X')) {
      word = 'S' + word.substring(1);
    }
    if (word.startsWith('WH')) {
      word = 'W' + word.substring(2);
    }

    let code = '';
    for (let i = 0; i < word.length; i++) {
      const c = word[i];
      const next = word[i + 1];

      switch (c) {
        case 'A':
        case 'E':
        case 'I':
        case 'O':
        case 'U':
          if (i === 0) code += c;
          break;
        case 'B':
          if (!(i === word.length - 1 && word[i - 1] === 'M')) code += 'B';
          break;
        case 'C':
          if (next === 'H') {
            code += 'X';
          } else if (next === 'I' || next === 'E' || next === 'Y') {
            code += 'S';
          } else {
            code += 'K';
          }
          break;
        case 'D':
          code += next === 'G' ? 'J' : 'T';
          break;
        case 'G':
          if (next !== 'H' && next !== 'N') code += 'K';
          break;
        case 'H':
          if (i > 0 && 'AEIOU'.includes(word[i - 1])) break;
          code += 'H';
          break;
        case 'K':
          if (i > 0 && word[i - 1] !== 'C') code += 'K';
          break;
        case 'P':
          code += next === 'H' ? 'F' : 'P';
          break;
        case 'Q':
          code += 'K';
          break;
        case 'S':
          code += next === 'H' ? 'X' : 'S';
          break;
        case 'T':
          if (next === 'I' && word[i + 2] === 'O') code += 'X';
          else if (next === 'H') code += '0';
          else code += 'T';
          break;
        case 'V':
          code += 'F';
          break;
        case 'W':
        case 'Y':
          if ('AEIOU'.includes(next || '')) code += c;
          break;
        case 'X':
          code += 'KS';
          break;
        case 'Z':
          code += 'S';
          break;
        default:
          if ('FJLMNR'.includes(c)) code += c;
      }
    }

    return code;
  }

  private getNgrams(s: string, n: number): string[] {
    const ngrams: string[] = [];
    const text = s.toLowerCase();

    for (let i = 0; i <= text.length - n; i++) {
      ngrams.push(text.substring(i, i + n));
    }

    return ngrams;
  }
}
