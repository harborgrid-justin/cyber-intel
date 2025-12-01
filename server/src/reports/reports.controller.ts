import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ReportsService } from './reports.service';
import { IncidentReport, ReportSection } from '@/types';

@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  async findAll(@Query('type') type?: string, @Query('status') status?: string): Promise<IncidentReport[]> {
    try {
      return await this.reportsService.findAll({ type, status });
    } catch (error) {
      throw new HttpException('Failed to retrieve reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<IncidentReport> {
    try {
      const report = await this.reportsService.findOne(id);
      if (!report) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }
      return report;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createReportDto: Omit<IncidentReport, 'id'>): Promise<IncidentReport> {
    try {
      return await this.reportsService.create(createReportDto);
    } catch (error) {
      throw new HttpException('Failed to create report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateReportDto: Partial<IncidentReport>): Promise<IncidentReport> {
    try {
      const report = await this.reportsService.update(id, updateReportDto);
      if (!report) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }
      return report;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.reportsService.remove(id);
      if (!result) {
        throw new HttpException('Report not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Report deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/sections')
  async getReportSections(@Param('id') id: string): Promise<ReportSection[]> {
    try {
      return await this.reportsService.getReportSections(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve report sections', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/sections')
  async addReportSection(@Param('id') id: string, @Body() sectionData: Omit<ReportSection, 'id'>): Promise<ReportSection> {
    try {
      return await this.reportsService.addReportSection(id, sectionData);
    } catch (error) {
      throw new HttpException('Failed to add report section', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/sections/:sectionId')
  async updateReportSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() sectionData: Partial<ReportSection>
  ): Promise<ReportSection> {
    try {
      return await this.reportsService.updateReportSection(id, sectionId, sectionData);
    } catch (error) {
      throw new HttpException('Failed to update report section', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/publish')
  async publishReport(@Param('id') id: string): Promise<IncidentReport> {
    try {
      return await this.reportsService.publishReport(id);
    } catch (error) {
      throw new HttpException('Failed to publish report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/archive')
  async archiveReport(@Param('id') id: string): Promise<IncidentReport> {
    try {
      return await this.reportsService.archiveReport(id);
    } catch (error) {
      throw new HttpException('Failed to archive report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  async getReportStats(): Promise<any> {
    try {
      return await this.reportsService.getReportStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve report statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('templates/:type')
  async getReportTemplate(@Param('type') type: string): Promise<any> {
    try {
      return await this.reportsService.getReportTemplate(type);
    } catch (error) {
      throw new HttpException('Failed to retrieve report template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}