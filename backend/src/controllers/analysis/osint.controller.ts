
import { Request, Response } from 'express';
import { OsintEngine } from '../../services/analysis/osint.engine';

export const analyzeOsintDomain = async (req: Request, res: Response) => {
  const result = OsintEngine.analyzeDomain(req.body.domain);
  res.json({ data: result });
};

export const analyzeOsintIdentity = async (req: Request, res: Response) => {
  const result = OsintEngine.analyzeIdentity(req.body.profile);
  res.json({ data: result });
};

export const checkCredentialExposure = async (req: Request, res: Response) => {
  const result = OsintEngine.analyzeCredentialExposure(req.body.email, req.body.breaches || []);
  res.json({ data: result });
};

export const analyzeOsintNetwork = async (req: Request, res: Response) => {
  const result = OsintEngine.analyzeNetworkInfra(req.body.geo);
  res.json({ data: result });
};

export const analyzeDarkWeb = async (req: Request, res: Response) => {
  const result = OsintEngine.analyzeDarkWebItem(req.body.item);
  res.json({ data: result });
};
