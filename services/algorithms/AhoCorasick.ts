
// A simplified Trie-based multi-pattern search (AC automation logic simplified for brevity)
class TrieNode {
  children: Map<string, TrieNode> = new Map();
  fail: TrieNode | null = null;
  outputs: string[] = [];
}

export class PatternScanner {
  private root = new TrieNode();

  addPattern(pattern: string) {
    let node = this.root;
    for (const char of pattern) {
      if (!node.children.has(char)) node.children.set(char, new TrieNode());
      node = node.children.get(char)!;
    }
    node.outputs.push(pattern);
  }

  // Build failure links (BFS)
  build() {
    const queue: TrieNode[] = [];
    for (const child of this.root.children.values()) {
        child.fail = this.root;
        queue.push(child);
    }
    
    while (queue.length > 0) {
        const current = queue.shift()!;
        for (const [char, child] of current.children) {
            let fail = current.fail;
            while (fail && !fail.children.has(char)) fail = fail.fail;
            child.fail = fail ? fail.children.get(char)! : this.root;
            child.outputs = child.outputs.concat(child.fail.outputs);
            queue.push(child);
        }
    }
  }

  search(text: string): { pattern: string, index: number }[] {
    let node = this.root;
    const results: { pattern: string, index: number }[] = [];
    
    for (let i = 0; i < text.length; i++) {
        const char = text[i];
        while (node !== this.root && !node.children.has(char)) node = node.fail!;
        node = node.children.get(char) || this.root;
        
        for (const pattern of node.outputs) {
            results.push({ pattern, index: i - pattern.length + 1 });
        }
    }
    return results;
  }
}
