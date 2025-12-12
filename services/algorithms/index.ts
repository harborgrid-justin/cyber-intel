/**
 * SENTINEL Advanced Algorithms Library
 * Agent 10 - PhD Software Engineer
 *
 * Comprehensive algorithm suite for cyber threat intelligence
 */

// Graph Algorithms
export { Dijkstra, GraphEdge, GraphNode, ShortestPathResult } from './graph/dijkstra';
export { PageRank, PageRankOptions, PageRankResult } from './graph/pagerank';
export { CommunityDetection, Community, CommunityDetectionResult } from './graph/community';
export { Centrality, CentralityScores, CentralityResult } from './graph/centrality';
export { PathFinding, AttackPath, PathConstraints } from './graph/pathfinding';

// Machine Learning
export { AnomalyDetection, AnomalyScore, AnomalyResult } from './ml/anomaly';
export { Clustering, ClusterPoint, Cluster, ClusteringResult } from './ml/clustering';
export {
  NaiveBayesClassifier,
  KNNClassifier,
  DecisionTreeClassifier,
  ClassificationModel,
  PredictionResult
} from './ml/classification';
export { NLP, Token, Entity, SentimentResult, KeywordResult } from './ml/nlp';
export { TextEmbedding, Embedding, SimilarityResult } from './ml/embedding';

// Scoring
export { CVSSCalculator, CVSSv3Metrics, CVSSScore } from './scoring/cvss';
export { RiskScoring, RiskFactors, RiskScore } from './scoring/risk';
export { PriorityScoring, PriorityFactors, PriorityScore } from './scoring/priority';
export { ConfidenceScoring, ConfidenceFactors, ConfidenceScore } from './scoring/confidence';
export { SeverityScoring, SeverityFactors, SeverityScore } from './scoring/severity';

// Search and Matching
export { FuzzyMatching, FuzzyMatch } from './search/fuzzy';
export { Similarity, SimilarityScore } from './search/similarity';
export { TFIDF, TFIDFDocument, TFIDFScore, SearchResult } from './search/tfidf';
export { BM25, BM25Document, BM25SearchResult } from './search/bm25';

// Data Processing
export { Aggregation, AggregationResult, Statistics, TimeWindow } from './processing/aggregation';
export { Normalization, NormalizationResult } from './processing/normalization';
export { Deduplication, DeduplicationResult, SimilarityThreshold } from './processing/deduplication';
export {
  Enrichment,
  EnrichmentResult,
  EnrichmentPipeline,
  EnrichmentStep
} from './processing/enrichment';
