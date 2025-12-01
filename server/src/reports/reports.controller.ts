import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  HttpException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ReportsService } from './reports.service';
import {
  CreateReportDto,
  UpdateReportDto,
  ReportQueryDto,
  CreateReportSectionDto,
  UpdateReportSectionDto,
  ReportResponseDto,
  ReportSectionResponseDto,
  DeleteReportResponseDto,
  ReportStatsDto,
  ReportTemplateDto,
} from './dto';

@ApiTags('reports')
@Controller('reports')
export class ReportsController {
  constructor(private readonly reportsService: ReportsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all incident reports',
    description: 'Retrieve all incident reports with optional filtering by type and status.',
  })
  @ApiQuery({
    name: 'type',
    required: false,
    enum: ['Executive', 'Forensic', 'Compliance', 'Technical'],
    description: 'Filter by report type',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['DRAFT', 'READY', 'ARCHIVED'],
    description: 'Filter by report status',
  })
  @ApiResponse({
    status: 200,
    description: 'List of incident reports retrieved successfully',
    type: [ReportResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve reports',
  })
  async findAll(@Query() query: ReportQueryDto): Promise<ReportResponseDto[]> {
    try {
      return await this.reportsService.findAll({ type: query.type, status: query.status });
    } catch (error) {
      throw new HttpException('Failed to retrieve reports', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  @ApiOperation({
    summary: 'Get report statistics',
    description: 'Retrieve aggregate statistics about all reports including counts by status, type, and author.',
  })
  @ApiResponse({
    status: 200,
    description: 'Report statistics retrieved successfully',
    type: ReportStatsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve report statistics',
  })
  async getReportStats(): Promise<ReportStatsDto> {
    try {
      return await this.reportsService.getReportStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve report statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('templates/:type')
  @ApiOperation({
    summary: 'Get report template',
    description: 'Retrieve a pre-defined template for creating reports of a specific type.',
  })
  @ApiParam({
    name: 'type',
    description: 'Type of report template',
    enum: ['Executive', 'Forensic', 'Compliance', 'Technical'],
  })
  @ApiResponse({
    status: 200,
    description: 'Report template retrieved successfully',
    type: ReportTemplateDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve report template',
  })
  async getReportTemplate(@Param('type') type: string): Promise<ReportTemplateDto> {
    try {
      return await this.reportsService.getReportTemplate(type);
    } catch (error) {
      throw new HttpException('Failed to retrieve report template', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get report by ID',
    description: 'Retrieve a specific incident report by its unique identifier.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the report',
    example: 'report-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Report retrieved successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve report',
  })
  async findOne(@Param('id') id: string): Promise<ReportResponseDto> {
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new incident report',
    description: 'Create a new incident report with the provided details.',
  })
  @ApiBody({ type: CreateReportDto })
  @ApiResponse({
    status: 201,
    description: 'Report created successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid report data',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to create report',
  })
  async create(@Body() createReportDto: CreateReportDto): Promise<ReportResponseDto> {
    try {
      return await this.reportsService.create(createReportDto);
    } catch (error) {
      throw new HttpException('Failed to create report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an incident report',
    description: 'Update an existing incident report with the provided changes.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the report',
    example: 'report-001',
  })
  @ApiBody({ type: UpdateReportDto })
  @ApiResponse({
    status: 200,
    description: 'Report updated successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update report',
  })
  async update(
    @Param('id') id: string,
    @Body() updateReportDto: UpdateReportDto,
  ): Promise<ReportResponseDto> {
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Delete an incident report',
    description: 'Permanently delete an incident report and all its sections.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the report',
    example: 'report-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Report deleted successfully',
    type: DeleteReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to delete report',
  })
  async remove(@Param('id') id: string): Promise<DeleteReportResponseDto> {
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
  @ApiOperation({
    summary: 'Get report sections',
    description: 'Retrieve all sections of a specific incident report.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the report',
    example: 'report-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Report sections retrieved successfully',
    type: [ReportSectionResponseDto],
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to retrieve report sections',
  })
  async getReportSections(@Param('id') id: string): Promise<ReportSectionResponseDto[]> {
    try {
      return await this.reportsService.getReportSections(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve report sections', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/sections')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Add a section to a report',
    description: 'Add a new section to an existing incident report.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the report',
    example: 'report-001',
  })
  @ApiBody({ type: CreateReportSectionDto })
  @ApiResponse({
    status: 201,
    description: 'Section added successfully',
    type: ReportSectionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to add report section',
  })
  async addReportSection(
    @Param('id') id: string,
    @Body() sectionData: CreateReportSectionDto,
  ): Promise<ReportSectionResponseDto> {
    try {
      return await this.reportsService.addReportSection(id, sectionData);
    } catch (error) {
      throw new HttpException('Failed to add report section', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id/sections/:sectionId')
  @ApiOperation({
    summary: 'Update a report section',
    description: 'Update an existing section within an incident report.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the report',
    example: 'report-001',
  })
  @ApiParam({
    name: 'sectionId',
    description: 'Unique identifier of the section',
    example: 'section-001',
  })
  @ApiBody({ type: UpdateReportSectionDto })
  @ApiResponse({
    status: 200,
    description: 'Section updated successfully',
    type: ReportSectionResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report or section not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to update report section',
  })
  async updateReportSection(
    @Param('id') id: string,
    @Param('sectionId') sectionId: string,
    @Body() sectionData: UpdateReportSectionDto,
  ): Promise<ReportSectionResponseDto> {
    try {
      return await this.reportsService.updateReportSection(id, sectionId, sectionData);
    } catch (error) {
      throw new HttpException('Failed to update report section', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/publish')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Publish a report',
    description: 'Change the status of a report from DRAFT to READY, making it available for distribution.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the report',
    example: 'report-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Report published successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Report cannot be published from current status',
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to publish report',
  })
  async publishReport(@Param('id') id: string): Promise<ReportResponseDto> {
    try {
      return await this.reportsService.publishReport(id);
    } catch (error) {
      throw new HttpException('Failed to publish report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/archive')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Archive a report',
    description: 'Move a report to the ARCHIVED status for long-term storage.',
  })
  @ApiParam({
    name: 'id',
    description: 'Unique identifier of the report',
    example: 'report-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Report archived successfully',
    type: ReportResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Report not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Failed to archive report',
  })
  async archiveReport(@Param('id') id: string): Promise<ReportResponseDto> {
    try {
      return await this.reportsService.archiveReport(id);
    } catch (error) {
      throw new HttpException('Failed to archive report', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
