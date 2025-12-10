
export class ColumnarStore {
  private columns: Map<string, any[]> = new Map();
  private length = 0;

  insert(row: Record<string, any>) {
    Object.keys(row).forEach(key => {
      if (!this.columns.has(key)) this.columns.set(key, []);
      this.columns.get(key)!.push(row[key]);
    });
    this.length++;
  }

  /**
   * Fast aggregation on a single column.
   */
  sum(column: string): number {
    const col = this.columns.get(column);
    return col ? col.reduce((a, b) => a + (Number(b) || 0), 0) : 0;
  }

  countBy(column: string): Record<string, number> {
    const col = this.columns.get(column) || [];
    const counts: Record<string, number> = {};
    for (const val of col) {
      counts[val] = (counts[val] || 0) + 1;
    }
    return counts;
  }
}
