/**
 * Classification Algorithms
 *
 * Time Complexity:
 * - Naive Bayes: O(n * d) training, O(d * k) prediction
 * - KNN: O(n) prediction
 * - Decision Tree: O(n * d * log n) training
 *
 * Use Cases:
 * - Threat type classification (malware, phishing, APT)
 * - Severity level prediction
 * - Attack stage identification
 * - IOC category classification
 */

export interface ClassificationModel {
  type: string;
  classes: string[];
  trained: boolean;
}

export interface PredictionResult {
  predictedClass: string;
  confidence: number;
  probabilities: Map<string, number>;
}

export class NaiveBayesClassifier implements ClassificationModel {
  type = 'naive-bayes';
  classes: string[] = [];
  trained = false;

  private classPriors: Map<string, number> = new Map();
  private featureProbabilities: Map<string, Map<number, Map<any, number>>> = new Map();
  private featureStats: Map<string, Map<number, { mean: number; variance: number }>> = new Map();

  train(features: number[][], labels: string[]): void {
    this.classes = Array.from(new Set(labels));
    const n = features.length;
    const d = features[0].length;

    // Calculate class priors
    for (const cls of this.classes) {
      const count = labels.filter(l => l === cls).length;
      this.classPriors.set(cls, count / n);
    }

    // Calculate feature statistics for each class (Gaussian NB)
    for (const cls of this.classes) {
      this.featureStats.set(cls, new Map());
      const classIndices = labels.map((l, i) => l === cls ? i : -1).filter(i => i >= 0);

      for (let j = 0; j < d; j++) {
        const values = classIndices.map(i => features[i][j]);
        const mean = values.reduce((a, b) => a + b, 0) / values.length;
        const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;

        this.featureStats.get(cls)!.set(j, { mean, variance: variance + 1e-9 });
      }
    }

    this.trained = true;
  }

  predict(features: number[]): PredictionResult {
    const probabilities = new Map<string, number>();
    let maxProb = -Infinity;
    let predictedClass = this.classes[0];

    for (const cls of this.classes) {
      let logProb = Math.log(this.classPriors.get(cls)!);
      const stats = this.featureStats.get(cls)!;

      for (let j = 0; j < features.length; j++) {
        const { mean, variance } = stats.get(j)!;
        const prob = this.gaussianProbability(features[j], mean, variance);
        logProb += Math.log(prob + 1e-10);
      }

      probabilities.set(cls, Math.exp(logProb));

      if (logProb > maxProb) {
        maxProb = logProb;
        predictedClass = cls;
      }
    }

    // Normalize probabilities
    const total = Array.from(probabilities.values()).reduce((a, b) => a + b, 0);
    for (const [cls, prob] of probabilities.entries()) {
      probabilities.set(cls, prob / total);
    }

    return {
      predictedClass,
      confidence: probabilities.get(predictedClass)!,
      probabilities
    };
  }

  private gaussianProbability(x: number, mean: number, variance: number): number {
    const exponent = -Math.pow(x - mean, 2) / (2 * variance);
    return Math.exp(exponent) / Math.sqrt(2 * Math.PI * variance);
  }
}

export class KNNClassifier implements ClassificationModel {
  type = 'knn';
  classes: string[] = [];
  trained = false;

  private trainingData: number[][] = [];
  private trainingLabels: string[] = [];
  private k: number;

  constructor(k: number = 5) {
    this.k = k;
  }

  train(features: number[][], labels: string[]): void {
    this.trainingData = features;
    this.trainingLabels = labels;
    this.classes = Array.from(new Set(labels));
    this.trained = true;
  }

  predict(features: number[]): PredictionResult {
    // Find k nearest neighbors
    const distances = this.trainingData.map((point, i) => ({
      index: i,
      distance: this.euclideanDistance(features, point),
      label: this.trainingLabels[i]
    }));

    distances.sort((a, b) => a.distance - b.distance);
    const neighbors = distances.slice(0, this.k);

    // Count votes
    const votes = new Map<string, number>();
    for (const neighbor of neighbors) {
      votes.set(neighbor.label, (votes.get(neighbor.label) || 0) + 1);
    }

    // Calculate probabilities
    const probabilities = new Map<string, number>();
    for (const cls of this.classes) {
      probabilities.set(cls, (votes.get(cls) || 0) / this.k);
    }

    let predictedClass = this.classes[0];
    let maxVotes = 0;

    for (const [cls, count] of votes.entries()) {
      if (count > maxVotes) {
        maxVotes = count;
        predictedClass = cls;
      }
    }

    return {
      predictedClass,
      confidence: probabilities.get(predictedClass)!,
      probabilities
    };
  }

  private euclideanDistance(a: number[], b: number[]): number {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }
}

export class DecisionTreeClassifier implements ClassificationModel {
  type = 'decision-tree';
  classes: string[] = [];
  trained = false;

  private root?: TreeNode;
  private maxDepth: number;
  private minSamplesSplit: number;

  constructor(maxDepth: number = 10, minSamplesSplit: number = 2) {
    this.maxDepth = maxDepth;
    this.minSamplesSplit = minSamplesSplit;
  }

