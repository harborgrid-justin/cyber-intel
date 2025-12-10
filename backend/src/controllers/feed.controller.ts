
import { Request, Response } from 'express';
import { FeedService } from '../services/feed.service';

export const listFeeds = async (_req: Request, res: Response) => {
  const feeds = await FeedService.getAll();
  res.json({ data: feeds });
};

export const addFeed = async (req: Request, res: Response) => {
  const feed = await FeedService.register(req.body, req.user!.username);
  res.status(201).json({ data: feed });
};

export const syncFeed = async (req: Request, res: Response) => {
  const feed = await FeedService.triggerSync(req.params.id, req.user!.username);
  if (!feed) return res.status(404).json({ error: 'Feed not found' });
  res.json({ data: feed, message: 'Sync started' });
};
