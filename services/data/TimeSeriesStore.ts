
interface DataPoint { time: number; value: number; }

export class TimeSeriesStore {
  private data: DataPoint[] = [];

  add(value: number) {
    this.data.push({ time: Date.now(), value });
  }

  /**
   * Retrieves data with simple aggregation (downsampling)
   * Reduces dataset to `points` count by averaging windows.
   */
  query(points: number = 50): DataPoint[] {
    if (this.data.length <= points) return this.data;

    const windowSize = Math.floor(this.data.length / points);
    const result: DataPoint[] = [];

    for (let i = 0; i < this.data.length; i += windowSize) {
      const slice = this.data.slice(i, i + windowSize);
      const avg = slice.reduce((sum, p) => sum + p.value, 0) / slice.length;
      result.push({ time: slice[0].time, value: avg });
    }
    return result;
  }
}
