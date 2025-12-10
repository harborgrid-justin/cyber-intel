
import { Request, Response } from 'express';
import { ActorService } from '../services/actor.service';
import { logger } from '../utils/logger';

export const listActors = async (req: Request, res: Response) => {
  try {
    const actors = await ActorService.getAll();
    res.json({ data: actors });
  } catch (err) {
    logger.error('List actors failed', err);
    res.status(500).json({ error: 'Internal Error' });
  }
};

export const getActor = async (req: Request, res: Response) => {
  try {
    const actor = await ActorService.getById(req.params.id);
    if (!actor) return res.status(404).json({ error: 'Actor not found' });
    res.json({ data: actor });
  } catch (err) {
    res.status(500).json({ error: 'Internal Error' });
  }
};

export const createActor = async (req: Request, res: Response) => {
  try {
    const actor = await ActorService.create(req.body, req.user!.username);
    res.status(201).json({ data: actor });
  } catch (err) {
    logger.error('Create actor failed', err);
    res.status(500).json({ error: 'Creation Failed' });
  }
};
