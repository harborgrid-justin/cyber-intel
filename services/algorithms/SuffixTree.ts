
class SuffixNode {
  children: Map<string, SuffixNode> = new Map();
  indices: number[] = [];
}

export class SuffixTree {
  private root = new SuffixNode();

  constructor(text: string) {
    for (let i = 0; i < text.length; i++) {
      this.insertSuffix(text.substring(i), i);
    }
  }

  private insertSuffix(suffix: string, index: number) {
    let curr = this.root;
    for (const char of suffix) {
      if (!curr.children.has(char)) {
        curr.children.set(char, new SuffixNode());
      }
      curr = curr.children.get(char)!;
      curr.indices.push(index);
    }
  }

  search(pattern: string): number[] {
    let curr = this.root;
    for (const char of pattern) {
      if (!curr.children.has(char)) return [];
      curr = curr.children.get(char)!;
    }
    return curr.indices;
  }
}
