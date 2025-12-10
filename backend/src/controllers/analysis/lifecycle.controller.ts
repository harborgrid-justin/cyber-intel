
import { Request, Response } from 'express';
import { LifecycleEngine } from '../../services/analysis/lifecycle.engine';

export const deduplicateThreat = async (req: Request, res: Response) => {
  const result = await LifecycleEngine.deduplicateThreat(req.body.threat);
  res.json({ data: result });
};

export const decayConfidence = async (req: Request, res: Response) => {
  const result = await LifecycleEngine.decayConfidence();
  res.json({ data: result });
};

export const applyGeoBlocking = async (req: Request, res: Response) => {
  const result = await LifecycleEngine.applyGeoBlocking();
  res.json({ data: result });
};

export const checkSlaBreaches = async (req: Request, res: Response) => {
  const result = await LifecycleEngine.checkSlaBreaches();
  res.json({ data: result });
};

export const runRetentionPolicy = async (req: Request, res: Response) => {
  const result = await LifecycleEngine.enforceRetentionPolicy();
  res.json({ data: result });
};

export const checkAnalystFatigue = async (req: Request, res: Response) => {
  const result = await LifecycleEngine.monitorAnalystFatigue();
  res.json({ data: result });
};

export const getStorageProjection = async (req: Request, res: Response) => {
  const result = await LifecycleEngine.calculateStorageProjection();
  res.json({ data: result });
};
