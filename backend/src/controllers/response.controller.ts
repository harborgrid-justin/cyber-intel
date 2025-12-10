
import { Request, Response } from 'express';
import { ResponseService } from '../services/response.service';

export const listPlaybooks = async (req: Request, res: Response) => {
  const pbs = await ResponseService.getPlaybooks();
  res.json({ data: pbs });
};

export const createPlaybook = async (req: Request, res: Response) => {
  const pb = await ResponseService.createPlaybook(req.body, req.user!.username);
  res.status(201).json({ data: pb });
};

export const runPlaybook = async (req: Request, res: Response) => {
  const result = await ResponseService.executePlaybook(req.params.id, req.body.caseId, req.user!.username);
  res.json(result);
};
