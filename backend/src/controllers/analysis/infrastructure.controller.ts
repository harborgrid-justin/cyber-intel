
import { Request, Response } from 'express';
import { VulnerabilityEngine } from '../../services/analysis/vulnerability.engine';
import { SystemPolicyEngine } from '../../services/analysis/system_policy.engine';
import { DashboardAnalyticsEngine } from '../../services/analysis/dashboard_analytics.engine';

export const getZeroDayImpact = async (req: Request, res: Response) => {
  const result = await VulnerabilityEngine.assessZeroDayImpact();
  res.json({ data: result });
};

export const getFeedCorrelation = async (req: Request, res: Response) => {
  const result = await VulnerabilityEngine.correlateVendorAdvisories();
  res.json({ data: result });
};

export const assessAssetRiskSingle = async (req: Request, res: Response) => {
  const result = await SystemPolicyEngine.assessAssetRisk(req.params.id);
  res.json({ data: result });
};

export const escalateVip = async (req: Request, res: Response) => {
  const result = await SystemPolicyEngine.escalateVIPTargets(req.params.id);
  res.json({ data: result });
};

export const getDefconLevel = async (req: Request, res: Response) => {
  const result = await DashboardAnalyticsEngine.calculateDefconLevel();
  res.json({ data: result });
};

export const getRegionalRisk = async (req: Request, res: Response) => {
  const result = await DashboardAnalyticsEngine.getRegionalRisk();
  res.json({ data: result });
};

export const getSystemHealth = async (req: Request, res: Response) => {
  const result = await DashboardAnalyticsEngine.predictSystemHealth();
  res.json({ data: result });
};

export const getCloudSecurity = async (req: Request, res: Response) => {
  const result = await DashboardAnalyticsEngine.checkCloudSecurity();
  res.json({ data: result });
};
