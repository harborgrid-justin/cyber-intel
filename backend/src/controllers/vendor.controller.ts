
import { Request, Response } from 'express';
import { VendorService } from '../services/vendor.service';

export const listVendors = async (req: Request, res: Response) => {
  const vendors = await VendorService.getAll();
  res.json({ data: vendors });
};

export const getVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await VendorService.getById(req.params.id);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ data: vendor });
  } catch (err) {
    res.status(500).json({ error: 'Internal Error' });
  }
};

export const addVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await VendorService.register(req.body, req.user!.username);
    res.status(201).json({ data: vendor });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add vendor' });
  }
};

export const updateVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await VendorService.update(req.params.id, req.body, req.user!.username);
    if (!vendor) return res.status(404).json({ error: 'Vendor not found' });
    res.json({ data: vendor });
  } catch (err) {
    res.status(500).json({ error: 'Failed to update vendor' });
  }
};

export const deleteVendor = async (req: Request, res: Response) => {
  try {
    const result = await VendorService.delete(req.params.id);
    if (!result) return res.status(404).json({ error: 'Vendor not found' });
    res.status(204).send();
  } catch (err) {
    res.status(500).json({ error: 'Failed to delete vendor' });
  }
};
