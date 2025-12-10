
import { Asset } from '../../models/infrastructure';

interface PatchPriority {
  vulnId: string;
  assetId: string;
  score: number;
  reason: string;
  cvss: number;
  businessCriticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

interface DecoyRecommendation {
  nodeId: string;
  reason: string;
  score: number;
}

interface HoneyToken {
  status: 'TRIGGERED' | 'DORMANT' | 'ACTIVE';
}

interface SegmentationPolicy {
  action: 'ALLOW' | 'DENY';
  source: string;
  destination: string;
  port: string;
}

interface TrafficFlow {
  source: string;
  dest: string;
  port: string;
}

interface LateralPath {
  path: string[];
  risk: number;
  details: string;
}

export class OrchestrationEngine {

  static async calculateBlastRadius(nodeId: string): Promise<{ affectedNodes: string[]; riskScore: number }> {
    const node = await (Asset as any).findByPk(nodeId);
    if (!node) return { affectedNodes: [], riskScore: 0 };

    const assets = await (Asset as any).findAll();
    // Simplified downstream traversal simulation
    const affected = assets.filter((a: Asset) => a.owner === node.owner || a.type === node.type).map((a: Asset) => a.id);
    
    let riskScore = 30;
    if (node.criticality === 'HIGH') riskScore = 90;
    else if (node.criticality === 'MEDIUM') riskScore = 60;

    return { affectedNodes: affected, riskScore };
  }

  static prioritizePatches(vulns: { id: string, score: number, exploited: boolean }[], nodes: Asset[]): PatchPriority[] {
    return vulns.map(v => {
        // Cast asset to any to bypass missing 'vulnerabilities' property in the model definition
        const affectedNode = nodes.find(n => (n as any).vulnerabilities?.includes(v.id));
        if (!affectedNode) return null;

        let score = v.score * 10; // Base CVSS weight
        let reason = 'Standard CVSS risk.';
        let criticality: PatchPriority['businessCriticality'] = 'LOW';

        // Contextual adjustment
        if (affectedNode.criticality === 'HIGH' || affectedNode.type === 'Database') {
            score += 40;
            criticality = 'CRITICAL';
            reason = 'Protects Restricted Data / Core DB.';
        } else if (affectedNode.status === 'ONLINE' && affectedNode.type === 'Server') {
            score += 20;
            criticality = 'HIGH';
            reason = 'Production Server Exposure.';
        }

        if (v.exploited) {
            score += 30;
            reason += ' KEV CONFIRMED.';
        }

        return { 
            vulnId: v.id, 
            assetId: affectedNode.id, 
            score: Math.min(100, score), 
            reason, 
            cvss: v.score, 
            businessCriticality: criticality 
        } as PatchPriority;
    }).filter((p): p is PatchPriority => p !== null);
  }

  static recommendDecoyPlacement(nodes: Asset[]): DecoyRecommendation[] {
    // Simple heuristic: High traffic or High Value Targets get decoys
    return nodes
      .filter(n => n.criticality === 'HIGH' || n.type === 'Database')
      .slice(0, 3)
      .map(n => ({
        nodeId: n.id,
        reason: 'High Value Target / Hub',
        score: 85
      }));
  }

  static analyzeLureEffectiveness(tokens: HoneyToken[]): number {
    if (!tokens || tokens.length === 0) return 0;
    
    const triggered = tokens.filter(t => t.status === 'TRIGGERED').length;
    const dormant = tokens.filter(t => t.status === 'DORMANT').length;
    
    // Weighted scoring: Triggered tokens prove value, dormant ones provide coverage
    let score = (triggered * 30) + (dormant * 10);
    
    // Normalize based on count
    const normalized = Math.min(100, Math.round(score / Math.max(1, tokens.length / 5)));
    return normalized;
  }

  static simulateSegmentation(policy: SegmentationPolicy, flows: TrafficFlow[]): { blockedCount: number; affectedServices: string[] } {
    // Basic simulation logic
    const blocked = flows.filter(f => {
       if (policy.action !== 'DENY') return false;
       const matchSrc = policy.source === '*' || f.source.includes(policy.source);
       const matchDst = policy.destination === '*' || f.dest.includes(policy.destination);
       const matchPort = policy.port === '*' || f.port === policy.port;
       return matchSrc && matchDst && matchPort;
    });

    const services = new Set(blocked.map(f => f.dest.split('(')[0].trim()));
    return {
        blockedCount: blocked.length,
        affectedServices: Array.from(services)
    };
  }

  static detectLateralMovementPaths(nodes: Asset[]): LateralPath[] {
    // Simplified backend logic for detecting flat networks
    // Real impl would traverse graph
    const riskPaths: LateralPath[] = [];
    const workstations = nodes.filter(n => n.type === 'Workstation');
    const dbs = nodes.filter(n => n.type === 'Database');

    if (workstations.length && dbs.length) {
        riskPaths.push({
            path: [workstations[0].name, 'Switch-Core', dbs[0].name],
            risk: 95,
            details: 'Direct path from Workstation segment to Production DB without Firewall'
        });
    }
    return riskPaths;
  }
}