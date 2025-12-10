
import { Request, Response } from 'express';
import { SearchEngine } from '../services/analysis/search.engine';

export const globalSearch = async (req: Request, res: Response) => {
  const query = req.query.q as string;
  if (!query) return res.json({ data: [] });
  
  const results = await SearchEngine.globalSearch(query);
  res.json({ data: results });
};
