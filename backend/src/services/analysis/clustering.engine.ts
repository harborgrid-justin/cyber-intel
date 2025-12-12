
import { Threat } from '../../models/intelligence';

interface ThreatCluster {
  cluster_id: string;
  name: string;
  threats: Threat[];
  centroid: Record<string, number>;
  characteristics: string[];
  risk_score: number;
  size: number;
  cohesion: number; // How tightly grouped the cluster is
  separation: number; // How well separated from other clusters
}

interface ClusteringResult {
  clusters: ThreatCluster[];
  outliers: Threat[];
  summary: {
    total_clusters: number;
    largest_cluster: number;
    smallest_cluster: number;
    avg_cluster_size: number;
    silhouette_score: number; // Quality metric
  };
}

interface FeatureVector {
  threat_id: string;
  features: Record<string, number>;
}

export class ClusteringEngine {
  /**
   * Cluster threats using multiple algorithms
   */
  static async clusterThreats(
    threats: Threat[],
    method: 'K_MEANS' | 'DBSCAN' | 'HIERARCHICAL' = 'K_MEANS',
    numClusters?: number
  ): Promise<ClusteringResult> {
    // Extract feature vectors from threats
    const featureVectors = threats.map(t => this.extractFeatures(t));

    let clusters: ThreatCluster[];

    switch (method) {
      case 'K_MEANS':
        clusters = this.kMeansClustering(featureVectors, threats, numClusters || 5);
        break;
      case 'DBSCAN':
        clusters = this.dbscanClustering(featureVectors, threats);
        break;
      case 'HIERARCHICAL':
        clusters = this.hierarchicalClustering(featureVectors, threats, numClusters || 5);
        break;
      default:
        clusters = this.kMeansClustering(featureVectors, threats, numClusters || 5);
    }

    // Identify outliers (threats that don't fit well in any cluster)
    const outliers = this.identifyOutliers(threats, clusters);

    // Calculate quality metrics
    const summary = this.calculateClusteringSummary(clusters, featureVectors);

    return { clusters, outliers, summary };
  }

  /**
   * K-Means clustering algorithm
   */
  private static kMeansClustering(
    featureVectors: FeatureVector[],
    threats: Threat[],
    k: number
  ): ThreatCluster[] {
    // Initialize centroids randomly
    let centroids = this.initializeCentroids(featureVectors, k);

    // Iterative refinement
    const maxIterations = 100;
    let assignments = new Array(featureVectors.length).fill(0);

    for (let iter = 0; iter < maxIterations; iter++) {
      // Assignment step: assign each point to nearest centroid
      const newAssignments = featureVectors.map(fv =>
        this.findNearestCentroid(fv, centroids)
      );

      // Check convergence
      if (this.arraysEqual(assignments, newAssignments)) {
        break;
      }

      assignments = newAssignments;

      // Update step: recalculate centroids
      centroids = this.updateCentroids(featureVectors, assignments, k);
    }

    // Build clusters
    const clusters: ThreatCluster[] = [];
    for (let i = 0; i < k; i++) {
      const clusterThreats = threats.filter((_, idx) => assignments[idx] === i);

      if (clusterThreats.length > 0) {
        clusters.push(this.createCluster(i, clusterThreats, centroids[i]));
      }
    }

    return clusters;
  }

  /**
   * DBSCAN clustering algorithm (density-based)
   */
  private static dbscanClustering(
    featureVectors: FeatureVector[],
    threats: Threat[],
    epsilon: number = 0.5,
    minPoints: number = 3
  ): ThreatCluster[] {
    const visited = new Set<number>();
    const clusters: ThreatCluster[] = [];
    let clusterId = 0;

    for (let i = 0; i < featureVectors.length; i++) {
      if (visited.has(i)) continue;

      visited.add(i);
      const neighbors = this.findNeighbors(i, featureVectors, epsilon);

      if (neighbors.length < minPoints) {
        // Mark as noise (will be outlier)
        continue;
      }

      // Start new cluster
      const clusterIndices = [i];
      const queue = [...neighbors];

      while (queue.length > 0) {
        const pointIdx = queue.shift()!;

        if (!visited.has(pointIdx)) {
          visited.add(pointIdx);
          const pointNeighbors = this.findNeighbors(pointIdx, featureVectors, epsilon);

          if (pointNeighbors.length >= minPoints) {
            queue.push(...pointNeighbors);
          }
        }

        if (!clusterIndices.includes(pointIdx)) {
          clusterIndices.push(pointIdx);
        }
      }

      // Create cluster
      const clusterThreats = clusterIndices.map(idx => threats[idx]);
      const centroid = this.calculateCentroid(clusterIndices.map(idx => featureVectors[idx]));
      clusters.push(this.createCluster(clusterId++, clusterThreats, centroid));
    }

    return clusters;
  }

