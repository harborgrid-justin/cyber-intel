
import { Request, Response } from 'express';
import { SettingsService } from '../services/settings.service';

export const listIntegrations = async (req: Request, res: Response) => {
  const integrations = await SettingsService.getIntegrations();
  res.json({ data: integrations });
};

export const addIntegration = async (req: Request, res: Response) => {
  const integration = await SettingsService.addIntegration(req.body, req.user!.username);
  res.status(201).json({ data: integration });
};

export const performMaintenance = async (req: Request, res: Response) => {
  const result = await SettingsService.runMaintenance(req.body.action, req.user!.username);
  res.json(result);
};
