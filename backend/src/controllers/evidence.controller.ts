
import { Request, Response } from 'express';
import { EvidenceService } from '../services/evidence.service';

export const listEvidence = async (req: Request, res: Response) => {
  const artifacts = await EvidenceService.getAll();
  res.json({ data: artifacts });
};

export const uploadEvidence = async (req: Request, res: Response) => {
  const artifact = await EvidenceService.create(req.body, req.user!.username);
  res.status(201).json({ data: artifact });
};

export const getChain = async (req: Request, res: Response) => {
  const chain = await EvidenceService.getChainOfCustody(req.params.id);
  res.json({ data: chain });
};