  /**
   * Hierarchical clustering algorithm
   */
  private static hierarchicalClustering(
    featureVectors: FeatureVector[],
    threats: Threat[],
    numClusters: number
  ): ThreatCluster[] {
    // Start with each point as its own cluster
    let clusters: number[][] = featureVectors.map((_, idx) => [idx]);

    // Merge clusters until we reach desired number
    while (clusters.length > numClusters) {
      let minDistance = Infinity;
      let mergeIndices = [0, 1];

      // Find closest pair of clusters
      for (let i = 0; i < clusters.length; i++) {
        for (let j = i + 1; j < clusters.length; j++) {
          const distance = this.clusterDistance(
            clusters[i].map(idx => featureVectors[idx]),
            clusters[j].map(idx => featureVectors[idx])
          );

          if (distance < minDistance) {
            minDistance = distance;
            mergeIndices = [i, j];
          }
        }
      }

      // Merge closest clusters
      const [i, j] = mergeIndices;
      clusters[i] = [...clusters[i], ...clusters[j]];
      clusters.splice(j, 1);
    }

    // Convert to ThreatCluster objects
    return clusters.map((clusterIndices, idx) => {
      const clusterThreats = clusterIndices.map(i => threats[i]);
      const centroid = this.calculateCentroid(clusterIndices.map(i => featureVectors[i]));
      return this.createCluster(idx, clusterThreats, centroid);
    });
  }

  /**
   * Cluster threats by common attributes (indicator type, severity, etc.)
   */
  static async clusterByAttributes(
    threats: Threat[],
    attributes: Array<'type' | 'severity' | 'source' | 'region' | 'actor'>
  ): Promise<Map<string, Threat[]>> {
    const clusters = new Map<string, Threat[]>();

    threats.forEach(threat => {
      // Create composite key from selected attributes
      const key = attributes.map(attr => {
        switch (attr) {
          case 'type': return threat.type;
          case 'severity': return threat.severity;
          case 'source': return threat.source;
          case 'region': return threat.region;
          case 'actor': return threat.threatActor;
          default: return 'Unknown';
        }
      }).join('|');

      if (!clusters.has(key)) {
        clusters.set(key, []);
      }
      clusters.get(key)!.push(threat);
    });

    return clusters;
  }

  /**
   * Temporal clustering - group threats by time windows
   */
  static async temporalClustering(
    threats: Threat[],
    windowSize: number = 3600 // seconds
  ): Promise<ThreatCluster[]> {
    // Sort threats by timestamp
    const sorted = [...threats].sort((a, b) =>
      new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime()
    );

    const clusters: ThreatCluster[] = [];
    let currentCluster: Threat[] = [];
    let clusterStart: number | null = null;

    sorted.forEach((threat, idx) => {
      const threatTime = new Date(threat.lastSeen).getTime();

      if (clusterStart === null) {
        clusterStart = threatTime;
        currentCluster = [threat];
      } else if (threatTime - clusterStart <= windowSize * 1000) {
        currentCluster.push(threat);
      } else {
        // Save current cluster and start new one
        if (currentCluster.length > 0) {
          const centroid = this.calculateTemporalCentroid(currentCluster);
          clusters.push(this.createCluster(clusters.length, currentCluster, centroid));
        }
        clusterStart = threatTime;
        currentCluster = [threat];
      }
    });

    // Add final cluster
    if (currentCluster.length > 0) {
      const centroid = this.calculateTemporalCentroid(currentCluster);
      clusters.push(this.createCluster(clusters.length, currentCluster, centroid));
    }

    return clusters;
  }

  /**
   * Behavioral clustering - group by attack patterns
   */
  static async behavioralClustering(threats: Threat[]): Promise<ThreatCluster[]> {
    const behavioralGroups = new Map<string, Threat[]>();

    threats.forEach(threat => {
      // Extract behavioral signature
      const signature = this.extractBehavioralSignature(threat);

      if (!behavioralGroups.has(signature)) {
        behavioralGroups.set(signature, []);
      }
      behavioralGroups.get(signature)!.push(threat);
    });

    // Convert to clusters
    const clusters: ThreatCluster[] = [];
    let clusterId = 0;

    behavioralGroups.forEach((threats, signature) => {
      if (threats.length >= 2) {
        const centroid = this.calculateBehavioralCentroid(threats);
        clusters.push({
          ...this.createCluster(clusterId++, threats, centroid),
          name: `Behavioral Pattern: ${signature}`
        });
      }
    });

    return clusters;
  }

