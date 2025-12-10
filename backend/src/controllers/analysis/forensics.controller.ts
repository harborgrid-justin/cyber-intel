
import { Request, Response } from 'express';
import { ForensicsEngine } from '../../services/analysis/forensics.engine';

export const verifyArtifact = async (req: Request, res: Response) => {
  const result = ForensicsEngine.verifyArtifactIntegrity(req.body.id, req.body.status);
  res.json({ data: result });
};

export const validateCustody = async (req: Request, res: Response) => {
  const result = ForensicsEngine.validateCustodyChain(req.body.events);
  res.json({ data: result });
};

export const assessMalware = async (req: Request, res: Response) => {
  const result = ForensicsEngine.assessMalwareRisk(req.body.sample);
  res.json({ data: result });
};

export const suggestDeviceAction = async (req: Request, res: Response) => {
  const result = ForensicsEngine.suggestDeviceAction(req.body.device);
  res.json({ data: result });
};
