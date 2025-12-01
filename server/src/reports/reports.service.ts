import { Injectable, NotFoundException } from '@nestjs/common';
import { IncidentReport, ReportSection } from '@/types';

@Injectable()
export class ReportsService {
  private reports: IncidentReport[] = [
    {
      id: 'report-001',
      title: 'SolarWinds Supply Chain Compromise - Executive Summary',
      type: 'Executive',
      date: '2021-01-15',
      author: 'Alice Johnson',
      status: 'READY',
      content: 'Executive summary of the SolarWinds supply chain attack...',
      relatedCaseId: 'case-001',
      relatedActorId: 'apt-001',
      relatedThreatId: 'threat-001'
    },
    {
      id: 'report-002',
      title: 'Colonial Pipeline Ransomware - Forensic Analysis',
      type: 'Forensic',
      date: '2021-06-15',
      author: 'Bob Smith',
      status: 'ARCHIVED',
      content: 'Detailed forensic analysis of the Colonial Pipeline incident...',
      relatedCaseId: 'case-002',
      relatedActorId: 'apt-002'
    },
    {
      id: 'report-003',
      title: 'Log4Shell Vulnerability Impact Assessment',
      type: 'Technical',
      date: '2021-12-20',
      author: 'Carol Williams',
      status: 'DRAFT',
      content: 'Technical assessment of Log4Shell vulnerability impact...',
      relatedThreatId: 'threat-003'
    }
  ];

  private reportSections: { [reportId: string]: ReportSection[] } = {
    'report-001': [
      {
        id: 'section-001',
        title: 'Executive Summary',
        content: 'The SolarWinds supply chain compromise represents one of the most sophisticated cyber attacks in history...'
      },
      {
        id: 'section-002',
        title: 'Impact Assessment',
        content: 'The attack affected multiple US government agencies and critical infrastructure...'
      }
    ],
    'report-002': [
      {
        id: 'section-003',
        title: 'Timeline',
        content: 'Detailed timeline of the Colonial Pipeline ransomware attack...'
      }
    ]
  };

  async findAll(filters?: { type?: string; status?: string }): Promise<IncidentReport[]> {
    let result = [...this.reports];

    if (filters?.type) {
      result = result.filter(report => report.type === filters.type);
    }

    if (filters?.status) {
      result = result.filter(report => report.status === filters.status);
    }

    return result.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }

  async findOne(id: string): Promise<IncidentReport | null> {
    return this.reports.find(report => report.id === id) || null;
  }

  async create(createReportDto: Omit<IncidentReport, 'id'>): Promise<IncidentReport> {
    const newReport: IncidentReport = {
      ...createReportDto,
      id: `report-${Date.now()}`
    };

    this.reports.push(newReport);
    return newReport;
  }

  async update(id: string, updateReportDto: Partial<IncidentReport>): Promise<IncidentReport | null> {
    const index = this.reports.findIndex(report => report.id === id);
    if (index === -1) {
      return null;
    }

    this.reports[index] = { ...this.reports[index], ...updateReportDto };
    return this.reports[index];
  }

  async remove(id: string): Promise<boolean> {
    const index = this.reports.findIndex(report => report.id === id);
    if (index === -1) {
      return false;
    }

    this.reports.splice(index, 1);
    delete this.reportSections[id];
    return true;
  }

