
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

export const getCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await CampaignService.getById(req.params.id);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ data: campaign });
  } catch (err) {
    logger.error('Get campaign failed', err);
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

export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await CampaignService.update(req.params.id, req.body, req.user!.username);
    if (!campaign) return res.status(404).json({ error: 'Campaign not found' });
    res.json({ data: campaign });
  } catch (err) {
    logger.error('Update campaign failed', err);
    res.status(500).json({ error: 'Update Failed' });
  }
};

export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const result = await CampaignService.delete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Campaign not found' });
    res.status(204).send();
  } catch (err) {
    logger.error('Delete campaign failed', err);
    res.status(500).json({ error: 'Delete Failed' });
  }
};
