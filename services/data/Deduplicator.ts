
export class Deduplicator {
  private signatures: Set<string> = new Set();

  /**
   * Checks if item is unique based on a simplified shingling hash.
   */
  isUnique(text: string): boolean {
    const sig = this.computeSignature(text);
    if (this.signatures.has(sig)) return false;
    this.signatures.add(sig);
    return true;
  }

  private computeSignature(text: string): string {
    // tokenize and sort to be insensitive to word order
    const tokens = text.toLowerCase().split(/\W+/).sort(); 
    return tokens.join('|');
  }
}
