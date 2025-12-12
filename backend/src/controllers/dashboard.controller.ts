
import { Request, Response } from 'express';
import { DashboardService } from '../services/dashboard.service';
import { NetworkEngine } from '../services/analysis/network.engine';
import { ComplianceEngine } from '../services/analysis/compliance.engine';

export const getDashboardStats = async (req: Request, res: Response) => {
  try {
    const stats = await DashboardService.getOverview();
    const trends = await DashboardService.getTrends();
    res.json({ data: { stats, trends } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to aggregate dashboard metrics' });
  }
};

export const getNetworkStats = async (req: Request, res: Response) => {
  try {
    const traffic = await NetworkEngine.analyzeTrafficPatterns();
    const ddos = await NetworkEngine.detectDdosSignatures();
    res.json({ data: { traffic, ddos } });
  } catch (err) {
    res.status(500).json({ error: 'Network analysis failed' });
  }
};

export const getComplianceStats = async (req: Request, res: Response) => {
  try {
    // In a real app, controls would be fetched from DB or param.
    // Expecting controls in body for calculation or use DB default
    const controls = req.body.controls || [];
    const stats = await ComplianceEngine.evaluateNistCompliance(controls);
    res.json({ data: stats });
  } catch (err) {
    res.status(500).json({ error: 'Compliance analysis failed' });
  }
};

/**
 * Get threat timeline data with date range filtering
 */
export const getTimelineData = async (req: Request, res: Response) => {
  try {
    const range = (req.query.range as '24h' | '7d' | '30d' | '90d') || '24h';
    const data = await DashboardService.getTimelineData(range);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch timeline data' });
  }
};

/**
 * Get geographic threat distribution
 */
export const getGeoThreats = async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getGeoThreatData();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch geographic threat data' });
  }
};

/**
 * Get MITRE ATT&CK technique statistics
 */
export const getMitreTechniques = async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getMitreTechniques();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch MITRE techniques' });
  }
};

/**
 * Get compliance metrics
 */
export const getComplianceMetrics = async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getComplianceMetrics();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch compliance metrics' });
  }
};

/**
 * Get overall risk score
 */
export const getRiskScore = async (req: Request, res: Response) => {
  try {
    const score = await DashboardService.getRiskScore();
    res.json({ data: { score } });
  } catch (err) {
    res.status(500).json({ error: 'Failed to calculate risk score' });
  }
};

/**
 * Get week-over-week comparison metrics
 */
export const getWeekOverWeekMetrics = async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getWeekOverWeekComparison();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch week-over-week metrics' });
  }
};

/**
 * Get month-over-month comparison metrics
 */
export const getMonthOverMonthMetrics = async (req: Request, res: Response) => {
  try {
    const data = await DashboardService.getMonthOverMonthComparison();
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch month-over-month metrics' });
  }
};

/**
 * Get threat forecast
 */
export const getForecast = async (req: Request, res: Response) => {
  try {
    const days = parseInt(req.query.days as string) || 7;
    const data = await DashboardService.getForecast(days);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to generate forecast' });
  }
};

/**
 * Get incident timeline
 */
export const getIncidentTimeline = async (req: Request, res: Response) => {
  try {
    const incidentId = req.query.incidentId as string | undefined;
    const data = await DashboardService.getIncidentTimeline(incidentId);
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch incident timeline' });
  }
};

/**
 * Get threat actor profile
 */
export const getThreatActorProfile = async (req: Request, res: Response) => {
  try {
    const actorId = req.params.actorId;
    if (!actorId) {
      return res.status(400).json({ error: 'Actor ID is required' });
    }
    const data = await DashboardService.getThreatActorProfile(actorId);
    if (!data) {
      return res.status(404).json({ error: 'Threat actor not found' });
    }
    res.json({ data });
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch threat actor profile' });
  }
};
