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

  /**
   * Exponential Weighted Moving Average (EWMA) for anomaly detection
   * More responsive to recent changes than simple moving average
   */
  ewma(
    values: number[],
    alpha: number = 0.3,
    threshold: number = 3
  ): AnomalyResult {
    if (values.length === 0) {
      return { anomalies: [], threshold, method: 'ewma', statistics: {} };
    }

    const anomalies: AnomalyScore[] = [];
    let ewmaValue = values[0];
    let ewmaVariance = 0;

    for (let i = 1; i < values.length; i++) {
      const prevEwma = ewmaValue;
      ewmaValue = alpha * values[i] + (1 - alpha) * ewmaValue;

      // Update variance estimate
      const diff = values[i] - prevEwma;
      ewmaVariance = (1 - alpha) * (ewmaVariance + alpha * diff * diff);

      const stdDev = Math.sqrt(ewmaVariance);
      const zScore = stdDev > 0 ? Math.abs((values[i] - ewmaValue) / stdDev) : 0;

      if (zScore > threshold && i > 10) { // Skip initial warm-up period
        anomalies.push({
          index: i,
          value: values[i],
          score: zScore,
          isAnomaly: true,
          metadata: { ewmaValue, stdDev }
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'ewma',
      statistics: { mean: ewmaValue }
    };
  }

  /**
   * Seasonal Hybrid ESD (Extreme Studentized Deviate) Test
   * Detects multiple anomalies in time series with seasonality
   */
  seasonalESD(
    values: number[],
    maxAnomalies: number = 10,
    alpha: number = 0.05
  ): AnomalyResult {
    const n = values.length;
    if (n < 3) {
      return { anomalies: [], threshold: 0, method: 'seasonal-esd', statistics: {} };
    }

    const anomalies: AnomalyScore[] = [];
    const workingValues = [...values];
    const anomalyIndices: number[] = [];

    for (let i = 0; i < maxAnomalies && workingValues.length > 2; i++) {
      const mean = this.calculateMean(workingValues);
      const stddev = this.calculateStdDev(workingValues, mean);

      // Find most extreme point
      let maxZ = 0;
      let maxIdx = -1;

      for (let j = 0; j < workingValues.length; j++) {
        const z = Math.abs((workingValues[j] - mean) / stddev);
        if (z > maxZ) {
          maxZ = z;
          maxIdx = j;
        }
      }

      // Calculate critical value
      const p = 1 - alpha / (2 * (n - i));
      const tDist = this.calculateTCritical(n - i - 2, p);
      const criticalValue = ((n - i - 1) * tDist) /
        Math.sqrt((n - i) * (n - i - 2 + tDist * tDist));

      if (maxZ > criticalValue) {
        const originalIdx = anomalyIndices.length > 0
          ? this.findOriginalIndex(values, workingValues[maxIdx], anomalyIndices)
          : maxIdx;

        anomalies.push({
          index: originalIdx,
          value: workingValues[maxIdx],
          score: maxZ,
          isAnomaly: true
        });

        anomalyIndices.push(maxIdx);
        workingValues.splice(maxIdx, 1);
      } else {
        break;
      }
    }

    return {
      anomalies: anomalies.sort((a, b) => a.index - b.index),
      threshold: alpha,
      method: 'seasonal-esd',
      statistics: {}
    };
  }

  /**
   * One-Class SVM for anomaly detection (simplified implementation)
   * Learns boundary around normal data
   */
  oneClassSVM(
    data: number[][],
    nu: number = 0.1,
    threshold: number = 0
  ): AnomalyResult {
    const n = data.length;

    // Simplified: Use distance from mean as proxy for SVM decision
    const centroid = this.calculateCentroid(data);
    const distances = data.map(point => this.euclideanDistance(point, centroid));

    // Calculate threshold using nu parameter
    const sortedDistances = [...distances].sort((a, b) => a - b);
    const thresholdIdx = Math.floor((1 - nu) * n);
    const autoThreshold = sortedDistances[thresholdIdx];

    const anomalies: AnomalyScore[] = [];

    for (let i = 0; i < n; i++) {
      if (distances[i] > autoThreshold) {
        anomalies.push({
          index: i,
          value: distances[i],
          score: distances[i] / autoThreshold,
          isAnomaly: true,
          metadata: { distance: distances[i], threshold: autoThreshold }
        });
      }
    }

    return {
      anomalies,
      threshold: autoThreshold,
      method: 'one-class-svm',
      statistics: {}
    };
  }

  /**
   * Autoencoder-inspired anomaly detection using reconstruction error
   * Simplified statistical version without deep learning
   */
  reconstructionError(
    data: number[][],
    compressionRatio: number = 0.5,
    threshold: number = 2
  ): AnomalyResult {
    const n = data.length;
    const d = data[0].length;

    // Use PCA-like dimensionality reduction
    const mean = this.calculateCentroid(data);
    const centered = data.map(point =>
      point.map((val, i) => val - mean[i])
    );

    // Calculate covariance matrix (simplified)
    const errors: number[] = [];

    for (let i = 0; i < n; i++) {
      // Reconstruction error is deviation from mean projection
      const error = this.euclideanDistance(centered[i], new Array(d).fill(0));
      errors.push(error);
    }

    const meanError = this.calculateMean(errors);
    const stdError = this.calculateStdDev(errors, meanError);

    const anomalies: AnomalyScore[] = [];

    for (let i = 0; i < n; i++) {
      const zScore = stdError > 0 ? (errors[i] - meanError) / stdError : 0;
      if (zScore > threshold) {
        anomalies.push({
          index: i,
          value: errors[i],
          score: zScore,
          isAnomaly: true,
          metadata: { reconstructionError: errors[i] }
        });
      }
    }

    return {
      anomalies,
      threshold,
      method: 'reconstruction-error',
      statistics: { mean: meanError, stddev: stdError }
    };
  }

  /**
   * Ensemble anomaly detection - combines multiple methods
   */
  ensemble(
    data: number[] | number[][],
    methods: string[] = ['z-score', 'iqr', 'isolation-forest'],
    votingThreshold: number = 0.5
  ): AnomalyResult {
    const results: AnomalyResult[] = [];
    const isMultiDim = Array.isArray(data[0]);

    // Run each method
    for (const method of methods) {
      try {
        let result: AnomalyResult;

        if (isMultiDim) {
          const multiData = data as number[][];
          switch (method) {
            case 'isolation-forest':
              result = this.isolationForest(multiData);
              break;
            case 'local-outlier-factor':
              result = this.localOutlierFactor(multiData);
              break;
            case 'dbscan':
              result = this.dbscan(multiData, 0.5);
              break;
            default:
              continue;
          }
        } else {
          const singleData = data as number[];
          switch (method) {
            case 'z-score':
              result = this.zScore(singleData);
              break;
            case 'iqr':
              result = this.iqr(singleData);
              break;
            case 'modified-z-score':
              result = this.modifiedZScore(singleData);
              break;
            case 'moving-average':
              result = this.movingAverage(singleData);
              break;
            default:
              continue;
          }
        }

        results.push(result);
      } catch (error) {
        // Skip methods that fail
        continue;
      }
    }

    // Vote on anomalies
    const votes = new Map<number, number>();
    const anomalyData = new Map<number, AnomalyScore>();

    for (const result of results) {
      for (const anomaly of result.anomalies) {
        votes.set(anomaly.index, (votes.get(anomaly.index) || 0) + 1);
        if (!anomalyData.has(anomaly.index)) {
          anomalyData.set(anomaly.index, anomaly);
        }
      }
    }

    const minVotes = Math.ceil(results.length * votingThreshold);
    const anomalies: AnomalyScore[] = [];

    for (const [index, voteCount] of votes.entries()) {
      if (voteCount >= minVotes) {
        const anomaly = anomalyData.get(index)!;
        anomalies.push({
          ...anomaly,
          score: voteCount / results.length,
          metadata: { votes: voteCount, methods: results.length }
        });
      }
    }

    return {
      anomalies: anomalies.sort((a, b) => a.index - b.index),
      threshold: votingThreshold,
      method: 'ensemble',
      statistics: { methodsUsed: results.length }
    };
  }

  // Additional helper methods

  private calculateCentroid(data: number[][]): number[] {
    const n = data.length;
    const d = data[0].length;
    const centroid = new Array(d).fill(0);

    for (const point of data) {
      for (let i = 0; i < d; i++) {
        centroid[i] += point[i];
      }
    }

    return centroid.map(val => val / n);
  }

  private calculateTCritical(df: number, p: number): number {
    // Simplified t-distribution critical value approximation
    if (df < 1) return 0;
    if (df === 1) return 12.706;
    if (df === 2) return 4.303;
    if (df <= 30) return 2.042 + (12.706 - 2.042) * Math.exp(-df / 5);
    return 1.96; // Normal approximation for large df
  }

  private findOriginalIndex(original: number[], value: number, excludeIndices: number[]): number {
    for (let i = 0; i < original.length; i++) {
      if (!excludeIndices.includes(i) && Math.abs(original[i] - value) < 1e-10) {
        return i;
      }
    }
    return 0;
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
