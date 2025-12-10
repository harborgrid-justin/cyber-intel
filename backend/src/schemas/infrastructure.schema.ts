
import { z } from 'zod';

export const assetSchema = z.object({ 
  body: z.object({ 
    name: z.string(),
    type: z.string(),
    criticality: z.string().optional(),
    ip: z.string().optional(),
    owner: z.string().optional(),
    securityControls: z.array(z.string()).optional(),
    dataSensitivity: z.string().optional(),
    dataVolumeGB: z.number().optional()
  }) 
});

export const vulnSchema = z.object({
  body: z.object({
    cveId: z.string().min(1),
    name: z.string().min(1),
    score: z.number().min(0).max(10),
    status: z.string(),
    vendor: z.string().optional(),
    zeroDay: z.boolean().optional(),
    exploited: z.boolean().optional(),
    affectedAssets: z.array(z.string()).optional()
  })
});

export const feedSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    url: z.string().url(),
    type: z.string(),
    interval: z.number().int().positive(),
    configuration: z.record(z.any()).optional()
  })
});

export const vendorSchema = z.object({
  body: z.object({
    name: z.string().min(1),
    product: z.string().optional(),
    tier: z.string().optional(),
    category: z.string().optional(),
    riskScore: z.number().optional(),
    hqLocation: z.string().optional(),
    sbom: z.array(z.any()).optional(),
    compliance: z.array(z.any()).optional(),
    access: z.array(z.any()).optional(),
    subcontractors: z.array(z.string()).optional()
  })
});
