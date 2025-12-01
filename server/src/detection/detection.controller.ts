import { Controller, Get, Post, Put, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { DetectionService } from './detection.service';
import { ForensicJob } from '../models/forensic-job.model';
import { ParserRule } from '../models/parser-rule.model';
import { EnrichmentModule } from '../models/enrichment-module.model';
import { NormalizationRule } from '../models/normalization-rule.model';

@ApiTags('detection')
@Controller('api/detection')
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  // Forensic Jobs
  @Get('forensic-jobs')
  @ApiOperation({ summary: 'Get all forensic jobs' })
  @ApiResponse({ status: 200, description: 'List of forensic jobs' })
  getForensicJobs(): Promise<ForensicJob[]> {
    return this.detectionService.getForensicJobs();
  }

  @Get('forensic-jobs/:id')
  @ApiOperation({ summary: 'Get forensic job by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Forensic job details' })
  @ApiResponse({ status: 404, description: 'Forensic job not found' })
  getForensicJob(@Param('id') id: string): Promise<ForensicJob> {
    return this.detectionService.getForensicJob(id);
  }

  @Post('forensic-jobs')
  @ApiOperation({ summary: 'Create a new forensic job' })
  @ApiResponse({ status: 201, description: 'Forensic job created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createForensicJob(@Body() job: Partial<ForensicJob>): Promise<ForensicJob> {
    return this.detectionService.createForensicJob(job);
  }

  @Put('forensic-jobs/:id')
  @ApiOperation({ summary: 'Update a forensic job' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Forensic job updated' })
  @ApiResponse({ status: 404, description: 'Forensic job not found' })
  updateForensicJob(@Param('id') id: string, @Body() updates: Partial<ForensicJob>): Promise<ForensicJob> {
    return this.detectionService.updateForensicJob(id, updates);
  }

  // Parser Rules
  @Get('parser-rules')
  @ApiOperation({ summary: 'Get all parser rules' })
  @ApiResponse({ status: 200, description: 'List of parser rules' })
  getParserRules(): Promise<ParserRule[]> {
    return this.detectionService.getParserRules();
  }

  @Post('parser-rules')
  @ApiOperation({ summary: 'Create a new parser rule' })
  @ApiResponse({ status: 201, description: 'Parser rule created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createParserRule(@Body() rule: Partial<ParserRule>): Promise<ParserRule> {
    return this.detectionService.createParserRule(rule);
  }

  // Enrichment Modules
  @Get('enrichment-modules')
  @ApiOperation({ summary: 'Get all enrichment modules' })
  @ApiResponse({ status: 200, description: 'List of enrichment modules' })
  getEnrichmentModules(): Promise<EnrichmentModule[]> {
    return this.detectionService.getEnrichmentModules();
  }

  @Put('enrichment-modules/:id')
  @ApiOperation({ summary: 'Update enrichment module status' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Enrichment module updated' })
  @ApiResponse({ status: 404, description: 'Enrichment module not found' })
  updateEnrichmentModule(@Param('id') id: string, @Body() body: { status: string }): Promise<EnrichmentModule> {
    return this.detectionService.updateEnrichmentModule(id, body.status);
  }

  // Normalization Rules
  @Get('normalization-rules')
  @ApiOperation({ summary: 'Get all normalization rules' })
  @ApiResponse({ status: 200, description: 'List of normalization rules' })
  getNormalizationRules(): Promise<NormalizationRule[]> {
    return this.detectionService.getNormalizationRules();
  }

  @Post('normalization-rules')
  @ApiOperation({ summary: 'Create a new normalization rule' })
  @ApiResponse({ status: 201, description: 'Normalization rule created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createNormalizationRule(@Body() rule: Partial<NormalizationRule>): Promise<NormalizationRule> {
    return this.detectionService.createNormalizationRule(rule);
  }
}