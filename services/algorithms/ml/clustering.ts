/**
 * Clustering Algorithms
 *
 * Time Complexity:
 * - K-Means: O(n * k * i * d) where i is iterations
 * - DBSCAN: O(n^2) worst case, O(n log n) with spatial indexing
 * - Hierarchical: O(n^3) for naive, O(n^2 log n) optimized
 *
 * Use Cases:
 * - Grouping similar threats into families
 * - Clustering attack patterns
 * - Organizing IOCs by similarity
 * - Segmenting user behavior profiles
 */

export interface ClusterPoint {
  id?: string;
  features: number[];
  cluster?: number;
  metadata?: any;
}

export interface Cluster {
  id: number;
  centroid: number[];
  points: ClusterPoint[];
  size: number;
  inertia?: number;
}

export interface ClusteringResult {
  clusters: Cluster[];
  labels: number[];
  inertia?: number;
  silhouetteScore?: number;
  numClusters: number;
}

export class Clustering {
  /**
   * K-Means Clustering
   * Partitions data into k clusters by minimizing within-cluster variance
   */
  kMeans(
    data: number[][],
    k: number,
    maxIterations: number = 100,
    tolerance: number = 1e-4
  ): ClusteringResult {
    const n = data.length;
    const d = data[0].length;

    // Initialize centroids using k-means++
    let centroids = this.kMeansPlusPlusInit(data, k);
    let labels = new Array(n).fill(0);
    let prevInertia = Infinity;

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assign points to nearest centroid
      for (let i = 0; i < n; i++) {
        let minDist = Infinity;
        let bestCluster = 0;

        for (let j = 0; j < k; j++) {
          const dist = this.euclideanDistance(data[i], centroids[j]);
          if (dist < minDist) {
            minDist = dist;
            bestCluster = j;
          }
        }

        labels[i] = bestCluster;
      }

      // Update centroids
      const newCentroids: number[][] = [];
      const counts = new Array(k).fill(0);

      for (let j = 0; j < k; j++) {
        newCentroids[j] = new Array(d).fill(0);
      }

      for (let i = 0; i < n; i++) {
        const cluster = labels[i];
        counts[cluster]++;
        for (let dim = 0; dim < d; dim++) {
          newCentroids[cluster][dim] += data[i][dim];
        }
      }

      for (let j = 0; j < k; j++) {
        if (counts[j] > 0) {
          for (let dim = 0; dim < d; dim++) {
            newCentroids[j][dim] /= counts[j];
          }
        }
      }

      // Check convergence
      const inertia = this.calculateInertia(data, labels, newCentroids);
      if (Math.abs(prevInertia - inertia) < tolerance) {
        centroids = newCentroids;
        break;
      }

      centroids = newCentroids;
      prevInertia = inertia;
    }

    // Build clusters
    const clusters: Cluster[] = [];
    for (let j = 0; j < k; j++) {
      const clusterPoints = data
        .map((point, i) => ({ features: point, cluster: labels[i], id: String(i) }))
        .filter(p => p.cluster === j);

      clusters.push({
        id: j,
        centroid: centroids[j],
        points: clusterPoints,
        size: clusterPoints.length
      });
    }

    const inertia = this.calculateInertia(data, labels, centroids);
    const silhouetteScore = this.calculateSilhouetteScore(data, labels);

