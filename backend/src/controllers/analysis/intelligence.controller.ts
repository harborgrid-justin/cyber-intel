
import { Request, Response } from 'express';
import { RiskEngine } from '../../services/analysis/risk.engine';
import { ThreatIntelligenceEngine } from '../../services/analysis/threat_intelligence.engine';
import { CampaignBuilderEngine } from '../../services/analysis/campaign_builder.engine';
import { SoarEngine } from '../../services/operations/soar.engine';
import { Campaign, Threat } from '../../models/intelligence';

export const calculateCampaignRisk = async (req: Request, res: Response) => {
  let campaign = req.body.campaign;
  if (req.body.campaignId) {
      campaign = await (Campaign as any).findByPk(req.body.campaignId);
  }
  const result = await RiskEngine.calculateCampaignRisk(campaign);
  res.json({ data: result });
};

export const analyzeThreatPatterns = async (req: Request, res: Response) => {
  const subnet = await ThreatIntelligenceEngine.detectSubnetPatterns();
  const ransomwareVelocity = await ThreatIntelligenceEngine.checkRansomwareVelocity();
  res.json({ data: { subnet, ransomwareVelocity } });
};

export const calculateAttribution = async (req: Request, res: Response) => {
  res.json({ data: [] });
};

export const runAutoTriage = async (req: Request, res: Response) => {
  // Mock fetching threats from body or DB
  const threats = req.body.threats || []; 
  const result = await SoarEngine.runAutoTriage(threats);
  res.json({ data: result });
};

export const getTtpLibrary = async (req: Request, res: Response) => {
  const result = CampaignBuilderEngine.getLibrary();
  res.json({ data: result });
};

export const validateCampaignChain = async (req: Request, res: Response) => {
  const result = CampaignBuilderEngine.validateChain(req.body.steps || []);
  res.json({ data: result });
};

export const calculateCampaignMetrics = async (req: Request, res: Response) => {
  const result = CampaignBuilderEngine.calculateMetrics(req.body.steps || []);
  res.json({ data: result });
};

export const optimizeCampaignChain = async (req: Request, res: Response) => {
  const result = CampaignBuilderEngine.optimizeChain(req.body.steps || []);
  res.json({ data: result });
};
