
import { Severity } from '../../../types';
import { CONFIG } from '@/config';

export const calculateThreatScore = (
  confidence: number,
  reputation: number,
  severity: Severity
): number => {
  const sevScore = CONFIG.SCORING.SEVERITY_VALUES[severity] || 0;
  
  const weightedScore = 
    (sevScore * CONFIG.SCORING.WEIGHTS.SEVERITY) + 
    (confidence * CONFIG.SCORING.WEIGHTS.CONFIDENCE) + 
    (reputation * CONFIG.SCORING.WEIGHTS.REPUTATION);
  
  return Math.min(100, Math.round(weightedScore));
};

export const getScoreColorClass = (score: number): string => {
  if (score >= 90) return 'text-red-500 border-red-500';
  if (score >= 70) return 'text-orange-500 border-orange-500';
  if (score >= 50) return 'text-yellow-500 border-yellow-500';
  return 'text-blue-500 border-blue-500';
};
