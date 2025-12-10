
import { Request, Response } from 'express';
import { AiService } from '../services/ai.service';

export const analyzeThreat = async (req: Request, res: Response) => {
  try {
    const { prompt, context } = req.body;
    const result = await AiService.generateAnalysis(prompt, context, req.user!.username);
    res.json({ data: result });
  } catch (err) {
    res.status(503).json({ error: 'AI Service Unavailable' });
  }
};
