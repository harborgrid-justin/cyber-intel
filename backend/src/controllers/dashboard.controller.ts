
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
