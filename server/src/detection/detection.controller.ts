import { Controller, Get, Post, Put, Body, Param, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { DetectionService } from './detection.service';
import { ForensicJob } from '../models/forensic-job.model';
import { ParserRule } from '../models/parser-rule.model';
import { EnrichmentModule } from '../models/enrichment-module.model';
import { NormalizationRule } from '../models/normalization-rule.model';
import {
  DetectionCreateForensicJobDto,
  DetectionUpdateForensicJobDto,
  DetectionCreateParserRuleDto,
  DetectionCreateNormalizationRuleDto,
  DetectionUpdateEnrichmentModuleDto,
} from './dto';

@ApiTags('detection')
@Controller('api/detection')
export class DetectionController {
  constructor(private readonly detectionService: DetectionService) {}

  // Forensic Jobs
  @Get('forensic-jobs')
  @ApiOperation({ summary: 'Get all forensic jobs' })
  @ApiResponse({ status: 200, description: 'List of forensic jobs returned successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getForensicJobs(): Promise<ForensicJob[]> {
    return this.detectionService.getForensicJobs();
  }

  @Get('forensic-jobs/:id')
  @ApiOperation({ summary: 'Get forensic job by ID' })
  @ApiParam({ name: 'id', description: 'Forensic job ID', type: String })
  @ApiResponse({ status: 200, description: 'Forensic job details returned successfully' })
  @ApiResponse({ status: 404, description: 'Forensic job not found' })
  async getForensicJob(@Param('id') id: string): Promise<ForensicJob> {
    return this.detectionService.getForensicJob(id);
  }

  @Post('forensic-jobs')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new forensic job' })
  @ApiBody({ type: DetectionCreateForensicJobDto, description: 'Forensic job data' })
  @ApiResponse({ status: 201, description: 'Forensic job created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async createForensicJob(@Body() createForensicJobDto: DetectionCreateForensicJobDto): Promise<ForensicJob> {
    return this.detectionService.createForensicJob(createForensicJobDto);
  }

  @Put('forensic-jobs/:id')
  @ApiOperation({ summary: 'Update a forensic job' })
  @ApiParam({ name: 'id', description: 'Forensic job ID', type: String })
  @ApiBody({ type: DetectionUpdateForensicJobDto, description: 'Forensic job update data' })
  @ApiResponse({ status: 200, description: 'Forensic job updated successfully' })
  @ApiResponse({ status: 404, description: 'Forensic job not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async updateForensicJob(
    @Param('id') id: string,
    @Body() updateForensicJobDto: DetectionUpdateForensicJobDto,
  ): Promise<ForensicJob> {
    return this.detectionService.updateForensicJob(id, updateForensicJobDto);
  }

  // Parser Rules
  @Get('parser-rules')
  @ApiOperation({ summary: 'Get all parser rules' })
  @ApiResponse({ status: 200, description: 'List of parser rules returned successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getParserRules(): Promise<ParserRule[]> {
    return this.detectionService.getParserRules();
  }

  @Post('parser-rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new parser rule' })
  @ApiBody({ type: DetectionCreateParserRuleDto, description: 'Parser rule data' })
  @ApiResponse({ status: 201, description: 'Parser rule created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async createParserRule(@Body() createParserRuleDto: DetectionCreateParserRuleDto): Promise<ParserRule> {
    return this.detectionService.createParserRule(createParserRuleDto);
  }

  // Enrichment Modules
  @Get('enrichment-modules')
  @ApiOperation({ summary: 'Get all enrichment modules' })
  @ApiResponse({ status: 200, description: 'List of enrichment modules returned successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getEnrichmentModules(): Promise<EnrichmentModule[]> {
    return this.detectionService.getEnrichmentModules();
  }

  @Put('enrichment-modules/:id')
  @ApiOperation({ summary: 'Update enrichment module status' })
  @ApiParam({ name: 'id', description: 'Enrichment module ID', type: String })
  @ApiBody({ type: DetectionUpdateEnrichmentModuleDto, description: 'Enrichment module status update' })
  @ApiResponse({ status: 200, description: 'Enrichment module updated successfully' })
  @ApiResponse({ status: 404, description: 'Enrichment module not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid status value' })
  async updateEnrichmentModule(
    @Param('id') id: string,
    @Body() updateEnrichmentModuleDto: DetectionUpdateEnrichmentModuleDto,
  ): Promise<EnrichmentModule> {
    return this.detectionService.updateEnrichmentModule(id, updateEnrichmentModuleDto.status);
  }

  // Normalization Rules
  @Get('normalization-rules')
  @ApiOperation({ summary: 'Get all normalization rules' })
  @ApiResponse({ status: 200, description: 'List of normalization rules returned successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getNormalizationRules(): Promise<NormalizationRule[]> {
    return this.detectionService.getNormalizationRules();
  }

  @Post('normalization-rules')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new normalization rule' })
  @ApiBody({ type: DetectionCreateNormalizationRuleDto, description: 'Normalization rule data' })
  @ApiResponse({ status: 201, description: 'Normalization rule created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async createNormalizationRule(
    @Body() createNormalizationRuleDto: DetectionCreateNormalizationRuleDto,
  ): Promise<NormalizationRule> {
    return this.detectionService.createNormalizationRule(createNormalizationRuleDto);
  }
}
