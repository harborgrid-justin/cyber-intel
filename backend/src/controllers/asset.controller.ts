
import { Request, Response } from 'express';
import { AssetService } from '../services/asset.service';

export const listAssets = async (_req: Request, res: Response) => {
  const assets = await AssetService.getAll();
  res.json({ data: assets });
};

export const getAsset = async (req: Request, res: Response) => {
  const asset = await AssetService.getById(req.params.id);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json({ data: asset });
};

export const createAsset = async (req: Request, res: Response) => {
  const asset = await AssetService.create(req.body, req.user!.username);
  res.status(201).json({ data: asset });
};

export const updateAsset = async (req: Request, res: Response) => {
  const asset = await AssetService.update(req.params.id, req.body, req.user!.username);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json({ data: asset });
};

export const updateAssetStatus = async (req: Request, res: Response) => {
  const asset = await AssetService.updateStatus(req.params.id, req.body.status, req.user!.username);
  if (!asset) return res.status(404).json({ error: 'Asset not found' });
  res.json({ data: asset });
};

export const deleteAsset = async (req: Request, res: Response) => {
  const result = await AssetService.delete(req.params.id);
  if (!result) return res.status(404).json({ error: 'Asset not found' });
  res.status(204).send();
};
