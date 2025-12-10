
interface Filter { field: string; val: any; }

export class QueryOptimizer {
  /**
   * Reorders filters to put the most selective ones first.
   * Assumes 'id' or 'type' are more selective than 'status'.
   */
  static optimize(filters: Filter[]): Filter[] {
    const selectivity: Record<string, number> = {
      'id': 10,
      'type': 5,
      'status': 1
    };

    return [...filters].sort((a, b) => {
      const scoreA = selectivity[a.field] || 0;
      const scoreB = selectivity[b.field] || 0;
      return scoreB - scoreA; // High score first
    });
  }
}
