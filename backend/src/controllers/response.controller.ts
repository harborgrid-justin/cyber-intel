
import { Request, Response } from 'express';
import { ResponseService } from '../services/response.service';

export const listPlaybooks = async (req: Request, res: Response) => {
  const pbs = await ResponseService.getPlaybooks();
  res.json({ data: pbs });
};

export const getPlaybook = async (req: Request, res: Response) => {
  const pb = await ResponseService.getPlaybookById(req.params.id);
  if (!pb) return res.status(404).json({ error: 'Playbook not found' });
  res.json({ data: pb });
};

export const createPlaybook = async (req: Request, res: Response) => {
  const pb = await ResponseService.createPlaybook(req.body, req.user!.username);
  res.status(201).json({ data: pb });
};

export const updatePlaybook = async (req: Request, res: Response) => {
  const pb = await ResponseService.updatePlaybook(req.params.id, req.body, req.user!.username);
  if (!pb) return res.status(404).json({ error: 'Playbook not found' });
  res.json({ data: pb });
};

export const deletePlaybook = async (req: Request, res: Response) => {
  const result = await ResponseService.deletePlaybook(req.params.id);
  if (!result) return res.status(404).json({ error: 'Playbook not found' });
  res.status(204).send();
};

export const runPlaybook = async (req: Request, res: Response) => {
  const result = await ResponseService.executePlaybook(req.params.id, req.body.caseId, req.user!.username);
  res.json(result);
};
