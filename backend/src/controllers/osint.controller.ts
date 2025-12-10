
import { Request, Response } from 'express';
import { OsintService } from '../services/osint.service';

export const globalSearch = async (req: Request, res: Response) => {
  const term = req.query.q as string;
  if (!term) return res.status(400).json({ error: 'Query parameter q is required' });
  
  const results = await OsintService.search(term);
  res.json({ data: results });
};

export const listBreaches = async (req: Request, res: Response) => {
  const breaches = await OsintService.getBreaches();
  res.json({ data: breaches });
};
