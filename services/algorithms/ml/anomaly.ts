/**
 * Anomaly Detection Algorithms
 *
 * Time Complexity:
 * - Z-Score: O(n)
 * - IQR Method: O(n log n)
 * - Isolation Forest: O(n * m * log n) where m is number of trees
 * - Local Outlier Factor: O(n^2)
 *
 * Use Cases:
 * - Detecting unusual network traffic patterns
 * - Identifying zero-day attack signatures
 * - Finding anomalous user behavior
 * - Discovering outlier threat indicators
 */

export interface AnomalyScore {
  index: number;
  value: number;
  score: number;
  isAnomaly: boolean;
  metadata?: any;
}

export interface AnomalyResult {
  anomalies: AnomalyScore[];
  threshold: number;
  method: string;
  statistics: {
    mean?: number;
    stddev?: number;
    median?: number;
    q1?: number;
    q3?: number;
    iqr?: number;
  };
}

export class AnomalyDetection {
  /**
   * Z-Score based anomaly detection
   * Detects points more than k standard deviations from mean
   */
  zScore(values: number[], threshold: number = 3, metadata?: any[]): AnomalyResult {
    const mean = this.calculateMean(values);
    const stddev = this.calculateStdDev(values, mean);

    const anomalies: AnomalyScore[] = [];

    for (let i = 0; i < values.length; i++) {
      const zScore = stddev > 0 ? Math.abs((values[i] - mean) / stddev) : 0;
      const isAnomaly = zScore > threshold;

      if (isAnomaly) {
        anomalies.push({
          index: i,
          value: values[i],
          score: zScore,
          isAnomaly: true,
          metadata: metadata?.[i]
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'z-score',
      statistics: { mean, stddev }
    };
  }

  /**
   * Modified Z-Score using median absolute deviation (MAD)
   * More robust to outliers than standard Z-score
   */
  modifiedZScore(values: number[], threshold: number = 3.5): AnomalyResult {
    const median = this.calculateMedian(values);
    const deviations = values.map(v => Math.abs(v - median));
    const mad = this.calculateMedian(deviations);

    const anomalies: AnomalyScore[] = [];
    const k = 1.4826; // Constant for normal distribution

    for (let i = 0; i < values.length; i++) {
      const modifiedZScore =
        mad > 0 ? (0.6745 * (values[i] - median)) / (k * mad) : 0;
      const isAnomaly = Math.abs(modifiedZScore) > threshold;

      if (isAnomaly) {
        anomalies.push({
          index: i,
          value: values[i],
          score: Math.abs(modifiedZScore),
          isAnomaly: true
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'modified-z-score',
      statistics: { median }
    };
  }

  /**
   * Interquartile Range (IQR) method
   * Detects values outside [Q1 - k*IQR, Q3 + k*IQR]
   */
  iqr(values: number[], k: number = 1.5): AnomalyResult {
    const sorted = [...values].sort((a, b) => a - b);
    const q1 = this.calculatePercentile(sorted, 25);
    const q3 = this.calculatePercentile(sorted, 75);
    const iqr = q3 - q1;

    const lowerBound = q1 - k * iqr;
    const upperBound = q3 + k * iqr;

    const anomalies: AnomalyScore[] = [];

    for (let i = 0; i < values.length; i++) {
      const isAnomaly = values[i] < lowerBound || values[i] > upperBound;

      if (isAnomaly) {
        const score = values[i] < lowerBound
          ? (lowerBound - values[i]) / iqr
          : (values[i] - upperBound) / iqr;

        anomalies.push({
          index: i,
          value: values[i],
          score,
          isAnomaly: true
        });
      }
    }

    return {
      anomalies,
      threshold: k,
      method: 'iqr',
      statistics: { q1, q3, iqr, median: this.calculateMedian(values) }
    };
  }

  /**
   * Isolation Forest for multi-dimensional anomaly detection
   * Simplified implementation
   */
  isolationForest(
    data: number[][],
    numTrees: number = 100,
    sampleSize?: number,
    threshold: number = 0.6
  ): AnomalyResult {
    const n = data.length;
    sampleSize = sampleSize || Math.min(256, n);

    const scores: number[] = [];
    const trees: IsolationTree[] = [];

    // Build trees
    for (let i = 0; i < numTrees; i++) {
      const sample = this.randomSample(data, sampleSize);
      const tree = this.buildIsolationTree(sample, 0, Math.ceil(Math.log2(sampleSize)));
      trees.push(tree);
    }

    // Calculate anomaly scores
    for (let i = 0; i < n; i++) {
      const avgDepth = this.averagePathLength(data[i], trees);
      const c = this.averagePathLengthBST(sampleSize);
      const score = Math.pow(2, -avgDepth / c);
      scores.push(score);
    }

    const anomalies: AnomalyScore[] = [];

    for (let i = 0; i < scores.length; i++) {
      const isAnomaly = scores[i] > threshold;
      if (isAnomaly) {
        anomalies.push({
          index: i,
          value: 0, // Multi-dimensional, no single value
          score: scores[i],
          isAnomaly: true
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'isolation-forest',
      statistics: {}
    };
  }

  /**
   * Local Outlier Factor (LOF)
   * Density-based anomaly detection
   */
  localOutlierFactor(
    data: number[][],
    k: number = 5,
    threshold: number = 1.5
  ): AnomalyResult {
    const n = data.length;
    const lofScores: number[] = [];

    for (let i = 0; i < n; i++) {
      const knn = this.findKNearestNeighbors(data[i], data, k);
      const lrd = this.localReachabilityDensity(i, knn, data);

      let lofSum = 0;
      for (const neighborIdx of knn) {
        const neighborLrd = this.localReachabilityDensity(neighborIdx,
          this.findKNearestNeighbors(data[neighborIdx], data, k), data);
        lofSum += neighborLrd / lrd;
      }

      const lof = lofSum / k;
      lofScores.push(lof);
    }

    const anomalies: AnomalyScore[] = [];

    for (let i = 0; i < lofScores.length; i++) {
      const isAnomaly = lofScores[i] > threshold;
      if (isAnomaly) {
        anomalies.push({
          index: i,
          value: 0,
          score: lofScores[i],
          isAnomaly: true
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'local-outlier-factor',
      statistics: {}
    };
  }

  /**
   * DBSCAN-based anomaly detection
   * Points not belonging to any cluster are anomalies
   */
  dbscan(
    data: number[][],
    eps: number,
    minPts: number = 5
  ): AnomalyResult {
    const n = data.length;
    const visited = new Array(n).fill(false);
    const clusters = new Array(n).fill(-1); // -1 = noise/anomaly
    let clusterId = 0;

    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      visited[i] = true;

      const neighbors = this.rangeQuery(data, i, eps);

      if (neighbors.length < minPts) {
        clusters[i] = -1; // Mark as noise
      } else {
        this.expandCluster(data, i, neighbors, clusterId, clusters, visited, eps, minPts);
        clusterId++;
      }
    }

    const anomalies: AnomalyScore[] = [];

    for (let i = 0; i < clusters.length; i++) {
      if (clusters[i] === -1) {
        anomalies.push({
          index: i,
          value: 0,
          score: 1.0,
          isAnomaly: true
        });
      }
    }

    return {
      anomalies,
      threshold: 1.0,
      method: 'dbscan',
      statistics: {}
    };
  }

  /**
   * Moving average based anomaly detection
   * Detects deviations from moving average
   */
  movingAverage(
    values: number[],
    windowSize: number = 10,
    threshold: number = 2
  ): AnomalyResult {
    const anomalies: AnomalyScore[] = [];
    const movingAvgs: number[] = [];
    const movingStds: number[] = [];

    for (let i = 0; i < values.length; i++) {
      const start = Math.max(0, i - windowSize + 1);
      const window = values.slice(start, i + 1);

      const avg = this.calculateMean(window);
      const std = this.calculateStdDev(window, avg);

      movingAvgs.push(avg);
      movingStds.push(std);

      if (i >= windowSize - 1) {
        const zScore = std > 0 ? Math.abs((values[i] - avg) / std) : 0;
        const isAnomaly = zScore > threshold;

        if (isAnomaly) {
          anomalies.push({
            index: i,
            value: values[i],
            score: zScore,
            isAnomaly: true
          });
        }
      }
    }

    return {
      anomalies,
      threshold,
      method: 'moving-average',
      statistics: {}
    };
  }

  // Helper methods

  private calculateMean(values: number[]): number {
    return values.reduce((a, b) => a + b, 0) / values.length;
  }

  private calculateStdDev(values: number[], mean: number): number {
    const variance =
      values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
    return Math.sqrt(variance);
  }

  private calculateMedian(values: number[]): number {
    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  private calculatePercentile(sorted: number[], percentile: number): number {
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  }

  private randomSample<T>(data: T[], size: number): T[] {
    const result: T[] = [];
    const indices = new Set<number>();

    while (indices.size < size) {
      const idx = Math.floor(Math.random() * data.length);
      if (!indices.has(idx)) {
        indices.add(idx);
        result.push(data[idx]);
      }
    }

    return result;
  }

  private buildIsolationTree(
    data: number[][],
    depth: number,
    maxDepth: number
  ): IsolationTree {
    if (depth >= maxDepth || data.length <= 1) {
      return { size: data.length, depth };
    }

    const feature = Math.floor(Math.random() * data[0].length);
    const values = data.map(d => d[feature]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const splitValue = min + Math.random() * (max - min);

    const left = data.filter(d => d[feature] < splitValue);
    const right = data.filter(d => d[feature] >= splitValue);

    return {
      feature,
      splitValue,
      left: this.buildIsolationTree(left, depth + 1, maxDepth),
      right: this.buildIsolationTree(right, depth + 1, maxDepth)
    };
  }

  private averagePathLength(point: number[], trees: IsolationTree[]): number {
    const depths = trees.map(tree => this.pathLength(point, tree, 0));
    return depths.reduce((a, b) => a + b, 0) / trees.length;
  }

  private pathLength(point: number[], tree: IsolationTree, depth: number): number {
    if (tree.left === undefined || tree.right === undefined) {
      return depth + this.averagePathLengthBST(tree.size!);
    }

    if (point[tree.feature!] < tree.splitValue!) {
      return this.pathLength(point, tree.left, depth + 1);
    } else {
      return this.pathLength(point, tree.right, depth + 1);
    }
  }

  private averagePathLengthBST(n: number): number {
    if (n <= 1) return 0;
    const h = Math.log(n - 1) + 0.5772156649; // Euler's constant
    return 2 * h - (2 * (n - 1)) / n;
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  private findKNearestNeighbors(
    point: number[],
    data: number[][],
    k: number
  ): number[] {
    const distances = data.map((p, i) => ({
      index: i,
      distance: this.euclideanDistance(point, p)
    }));

    distances.sort((a, b) => a.distance - b.distance);
    return distances.slice(1, k + 1).map(d => d.index);
  }

  private localReachabilityDensity(
    index: number,
    neighbors: number[],
    data: number[][]
  ): number {
    let sum = 0;
    for (const neighborIdx of neighbors) {
      const dist = this.euclideanDistance(data[index], data[neighborIdx]);
      const kDist = this.kDistance(neighborIdx, data, neighbors.length);
      sum += Math.max(dist, kDist);
    }
    return neighbors.length / sum;
  }

  private kDistance(index: number, data: number[][], k: number): number {
    const distances = data.map((p, i) =>
      i === index ? Infinity : this.euclideanDistance(data[index], p)
    );
    distances.sort((a, b) => a - b);
    return distances[k - 1];
  }

  private rangeQuery(data: number[][], index: number, eps: number): number[] {
    const neighbors: number[] = [];
    for (let i = 0; i < data.length; i++) {
      if (i !== index && this.euclideanDistance(data[index], data[i]) <= eps) {
        neighbors.push(i);
      }
    }
    return neighbors;
  }

  private expandCluster(
    data: number[][],
    index: number,
    neighbors: number[],
    clusterId: number,
    clusters: number[],
    visited: boolean[],
    eps: number,
    minPts: number
  ): void {
    clusters[index] = clusterId;
    const queue = [...neighbors];

    while (queue.length > 0) {
      const current = queue.shift()!;

      if (!visited[current]) {
        visited[current] = true;
        const currentNeighbors = this.rangeQuery(data, current, eps);

        if (currentNeighbors.length >= minPts) {
          queue.push(...currentNeighbors);
        }
      }

      if (clusters[current] === -1) {
        clusters[current] = clusterId;
      }
    }
  }
}

interface IsolationTree {
  feature?: number;
  splitValue?: number;
  left?: IsolationTree;
  right?: IsolationTree;
  size?: number;
  depth?: number;
}
