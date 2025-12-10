
import { Request, Response } from 'express';
import { MessagingService } from '../services/messaging.service';

export const getChannels = async (req: Request, res: Response) => {
  const channels = await MessagingService.getChannels(req.user!.username);
  res.json({ data: channels });
};

export const getHistory = async (req: Request, res: Response) => {
  const messages = await MessagingService.getMessages(req.params.channelId);
  res.json({ data: messages });
};

export const sendMessage = async (req: Request, res: Response) => {
  const msg = await MessagingService.sendMessage(req.body.channelId, req.body.content, req.user!.username);
  res.status(201).json({ data: msg });
};

export const createChannel = async (req: Request, res: Response) => {
  const chan = await MessagingService.createChannel(req.body.name, req.body.type, req.user!.username);
  res.status(201).json({ data: chan });
};
