
import { Request, Response } from 'express';
import { CaseOperationsEngine } from '../../services/analysis/case_operations.engine';
import { DashboardAnalyticsEngine } from '../../services/analysis/dashboard_analytics.engine';
import { SecurityEngine } from '../../services/analysis/security.engine';
import { AuditAnalysisEngine } from '../../services/analysis/audit_analysis.engine';
import { ComplianceEngine } from '../../services/analysis/compliance.engine';

export const suggestCasePlaybook = async (req: Request, res: Response) => {
  const result = await CaseOperationsEngine.suggestPlaybook(req.body.case);
  res.json({ data: result });
};

export const correlateCases = async (req: Request, res: Response) => {
  const result = await CaseOperationsEngine.correlateCases(req.params.id);
  res.json({ data: result });
};

export const checkSlaStatus = async (req: Request, res: Response) => {
  res.json({ data: { status: 'OK', timeLeft: '24h' } });
};

export const checkCompliance = async (req: Request, res: Response) => {
  res.json({ data: { score: 0, criticalGaps: [] } });
};

export const detectImpossibleTravel = async (req: Request, res: Response) => {
  const result = await ComplianceEngine.detectImpossibleTravel();
  res.json({ data: result });
};

export const getInsiderThreats = async (req: Request, res: Response) => {
  const result = await DashboardAnalyticsEngine.analyzeInsiderThreats();
  res.json({ data: result });
};

export const getThreatTrends = async (req: Request, res: Response) => {
  const result = await DashboardAnalyticsEngine.getTrendMetrics();
  res.json({ data: result });
};

export const getDarkWebChatter = async (req: Request, res: Response) => {
  const result = await SecurityEngine.analyzeChatterVolume();
  res.json({ data: result });
};

export const getCredentialLeaks = async (req: Request, res: Response) => {
  const result = await SecurityEngine.correlateCredentialLeaks();
  res.json({ data: result });
};

export const analyzeAuthLogs = async (req: Request, res: Response) => {
  const result = await AuditAnalysisEngine.analyzeAuth();
  res.json({ data: result });
};

export const analyzeNetworkLogs = async (req: Request, res: Response) => {
  const result = await AuditAnalysisEngine.analyzeNetwork();
  res.json({ data: result });
};

export const analyzeDataLogs = async (req: Request, res: Response) => {
  const result = await AuditAnalysisEngine.analyzeData();
  res.json({ data: result });
};
