
import { Request, Response } from 'express';
import { EvidenceService } from '../services/evidence.service';

export const listEvidence = async (req: Request, res: Response) => {
  const artifacts = await EvidenceService.getAll();
  res.json({ data: artifacts });
};

export const getEvidence = async (req: Request, res: Response) => {
  const artifact = await EvidenceService.getById(req.params.id);
  if (!artifact) return res.status(404).json({ error: 'Evidence not found' });
  res.json({ data: artifact });
};

export const uploadEvidence = async (req: Request, res: Response) => {
  const artifact = await EvidenceService.create(req.body, req.user!.username);
  res.status(201).json({ data: artifact });
};

export const updateEvidence = async (req: Request, res: Response) => {
  const artifact = await EvidenceService.update(req.params.id, req.body, req.user!.username);
  if (!artifact) return res.status(404).json({ error: 'Evidence not found' });
  res.json({ data: artifact });
};

export const deleteEvidence = async (req: Request, res: Response) => {
  const result = await EvidenceService.delete(req.params.id);
  if (!result) return res.status(404).json({ error: 'Evidence not found' });
  res.status(204).send();
};

export const getChain = async (req: Request, res: Response) => {
  const chain = await EvidenceService.getChainOfCustody(req.params.id);
  res.json({ data: chain });
};