  async getReportSections(reportId: string): Promise<ReportSection[]> {
    const report = await this.findOne(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return this.reportSections[reportId] || [];
  }

  async addReportSection(reportId: string, sectionData: Omit<ReportSection, 'id'>): Promise<ReportSection> {
    const report = await this.findOne(reportId);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (!this.reportSections[reportId]) {
      this.reportSections[reportId] = [];
    }

    const newSection: ReportSection = {
      ...sectionData,
      id: `section-${Date.now()}`
    };

    this.reportSections[reportId].push(newSection);
    return newSection;
  }

  async updateReportSection(reportId: string, sectionId: string, sectionData: Partial<ReportSection>): Promise<ReportSection> {
    const sections = this.reportSections[reportId];
    if (!sections) {
      throw new NotFoundException('Report sections not found');
    }

    const index = sections.findIndex(section => section.id === sectionId);
    if (index === -1) {
      throw new NotFoundException('Report section not found');
    }

    sections[index] = { ...sections[index], ...sectionData };
    return sections[index];
  }

  async publishReport(id: string): Promise<IncidentReport> {
    const report = await this.findOne(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    if (report.status !== 'DRAFT' && report.status !== 'READY') {
      throw new Error('Report can only be published from DRAFT or READY status');
    }

    return await this.update(id, {
      status: 'READY',
      date: new Date().toISOString().split('T')[0]
    }) as IncidentReport;
  }

  async archiveReport(id: string): Promise<IncidentReport> {
    const report = await this.findOne(id);
    if (!report) {
      throw new NotFoundException('Report not found');
    }

    return await this.update(id, { status: 'ARCHIVED' }) as IncidentReport;
  }

  async getReportStats(): Promise<any> {
    const total = this.reports.length;
    const drafts = this.reports.filter(r => r.status === 'DRAFT').length;
    const ready = this.reports.filter(r => r.status === 'READY').length;
    const archived = this.reports.filter(r => r.status === 'ARCHIVED').length;

    const types = this.reports.reduce((acc, report) => {
      acc[report.type] = (acc[report.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const authors = this.reports.reduce((acc, report) => {
      acc[report.author] = (acc[report.author] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const avgSections = Object.values(this.reportSections).reduce((sum, sections) => sum + sections.length, 0) / total || 0;

    return {
      total,
      drafts,
      ready,
      archived,
      types,
      authors,
      avgSections: Math.round(avgSections * 10) / 10,
      completionRate: Math.round((ready / total) * 100)
    };
  }

  async getReportTemplate(type: string): Promise<any> {
    const templates = {
      'Executive': {
        type: 'Executive',
        sections: [
          { title: 'Executive Summary', content: 'High-level overview of the incident...' },
          { title: 'Impact Assessment', content: 'Business and operational impact...' },
          { title: 'Response Actions', content: 'Actions taken to contain and remediate...' },
          { title: 'Recommendations', content: 'Future prevention and improvement measures...' }
        ]
      },
      'Forensic': {
        type: 'Forensic',
        sections: [
          { title: 'Timeline', content: 'Chronological sequence of events...' },
          { title: 'Technical Analysis', content: 'Detailed technical findings...' },
          { title: 'Indicators of Compromise', content: 'IOCs identified during investigation...' },
          { title: 'Chain of Custody', content: 'Evidence handling and preservation...' }
        ]
      },
      'Technical': {
        type: 'Technical',
        sections: [
          { title: 'System Analysis', content: 'Affected systems and configurations...' },
          { title: 'Vulnerability Assessment', content: 'Technical vulnerabilities exploited...' },
          { title: 'Remediation Steps', content: 'Technical fixes and hardening measures...' },
          { title: 'Monitoring Recommendations', content: 'Enhanced detection and monitoring...' }
        ]
      },
      'Compliance': {
        type: 'Compliance',
        sections: [
          { title: 'Regulatory Requirements', content: 'Applicable compliance frameworks...' },
          { title: 'Compliance Gaps', content: 'Areas of non-compliance identified...' },
          { title: 'Remediation Plan', content: 'Steps to achieve compliance...' },
          { title: 'Audit Trail', content: 'Documentation for regulatory review...' }
        ]
      }
    };

    return templates[type as keyof typeof templates] || templates['Executive'];
  }

  async getReportsByAuthor(author: string): Promise<IncidentReport[]> {
    return this.reports.filter(report => report.author === author);
  }

  async getReportsByCase(caseId: string): Promise<IncidentReport[]> {
    return this.reports.filter(report => report.relatedCaseId === caseId);
  }

  async generateReportContent(reportId: string): Promise<string> {
    const report = await this.findOne(reportId);
    const sections = await this.getReportSections(reportId);

    if (!report) {
      throw new NotFoundException('Report not found');
    }

    let content = `# ${report.title}\n\n`;
    content += `**Type:** ${report.type}\n`;
    content += `**Author:** ${report.author}\n`;
    content += `**Date:** ${report.date}\n`;
    content += `**Status:** ${report.status}\n\n`;

    content += `## Report Content\n\n`;
    content += report.content;
    content += `\n\n`;

    sections.forEach(section => {
      content += `## ${section.title}\n\n`;
      content += section.content;
      content += `\n\n`;
    });

    return content;
  }
}