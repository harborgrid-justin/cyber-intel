
// Fix: Import types from the central types file
import { Severity } from '../types';
import { threatData } from './dataLayer';

/**
 * Calculates a threat score based on dynamic weights from the data provider.
 * NOTE: Primary scoring logic resides in the backend `ScoringEngine`. 
 * This function should only be used for offline calculations or optimistic UI updates.
 */
export const calculateThreatScore = (
  confidence: number,
  reputation: number,
  severity: Severity
): number => {
  // Fix: Property 'getScoringConfig' does not exist on type 'DataLayer'. This method is now available.
  const scoringConfig = threatData.getScoringConfig();
  
  const sevScore = scoringConfig.severityValues[severity] || 0;
  
  const weightedScore = 
    (sevScore * scoringConfig.weights.severity) + 
    (confidence * scoringConfig.weights.confidence) + 
    (reputation * scoringConfig.weights.reputation);
  
  return Math.min(100, Math.round(weightedScore));
};

export const getScoreColorClass = (score: number): 'critical' | 'high' | 'medium' | 'low' => {
  if (score >= 90) return 'critical';
  if (score >= 70) return 'high';
  if (score >= 50) return 'medium';
  return 'low';
};