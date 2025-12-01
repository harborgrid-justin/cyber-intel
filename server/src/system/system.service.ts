import { Injectable, NotFoundException } from '@nestjs/common';
import { SystemNode } from '@/types';

@Injectable()
export class SystemService {
  private nodes: SystemNode[] = [
    {
      id: 'node-001',
      name: 'Web Server 01',
      status: 'ONLINE',
      load: 45,
      latency: 12,
      type: 'Server',
      vulnerabilities: ['vuln-001'],
      vendor: 'Apache',
      criticalProcess: 'httpd',
      dependencies: ['node-002'],
      securityControls: ['EDR', 'AV', 'DLP'],
      dataSensitivity: 'INTERNAL',
      dataVolumeGB: 50,
      segment: 'DMZ',
      networkConnections: 1250
    },
    {
      id: 'node-002',
      name: 'Database Server',
      status: 'ONLINE',
      load: 78,
      latency: 8,
      type: 'Database',
      vulnerabilities: [],
      vendor: 'PostgreSQL',
      criticalProcess: 'postgres',
      dependencies: [],
      securityControls: ['EDR', 'FIREWALL'],
      dataSensitivity: 'CONFIDENTIAL',
      dataVolumeGB: 500,
      segment: 'PROD',
      networkConnections: 89
    },
    {
      id: 'node-003',
      name: 'Domain Controller',
      status: 'DEGRADED',
      load: 92,
      latency: 45,
      type: 'Server',
      vulnerabilities: ['vuln-003'],
      vendor: 'Microsoft',
      criticalProcess: 'lsass.exe',
      dependencies: ['node-004'],
      securityControls: ['EDR', 'AV'],
      dataSensitivity: 'RESTRICTED',
      dataVolumeGB: 100,
      segment: 'PROD',
      networkConnections: 567
    },
    {
      id: 'node-004',
      name: 'File Server',
      status: 'OFFLINE',
      load: 0,
      latency: 0,
      type: 'Server',
      vulnerabilities: ['vuln-002'],
      vendor: 'Microsoft',
      criticalProcess: 'smbd',
      dependencies: [],
      securityControls: ['AV'],
      dataSensitivity: 'CONFIDENTIAL',
      dataVolumeGB: 2000,
      segment: 'PROD',
      networkConnections: 0
    }
  ];

  async findAllNodes(filters?: { status?: string; segment?: string }): Promise<SystemNode[]> {
    let result = [...this.nodes];

    if (filters?.status) {
      result = result.filter(node => node.status === filters.status);
    }

    if (filters?.segment) {
      result = result.filter(node => node.segment === filters.segment);
    }

    return result.sort((a, b) => b.load - a.load);
  }

  async findNodeById(id: string): Promise<SystemNode | null> {
    return this.nodes.find(node => node.id === id) || null;
  }

  async createNode(createNodeDto: Omit<SystemNode, 'id'>): Promise<SystemNode> {
    const newNode: SystemNode = {
      ...createNodeDto,
      id: `node-${Date.now()}`
    };

    this.nodes.push(newNode);
    return newNode;
  }

  async updateNode(id: string, updateNodeDto: Partial<SystemNode>): Promise<SystemNode | null> {
    const index = this.nodes.findIndex(node => node.id === id);
    if (index === -1) {
      return null;
    }

    this.nodes[index] = { ...this.nodes[index], ...updateNodeDto };
    return this.nodes[index];
  }

  async removeNode(id: string): Promise<boolean> {
    const index = this.nodes.findIndex(node => node.id === id);
    if (index === -1) {
      return false;
    }

    this.nodes.splice(index, 1);
    return true;
  }

