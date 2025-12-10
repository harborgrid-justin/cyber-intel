
import { Vendor, SbomComponent, VendorAccess } from '../../types';
import { apiClient } from '../apiClient';

export class SupplyChainLogic {

  static async calculateHolisticRiskScore(vendor: Vendor): Promise<number> {
    // In connected mode, we trust the backend's scheduled reassessment or the value on the object
    // But if we need to force calc:
    return vendor.riskScore;
  }

  static async analyzeSbomHealth(components: SbomComponent[]): Promise<{ riskScore: number; summary: string }> {
    try {
      return await apiClient.post<any>('/analysis/scrm/sbom-health', { components });
    } catch {
      return { riskScore: 0, summary: 'Analysis Offline' };
    }
  }

  static async traceDownstreamImpact(vendorId: string): Promise<{ impactedCount: number, depth: number }> {
    try {
      return await apiClient.get<any>(`/analysis/scrm/${vendorId}/trace`);
    } catch {
      return { impactedCount: 0, depth: 0 };
    }
  }

  static async auditLeastPrivilege(accessList: VendorAccess[]): Promise<{ violations: number, details: string[] }> {
    try {
      return await apiClient.post('/analysis/scrm/audit-access', { accessList });
    } catch {
      return { violations: 0, details: [] };
    }
  }

  static async assessJurisdictionalRisk(country: string): Promise<{ score: number, label: string }> {
    try {
      return await apiClient.post<any>('/analysis/scrm/geo-risk', { country });
    } catch {
      return { score: 50, label: 'Unknown (Offline)' };
    }
  }
}