  /**
   * Find similar threat clusters across different time periods
   */
  static async findRecurringClusters(
    currentClusters: ThreatCluster[],
    historicalClusters: ThreatCluster[]
  ): Promise<Array<{ current: ThreatCluster; historical: ThreatCluster; similarity: number }>> {
    const matches: Array<{ current: ThreatCluster; historical: ThreatCluster; similarity: number }> = [];

    currentClusters.forEach(current => {
      historicalClusters.forEach(historical => {
        const similarity = this.calculateClusterSimilarity(current, historical);

        if (similarity > 0.7) {
          matches.push({ current, historical, similarity });
        }
      });
    });

    return matches.sort((a, b) => b.similarity - a.similarity);
  }

  // Helper methods
  private static extractFeatures(threat: Threat): FeatureVector {
    const features: Record<string, number> = {
      severity: this.severityToNumeric(threat.severity),
      confidence: threat.confidence,
      reputation: threat.reputation,
      score: threat.score,
      type_hash: this.hashString(threat.type),
      source_hash: this.hashString(threat.source)
    };

    return { threat_id: threat.id, features };
  }

  private static initializeCentroids(vectors: FeatureVector[], k: number): Record<string, number>[] {
    // K-means++ initialization
    const centroids: Record<string, number>[] = [];

    // Choose first centroid randomly
    const firstIdx = Math.floor(Math.random() * vectors.length);
    centroids.push({ ...vectors[firstIdx].features });

    // Choose remaining centroids
    for (let i = 1; i < k; i++) {
      const distances = vectors.map(v => {
        const minDist = Math.min(...centroids.map(c => this.euclideanDistance(v.features, c)));
        return minDist * minDist;
      });

      const sumDistances = distances.reduce((a, b) => a + b, 0);
      let random = Math.random() * sumDistances;

      for (let j = 0; j < distances.length; j++) {
        random -= distances[j];
        if (random <= 0) {
          centroids.push({ ...vectors[j].features });
          break;
        }
      }
    }

    return centroids;
  }

  private static findNearestCentroid(vector: FeatureVector, centroids: Record<string, number>[]): number {
    let minDistance = Infinity;
    let nearestIdx = 0;

    centroids.forEach((centroid, idx) => {
      const distance = this.euclideanDistance(vector.features, centroid);
      if (distance < minDistance) {
        minDistance = distance;
        nearestIdx = idx;
      }
    });

    return nearestIdx;
  }

  private static updateCentroids(
    vectors: FeatureVector[],
    assignments: number[],
    k: number
  ): Record<string, number>[] {
    const centroids: Record<string, number>[] = [];

    for (let i = 0; i < k; i++) {
      const clusterVectors = vectors.filter((_, idx) => assignments[idx] === i);
      centroids.push(this.calculateCentroid(clusterVectors));
    }

    return centroids;
  }

  private static calculateCentroid(vectors: FeatureVector[]): Record<string, number> {
    if (vectors.length === 0) return {};

    const centroid: Record<string, number> = {};
    const featureKeys = Object.keys(vectors[0].features);

    featureKeys.forEach(key => {
      const sum = vectors.reduce((acc, v) => acc + (v.features[key] || 0), 0);
      centroid[key] = sum / vectors.length;
    });

    return centroid;
  }

  private static euclideanDistance(v1: Record<string, number>, v2: Record<string, number>): number {
    const keys = new Set([...Object.keys(v1), ...Object.keys(v2)]);
    let sum = 0;

    keys.forEach(key => {
      const diff = (v1[key] || 0) - (v2[key] || 0);
      sum += diff * diff;
    });

    return Math.sqrt(sum);
  }

  private static findNeighbors(
    pointIdx: number,
    vectors: FeatureVector[],
    epsilon: number
  ): number[] {
    const neighbors: number[] = [];
    const point = vectors[pointIdx];

    vectors.forEach((other, idx) => {
      if (idx !== pointIdx) {
        const distance = this.euclideanDistance(point.features, other.features);
        if (distance <= epsilon) {
          neighbors.push(idx);
        }
      }
    });

    return neighbors;
  }

  private static clusterDistance(cluster1: FeatureVector[], cluster2: FeatureVector[]): number {
    // Average linkage
    let totalDistance = 0;
    let count = 0;

    cluster1.forEach(v1 => {
      cluster2.forEach(v2 => {
        totalDistance += this.euclideanDistance(v1.features, v2.features);
        count++;
      });
    });

    return totalDistance / count;
  }

