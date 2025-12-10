
import { Request, Response } from 'express';
import { ThreatService } from '../services/threat.service';
import { ScoringEngine } from '../services/analysis/scoring.engine';
import { ActorService } from '../services/actor.service';
import { logger } from '../utils/logger';

export const getThreats = async (req: Request, res: Response) => {
  try {
    const threats = await ThreatService.getAll();
    res.json({ data: threats, count: threats.length });
  } catch (err) {
    logger.error('Error fetching threats', err);
    res.status(500).json({ error: 'Internal Server Error' });
  }
};

export const getThreatById = async (req: Request, res: Response) => {
  try {
    const threat = await ThreatService.getById(req.params.id);
    if (!threat) return res.status(404).json({ error: 'Threat not found' });
    res.json({ data: threat });
  } catch (err) {
    res.status(500).json({ error: 'Database Error' });
  }
};

export const createThreat = async (req: Request, res: Response) => {
  try {
    const data = req.body;

    // 1. Calculate Score Server-Side
    data.score = ScoringEngine.calculateThreatScore(
      data.confidence || 50,
      data.reputation || 50,
      data.severity || 'MEDIUM'
    );

    // 2. Auto-Attribution
    const actors = await ActorService.getAll();
    // We create a temporary object to check attribution before saving
    if (!data.threatActor || data.threatActor === 'Unknown') {
      data.threatActor = await ScoringEngine.autoAttribute({ ...data } as any, actors);
    }

    const newThreat = await ThreatService.create(data);
    logger.info(`Threat created by ${req.user?.username}`, { id: newThreat.id });
    res.status(201).json({ data: newThreat });
  } catch (err) {
    logger.error('Creation failed', err);
    res.status(400).json({ error: 'Invalid Data' });
  }
};

export const updateThreatStatus = async (req: Request, res: Response) => {
  try {
    const updated = await ThreatService.updateStatus(req.params.id, req.body.status);
    if (!updated) return res.status(404).json({ error: 'Threat not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};
