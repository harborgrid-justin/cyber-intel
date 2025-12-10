
import { Request, Response } from 'express';
import { VendorService } from '../services/vendor.service';

export const listVendors = async (req: Request, res: Response) => {
  const vendors = await VendorService.getAll();
  res.json({ data: vendors });
};

export const addVendor = async (req: Request, res: Response) => {
  try {
    const vendor = await VendorService.register(req.body, req.user!.username);
    res.status(201).json({ data: vendor });
  } catch (err) {
    res.status(500).json({ error: 'Failed to add vendor' });
  }
};
