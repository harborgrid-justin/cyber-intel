
import { Request, Response } from 'express';
import { ReportService } from '../services/report.service';
import { ReportGenerator } from '../services/analysis/report_generator';

export const listReports = async (req: Request, res: Response) => {
  const reports = await ReportService.getAll();
  res.json({ data: reports });
};

export const createReport = async (req: Request, res: Response) => {
  const report = await ReportService.create(req.body, req.user!.username);
  res.status(201).json({ data: report });
};

export const updateReportStatus = async (req: Request, res: Response) => {
  const report = await ReportService.updateStatus(req.params.id, req.body.status, req.user!.username);
  if (!report) return res.status(404).json({ error: 'Report not found' });
  res.json({ data: report });
};

export const generateDraft = async (req: Request, res: Response) => {
  try {
    const { caseId, type } = req.body;
    const content = await ReportGenerator.generateCaseDraft(caseId, type);
    res.json({ data: { content } });
  } catch (err: any) {
    res.status(400).json({ error: err.message });
  }
};

export const getTemplates = async (req: Request, res: Response) => {
  const templates = ReportGenerator.getTemplates();
  res.json({ data: templates });
};
