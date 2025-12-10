import { Report } from '../models/operations';
import { AuditService } from './audit.service';

export class ReportService {
  static async getAll() {
    return await (Report as any).findAll({ order: [['date', 'DESC']] });
  }

  static async create(data: any, author: string) {
    const id = `RPT-${Date.now()}`;
    const report = await (Report as any).create({
      id,
      title: data.title,
      type: data.type,
      author,
      status: 'DRAFT',
      content: data.content || '',
      related_case_id: data.relatedCaseId,
      date: new Date()
    });

    await AuditService.log(author, 'REPORT_CREATED', `Drafted report ${id}`);
    return report;
  }

  static async updateStatus(id: string, status: string, userId: string) {
    const report = await (Report as any).findByPk(id);
    if (report) {
      report.status = status;
      await report.save();
      await AuditService.log(userId, 'REPORT_STATUS', `Report ${id} changed to ${status}`);
      return report;
    }
    return null;
  }
}