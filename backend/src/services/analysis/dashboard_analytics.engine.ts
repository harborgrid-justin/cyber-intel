import { Threat, Case } from '../../models/intelligence';
import { Asset } from '../../models/infrastructure';
import { AuditLog } from '../../models/operations';
import { User } from '../../models/system';
import { Op } from 'sequelize';

export class DashboardAnalyticsEngine {

  // --- Core Overview ---
  static async calculateDefconLevel() {
    const activeThreats = await (Threat as any).count({ where: { status: { [Op.ne]: 'CLOSED' } } });
    const criticals = await (Threat as any).count({ where: { severity: 'CRITICAL', status: { [Op.ne]: 'CLOSED' } } });
    const activeCases = await (Case as any).count({ where: { status: { [Op.ne]: 'CLOSED' } } });

    // Heuristic Score (0-100)
    const score = Math.min(100, (criticals * 10) + (activeCases * 5) + (activeThreats));

    if (score > 80) return { level: 1, label: 'CRITICAL (DEFCON 1)', color: 'text-red-500' };
    if (score > 60) return { level: 2, label: 'SEVERE (DEFCON 2)', color: 'text-orange-500' };
    if (score > 40) return { level: 3, label: 'ELEVATED (DEFCON 3)', color: 'text-yellow-500' };
    return { level: 4, label: 'GUARDED (DEFCON 4)', color: 'text-green-500' };
  }

  static async getTrendMetrics() {
    const now = new Date();
    const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
    const twoDaysAgo = new Date(now.getTime() - 48 * 60 * 60 * 1000);

    const last24h = await (Threat as any).count({
      where: { last_seen: { [Op.gte]: yesterday } }
    });

    const prev24h = await (Threat as any).count({
      where: { last_seen: { [Op.between]: [twoDaysAgo, yesterday] } }
    });

    const delta = last24h - prev24h;
    
    return { 
      count: last24h, 
      delta, 
      trend: delta > 0 ? 'UP' : 'DOWN' 
    };
  }

  static async getRegionalRisk() {
    const threats = await (Threat as any).findAll();
    const risks: Record<string, number> = {};
    threats.forEach((t: any) => {
      const r = t.region || 'Unknown';
      risks[r] = (risks[r] || 0) + (t.score / 10);
    });
    return Object.entries(risks).sort((a, b) => b[1] - a[1]);
  }

  // --- Infrastructure ---
  static async predictSystemHealth() {
    const nodes = await (Asset as any).findAll();
    const predictions = nodes.map((node: any) => {
        // In real app, load/latency comes from TSDB (Prometheus/Influx)
        const load = Math.random() * 100; 
        const latency = Math.random() * 300;
        
        let risk = 0;
        if (load > 90) risk += 50;
        if (latency > 200) risk += 30;
        if (node.status === 'DEGRADED') risk += 20;
        
        let prediction = 'Stable';
        if (risk > 80) prediction = 'Critical Failure Imminent (< 1h)';
        else if (risk > 50) prediction = 'Performance Degradation Likely';
        
        return { 
            nodeId: node.id, 
            name: node.name, 
            risk, 
            prediction, 
            load: Math.round(load),
            latency: Math.round(latency),
            status: node.status 
        };
    });
    
    // Uptime calculation
    const total = nodes.length || 1;
    const down = nodes.filter((n: any) => n.status === 'OFFLINE').length;
    const uptime = ((total - down) / total) * 100;

    return { nodes: predictions, systemUptime: uptime };
  }

  static async checkCloudSecurity() {
    // Mock cloud security checks
    const nodes = await (Asset as any).findAll();
    const iamRisks = nodes
        .filter((n: any) => n.type === 'Database' && n.criticality === 'HIGH') 
        .map((n: any) => ({ resource: n.name, issue: 'Publicly Accessible Database (Risk: High)' }));
    
    const misconfigs = Math.floor(Math.random() * 5); 
    
    return { iamRisks, misconfigurations: misconfigs, monthlySpend: 4200 };
  }

  // --- Security ---
  static async analyzeInsiderThreats() {
    const users = await (User as any).findAll();
    const logs = await (AuditLog as any).findAll({ limit: 500, order: [['timestamp', 'DESC']] });
    
    return users.map((u: any) => {
        const userLogs = logs.filter((l: any) => l.user_id === u.username);
        const failures = userLogs.filter((l: any) => l.action.includes('FAIL')).length;
        const exports = userLogs.filter((l: any) => l.action === 'DATA_EXPORT').length;
        
        const anomalies = [];
        if (failures > 3) anomalies.push('Multiple Auth Failures');
        if (exports > 0) anomalies.push('Data Exfiltration Attempt');
        if (u.status === 'LOCKED') anomalies.push('Account Locked');
        
        let score = (failures * 10) + (exports * 30);
        if (u.status === 'LOCKED') score += 50;

        return { 
            user: { name: u.username, role: u.role, id: u.id }, 
            score: Math.min(100, score), 
            anomalies 
        };
    }).sort((a: any, b: any) => b.score - a.score).filter((u: any) => u.score > 0);
  }
}