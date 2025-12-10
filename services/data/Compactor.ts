
interface Delta {
  field: string;
  value: any;
  timestamp: number;
}

export class Compactor {
  /**
   * Collapses a series of field updates into a final state object.
   * Last write wins based on timestamp.
   */
  static compact<T>(initialState: T, deltas: Delta[]): T {
    // Sort by time ascending
    const sorted = [...deltas].sort((a, b) => a.timestamp - b.timestamp);
    
    const finalState: any = { ...initialState };
    
    sorted.forEach(delta => {
      finalState[delta.field] = delta.value;
    });

    return finalState as T;
  }

  /**
   * Compresses a log by removing intermediate updates to the same field.
   */
  static pruneHistory(deltas: Delta[]): Delta[] {
    const seen = new Set<string>();
    // Iterate backwards to keep latest
    const kept: Delta[] = [];
    
    for (let i = deltas.length - 1; i >= 0; i--) {
        if (!seen.has(deltas[i].field)) {
            seen.add(deltas[i].field);
            kept.unshift(deltas[i]);
        }
    }
    return kept;
  }
}
