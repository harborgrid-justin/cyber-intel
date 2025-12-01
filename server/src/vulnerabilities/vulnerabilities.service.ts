import { Injectable, NotFoundException } from '@nestjs/common';
import { Vulnerability } from '@/types';

@Injectable()
export class VulnerabilitiesService {
  private vulnerabilities: Vulnerability[] = [
    {
      id: 'vuln-001',
      name: 'Log4Shell',
      score: 10.0,
      status: 'PATCHED',
      vendor: 'Apache',
      vectors: ['Remote Code Execution'],
      zeroDay: false,
      exploited: true,
      description: 'Critical remote code execution vulnerability in Log4j',
      firstDetected: '2021-12-09',
      affectedAssets: ['web-server-01', 'app-server-02']
    },
    {
      id: 'vuln-002',
      name: 'Heartbleed',
      score: 7.5,
      status: 'PATCHED',
      vendor: 'OpenSSL',
      vectors: ['Information Disclosure'],
      zeroDay: false,
      exploited: true,
      description: 'OpenSSL Heartbleed vulnerability allowing memory disclosure',
      firstDetected: '2014-04-07',
      affectedAssets: ['ssl-gateway-01']
    },
    {
      id: 'vuln-003',
      name: 'Zero-Day SMB Exploit',
      score: 9.8,
      status: 'UNPATCHED',
      vendor: 'Microsoft',
      vectors: ['Remote Code Execution', 'Privilege Escalation'],
      zeroDay: true,
      exploited: false,
      description: 'Unknown zero-day vulnerability in SMB protocol',
      firstDetected: '2024-12-01',
      affectedAssets: ['file-server-01', 'domain-controller-01']
    }
  ];

  async findAll(filters?: { status?: string; severity?: string }): Promise<Vulnerability[]> {
    let result = [...this.vulnerabilities];

    if (filters?.status) {
      result = result.filter(vuln => vuln.status === filters.status);
    }

    if (filters?.severity) {
      // Map severity to CVSS score ranges
      const severityRanges = {
        'CRITICAL': [9.0, 10.0],
        'HIGH': [7.0, 8.9],
        'MEDIUM': [4.0, 6.9],
        'LOW': [0.1, 3.9]
      };

      const range = severityRanges[filters.severity as keyof typeof severityRanges];
      if (range) {
        result = result.filter(vuln => vuln.score >= range[0] && vuln.score <= range[1]);
      }
    }

    return result.sort((a, b) => b.score - a.score);
  }

  async findOne(id: string): Promise<Vulnerability | null> {
    return this.vulnerabilities.find(vuln => vuln.id === id) || null;
  }

  async create(createVulnerabilityDto: Omit<Vulnerability, 'id'>): Promise<Vulnerability> {
    const newVulnerability: Vulnerability = {
      ...createVulnerabilityDto,
      id: `vuln-${Date.now()}`
    };

    this.vulnerabilities.push(newVulnerability);
    return newVulnerability;
  }

  async update(id: string, updateVulnerabilityDto: Partial<Vulnerability>): Promise<Vulnerability | null> {
    const index = this.vulnerabilities.findIndex(vuln => vuln.id === id);
    if (index === -1) {
      return null;
    }

    this.vulnerabilities[index] = { ...this.vulnerabilities[index], ...updateVulnerabilityDto };
    return this.vulnerabilities[index];
  }

  async remove(id: string): Promise<boolean> {
    const index = this.vulnerabilities.findIndex(vuln => vuln.id === id);
    if (index === -1) {
      return false;
    }

    this.vulnerabilities.splice(index, 1);
    return true;
  }

  async getAffectedAssets(id: string): Promise<string[]> {
    const vulnerability = await this.findOne(id);
    if (!vulnerability) {
      throw new NotFoundException('Vulnerability not found');
    }

    return vulnerability.affectedAssets || [];
  }

  async mitigate(id: string, mitigationData: { action: string; notes?: string }): Promise<Vulnerability> {
    const vulnerability = await this.findOne(id);
    if (!vulnerability) {
      throw new NotFoundException('Vulnerability not found');
    }

    // Update status based on mitigation action
    let newStatus: Vulnerability['status'] = vulnerability.status;
    if (mitigationData.action === 'PATCH') {
      newStatus = 'PATCHED';
    } else if (mitigationData.action === 'MITIGATE') {
      newStatus = 'MITIGATED';
    }

    return await this.update(id, {
      status: newStatus,
      description: vulnerability.description + `\n\nMitigation: ${mitigationData.action} - ${mitigationData.notes || 'No notes provided'}`
    }) as Vulnerability;
  }

  async getVulnerabilityStats(): Promise<any> {
    const total = this.vulnerabilities.length;
    const patched = this.vulnerabilities.filter(v => v.status === 'PATCHED').length;
    const unpatched = this.vulnerabilities.filter(v => v.status === 'UNPATCHED').length;
    const critical = this.vulnerabilities.filter(v => v.score >= 9.0).length;
    const zeroDays = this.vulnerabilities.filter(v => v.zeroDay).length;
    const exploited = this.vulnerabilities.filter(v => v.exploited).length;

    const vendors = this.vulnerabilities.reduce((acc, vuln) => {
      acc[vuln.vendor] = (acc[vuln.vendor] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const severityBreakdown = {
      critical: this.vulnerabilities.filter(v => v.score >= 9.0).length,
      high: this.vulnerabilities.filter(v => v.score >= 7.0 && v.score < 9.0).length,
      medium: this.vulnerabilities.filter(v => v.score >= 4.0 && v.score < 7.0).length,
      low: this.vulnerabilities.filter(v => v.score < 4.0).length
    };

    return {
      total,
      patched,
      unpatched,
      critical,
      zeroDays,
      exploited,
      vendors,
      severityBreakdown,
      complianceRate: total > 0 ? Math.round((patched / total) * 100) : 0
    };
  }

  async getHighRiskVulnerabilities(): Promise<Vulnerability[]> {
    return this.vulnerabilities.filter(vuln =>
      vuln.score >= 7.0 &&
      (vuln.status === 'UNPATCHED' || vuln.zeroDay || vuln.exploited)
    );
  }

  async getVulnerabilitiesByVendor(vendor: string): Promise<Vulnerability[]> {
    return this.vulnerabilities.filter(vuln => vuln.vendor === vendor);
  }
}