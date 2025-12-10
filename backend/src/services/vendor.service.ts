
import { Vendor } from '../models/infrastructure';
import { AuditService } from './audit.service';

interface CreateVendorInput {
  name: string;
  product?: string;
  tier?: string;
  category?: string;
  riskScore?: number;
  hqLocation?: string;
  sbom?: unknown[];
  compliance?: unknown[];
  access?: unknown[];
  subcontractors?: string[];
}

export class VendorService {
  static async getAll(): Promise<Vendor[]> {
    return await (Vendor as any).findAll({ order: [['risk_score', 'DESC']] });
  }

  static async register(data: CreateVendorInput, userId: string): Promise<Vendor> {
    const id = `VEND-${Date.now()}`;
    const vendor = await (Vendor as any).create({
      id,
      name: data.name,
      product: data.product,
      tier: data.tier,
      category: data.category,
      risk_score: data.riskScore || 0,
      hq_location: data.hqLocation || 'Unknown',
      sbom: data.sbom || [],
      compliance: data.compliance || [],
      access: data.access || [],
      subcontractors: data.subcontractors || []
    });
    
    await AuditService.log(userId, 'VENDOR_ADDED', `Tracked vendor ${data.name}`, id);
    return vendor;
  }
}
