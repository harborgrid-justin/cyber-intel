# SENTINEL Advanced Algorithms Library

**Agent 10 - PhD Software Engineer**
**Specialization:** Advanced Algorithms and Optimization

---

## Overview

This library contains production-ready algorithms optimized for the SENTINEL Cyber Intelligence Platform. All implementations are type-safe, well-documented, and performance-optimized for real-world threat intelligence operations.

---

## Table of Contents

- [Graph Algorithms](#graph-algorithms)
- [Machine Learning Algorithms](#machine-learning-algorithms)
- [Scoring Algorithms](#scoring-algorithms)
- [Search and Matching](#search-and-matching)
- [Data Processing](#data-processing)
- [Complexity Analysis](#complexity-analysis)
- [Usage Examples](#usage-examples)

---

## Graph Algorithms

Located in: `/services/algorithms/graph/`

### 1. Dijkstra's Shortest Path (`dijkstra.ts`)

**Purpose:** Finding optimal attack paths in threat graphs

**Time Complexity:** O((V + E) log V) with binary heap
**Space Complexity:** O(V)

**Key Methods:**
- `findShortestPath(source, target)` - Single shortest path
- `findAllShortestPaths(source)` - All paths from source
- `findKShortestPaths(source, target, k)` - K alternative paths (Yen's algorithm)

**Use Cases:**
- Attack path analysis
- Lateral movement detection
- Network routing optimization
- Minimum cost path calculation

**Example:**
```typescript
import { Dijkstra } from './graph/dijkstra';

const dijkstra = new Dijkstra();
dijkstra.buildGraph([
  { from: 'attacker', to: 'gateway', weight: 1 },
  { from: 'gateway', to: 'server', weight: 2 }
]);

const result = dijkstra.findShortestPath('attacker', 'server');
// { distance: 3, path: ['attacker', 'gateway', 'server'], cost: 3 }
```

---

### 2. PageRank (`pagerank.ts`)

**Purpose:** Ranking importance of nodes in threat networks

**Time Complexity:** O(V + E) per iteration (10-100 iterations typical)
**Space Complexity:** O(V)

**Key Methods:**
- `calculate(edges, options)` - Standard PageRank
- `personalizedPageRank(edges, seedNodes)` - Biased towards specific nodes
- `calculateHITS(edges)` - Authority and hub scores

**Use Cases:**
- Threat actor importance ranking
- Critical infrastructure identification
- IOC significance scoring
- Investigation prioritization

**Example:**
```typescript
import { PageRank } from './graph/pagerank';

const pagerank = new PageRank();
const result = pagerank.calculate(edges, { dampingFactor: 0.85, maxIterations: 100 });
console.log(result.topNodes); // Top ranked nodes
```

---

### 3. Community Detection (`community.ts`)

**Purpose:** Clustering related threats and actors

**Time Complexity:** O(V + E) for Louvain, O(n^2) for Label Propagation
**Space Complexity:** O(V + E)

**Key Methods:**
- `louvain(edges, resolution)` - Modularity-based clustering
- `labelPropagation(edges, maxIterations)` - Fast clustering
- `girvanNewman(edges, numCommunities)` - Hierarchical clustering

**Use Cases:**
- APT campaign clustering
- Botnet detection
- Threat family grouping
- Related IOC discovery

---

### 4. Centrality Measures (`centrality.ts`)

**Purpose:** Identifying key actors and critical nodes

**Time Complexity:** O(V * E) for betweenness, O(V + E) for others
**Space Complexity:** O(V)

**Key Methods:**
- `calculateAll(edges)` - All centrality measures
- `calculateBetweenness(graph)` - Brandes' algorithm
- `calculateEigenvector(graph)` - Power iteration

**Use Cases:**
- Finding pivotal threat actors
- Critical infrastructure identification
- Network bottleneck detection
- Key vulnerability assessment

---

### 5. Path Finding (`pathfinding.ts`)

**Purpose:** Enumerating attack paths and chains

**Time Complexity:** O(V!) worst case for all paths
**Space Complexity:** O(V * d) where d is max depth

**Key Methods:**
- `findAllSimplePaths(source, target, constraints)` - All simple paths
- `findAttackChains(source, target, requiredNodes)` - Paths through specific nodes
- `findCriticalNodes(source, target)` - Articulation points

**Use Cases:**
- Attack chain enumeration
- Kill chain analysis
- Privilege escalation paths
- Lateral movement detection

---

## Machine Learning Algorithms

Located in: `/services/algorithms/ml/`

### 1. Anomaly Detection (`anomaly.ts`)

**Time Complexity:** O(n) for Z-Score, O(n^2) for LOF
**Space Complexity:** O(n)

**Algorithms:**
- Z-Score - Statistical outliers
- Modified Z-Score (MAD) - Robust to outliers
- IQR Method - Interquartile range
- Isolation Forest - Multi-dimensional anomalies
- Local Outlier Factor - Density-based
- DBSCAN - Cluster-based

**Use Cases:**
- Zero-day detection
- Unusual traffic patterns
- Behavioral anomalies
- Outlier threat indicators

---

### 2. Clustering (`clustering.ts`)

**Time Complexity:** O(n * k * i * d) for K-Means
**Space Complexity:** O(n * d)

**Algorithms:**
- K-Means - Partitional clustering
- DBSCAN - Density-based
- Hierarchical - Bottom-up clustering
- Mean Shift - Mode seeking

**Use Cases:**
- Malware family grouping
- Attack pattern clustering
- User behavior segmentation
- IOC categorization

---

### 3. Classification (`classification.ts`)

**Time Complexity:** O(n * d) for Naive Bayes training
**Space Complexity:** O(k * d)

**Algorithms:**
- Naive Bayes - Probabilistic classifier
- K-NN - Instance-based learning
- Decision Tree - Rule-based classifier

**Use Cases:**
- Threat type classification
- Severity prediction
- Attack stage identification
- Malware categorization

---

### 4. NLP (`nlp.ts`)

**Time Complexity:** O(n) for most operations
**Space Complexity:** O(n)

**Features:**
- Tokenization
- N-gram generation
- Named Entity Recognition (IOCs, CVEs, hashes)
- Sentiment analysis
- Keyword extraction
- Text similarity (Jaccard, Cosine)

**Use Cases:**
- Threat report analysis
- IOC extraction
- Intelligence summarization
- Content classification

---

### 5. Text Embedding (`embedding.ts`)

**Time Complexity:** O(n * d * w) for Word2Vec
**Space Complexity:** O(v * d) where v is vocabulary size

**Features:**
- Word2Vec (Skip-gram)
- Document embeddings
- TF-IDF vectors
- Similarity search

**Use Cases:**
- Similar threat detection
- Semantic search
- Content recommendation
- Document clustering

---

## Scoring Algorithms

Located in: `/services/algorithms/scoring/`

### 1. CVSS Calculator (`cvss.ts`)

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Features:**
- CVSS v3.1 compliant
- Base, Temporal, Environmental scores
- Severity ratings (NONE to CRITICAL)
- Vector string generation

**Use Cases:**
- Vulnerability scoring
- Patch prioritization
- Risk assessment
- Compliance reporting

---

### 2. Risk Scoring (`risk.ts`)

**Time Complexity:** O(n) for aggregation
**Space Complexity:** O(1)

**Methods:**
- Basic Risk (Likelihood × Impact)
- NIST Model (Threat × Vulnerability × Impact)
- FAIR Model (Loss Event Frequency × Magnitude)
- Residual Risk (After controls)

**Use Cases:**
- Threat risk assessment
- Control effectiveness
- Risk aggregation
- Time-adjusted risk

---

### 3. Priority Scoring (`priority.ts`)

**Time Complexity:** O(1) per calculation
**Space Complexity:** O(1)

**Models:**
- RICE (Reach, Impact, Confidence, Effort)
- Eisenhower Matrix (Urgent/Important)
- Weighted Priority
- MoSCoW (Must/Should/Could/Won't)
- SLA-based Priority

**Use Cases:**
- Alert triage
- Investigation prioritization
- Resource allocation
- SLA management

---

### 4. Confidence Scoring (`confidence.ts`)

**Time Complexity:** O(n) for multi-source
**Space Complexity:** O(1)

**Methods:**
- Admiralty Code
- Traffic Light Protocol (TLP)
- Multi-factor confidence
- Bayesian updates
- Source corroboration

**Use Cases:**
- Intelligence reliability
- Source credibility
- Attribution confidence
- Data quality assessment

---

### 5. Severity Assessment (`severity.ts`)

**Time Complexity:** O(1)
**Space Complexity:** O(1)

**Methods:**
- NIST 800-61 framework
- CIA Triad-based
- Alert severity
- Data breach severity
- APT severity

**Use Cases:**
- Incident classification
- SLA determination
- Impact assessment
- Response prioritization

---

## Search and Matching

Located in: `/services/algorithms/search/`

### 1. Fuzzy Matching (`fuzzy.ts`)

**Time Complexity:** O(m * n) for most algorithms
**Space Complexity:** O(m * n)

**Algorithms:**
- Levenshtein Distance
- Damerau-Levenshtein
- Jaro-Winkler Similarity
- Hamming Distance
- Soundex (phonetic)
- Metaphone (phonetic)

**Use Cases:**
- IOC matching with typos
- Domain similarity
- Threat actor name variations
- Approximate search

---

### 2. Similarity (`similarity.ts`)

**Time Complexity:** O(n) for most methods
**Space Complexity:** O(n)

**Metrics:**
- Jaccard Similarity
- Cosine Similarity
- Dice Coefficient
- Overlap Coefficient
- Euclidean Distance
- Manhattan Distance
- Pearson Correlation

**Use Cases:**
- Document similarity
- Duplicate detection
- Content recommendation
- Plagiarism detection

---

### 3. TF-IDF (`tfidf.ts`)

**Time Complexity:** O(n * m) for indexing
**Space Complexity:** O(n * v)

**Features:**
- Document indexing
- Keyword extraction
- Search ranking
- Similarity search

**Use Cases:**
- Document ranking
- Information retrieval
- Feature extraction
- Content analysis

---

### 4. BM25 (`bm25.ts`)

**Time Complexity:** O(n * m) for indexing
**Space Complexity:** O(n * v)

**Features:**
- Advanced ranking function
- Phrase search
- Boolean search (AND/OR/NOT)
- Tunable parameters (k1, b)

**Use Cases:**
- Search engine implementation
- Document ranking
- Relevance scoring
- Query optimization

---

## Data Processing

Located in: `/services/algorithms/processing/`

### 1. Aggregation (`aggregation.ts`)

**Time Complexity:** O(n) for most operations
**Space Complexity:** O(n) or O(k) for grouped data

**Features:**
- Group by operations
- Statistical calculations
- Time-based windowing
- Rolling aggregations
- Pivot tables
- Histograms

**Use Cases:**
- Metrics calculation
- Dashboard statistics
- Time series analysis
- Report generation

---

### 2. Normalization (`normalization.ts`)

**Time Complexity:** O(n)
**Space Complexity:** O(n)

**Methods:**
- Min-Max normalization
- Z-score standardization
- Robust scaling (IQR)
- Log normalization
- IOC format normalization

**Use Cases:**
- Feature scaling
- Data standardization
- ML preprocessing
- Score normalization

---

### 3. Deduplication (`deduplication.ts`)

**Time Complexity:** O(n) to O(n^2) depending on method
**Space Complexity:** O(n)

**Algorithms:**
- Exact deduplication (hash-based)
- Fuzzy deduplication (similarity)
- Bloom filters (probabilistic)
- MinHash (set similarity)
- LSH (Locality Sensitive Hashing)

**Use Cases:**
- Duplicate IOC removal
- Data quality improvement
- Alert deduplication
- Report merging

---

### 4. Enrichment (`enrichment.ts`)

**Time Complexity:** O(n) per step
**Space Complexity:** O(n)

**Features:**
- Pipeline-based enrichment
- Batch processing
- Conditional enrichment
- Entity linking
- Temporal context
- Reputation enrichment

**Use Cases:**
- IOC enrichment
- Threat context addition
- Data augmentation
- Intelligence fusion

---

## Complexity Analysis

### Summary Table

| Algorithm | Time Complexity | Space Complexity | Best For |
|-----------|----------------|------------------|----------|
| Dijkstra | O((V+E) log V) | O(V) | Shortest paths |
| PageRank | O(V+E) × iterations | O(V) | Node ranking |
| Louvain | O(V+E) | O(V+E) | Community detection |
| K-Means | O(n×k×i×d) | O(n×d) | Clustering |
| Isolation Forest | O(n×m×log n) | O(n×m) | Anomaly detection |
| BM25 | O(n×m) | O(n×v) | Search ranking |
| MinHash | O(n×h) | O(n×h) | Deduplication |

**Legend:**
- V = vertices/nodes
- E = edges
- n = number of items
- k = number of clusters
- i = iterations
- d = dimensions/features
- m = number of trees
- h = hash functions
- v = vocabulary size

---

## Usage Examples

### Complete Attack Path Analysis

```typescript
import { Dijkstra } from './graph/dijkstra';
import { PageRank } from './graph/pagerank';
import { Centrality } from './graph/centrality';

// Build attack graph
const edges = [
  { from: 'internet', to: 'firewall', weight: 1 },
  { from: 'firewall', to: 'dmz', weight: 2 },
  { from: 'dmz', to: 'internal', weight: 3 }
];

// Find shortest attack path
const dijkstra = new Dijkstra();
dijkstra.buildGraph(edges);
const path = dijkstra.findShortestPath('internet', 'internal');

// Rank critical nodes
const pagerank = new PageRank();
const importance = pagerank.calculate(edges);

// Identify bottlenecks
const centrality = new Centrality();
const metrics = centrality.calculateAll(edges);

console.log('Attack Path:', path.path);
console.log('Critical Nodes:', importance.topNodes);
console.log('Bottlenecks:', metrics.rankings.byBetweenness);
```

### Threat Intelligence Processing Pipeline

```typescript
import { Normalization } from './processing/normalization';
import { Deduplication } from './processing/deduplication';
import { Enrichment } from './processing/enrichment';
import { CVSSCalculator } from './scoring/cvss';
import { PriorityScoring } from './scoring/priority';

// Normalize IOCs
const norm = new Normalization();
const normalized = iocs.map(ioc => ({
  ...ioc,
  hash: norm.normalizeHash(ioc.hash),
  domain: norm.normalizeDomain(ioc.domain)
}));

// Deduplicate
const dedup = new Deduplication();
const { unique } = dedup.exact(normalized, ioc => ioc.hash);

// Enrich with threat intel
const enrichment = new Enrichment();
const enriched = await enrichment.enrichBatch(unique, {
  name: 'threat-intel',
  steps: [
    { name: 'reputation', enrich: async (ioc) => ({ reputation: await getReputation(ioc) }) },
    { name: 'geolocation', enrich: async (ioc) => ({ geo: await getGeo(ioc) }) }
  ]
});

// Score and prioritize
const cvss = new CVSSCalculator();
const priority = new PriorityScoring();

const scored = enriched.map(item => ({
  ...item.enriched,
  cvss: cvss.calculateV3(item.enriched.cvssMetrics),
  priority: priority.calculateThreatPriority(
    item.enriched.cvssScore,
    item.enriched.exploitAvailable,
    item.enriched.activeExploitation,
    item.enriched.exposure,
    item.enriched.patchAvailable
  )
}));

console.log('Processed:', scored.length);
console.log('Top Priority:', scored.filter(s => s.priority.level === 'P0'));
```

---

## Performance Considerations

1. **Graph Algorithms**: Use appropriate data structures (adjacency lists vs matrices) based on graph density
2. **ML Algorithms**: Consider data preprocessing and feature scaling for better performance
3. **Search Algorithms**: Index frequently searched data, use appropriate similarity metrics
4. **Batch Processing**: Process data in chunks for large datasets
5. **Caching**: Cache expensive computations (PageRank, embeddings)

---

## Testing

All algorithms include:
- Unit tests for correctness
- Performance benchmarks
- Edge case handling
- Type safety validation

---

## Contributing

When adding new algorithms:
1. Document time/space complexity
2. Include use cases
3. Add comprehensive tests
4. Follow TypeScript best practices
5. Update this README

---

## License

Proprietary - SENTINEL Cyber Intelligence Platform

---

**Agent 10 - Advanced Algorithms Implementation Complete**
**Date:** 2025-12-12
**Status:** Production Ready
