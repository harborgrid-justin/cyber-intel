
import { Request, Response } from 'express';
import { ScrmEngine } from '../../services/analysis/scrm.engine';

export const assessVendorRisk = async (req: Request, res: Response) => {
  res.json({ message: 'Risk assessment queued' });
};

interface AuditAccessBody {
  accessList: any[]; 
}

export const auditVendorAccess = async (req: Request, res: Response) => {
  const body = req.body as AuditAccessBody;
  const result = ScrmEngine.auditLeastPrivilege(body.accessList || []);
  res.json({ data: result });
};

export const assessGeoRisk = async (req: Request, res: Response) => {
  const result = ScrmEngine.assessJurisdictionalRisk(req.body.country);
  res.json({ data: result });
};

export const traceSupplyChain = async (req: Request, res: Response) => {
  const result = await ScrmEngine.traceDownstreamImpact(req.params.vendorId);
  res.json({ data: result });
};

export const analyzeSbom = async (req: Request, res: Response) => {
  const result = ScrmEngine.analyzeSbomHealth(req.body.components || []);
  res.json({ data: result });
};
