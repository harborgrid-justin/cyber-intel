/**
 * Threat Intelligence API Routes
 * Comprehensive API endpoints for threat intelligence operations
 */

import { Router } from 'express';
import { AttributionEngine } from '../services/analysis/attribution.engine';
import { DetectionEngine } from '../services/analysis/detection.engine';
import { CorrelationEngine } from '../services/analysis/correlation.engine';
import { PredictionEngine } from '../services/analysis/prediction.engine';
import { ClusteringEngine } from '../services/analysis/clustering.engine';
import { SimilarityEngine } from '../services/analysis/similarity.engine';
import { IOCExtractor } from '../services/algorithms/threat/ioc_extractor';
import { ThreatScorer } from '../services/algorithms/threat/threat_scorer';
import { KillChainMapper } from '../services/algorithms/threat/kill_chain_mapper';
import { TTPAnalyzer } from '../services/algorithms/threat/ttp_analyzer';
import { ThreatPrioritizer } from '../services/algorithms/threat/threat_prioritizer';
import { STIXService } from '../services/integrations/stix.service';

const router = Router();

// ============================================================================
// IOC ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/ioc/extract
 * Extract IOCs from text
 */
router.post('/ioc/extract', async (req, res) => {
  try {
    const { text, types, deduplicate, includeContext } = req.body;

    const result = IOCExtractor.extract(text, {
      types,
      deduplicate,
      includeContext
    });

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/ioc/enrich
 * Enrich IOCs with threat intelligence
 */
router.post('/ioc/enrich', async (req, res) => {
  try {
    const { iocs } = req.body;
    const enriched = await IOCExtractor.enrichIOCs(iocs);

    res.json({
      success: true,
      data: enriched
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// THREAT SCORING ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/score
 * Calculate threat score
 */
router.post('/score', async (req, res) => {
  try {
    const input = req.body;
    const score = ThreatScorer.calculateScore(input);

    res.json({
      success: true,
      data: score
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/score/batch
 * Batch score multiple threats
 */
router.post('/score/batch', async (req, res) => {
  try {
    const { threats } = req.body;
    const scores = ThreatScorer.batchScore(threats);

    res.json({
      success: true,
      data: scores
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/score/contextual
 * Calculate contextual threat score
 */
router.post('/score/contextual', async (req, res) => {
  try {
    const { baseScore, context } = req.body;
    const score = ThreatScorer.calculateContextualScore(baseScore, context);

    res.json({
      success: true,
      data: { contextual_score: score }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// ATTRIBUTION ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/attribution
 * Calculate threat attribution
 */
router.post('/attribution', async (req, res) => {
  try {
    const { input, actors } = req.body;
    const results = await AttributionEngine.calculate(input, actors);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/attribution/ttp
 * TTP-based attribution
 */
router.post('/attribution/ttp', async (req, res) => {
  try {
    const { ttpCodes, actors } = req.body;
    const results = await AttributionEngine.attributeByTTP(ttpCodes, actors);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/attribution/confidence
 * Calculate attribution confidence
 */
router.post('/attribution/confidence', async (req, res) => {
  try {
    const { priorProbability, evidenceStrength, falsePositiveRate } = req.body;
    const confidence = AttributionEngine.calculateBayesianAttribution(
      priorProbability,
      evidenceStrength,
      falsePositiveRate
    );

    res.json({
      success: true,
      data: { confidence }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CORRELATION ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/correlate
 * Correlate security events
 */
router.post('/correlate', async (req, res) => {
  try {
    const { events } = req.body;
    const results = await CorrelationEngine.correlateEvents(events);

    res.json({
      success: true,
      data: results
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/correlate/stream
 * Real-time correlation for streaming events
 */
router.post('/correlate/stream', async (req, res) => {
  try {
    const { newEvent, recentEvents, timeWindow } = req.body;
    const result = await CorrelationEngine.correlateStream(newEvent, recentEvents, timeWindow);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/correlate/graph
 * Build correlation graph
 */
router.post('/correlate/graph', async (req, res) => {
  try {
    const { events } = req.body;
    const graph = CorrelationEngine.buildCorrelationGraph(events);

    res.json({
      success: true,
      data: graph
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// PREDICTION ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/predict
 * Predict future threats
 */
router.post('/predict', async (req, res) => {
  try {
    const { historicalThreats, timeframe } = req.body;
    const predictions = await PredictionEngine.predictThreats(historicalThreats, timeframe);

    res.json({
      success: true,
      data: predictions
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/predict/trends
 * Forecast threat trends
 */
router.post('/predict/trends', async (req, res) => {
  try {
    const { historicalData, forecastDays } = req.body;
    const trends = await PredictionEngine.forecastTrends(historicalData, forecastDays);

    res.json({
      success: true,
      data: trends
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/predict/risk
 * Generate risk forecast
 */
router.post('/predict/risk', async (req, res) => {
  try {
    const { threats, assets, vulnerabilities, days } = req.body;
    const forecast = await PredictionEngine.generateRiskForecast(threats, assets, vulnerabilities, days);

    res.json({
      success: true,
      data: forecast
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// CLUSTERING ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/cluster
 * Cluster threats
 */
router.post('/cluster', async (req, res) => {
  try {
    const { threats, method, numClusters } = req.body;
    const result = await ClusteringEngine.clusterThreats(threats, method, numClusters);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/cluster/temporal
 * Temporal clustering
 */
router.post('/cluster/temporal', async (req, res) => {
  try {
    const { threats, windowSize } = req.body;
    const clusters = await ClusteringEngine.temporalClustering(threats, windowSize);

    res.json({
      success: true,
      data: clusters
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// SIMILARITY ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/similarity
 * Calculate threat similarity
 */
router.post('/similarity', async (req, res) => {
  try {
    const { threat1, threat2 } = req.body;
    const score = SimilarityEngine.calculateThreatSimilarity(threat1, threat2);

    res.json({
      success: true,
      data: score
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/similarity/find
 * Find similar threats
 */
router.post('/similarity/find', async (req, res) => {
  try {
    const { target, candidates, threshold } = req.body;
    const similar = await SimilarityEngine.findSimilarThreats(target, candidates, threshold);

    res.json({
      success: true,
      data: similar
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/similarity/duplicates
 * Find duplicate threats
 */
router.post('/similarity/duplicates', async (req, res) => {
  try {
    const { threats, threshold } = req.body;
    const duplicates = await SimilarityEngine.findDuplicates(threats, threshold);

    res.json({
      success: true,
      data: duplicates
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// KILL CHAIN ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/killchain/map
 * Map to kill chain phase
 */
router.post('/killchain/map', async (req, res) => {
  try {
    const { indicator, framework } = req.body;
    const mapping = KillChainMapper.mapToKillChain(indicator, framework);

    res.json({
      success: true,
      data: mapping
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/killchain/timeline
 * Build attack timeline
 */
router.post('/killchain/timeline', async (req, res) => {
  try {
    const { activities } = req.body;
    const timeline = KillChainMapper.buildAttackTimeline(activities);

    res.json({
      success: true,
      data: timeline
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/killchain/gaps
 * Identify defensive gaps
 */
router.post('/killchain/gaps', async (req, res) => {
  try {
    const { timeline } = req.body;
    const gaps = KillChainMapper.identifyDefensiveGaps(timeline);

    res.json({
      success: true,
      data: gaps
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// TTP ANALYSIS ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/ttp/analyze
 * Analyze TTPs
 */
router.post('/ttp/analyze', async (req, res) => {
  try {
    const { observedBehaviors, contextData } = req.body;
    const analysis = await TTPAnalyzer.analyzeTTPs(observedBehaviors, contextData);

    res.json({
      success: true,
      data: analysis
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/ttp/compare
 * Compare TTP profiles
 */
router.post('/ttp/compare', async (req, res) => {
  try {
    const { profile1, profile2 } = req.body;
    const comparison = TTPAnalyzer.compareTTPProfiles(profile1, profile2);

    res.json({
      success: true,
      data: comparison
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/ttp/gaps
 * Identify TTP gaps
 */
router.post('/ttp/gaps', async (req, res) => {
  try {
    const { observedTTPs, coverage } = req.body;
    const gaps = TTPAnalyzer.identifyDefensiveGaps(observedTTPs, coverage);

    res.json({
      success: true,
      data: gaps
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// THREAT PRIORITIZATION ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/prioritize
 * Prioritize threat
 */
router.post('/prioritize', async (req, res) => {
  try {
    const threat = req.body;
    const prioritized = ThreatPrioritizer.prioritize(threat);

    res.json({
      success: true,
      data: prioritized
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/prioritize/batch
 * Batch prioritize threats
 */
router.post('/prioritize/batch', async (req, res) => {
  try {
    const { threats } = req.body;
    const prioritized = ThreatPrioritizer.prioritizeBatch(threats);

    res.json({
      success: true,
      data: prioritized
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/prioritize/dynamic
 * Dynamic prioritization with context
 */
router.post('/prioritize/dynamic', async (req, res) => {
  try {
    const { threats, context } = req.body;
    const prioritized = ThreatPrioritizer.dynamicPrioritization(threats, context);

    res.json({
      success: true,
      data: prioritized
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// STIX/TAXII ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/stix/export
 * Export to STIX format
 */
router.post('/stix/export', async (req, res) => {
  try {
    const { threats, actors } = req.body;
    const bundle = STIXService.exportToSTIX(threats, actors);

    res.json({
      success: true,
      data: bundle
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/stix/import
 * Import from STIX format
 */
router.post('/stix/import', async (req, res) => {
  try {
    const bundle = req.body;
    const imported = STIXService.importFromSTIX(bundle);

    res.json({
      success: true,
      data: imported
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/taxii/fetch
 * Fetch from TAXII server
 */
router.post('/taxii/fetch', async (req, res) => {
  try {
    const { server, options } = req.body;
    const bundle = await STIXService.fetchFromTAXII(server, options);

    res.json({
      success: true,
      data: bundle
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/threat-intel/taxii/push
 * Push to TAXII server
 */
router.post('/taxii/push', async (req, res) => {
  try {
    const { server, bundle } = req.body;
    const result = await STIXService.pushToTAXII(server, bundle);

    res.json(result);
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

// ============================================================================
// DETECTION ENDPOINTS
// ============================================================================

/**
 * POST /api/threat-intel/detect
 * ML-based threat detection
 */
router.post('/detect', async (req, res) => {
  try {
    const data = req.body;
    const result = await DetectionEngine.detectThreats(data);

    res.json({
      success: true,
      data: result
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export default router;
