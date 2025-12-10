
export class InvertedIndex {
  private index: Map<string, Set<string>> = new Map();

  add(id: string, text: string) {
    const tokens = this.tokenize(text);
    tokens.forEach(token => {
      if (!this.index.has(token)) {
        this.index.set(token, new Set());
      }
      this.index.get(token)!.add(id);
    });
  }

  search(query: string): string[] {
    const tokens = this.tokenize(query);
    if (tokens.length === 0) return [];

    let results = this.index.get(tokens[0]) || new Set();
    
    for (let i = 1; i < tokens.length; i++) {
      const nextSet = this.index.get(tokens[i]) || new Set();
      results = new Set([...results].filter(x => nextSet.has(x))); // Intersection
    }

    return Array.from(results);
  }

  private tokenize(text: string): string[] {
    return text.toLowerCase().split(/\W+/).filter(t => t.length > 2);
  }
}
