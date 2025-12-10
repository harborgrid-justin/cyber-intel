
import { Request, Response } from 'express';
import { DetectionEngine } from '../../services/analysis/detection.engine';

export const analyzeUeba = async (req: Request, res: Response) => {
  const { user, logs } = req.body;
  const score = DetectionEngine.runUEBA(user, logs || []);
  res.json({ data: score });
};

export const validateRule = async (req: Request, res: Response) => {
  const result = DetectionEngine.validateYara(req.body.content);
  res.json({ data: result });
};

export const analyzeNodeMemory = async (req: Request, res: Response) => {
  const result = await DetectionEngine.analyzeMemory(req.params.id);
  res.json({ data: result });
};

export const analyzeNodeDisk = async (req: Request, res: Response) => {
  const result = await DetectionEngine.analyzeDisk(req.params.id);
  res.json({ data: result });
};
