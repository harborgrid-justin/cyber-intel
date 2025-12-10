
export class VectorStore {
  private vectors: Map<string, number[]> = new Map();

  add(id: string, vector: number[]) {
    this.vectors.set(id, vector);
  }

  search(queryVector: number[], topK: number = 5): { id: string; score: number }[] {
    const results: { id: string; score: number }[] = [];
    
    for (const [id, vector] of this.vectors.entries()) {
      const score = this.cosineSimilarity(queryVector, vector);
      results.push({ id, score });
    }

    return results.sort((a, b) => b.score - a.score).slice(0, topK);
  }

  private cosineSimilarity(a: number[], b: number[]): number {
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < a.length; i++) {
      dot += a[i] * b[i];
      magA += a[i] * a[i];
      magB += b[i] * b[i];
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }
}
