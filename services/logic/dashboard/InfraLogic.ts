
import { apiClient } from '../../apiClient';
import { CountMinSketch } from '../../algorithms/CountMinSketch';
import { SystemNode } from '../../../types';
import { threatData } from '../../dataLayer';

// Probabilistic data structure to track protocol frequency without unbounded memory
const trafficSketch = new CountMinSketch(0.01, 0.99); // Error 1%, Confidence 99%

interface SystemHealthResponse {
  nodes: any[];
  systemUptime: number;
}

interface NetworkAnalyticsResponse {
  traffic: { protocol: string; volumeMB: number; count: number }[];
  ddos: { detected: boolean; signature: string; confidence: number };
}

interface CloudSecurityResponse {
  iamRisks: { resource: string; issue: string }[];
  misconfigurations: number;
  monthlySpend: number;
}

export class HealthLogic {
  static async getSystemHealth(cachedNodes: SystemNode[]): Promise<SystemHealthResponse> {
    if (threatData.isOffline) {
        return this.getOfflineSimulation(cachedNodes);
    }
    try {
      // Returns pre-calculated risk and predictions from backend
      return await apiClient.get<SystemHealthResponse>('/analysis/dashboard/system-health');
    } catch {
      return this.getOfflineSimulation(cachedNodes);
    }
  }

  private static getOfflineSimulation(cachedNodes: SystemNode[]): SystemHealthResponse {
      const nodes = cachedNodes.map(n => ({
          nodeId: n.id,
          name: n.name,
          risk: n.status === 'DEGRADED' ? 65 : 10,
          prediction: n.status === 'DEGRADED' ? 'Service Degradation Likely' : 'Stable',
          load: n.load,
          status: n.status
      }));
      return { nodes, systemUptime: 99.98 };
  }

  // Deprecated: Logic moved to backend `DashboardAnalyticsEngine.predictSystemHealth`
  static predictNodeFailure(node: any): { risk: number; prediction: string } {
    return { risk: node.risk || 0, prediction: node.prediction || 'Unknown' };
  }
}

export class NetworkOpsLogic {
  static async getNetworkAnalytics(): Promise<NetworkAnalyticsResponse> {
    if (threatData.isOffline) {
        return this.getOfflineTraffic();
    }
    try {
      return await apiClient.get<NetworkAnalyticsResponse>('/dashboard/network');
    } catch {
      return this.getOfflineTraffic();
    }
  }
  
  private static getOfflineTraffic(): NetworkAnalyticsResponse {
      // Offline Traffic Simulation using Sketch for variation
      trafficSketch.add('HTTPS');
      trafficSketch.add('HTTPS');
      trafficSketch.add('DNS');
      
      return { 
          traffic: [
              { protocol: 'HTTPS', volumeMB: 450.5, count: 12000 + trafficSketch.estimate('HTTPS') },
              { protocol: 'SSH', volumeMB: 120.2, count: 450 + trafficSketch.estimate('SSH') },
              { protocol: 'DNS', volumeMB: 45.0, count: 8900 + trafficSketch.estimate('DNS') },
              { protocol: 'RDP', volumeMB: 850.0, count: 120 + trafficSketch.estimate('RDP') }
          ], 
          ddos: { 
              detected: Math.random() > 0.8, 
              signature: 'SYN_FLOOD', 
              confidence: 95 
          } 
      };
  }

  // Deprecated: Logic moved to `NetworkEngine`
  static analyzeTrafficPatterns(pcaps: any[]): any[] {
    return []; 
  }

  static detectDdosSignatures(pcaps: any[]): boolean {
    return false;
  }
}

export class CloudSecLogic {
  static async getCloudSecurity(): Promise<CloudSecurityResponse> {
    if (threatData.isOffline) {
        return this.getOfflineCloud();
    }
    try {
      return await apiClient.get<CloudSecurityResponse>('/analysis/dashboard/cloud-security');
    } catch {
      return this.getOfflineCloud();
    }
  }
  
  private static getOfflineCloud(): CloudSecurityResponse {
      return { 
          iamRisks: [
              { resource: 's3-prod-bucket', issue: 'Public Read Access' },
              { resource: 'admin-role', issue: 'MFA Disabled' }
          ], 
          misconfigurations: 3, 
          monthlySpend: 12500 
      };
  }
}
