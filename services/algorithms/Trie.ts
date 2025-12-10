
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  isEndOfWord: boolean = false;
  data: any = null;
}

export class PrefixTrie {
  private root: TrieNode = new TrieNode();

  insert(word: string, data?: any): void {
    let current = this.root;
    for (const char of word.toLowerCase()) {
      if (!current.children.has(char)) {
        current.children.set(char, new TrieNode());
      }
      current = current.children.get(char)!;
    }
    current.isEndOfWord = true;
    current.data = data;
  }

  searchPrefix(prefix: string): any[] {
    let current = this.root;
    for (const char of prefix.toLowerCase()) {
      if (!current.children.has(char)) return [];
      current = current.children.get(char)!;
    }
    return this.collect(current);
  }

  private collect(node: TrieNode): any[] {
    let results: any[] = [];
    if (node.isEndOfWord) results.push(node.data);
    
    for (const child of node.children.values()) {
      results = results.concat(this.collect(child));
    }
    return results;
  }
}
