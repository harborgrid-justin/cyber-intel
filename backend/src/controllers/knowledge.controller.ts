
import { Request, Response } from 'express';
import { KnowledgeService } from '../services/knowledge.service';

export const listTechniques = async (req: Request, res: Response) => {
  const techs = await KnowledgeService.getTechniques(req.query.tactic as string);
  res.json({ data: techs });
};

export const listGroups = async (req: Request, res: Response) => {
  const groups = await KnowledgeService.getGroups();
  res.json({ data: groups });
};

export const syncMitre = async (req: Request, res: Response) => {
  const result = await KnowledgeService.syncFramework();
  res.json(result);
};
