
import { Request, Response } from 'express';
import { FeedService } from '../services/feed.service';

export const listFeeds = async (_req: Request, res: Response) => {
  const feeds = await FeedService.getAll();
  res.json({ data: feeds });
};

export const getFeed = async (req: Request, res: Response) => {
  const feed = await FeedService.getById(req.params.id);
  if (!feed) return res.status(404).json({ error: 'Feed not found' });
  res.json({ data: feed });
};

export const addFeed = async (req: Request, res: Response) => {
  const feed = await FeedService.register(req.body, req.user!.username);
  res.status(201).json({ data: feed });
};

export const updateFeed = async (req: Request, res: Response) => {
  const feed = await FeedService.update(req.params.id, req.body, req.user!.username);
  if (!feed) return res.status(404).json({ error: 'Feed not found' });
  res.json({ data: feed });
};

export const deleteFeed = async (req: Request, res: Response) => {
  const result = await FeedService.delete(req.params.id);
  if (!result) return res.status(404).json({ error: 'Feed not found' });
  res.status(204).send();
};

export const syncFeed = async (req: Request, res: Response) => {
  const feed = await FeedService.triggerSync(req.params.id, req.user!.username);
  if (!feed) return res.status(404).json({ error: 'Feed not found' });
  res.json({ data: feed, message: 'Sync started' });
};