  train(features: number[][], labels: string[]): void {
    this.classes = Array.from(new Set(labels));
    this.root = this.buildTree(features, labels, 0);
    this.trained = true;
  }

  predict(features: number[]): PredictionResult {
    let node = this.root;

    while (node && !node.isLeaf) {
      if (features[node.feature!] <= node.threshold!) {
        node = node.left;
      } else {
        node = node.right;
      }
    }

    const classCounts = node?.classCounts || new Map();
    const total = Array.from(classCounts.values()).reduce((a, b) => a + b, 0);
    const probabilities = new Map<string, number>();

    for (const cls of this.classes) {
      probabilities.set(cls, (classCounts.get(cls) || 0) / total);
    }

    return {
      predictedClass: node?.predictedClass || this.classes[0],
      confidence: probabilities.get(node?.predictedClass || this.classes[0])!,
      probabilities
    };
  }

  private buildTree(features: number[][], labels: string[], depth: number): TreeNode {
    const classCounts = this.countClasses(labels);
    const majorityClass = this.getMajorityClass(classCounts);

    // Stopping criteria
    if (
      depth >= this.maxDepth ||
      labels.length < this.minSamplesSplit ||
      classCounts.size === 1
    ) {
      return {
        isLeaf: true,
        predictedClass: majorityClass,
        classCounts
      };
    }

    // Find best split
    const { feature, threshold, gain } = this.findBestSplit(features, labels);

    if (gain === 0) {
      return {
        isLeaf: true,
        predictedClass: majorityClass,
        classCounts
      };
    }

    // Split data
    const { leftFeatures, leftLabels, rightFeatures, rightLabels } = this.splitData(
      features,
      labels,
      feature,
      threshold
    );

    return {
      isLeaf: false,
      feature,
      threshold,
      left: this.buildTree(leftFeatures, leftLabels, depth + 1),
      right: this.buildTree(rightFeatures, rightLabels, depth + 1),
      predictedClass: majorityClass,
      classCounts
    };
  }

  private findBestSplit(features: number[][], labels: string[]): {
    feature: number;
    threshold: number;
    gain: number;
  } {
    let bestGain = 0;
    let bestFeature = 0;
    let bestThreshold = 0;

    const baseEntropy = this.calculateEntropy(labels);
    const numFeatures = features[0].length;

    for (let f = 0; f < numFeatures; f++) {
      const values = features.map(row => row[f]);
      const uniqueValues = Array.from(new Set(values)).sort((a, b) => a - b);

      for (let i = 0; i < uniqueValues.length - 1; i++) {
        const threshold = (uniqueValues[i] + uniqueValues[i + 1]) / 2;
        const gain = this.informationGain(features, labels, f, threshold, baseEntropy);

        if (gain > bestGain) {
          bestGain = gain;
          bestFeature = f;
          bestThreshold = threshold;
        }
      }
    }

    return { feature: bestFeature, threshold: bestThreshold, gain: bestGain };
  }

  private informationGain(
    features: number[][],
    labels: string[],
    feature: number,
    threshold: number,
    baseEntropy: number
  ): number {
    const { leftLabels, rightLabels } = this.splitData(
      features,
      labels,
      feature,
      threshold
    );

    if (leftLabels.length === 0 || rightLabels.length === 0) {
      return 0;
    }

    const n = labels.length;
    const leftWeight = leftLabels.length / n;
    const rightWeight = rightLabels.length / n;

    const weightedEntropy =
      leftWeight * this.calculateEntropy(leftLabels) +
      rightWeight * this.calculateEntropy(rightLabels);

    return baseEntropy - weightedEntropy;
  }

  private calculateEntropy(labels: string[]): number {
    const counts = this.countClasses(labels);
    const total = labels.length;
    let entropy = 0;

    for (const count of counts.values()) {
      const prob = count / total;
      entropy -= prob * Math.log2(prob);
    }

    return entropy;
  }

  private countClasses(labels: string[]): Map<string, number> {
    const counts = new Map<string, number>();
    for (const label of labels) {
      counts.set(label, (counts.get(label) || 0) + 1);
    }
    return counts;
  }

  private getMajorityClass(classCounts: Map<string, number>): string {
    let maxCount = 0;
    let majorityClass = '';

    for (const [cls, count] of classCounts.entries()) {
      if (count > maxCount) {
        maxCount = count;
        majorityClass = cls;
      }
    }

    return majorityClass;
  }

  private splitData(
    features: number[][],
    labels: string[],
    feature: number,
    threshold: number
  ) {
    const leftFeatures: number[][] = [];
    const leftLabels: string[] = [];
    const rightFeatures: number[][] = [];
    const rightLabels: string[] = [];

    for (let i = 0; i < features.length; i++) {
      if (features[i][feature] <= threshold) {
        leftFeatures.push(features[i]);
        leftLabels.push(labels[i]);
      } else {
        rightFeatures.push(features[i]);
        rightLabels.push(labels[i]);
      }
    }

    return { leftFeatures, leftLabels, rightFeatures, rightLabels };
  }
}

interface TreeNode {
  isLeaf: boolean;
  feature?: number;
  threshold?: number;
  left?: TreeNode;
  right?: TreeNode;
  predictedClass?: string;
  classCounts?: Map<string, number>;
}
