
import { Request, Response } from 'express';
import { AuditService } from '../services/audit.service';

export const getAuditLogs = async (req: Request, res: Response) => {
  try {
    const limit = parseInt(req.query.limit as string) || 100;
    const offset = parseInt(req.query.offset as string) || 0;
    const logs = await AuditService.getLogs(limit, offset);
    res.json({ data: logs });
  } catch (err) {
    res.status(500).json({ error: 'Failed to retrieve logs' });
  }
};
