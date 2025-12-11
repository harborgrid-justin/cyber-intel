import { Request, Response } from 'express';

export const checkHealth = (req: Request, res: Response) => {
  res.status(200).json({
    status: 'OPERATIONAL',
    timestamp: new Date().toISOString(),
    uptime: (process as any).uptime(),
    system: 'Sentinel Core Backend'
  });
};