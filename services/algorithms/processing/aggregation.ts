/**
 * Data Aggregation Utilities
 *
 * Time Complexity: O(n) for most operations
 * Space Complexity: O(n) or O(k) for grouped data
 *
 * Use Cases:
 * - Aggregating threat data from multiple sources
 * - Computing statistics over time windows
 * - Grouping and summarizing IOCs
 * - Dashboard metrics calculation
 */

export interface AggregationResult<T> {
  groups: Map<string, T[]>;
  statistics: Map<string, Statistics>;
  total: number;
}

export interface Statistics {
  count: number;
  sum?: number;
  mean?: number;
  median?: number;
  mode?: any;
  min?: number;
  max?: number;
  stddev?: number;
  variance?: number;
  percentiles?: Map<number, number>;
}

export interface TimeWindow {
  start: Date;
  end: Date;
  count: number;
  values: any[];
}

export class Aggregation {
  /**
   * Group by field value
   */
  groupBy<T>(
    items: T[],
    getKey: (item: T) => string
  ): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    for (const item of items) {
      const key = getKey(item);
      if (!groups.has(key)) {
        groups.set(key, []);
      }
      groups.get(key)!.push(item);
    }

    return groups;
  }

  /**
   * Group by multiple fields
   */
  groupByMultiple<T>(
    items: T[],
    getKeys: (item: T) => string[]
  ): Map<string, T[]> {
    const groups = new Map<string, T[]>();

    for (const item of items) {
      const keys = getKeys(item);
      const compositeKey = keys.join('::');

      if (!groups.has(compositeKey)) {
        groups.set(compositeKey, []);
      }
      groups.get(compositeKey)!.push(item);
    }

    return groups;
  }

  /**
   * Calculate statistics for numeric values
   */
  calculateStatistics(values: number[]): Statistics {
    if (values.length === 0) {
      return { count: 0 };
    }

    const sorted = [...values].sort((a, b) => a - b);
    const count = values.length;
    const sum = values.reduce((a, b) => a + b, 0);
    const mean = sum / count;

    // Variance and standard deviation
    const variance = values.reduce((acc, val) => acc + Math.pow(val - mean, 2), 0) / count;
    const stddev = Math.sqrt(variance);

    // Median
    const median = count % 2 === 0
      ? (sorted[count / 2 - 1] + sorted[count / 2]) / 2
      : sorted[Math.floor(count / 2)];

    // Mode
    const freqMap = new Map<number, number>();
    let maxFreq = 0;
    let mode = values[0];

    for (const val of values) {
      const freq = (freqMap.get(val) || 0) + 1;
      freqMap.set(val, freq);
      if (freq > maxFreq) {
        maxFreq = freq;
        mode = val;
      }
    }

    // Percentiles
    const percentiles = new Map<number, number>();
    for (const p of [25, 50, 75, 90, 95, 99]) {
      const index = (p / 100) * (count - 1);
      const lower = Math.floor(index);
      const upper = Math.ceil(index);
      const weight = index - lower;

      percentiles.set(
        p,
        sorted[lower] * (1 - weight) + sorted[upper] * weight
      );
    }

    return {
      count,
      sum,
      mean,
      median,
      mode,
      min: sorted[0],
      max: sorted[count - 1],
      stddev,
      variance,
      percentiles
    };
  }

  /**
   * Aggregate with statistics
   */
  aggregateWithStats<T>(
    items: T[],
    groupKey: (item: T) => string,
    getValue: (item: T) => number
  ): AggregationResult<T> {
    const groups = this.groupBy(items, groupKey);
    const statistics = new Map<string, Statistics>();

    for (const [key, groupItems] of groups.entries()) {
      const values = groupItems.map(getValue);
      statistics.set(key, this.calculateStatistics(values));
    }

    return {
      groups,
      statistics,
      total: items.length
    };
  }

  /**
   * Rolling window aggregation
   */
  rollingWindow<T>(
    items: T[],
    getTimestamp: (item: T) => Date,
    windowSize: number, // milliseconds
    aggregateFn: (window: T[]) => any
  ): Array<{ timestamp: Date; value: any; count: number }> {
    const sorted = [...items].sort(
      (a, b) => getTimestamp(a).getTime() - getTimestamp(b).getTime()
    );

    const results: Array<{ timestamp: Date; value: any; count: number }> = [];
    const window: T[] = [];

    for (const item of sorted) {
      const timestamp = getTimestamp(item);
      window.push(item);

      // Remove items outside window
      while (
        window.length > 0 &&
        timestamp.getTime() - getTimestamp(window[0]).getTime() > windowSize
      ) {
        window.shift();
      }

      results.push({
        timestamp,
        value: aggregateFn(window),
        count: window.length
      });
    }

    return results;
  }

  /**
   * Time bucket aggregation
   */
  timeBuckets<T>(
    items: T[],
    getTimestamp: (item: T) => Date,
    bucketSize: number, // milliseconds
    aggregateFn: (bucket: T[]) => any
  ): TimeWindow[] {
    if (items.length === 0) return [];

    const sorted = [...items].sort(
      (a, b) => getTimestamp(a).getTime() - getTimestamp(b).getTime()
    );

    const firstTime = getTimestamp(sorted[0]).getTime();
    const lastTime = getTimestamp(sorted[sorted.length - 1]).getTime();

    const buckets: TimeWindow[] = [];
    const bucketMap = new Map<number, T[]>();

    for (const item of sorted) {
      const time = getTimestamp(item).getTime();
      const bucketIndex = Math.floor((time - firstTime) / bucketSize);

      if (!bucketMap.has(bucketIndex)) {
        bucketMap.set(bucketIndex, []);
      }
      bucketMap.get(bucketIndex)!.push(item);
    }

    for (const [index, items] of bucketMap.entries()) {
      const start = new Date(firstTime + index * bucketSize);
      const end = new Date(firstTime + (index + 1) * bucketSize);

      buckets.push({
        start,
        end,
        count: items.length,
        values: [aggregateFn(items)]
      });
    }

    return buckets;
  }

  /**
   * Top K aggregation
   */
  topK<T>(
    items: T[],
    getValue: (item: T) => number,
    k: number
  ): T[] {
    return [...items]
      .sort((a, b) => getValue(b) - getValue(a))
      .slice(0, k);
  }

  /**
   * Count distinct values
   */
  countDistinct<T>(
    items: T[],
    getValue: (item: T) => any
  ): Map<any, number> {
    const counts = new Map<any, number>();

    for (const item of items) {
      const value = getValue(item);
      counts.set(value, (counts.get(value) || 0) + 1);
    }

    return counts;
  }

  /**
   * Histogram generation
   */
  histogram(
    values: number[],
    numBins: number = 10
  ): Array<{ min: number; max: number; count: number }> {
    if (values.length === 0) return [];

    const min = Math.min(...values);
    const max = Math.max(...values);
    const binSize = (max - min) / numBins;

    const bins = Array(numBins)
      .fill(0)
      .map((_, i) => ({
        min: min + i * binSize,
        max: min + (i + 1) * binSize,
        count: 0
      }));

    for (const value of values) {
      const binIndex = Math.min(
        Math.floor((value - min) / binSize),
        numBins - 1
      );
      bins[binIndex].count++;
    }

    return bins;
  }

  /**
   * Pivot table
   */
  pivot<T>(
    items: T[],
    rowKey: (item: T) => string,
    colKey: (item: T) => string,
    aggregateFn: (items: T[]) => any
  ): Map<string, Map<string, any>> {
    const pivot = new Map<string, Map<string, any>>();

    for (const item of items) {
      const row = rowKey(item);
      const col = colKey(item);

      if (!pivot.has(row)) {
        pivot.set(row, new Map());
      }

      const rowMap = pivot.get(row)!;
      if (!rowMap.has(col)) {
        rowMap.set(col, []);
      }

      rowMap.get(col)!.push(item);
    }

    // Apply aggregation
    const result = new Map<string, Map<string, any>>();
    for (const [row, cols] of pivot.entries()) {
      const rowResult = new Map<string, any>();
      for (const [col, items] of cols.entries()) {
        rowResult.set(col, aggregateFn(items));
      }
      result.set(row, rowResult);
    }

    return result;
  }

  /**
   * Running total
   */
  runningTotal(values: number[]): number[] {
    const result: number[] = [];
    let total = 0;

    for (const value of values) {
      total += value;
      result.push(total);
    }

    return result;
  }

  /**
   * Moving average
   */
  movingAverage(values: number[], windowSize: number): number[] {
    const result: number[] = [];

    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);
      const avg = window.reduce((a, b) => a + b, 0) / window.length;
      result.push(avg);
    }

    return result;
  }

  /**
   * Exponential moving average
   */
  exponentialMovingAverage(
    values: number[],
    alpha: number = 0.3
  ): number[] {
    if (values.length === 0) return [];

    const result: number[] = [values[0]];

    for (let i = 1; i < values.length; i++) {
      const ema = alpha * values[i] + (1 - alpha) * result[i - 1];
      result.push(ema);
    }

    return result;
  }
}
