
import { Request, Response } from 'express';
import { CampaignService } from '../services/campaign.service';
import { logger } from '../utils/logger';

export const listCampaigns = async (req: Request, res: Response) => {
  try {
    const campaigns = await CampaignService.getAll();
    res.json({ data: campaigns });
  } catch (err) {
    logger.error('List campaigns failed', err);
    res.status(500).json({ error: 'Internal Error' });
  }
};

export const createCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await CampaignService.create(req.body, req.user!.username);
    res.status(201).json({ data: campaign });
  } catch (err) {
    logger.error('Create campaign failed', err);
    res.status(500).json({ error: 'Creation Failed' });
  }
};