  async getSystemHealth(): Promise<any> {
    const total = this.nodes.length;
    const online = this.nodes.filter(n => n.status === 'ONLINE').length;
    const offline = this.nodes.filter(n => n.status === 'OFFLINE').length;
    const degraded = this.nodes.filter(n => n.status === 'DEGRADED').length;
    const isolated = this.nodes.filter(n => n.status === 'ISOLATED').length;

    const avgLoad = this.nodes.reduce((sum, node) => sum + node.load, 0) / total;
    const avgLatency = this.nodes.filter(n => n.status === 'ONLINE')
      .reduce((sum, node) => sum + node.latency, 0) / online || 0;

    const segments = this.nodes.reduce((acc, node) => {
      if (node.segment) {
        acc[node.segment] = (acc[node.segment] || 0) + 1;
      }
      return acc;
    }, {} as Record<string, number>);

    return {
      total,
      online,
      offline,
      degraded,
      isolated,
      uptime: Math.round((online / total) * 100),
      avgLoad: Math.round(avgLoad),
      avgLatency: Math.round(avgLatency),
      segments,
      criticalNodes: this.nodes.filter(n => n.load > 80 || n.status === 'DEGRADED').length
    };
  }

  async getNodesBySegment(segment: string): Promise<SystemNode[]> {
    return this.nodes.filter(node => node.segment === segment);
  }

  async isolateNode(id: string, isolationData: { reason: string; duration?: number }): Promise<SystemNode> {
    const node = await this.findNodeById(id);
    if (!node) {
      throw new NotFoundException('System node not found');
    }

    return await this.updateNode(id, {
      status: 'ISOLATED',
      // Store isolation metadata in dependencies or create a new field
      dependencies: [...(node.dependencies || []), `ISOLATED:${isolationData.reason}:${isolationData.duration || 0}`]
    }) as SystemNode;
  }

  async restoreNode(id: string): Promise<SystemNode> {
    const node = await this.findNodeById(id);
    if (!node) {
      throw new NotFoundException('System node not found');
    }

    // Remove isolation metadata
    const cleanDependencies = (node.dependencies || []).filter(dep => !dep.startsWith('ISOLATED:'));

    return await this.updateNode(id, {
      status: 'ONLINE',
      dependencies: cleanDependencies
    }) as SystemNode;
  }

  async getVulnerabilitySummary(): Promise<any> {
    const allVulnerabilities = this.nodes.flatMap(node => node.vulnerabilities || []);
    const uniqueVulnerabilities = [...new Set(allVulnerabilities)];

    const vulnerabilityCounts = this.nodes.reduce((acc, node) => {
      (node.vulnerabilities || []).forEach(vuln => {
        acc[vuln] = (acc[vuln] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const nodesWithVulnerabilities = this.nodes.filter(node =>
      (node.vulnerabilities || []).length > 0
    ).length;

    return {
      totalVulnerabilities: uniqueVulnerabilities.length,
      affectedNodes: nodesWithVulnerabilities,
      vulnerabilityDistribution: vulnerabilityCounts,
      riskScore: this.calculateRiskScore()
    };
  }

  private calculateRiskScore(): number {
    let totalRisk = 0;

    this.nodes.forEach(node => {
      let nodeRisk = 0;

      // Status risk
      if (node.status === 'OFFLINE') nodeRisk += 50;
      else if (node.status === 'DEGRADED') nodeRisk += 25;
      else if (node.status === 'ISOLATED') nodeRisk += 30;

      // Load risk
      if (node.load > 90) nodeRisk += 40;
      else if (node.load > 70) nodeRisk += 20;

      // Vulnerability risk
      nodeRisk += (node.vulnerabilities?.length || 0) * 15;

      // Data sensitivity risk
      const sensitivityMultiplier = {
        'PUBLIC': 1,
        'INTERNAL': 2,
        'CONFIDENTIAL': 3,
        'RESTRICTED': 4
      }[node.dataSensitivity] || 1;

      totalRisk += nodeRisk * sensitivityMultiplier;
    });

    return Math.min(100, Math.round(totalRisk / this.nodes.length));
  }

  async getCriticalNodes(): Promise<SystemNode[]> {
    return this.nodes.filter(node =>
      node.load > 80 ||
      node.status === 'DEGRADED' ||
      node.status === 'OFFLINE' ||
      (node.vulnerabilities || []).length > 2
    );
  }
}