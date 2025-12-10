
import { Request, Response } from 'express';
import { CaseService } from '../services/case.service';
import { logger } from '../utils/logger';

export const listCases = async (req: Request, res: Response) => {
  try {
    const filters = {
      status: req.query.status as string,
      assignee: req.query.assignee as string
    };
    const cases = await CaseService.getAll(filters);
    res.json({ data: cases });
  } catch (err) {
    logger.error('List cases error', err);
    res.status(500).json({ error: 'Internal Error' });
  }
};

export const createCase = async (req: Request, res: Response) => {
  try {
    // req.user is guaranteed by auth middleware
    const newCase = await CaseService.create(req.body, req.user!.username);
    res.status(201).json({ data: newCase });
  } catch (err) {
    logger.error('Create case error', err);
    res.status(500).json({ error: 'Failed to create case' });
  }
};

export const updateCase = async (req: Request, res: Response) => {
  try {
    const updated = await CaseService.update(req.params.id, req.body, req.user!.username);
    if (!updated) return res.status(404).json({ error: 'Case not found' });
    res.json({ data: updated });
  } catch (err) {
    res.status(500).json({ error: 'Update failed' });
  }
};