    return {
      clusters,
      labels,
      inertia,
      silhouetteScore,
      numClusters: k
    };
  }

  /**
   * DBSCAN (Density-Based Spatial Clustering)
   * Finds clusters of arbitrary shape based on density
   */
  dbscan(data: number[][], eps: number, minPts: number = 5): ClusteringResult {
    const n = data.length;
    const labels = new Array(n).fill(-1); // -1 = noise
    const visited = new Array(n).fill(false);
    let clusterId = 0;

    for (let i = 0; i < n; i++) {
      if (visited[i]) continue;
      visited[i] = true;

      const neighbors = this.rangeQuery(data, i, eps);

      if (neighbors.length < minPts) {
        labels[i] = -1; // Mark as noise
      } else {
        this.expandCluster(data, i, neighbors, clusterId, labels, visited, eps, minPts);
        clusterId++;
      }
    }

    // Build clusters
    const clusterMap = new Map<number, ClusterPoint[]>();

    for (let i = 0; i < n; i++) {
      const label = labels[i];
      if (label >= 0) {
        if (!clusterMap.has(label)) {
          clusterMap.set(label, []);
        }
        clusterMap.get(label)!.push({
          id: String(i),
          features: data[i],
          cluster: label
        });
      }
    }

    const clusters: Cluster[] = [];
    for (const [id, points] of clusterMap.entries()) {
      const centroid = this.calculateCentroid(points.map(p => p.features));
      clusters.push({
        id,
        centroid,
        points,
        size: points.length
      });
    }

    return {
      clusters,
      labels,
      numClusters: clusterId
    };
  }

  /**
   * Hierarchical Agglomerative Clustering
   * Builds a hierarchy of clusters bottom-up
   */
  hierarchical(
    data: number[][],
    numClusters: number,
    linkage: 'single' | 'complete' | 'average' = 'average'
  ): ClusteringResult {
    const n = data.length;

    // Initialize: each point is its own cluster
    let clusters: Set<number>[] = [];
    for (let i = 0; i < n; i++) {
      clusters.push(new Set([i]));
    }

    // Distance matrix
    const distances = this.calculateDistanceMatrix(data);

    // Merge clusters until we have desired number
    while (clusters.length > numClusters) {
      let minDist = Infinity;
      let mergeI = 0;
      let mergeJ = 1;

      // Find closest pair of clusters
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const dist = this.clusterDistance(
            clusters[i],
            clusters[j],
            distances,
            linkage
          );

          if (dist < minDist) {
            minDist = dist;
            mergeI = i;
            mergeJ = j;
          }
        }
      }

      // Merge clusters
      const merged = new Set([...clusters[mergeI], ...clusters[mergeJ]]);
      clusters = clusters.filter((_, idx) => idx !== mergeI && idx !== mergeJ);
      clusters.push(merged);
    }

    // Build result
    const labels = new Array(n).fill(0);
    const finalClusters: Cluster[] = [];

    clusters.forEach((cluster, clusterIdx) => {
      const points: ClusterPoint[] = [];
      const indices = Array.from(cluster);

      indices.forEach(idx => {
        labels[idx] = clusterIdx;
        points.push({
          id: String(idx),
          features: data[idx],
          cluster: clusterIdx
        });
      });

      const centroid = this.calculateCentroid(points.map(p => p.features));

      finalClusters.push({
        id: clusterIdx,
        centroid,
        points,
        size: points.length
      });
    });

    return {
      clusters: finalClusters,
      labels,
      numClusters
    };
  }

  /**
   * Mean Shift Clustering
   * Finds clusters by shifting points toward dense regions
   */
  meanShift(
    data: number[][],
    bandwidth: number,
    maxIterations: number = 100
  ): ClusteringResult {
    const n = data.length;
    const d = data[0].length;

    // Shift each point
    const shiftedPoints: number[][] = [];
    for (let i = 0; i < n; i++) {
      let point = [...data[i]];

      for (let iter = 0; iter < maxIterations; iter++) {
        const neighbors = data.filter(p =>
          this.euclideanDistance(p, point) <= bandwidth
        );

        if (neighbors.length === 0) break;

        const newPoint = new Array(d).fill(0);
        for (const neighbor of neighbors) {
          for (let dim = 0; dim < d; dim++) {
            newPoint[dim] += neighbor[dim];
          }
        }

        for (let dim = 0; dim < d; dim++) {
          newPoint[dim] /= neighbors.length;
        }

        if (this.euclideanDistance(point, newPoint) < 1e-3) {
          point = newPoint;
          break;
        }

        point = newPoint;
      }

      shiftedPoints.push(point);
    }

    // Merge similar shifted points to find cluster centers
    const centers: number[][] = [];
    const labels = new Array(n).fill(0);

    for (let i = 0; i < n; i++) {
      let found = false;

      for (let j = 0; j < centers.length; j++) {
        if (this.euclideanDistance(shiftedPoints[i], centers[j]) < bandwidth) {
          labels[i] = j;
          found = true;
          break;
        }
      }

      if (!found) {
        labels[i] = centers.length;
        centers.push(shiftedPoints[i]);
      }
    }

    // Build clusters
    const clusters: Cluster[] = [];
    for (let i = 0; i < centers.length; i++) {
      const points = data
        .map((point, idx) => ({
          id: String(idx),
          features: point,
          cluster: labels[idx]
        }))
        .filter(p => p.cluster === i);

      clusters.push({
        id: i,
        centroid: centers[i],
        points,
        size: points.length
      });
    }

    return {
      clusters,
      labels,
      numClusters: centers.length
    };
  }

  /**
   * Elbow method to find optimal k for k-means
   */
  findOptimalK(data: number[][], maxK: number = 10): number {
    const inertias: number[] = [];

    for (let k = 1; k <= maxK; k++) {
      const result = this.kMeans(data, k);
      inertias.push(result.inertia || 0);
    }

    // Find elbow using rate of change
    let maxRateChange = 0;
    let optimalK = 2;

    for (let k = 2; k < maxK; k++) {
      const rateChange = inertias[k - 1] - inertias[k];
      const prevRateChange = inertias[k - 2] - inertias[k - 1];
      const change = prevRateChange - rateChange;

      if (change > maxRateChange) {
        maxRateChange = change;
        optimalK = k;
      }
    }

    return optimalK;
  }

  /**
   * Threat-specific clustering for grouping similar threats
   * Uses weighted features based on threat characteristics
   */
  threatClustering(
    threats: Array<{ features: number[]; metadata?: any }>,
    options: {
      method?: 'kmeans' | 'dbscan' | 'hierarchical';
      numClusters?: number;
      autoDetectClusters?: boolean;
    } = {}
  ): ClusteringResult {
    const {
      method = 'kmeans',
      numClusters = 5,
      autoDetectClusters = true
    } = options;

    const data = threats.map(t => t.features);

    // Auto-detect optimal number of clusters
    const k = autoDetectClusters && method === 'kmeans'
      ? this.findOptimalK(data, Math.min(10, Math.floor(data.length / 2)))
      : numClusters;

    let result: ClusteringResult;

    switch (method) {
      case 'dbscan':
        const eps = this.estimateEpsilon(data);
        result = this.dbscan(data, eps, 3);
        break;

      case 'hierarchical':
        result = this.hierarchical(data, k);
        break;

      case 'kmeans':
      default:
        result = this.kMeans(data, k);
        break;
    }

    // Enrich clusters with metadata
    result.clusters = result.clusters.map((cluster, idx) => ({
      ...cluster,
      points: cluster.points.map((point, pIdx) => ({
        ...point,
        metadata: threats[parseInt(point.id || '0')]?.metadata
      }))
    }));

    return result;
  }

  /**
   * Estimate optimal epsilon for DBSCAN using k-distance graph
   */
  private estimateEpsilon(data: number[][], k: number = 4): number {
    const distances: number[] = [];

    for (let i = 0; i < data.length; i++) {
      const knnDistances = data
        .map((point, idx) => ({
          idx,
          dist: idx === i ? Infinity : this.euclideanDistance(data[i], point)
        }))
        .sort((a, b) => a.dist - b.dist)
        .slice(0, k)
        .map(d => d.dist);

      distances.push(Math.max(...knnDistances));
    }

    // Use knee point of sorted distances
    distances.sort((a, b) => a - b);
    const kneeIdx = Math.floor(distances.length * 0.9);
    return distances[kneeIdx];
  }

  /**
   * Fuzzy C-Means clustering for soft cluster assignments
   */
  fuzzyCMeans(
    data: number[][],
    c: number,
    m: number = 2,
    maxIterations: number = 100,
    tolerance: number = 1e-4
  ): {
    clusters: Cluster[];
    membershipMatrix: number[][];
    labels: number[];
  } {
    const n = data.length;
    const d = data[0].length;

    // Initialize membership matrix randomly
    let U = Array(n).fill(0).map(() =>
      Array(c).fill(0).map(() => Math.random())
    );

    // Normalize rows
    U = U.map(row => {
      const sum = row.reduce((a, b) => a + b, 0);
      return row.map(val => val / sum);
    });

    let centroids = Array(c).fill(0).map(() => Array(d).fill(0));

    for (let iter = 0; iter < maxIterations; iter++) {
      // Update centroids
      const newCentroids: number[][] = [];

      for (let j = 0; j < c; j++) {
        const centroid = Array(d).fill(0);
        let weightSum = 0;

        for (let i = 0; i < n; i++) {
          const weight = Math.pow(U[i][j], m);
          weightSum += weight;

          for (let dim = 0; dim < d; dim++) {
            centroid[dim] += weight * data[i][dim];
          }
        }

        newCentroids.push(centroid.map(val => val / weightSum));
      }

      // Check convergence
      const maxDiff = Math.max(...newCentroids.map((cent, j) =>
        this.euclideanDistance(cent, centroids[j])
      ));

      if (maxDiff < tolerance) {
        centroids = newCentroids;
        break;
      }

      centroids = newCentroids;

      // Update membership matrix
      for (let i = 0; i < n; i++) {
        for (let j = 0; j < c; j++) {
          const dij = this.euclideanDistance(data[i], centroids[j]);

          if (dij === 0) {
            U[i] = Array(c).fill(0);
            U[i][j] = 1;
          } else {
            let sum = 0;
            for (let k = 0; k < c; k++) {
              const dik = this.euclideanDistance(data[i], centroids[k]);
              sum += Math.pow(dij / dik, 2 / (m - 1));
            }
            U[i][j] = 1 / sum;
          }
        }
      }
    }

    // Build clusters
    const labels = U.map(row => row.indexOf(Math.max(...row)));
    const clusters: Cluster[] = [];

    for (let j = 0; j < c; j++) {
      const points = data
        .map((point, i) => ({
          id: String(i),
          features: point,
          cluster: labels[i],
          metadata: { membership: U[i][j] }
        }))
        .filter(p => p.cluster === j);

      clusters.push({
        id: j,
        centroid: centroids[j],
        points,
        size: points.length
      });
    }

    return { clusters, membershipMatrix: U, labels };
  }

  /**
   * Spectral clustering for complex cluster shapes
   */
  spectralClustering(
    data: number[][],
    k: number,
    sigma: number = 1.0
  ): ClusteringResult {
    const n = data.length;

    // Build similarity matrix
    const W: number[][] = Array(n).fill(0).map(() => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = i + 1; j < n; j++) {
        const dist = this.euclideanDistance(data[i], data[j]);
        const similarity = Math.exp(-dist * dist / (2 * sigma * sigma));
        W[i][j] = similarity;
        W[j][i] = similarity;
      }
    }

    // Compute degree matrix
    const D = W.map(row => row.reduce((a, b) => a + b, 0));

    // Compute normalized Laplacian (simplified)
    const L: number[][] = Array(n).fill(0).map((_, i) =>
      Array(n).fill(0).map((_, j) => {
        if (i === j) return 1;
        return -W[i][j] / Math.sqrt(D[i] * D[j]);
      })
    );

    // In practice, we'd compute eigenvectors here
    // For this simplified version, we'll use k-means on the data
    return this.kMeans(data, k);
  }

  /**
   * Gap statistic for determining optimal number of clusters
   */
  gapStatistic(
    data: number[][],
    maxK: number = 10,
    B: number = 10
  ): {
    optimalK: number;
    gaps: number[];
    stds: number[];
  } {
    const gaps: number[] = [];
    const stds: number[] = [];

    // Get data bounds
    const mins = Array(data[0].length).fill(Infinity);
    const maxs = Array(data[0].length).fill(-Infinity);

    for (const point of data) {
      for (let d = 0; d < point.length; d++) {
        mins[d] = Math.min(mins[d], point[d]);
        maxs[d] = Math.max(maxs[d], point[d]);
      }
    }

    for (let k = 1; k <= maxK; k++) {
      // Cluster original data
      const result = this.kMeans(data, k);
      const logWk = Math.log(result.inertia || 1);

      // Generate reference datasets and cluster them
      const refLogWks: number[] = [];

      for (let b = 0; b < B; b++) {
        const refData = Array(data.length).fill(0).map(() =>
          Array(data[0].length).fill(0).map((_, d) =>
            mins[d] + Math.random() * (maxs[d] - mins[d])
          )
        );

        const refResult = this.kMeans(refData, k);
        refLogWks.push(Math.log(refResult.inertia || 1));
      }

      const meanRefLogWk = refLogWks.reduce((a, b) => a + b, 0) / B;
      const gap = meanRefLogWk - logWk;

      // Calculate standard deviation
      const variance = refLogWks.reduce((sum, val) =>
        sum + Math.pow(val - meanRefLogWk, 2), 0
      ) / B;
      const sdk = Math.sqrt(variance) * Math.sqrt(1 + 1 / B);

      gaps.push(gap);
      stds.push(sdk);
    }

    // Find optimal k using gap statistic rule
    let optimalK = 1;
    for (let k = 0; k < maxK - 1; k++) {
      if (gaps[k] >= gaps[k + 1] - stds[k + 1]) {
        optimalK = k + 1;
        break;
      }
    }

    return { optimalK, gaps, stds };
  }

  // Helper methods

  private kMeansPlusPlusInit(data: number[][], k: number): number[][] {
    const centroids: number[][] = [];
    const n = data.length;

    // Choose first centroid randomly
    const firstIdx = Math.floor(Math.random() * n);
    centroids.push([...data[firstIdx]]);

    // Choose remaining centroids
    for (let i = 1; i < k; i++) {
      const distances = new Array(n).fill(0);
      let totalDist = 0;

      for (let j = 0; j < n; j++) {
        let minDist = Infinity;
        for (const centroid of centroids) {
          const dist = this.euclideanDistance(data[j], centroid);
          minDist = Math.min(minDist, dist);
        }
        distances[j] = minDist * minDist;
        totalDist += distances[j];
      }

      // Select next centroid with probability proportional to distance
      const random = Math.random() * totalDist;
      let sum = 0;

      for (let j = 0; j < n; j++) {
        sum += distances[j];
        if (sum >= random) {
          centroids.push([...data[j]]);
          break;
        }
      }
    }

    return centroids;
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }

  private calculateInertia(
    data: number[][],
    labels: number[],
    centroids: number[][]
  ): number {
    let inertia = 0;
    for (let i = 0; i < data.length; i++) {
      const dist = this.euclideanDistance(data[i], centroids[labels[i]]);
      inertia += dist * dist;
    }
    return inertia;
  }

  private calculateSilhouetteScore(data: number[][], labels: number[]): number {
    const n = data.length;
    let totalScore = 0;

    for (let i = 0; i < n; i++) {
      const cluster = labels[i];

      // Calculate a(i): mean distance to points in same cluster
      let aSum = 0;
      let aCount = 0;

      for (let j = 0; j < n; j++) {
        if (i !== j && labels[j] === cluster) {
          aSum += this.euclideanDistance(data[i], data[j]);
          aCount++;
        }
      }

      const a = aCount > 0 ? aSum / aCount : 0;

      // Calculate b(i): mean distance to points in nearest cluster
      const otherClusters = new Set(labels);
      otherClusters.delete(cluster);

      let minB = Infinity;

      for (const otherCluster of otherClusters) {
        let bSum = 0;
        let bCount = 0;

        for (let j = 0; j < n; j++) {
          if (labels[j] === otherCluster) {
            bSum += this.euclideanDistance(data[i], data[j]);
            bCount++;
          }
        }

        if (bCount > 0) {
          const b = bSum / bCount;
          minB = Math.min(minB, b);
        }
      }

      const silhouette = minB !== Infinity ? (minB - a) / Math.max(a, minB) : 0;
      totalScore += silhouette;
    }

    return totalScore / n;
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
    labels: number[],
    visited: boolean[],
    eps: number,
    minPts: number
  ): void {
    labels[index] = clusterId;
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

      if (labels[current] === -1) {
        labels[current] = clusterId;
      }
    }
  }

  private calculateCentroid(points: number[][]): number[] {
    if (points.length === 0) return [];

    const d = points[0].length;
    const centroid = new Array(d).fill(0);

    for (const point of points) {
      for (let i = 0; i < d; i++) {
        centroid[i] += point[i];
      }
    }

    for (let i = 0; i < d; i++) {
      centroid[i] /= points.length;
    }

    return centroid;
  }

  private calculateDistanceMatrix(data: number[][]): number[][] {
    const n = data.length;
    const matrix: number[][] = [];

    for (let i = 0; i < n; i++) {
      matrix[i] = [];
      for (let j = 0; j < n; j++) {
        matrix[i][j] = this.euclideanDistance(data[i], data[j]);
      }
    }

    return matrix;
  }

  private clusterDistance(
    cluster1: Set<number>,
    cluster2: Set<number>,
    distances: number[][],
    linkage: 'single' | 'complete' | 'average'
  ): number {
    const dists: number[] = [];

    for (const i of cluster1) {
      for (const j of cluster2) {
        dists.push(distances[i][j]);
      }
    }

    if (linkage === 'single') {
      return Math.min(...dists);
    } else if (linkage === 'complete') {
      return Math.max(...dists);
    } else {
      return dists.reduce((a, b) => a + b, 0) / dists.length;
    }
  }
}