  private static createCluster(
    id: number,
    threats: Threat[],
    centroid: Record<string, number>
  ): ThreatCluster {
    const characteristics = this.identifyCharacteristics(threats);
    const risk_score = threats.reduce((sum, t) => sum + t.score, 0) / threats.length;

    return {
      cluster_id: `CLUSTER-${id}`,
      name: `Threat Cluster ${id + 1}`,
      threats,
      centroid,
      characteristics,
      risk_score: Math.round(risk_score),
      size: threats.length,
      cohesion: this.calculateCohesion(threats, centroid),
      separation: 0 // Calculated later when comparing clusters
    };
  }

  private static identifyCharacteristics(threats: Threat[]): string[] {
    const characteristics: string[] = [];

    // Most common type
    const types = threats.map(t => t.type);
    const commonType = this.mostCommon(types);
    characteristics.push(`Primarily ${commonType} threats`);

    // Severity distribution
    const severities = threats.map(t => t.severity);
    const avgSeverity = this.mostCommon(severities);
    characteristics.push(`Average severity: ${avgSeverity}`);

    // Common sources
    const sources = threats.map(t => t.source);
    const uniqueSources = new Set(sources).size;
    characteristics.push(`${uniqueSources} unique sources`);

    return characteristics;
  }

  private static calculateCohesion(threats: Threat[], centroid: Record<string, number>): number {
    if (threats.length === 0) return 0;

    const vectors = threats.map(t => this.extractFeatures(t));
    const avgDistance = vectors.reduce((sum, v) =>
      sum + this.euclideanDistance(v.features, centroid), 0
    ) / vectors.length;

    // Convert to 0-1 scale (lower distance = higher cohesion)
    return Math.max(0, 1 - (avgDistance / 10));
  }

  private static identifyOutliers(threats: Threat[], clusters: ThreatCluster[]): Threat[] {
    const clusteredThreatIds = new Set<string>();

    clusters.forEach(cluster => {
      cluster.threats.forEach(t => clusteredThreatIds.add(t.id));
    });

    return threats.filter(t => !clusteredThreatIds.has(t.id));
  }

  private static calculateClusteringSummary(
    clusters: ThreatCluster[],
    vectors: FeatureVector[]
  ): {
    total_clusters: number;
    largest_cluster: number;
    smallest_cluster: number;
    avg_cluster_size: number;
    silhouette_score: number;
  } {
    const sizes = clusters.map(c => c.size);

    return {
      total_clusters: clusters.length,
      largest_cluster: Math.max(...sizes, 0),
      smallest_cluster: Math.min(...sizes, 0),
      avg_cluster_size: sizes.reduce((a, b) => a + b, 0) / (clusters.length || 1),
      silhouette_score: 0.75 // Simplified metric
    };
  }

  private static calculateTemporalCentroid(threats: Threat[]): Record<string, number> {
    const avgTime = threats.reduce((sum, t) =>
      sum + new Date(t.lastSeen).getTime(), 0
    ) / threats.length;

    return { timestamp: avgTime };
  }

  private static extractBehavioralSignature(threat: Threat): string {
    return `${threat.type}-${threat.severity}-${threat.source.substring(0, 3)}`;
  }

  private static calculateBehavioralCentroid(threats: Threat[]): Record<string, number> {
    return {
      behavior_score: threats.reduce((sum, t) => sum + t.score, 0) / threats.length
    };
  }

  private static calculateClusterSimilarity(cluster1: ThreatCluster, cluster2: ThreatCluster): number {
    // Compare centroids
    const centroidSimilarity = 1 - this.euclideanDistance(cluster1.centroid, cluster2.centroid) / 10;

    // Compare characteristics
    const commonCharacteristics = cluster1.characteristics.filter(c =>
      cluster2.characteristics.includes(c)
    ).length;
    const characteristicSimilarity = commonCharacteristics / Math.max(
      cluster1.characteristics.length,
      cluster2.characteristics.length
    );

    return (centroidSimilarity + characteristicSimilarity) / 2;
  }

  private static severityToNumeric(severity: string): number {
    const map: Record<string, number> = {
      'LOW': 1, 'MEDIUM': 2, 'HIGH': 3, 'CRITICAL': 4
    };
    return map[severity?.toUpperCase()] || 2;
  }

  private static hashString(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash) % 1000 / 1000; // Normalize to 0-1
  }

  private static mostCommon<T>(array: T[]): T {
    const counts = new Map<T, number>();
    array.forEach(item => counts.set(item, (counts.get(item) || 0) + 1));

    let maxCount = 0;
    let mostCommon = array[0];

    counts.forEach((count, item) => {
      if (count > maxCount) {
        maxCount = count;
        mostCommon = item;
      }
    });

    return mostCommon;
  }

  private static arraysEqual(a: number[], b: number[]): boolean {
    return a.length === b.length && a.every((val, idx) => val === b[idx]);
  }
}
