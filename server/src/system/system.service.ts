import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { SystemNode } from '../models';
import { Op } from 'sequelize';
import {
  CreateSystemNodeDto,
  UpdateSystemNodeDto,
  IsolateNodeDto,
  SystemHealthDto,
  VulnerabilitySummaryDto,
} from './dto';

@Injectable()
export class SystemService {
  constructor(
    @InjectModel(SystemNode)
    private readonly systemNodeModel: typeof SystemNode,
  ) {}

  async findAllNodes(filters?: { status?: string; segment?: string }): Promise<SystemNode[]> {
    const where: Record<string, string> = {};
    if (filters?.status) {
      where.status = filters.status;
    }
    if (filters?.segment) {
      where.segment = filters.segment;
    }
    return this.systemNodeModel.findAll({ where, order: [['load', 'DESC']] });
  }

  async findNodeById(id: string): Promise<SystemNode | null> {
    return this.systemNodeModel.findByPk(id);
  }

  async createNode(createNodeDto: CreateSystemNodeDto): Promise<SystemNode> {
    const nodeData = { ...createNodeDto };
    if (!nodeData.id) {
      nodeData.id = `node-${Date.now()}`;
    }
    return this.systemNodeModel.create(nodeData as SystemNode);
  }

  async updateNode(id: string, updateNodeDto: UpdateSystemNodeDto): Promise<SystemNode | null> {
    const [affectedCount] = await this.systemNodeModel.update(updateNodeDto, { where: { id } });
    if (affectedCount === 0) {
      return null;
    }
    return this.systemNodeModel.findByPk(id);
  }

  async removeNode(id: string): Promise<boolean> {
    const affectedCount = await this.systemNodeModel.destroy({ where: { id } });
    return affectedCount > 0;
  }

  async getSystemHealth(): Promise<SystemHealthDto> {
    const nodes = await this.systemNodeModel.findAll();
    const total = nodes.length;

    if (total === 0) {
      return {
        total: 0,
        online: 0,
        offline: 0,
        degraded: 0,
        isolated: 0,
        uptime: 0,
        avgLoad: 0,
        avgLatency: 0,
        segments: {},
        criticalNodes: 0,
      };
    }

    const online = nodes.filter(n => n.status === 'ONLINE').length;
    const offline = nodes.filter(n => n.status === 'OFFLINE').length;
    const degraded = nodes.filter(n => n.status === 'DEGRADED').length;
    const isolated = nodes.filter(n => n.status === 'ISOLATED').length;

    const avgLoad = nodes.reduce((sum, node) => sum + node.load, 0) / total;
    const onlineNodes = nodes.filter(n => n.status === 'ONLINE');
    const avgLatency = onlineNodes.length > 0
      ? onlineNodes.reduce((sum, node) => sum + node.latency, 0) / onlineNodes.length
      : 0;

    const segments = nodes.reduce((acc, node) => {
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
      criticalNodes: nodes.filter(n => n.load > 80 || n.status === 'DEGRADED').length,
    };
  }

  async getNodesBySegment(segment: string): Promise<SystemNode[]> {
    return this.systemNodeModel.findAll({ where: { segment } });
  }

  async isolateNode(id: string, isolationData: IsolateNodeDto): Promise<SystemNode> {
    const node = await this.findNodeById(id);
    if (!node) {
      throw new NotFoundException(`System node with ID ${id} not found`);
    }

    const updatedNode = await this.updateNode(id, {
      status: 'ISOLATED',
      dependencies: [
        ...(node.dependencies || []),
        `ISOLATED:${isolationData.reason}:${isolationData.duration || 0}`,
      ],
    });

    return updatedNode as SystemNode;
  }

  async restoreNode(id: string): Promise<SystemNode> {
    const node = await this.findNodeById(id);
    if (!node) {
      throw new NotFoundException(`System node with ID ${id} not found`);
    }

    const cleanDependencies = (node.dependencies || []).filter(
      dep => !dep.startsWith('ISOLATED:'),
    );

    const updatedNode = await this.updateNode(id, {
      status: 'ONLINE',
      dependencies: cleanDependencies,
    });

    return updatedNode as SystemNode;
  }

  async getVulnerabilitySummary(): Promise<VulnerabilitySummaryDto> {
    const nodes = await this.systemNodeModel.findAll();
    const allVulnerabilities = nodes.flatMap(node => node.vulnerabilities || []);
    const uniqueVulnerabilities = [...new Set(allVulnerabilities)];

    const vulnerabilityCounts = nodes.reduce((acc, node) => {
      (node.vulnerabilities || []).forEach(vuln => {
        acc[vuln] = (acc[vuln] || 0) + 1;
      });
      return acc;
    }, {} as Record<string, number>);

    const nodesWithVulnerabilities = nodes.filter(
      node => (node.vulnerabilities || []).length > 0,
    ).length;

    return {
      totalVulnerabilities: uniqueVulnerabilities.length,
      affectedNodes: nodesWithVulnerabilities,
      vulnerabilityDistribution: vulnerabilityCounts,
      riskScore: this.calculateRiskScore(nodes),
    };
  }

  private calculateRiskScore(nodes: SystemNode[]): number {
    if (nodes.length === 0) return 0;

    let totalRisk = 0;

    nodes.forEach(node => {
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
      const sensitivityMultiplier: Record<string, number> = {
        PUBLIC: 1,
        INTERNAL: 2,
        CONFIDENTIAL: 3,
        RESTRICTED: 4,
      };

      totalRisk += nodeRisk * (sensitivityMultiplier[node.dataSensitivity] || 1);
    });

    return Math.min(100, Math.round(totalRisk / nodes.length));
  }

  async getCriticalNodes(): Promise<SystemNode[]> {
    return this.systemNodeModel.findAll({
      where: {
        [Op.or]: [
          { load: { [Op.gt]: 80 } },
          { status: 'DEGRADED' },
          { status: 'OFFLINE' },
        ],
      },
    });
  }
}
