import { Controller, Get, Post, Put, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { IngestionService } from './ingestion.service';
import {
  CreateIngestionJobDto,
  UpdateIngestionJobDto,
  CompleteIngestionJobDto,
  IngestionCreateParserRuleDto,
  UpdateParserRuleDto,
  ValidateParserRuleDto,
  CreateEnrichmentModuleDto,
  IngestionUpdateEnrichmentModuleDto,
  IngestionCreateNormalizationRuleDto,
  UpdateNormalizationRuleDto,
  ProcessDataDto,
} from './dto';
import {
  IngestionJob,
  ParserRule,
  EnrichmentModule,
  NormalizationRule
} from '@/types';

@ApiTags('ingestion')
@Controller('api/ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  // Ingestion Jobs
  @Get('jobs')
  @ApiOperation({ summary: 'Get all ingestion jobs' })
  @ApiResponse({ status: 200, description: 'Returns all ingestion jobs' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve ingestion jobs' })
  async getIngestionJobs(): Promise<IngestionJob[]> {
    try {
      return this.ingestionService.getIngestionJobs();
    } catch (error) {
      throw new HttpException('Failed to retrieve ingestion jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('jobs/active')
  @ApiOperation({ summary: 'Get all active ingestion jobs' })
  @ApiResponse({ status: 200, description: 'Returns active ingestion jobs' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve active ingestion jobs' })
  async getActiveIngestionJobs(): Promise<IngestionJob[]> {
    try {
      return this.ingestionService.getActiveIngestionJobs();
    } catch (error) {
      throw new HttpException('Failed to retrieve active ingestion jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('jobs/:id')
  @ApiOperation({ summary: 'Get ingestion job by ID' })
  @ApiParam({ name: 'id', description: 'Ingestion job ID', example: 'job-123' })
  @ApiResponse({ status: 200, description: 'Returns the ingestion job' })
  @ApiResponse({ status: 404, description: 'Ingestion job not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve ingestion job' })
  async getIngestionJob(@Param('id') id: string): Promise<IngestionJob> {
    try {
      const job = this.ingestionService.getIngestionJob(id);
      if (!job) {
        throw new HttpException('Ingestion job not found', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('jobs')
  @ApiOperation({ summary: 'Create a new ingestion job' })
  @ApiBody({ type: CreateIngestionJobDto })
  @ApiResponse({ status: 201, description: 'Ingestion job created' })
  @ApiResponse({ status: 500, description: 'Failed to create ingestion job' })
  async createIngestionJob(@Body() jobData: CreateIngestionJobDto): Promise<IngestionJob> {
    try {
      return this.ingestionService.createIngestionJob(jobData as Omit<IngestionJob, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to create ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('jobs/:id')
  @ApiOperation({ summary: 'Update an ingestion job' })
  @ApiParam({ name: 'id', description: 'Ingestion job ID', example: 'job-123' })
  @ApiBody({ type: UpdateIngestionJobDto })
  @ApiResponse({ status: 200, description: 'Ingestion job updated' })
  @ApiResponse({ status: 404, description: 'Ingestion job not found' })
  @ApiResponse({ status: 500, description: 'Failed to update ingestion job' })
  async updateIngestionJob(@Param('id') id: string, @Body() updates: UpdateIngestionJobDto): Promise<IngestionJob> {
    try {
      const job = this.ingestionService.updateIngestionJob(id, updates as any);
      if (!job) {
        throw new HttpException('Ingestion job not found', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('jobs/:id/start')
  @ApiOperation({ summary: 'Start an ingestion job' })
  @ApiParam({ name: 'id', description: 'Ingestion job ID', example: 'job-123' })
  @ApiResponse({ status: 200, description: 'Ingestion job started' })
  @ApiResponse({ status: 404, description: 'Ingestion job not found' })
  @ApiResponse({ status: 400, description: 'Job is not in pending state' })
  @ApiResponse({ status: 500, description: 'Failed to start ingestion job' })
  async startIngestionJob(@Param('id') id: string): Promise<IngestionJob> {
    try {
      const job = this.ingestionService.startIngestionJob(id);
      if (!job) {
        throw new HttpException('Ingestion job not found', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to start ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('jobs/:id/complete')
  @ApiOperation({ summary: 'Complete an ingestion job' })
  @ApiParam({ name: 'id', description: 'Ingestion job ID', example: 'job-123' })
  @ApiBody({ type: CompleteIngestionJobDto })
  @ApiResponse({ status: 200, description: 'Ingestion job completed' })
  @ApiResponse({ status: 404, description: 'Ingestion job not found' })
  @ApiResponse({ status: 400, description: 'Job is not in running state' })
  @ApiResponse({ status: 500, description: 'Failed to complete ingestion job' })
  async completeIngestionJob(@Param('id') id: string, @Body() data: CompleteIngestionJobDto): Promise<IngestionJob> {
    try {
      const job = this.ingestionService.completeIngestionJob(id, data.count);
      if (!job) {
        throw new HttpException('Ingestion job not found', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to complete ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('jobs/:id/fail')
  @ApiOperation({ summary: 'Mark an ingestion job as failed' })
  @ApiParam({ name: 'id', description: 'Ingestion job ID', example: 'job-123' })
  @ApiResponse({ status: 200, description: 'Ingestion job marked as failed' })
  @ApiResponse({ status: 404, description: 'Ingestion job not found' })
  @ApiResponse({ status: 400, description: 'Job is not in running state' })
  @ApiResponse({ status: 500, description: 'Failed to fail ingestion job' })
  async failIngestionJob(@Param('id') id: string): Promise<IngestionJob> {
    try {
      const job = this.ingestionService.failIngestionJob(id);
      if (!job) {
        throw new HttpException('Ingestion job not found', HttpStatus.NOT_FOUND);
      }
      return job;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to fail ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Parser Rules
  @Get('parser-rules')
  @ApiOperation({ summary: 'Get all parser rules' })
  @ApiResponse({ status: 200, description: 'Returns all parser rules' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve parser rules' })
  async getParserRules(): Promise<ParserRule[]> {
    try {
      return this.ingestionService.getParserRules();
    } catch (error) {
      throw new HttpException('Failed to retrieve parser rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('parser-rules/failed')
  @ApiOperation({ summary: 'Get all failed parser rules' })
  @ApiResponse({ status: 200, description: 'Returns failed parser rules' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve failed parser rules' })
  async getFailedParserRules(): Promise<ParserRule[]> {
    try {
      return this.ingestionService.getFailedParserRules();
    } catch (error) {
      throw new HttpException('Failed to retrieve failed parser rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('parser-rules/:id')
  @ApiOperation({ summary: 'Get parser rule by ID' })
  @ApiParam({ name: 'id', description: 'Parser rule ID', example: 'rule-123' })
  @ApiResponse({ status: 200, description: 'Returns the parser rule' })
  @ApiResponse({ status: 404, description: 'Parser rule not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve parser rule' })
  async getParserRule(@Param('id') id: string): Promise<ParserRule> {
    try {
      const rule = this.ingestionService.getParserRule(id);
      if (!rule) {
        throw new HttpException('Parser rule not found', HttpStatus.NOT_FOUND);
      }
      return rule;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('parser-rules')
  @ApiOperation({ summary: 'Create a new parser rule' })
  @ApiBody({ type: IngestionCreateParserRuleDto })
  @ApiResponse({ status: 201, description: 'Parser rule created' })
  @ApiResponse({ status: 500, description: 'Failed to create parser rule' })
  async createParserRule(@Body() ruleData: IngestionCreateParserRuleDto): Promise<ParserRule> {
    try {
      return this.ingestionService.createParserRule(ruleData as Omit<ParserRule, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to create parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('parser-rules/:id')
  @ApiOperation({ summary: 'Update a parser rule' })
  @ApiParam({ name: 'id', description: 'Parser rule ID', example: 'rule-123' })
  @ApiBody({ type: UpdateParserRuleDto })
  @ApiResponse({ status: 200, description: 'Parser rule updated' })
  @ApiResponse({ status: 404, description: 'Parser rule not found' })
  @ApiResponse({ status: 500, description: 'Failed to update parser rule' })
  async updateParserRule(@Param('id') id: string, @Body() updates: UpdateParserRuleDto): Promise<ParserRule> {
    try {
      const rule = this.ingestionService.updateParserRule(id, updates as any);
      if (!rule) {
        throw new HttpException('Parser rule not found', HttpStatus.NOT_FOUND);
      }
      return rule;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('parser-rules/:id/validate')
  @ApiOperation({ summary: 'Validate a parser rule against sample data' })
  @ApiParam({ name: 'id', description: 'Parser rule ID', example: 'rule-123' })
  @ApiBody({ type: ValidateParserRuleDto })
  @ApiResponse({ status: 200, description: 'Validation result' })
  @ApiResponse({ status: 404, description: 'Parser rule not found' })
  @ApiResponse({ status: 500, description: 'Failed to validate parser rule' })
  async validateParserRule(@Param('id') id: string, @Body() data: ValidateParserRuleDto): Promise<{ valid: boolean }> {
    try {
      const rule = this.ingestionService.getParserRule(id);
      if (!rule) {
        throw new HttpException('Parser rule not found', HttpStatus.NOT_FOUND);
      }
      const valid = this.ingestionService.validateParserRule(data.pattern, data.sampleLog);
      return { valid };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to validate parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Enrichment Modules
  @Get('enrichment-modules')
  @ApiOperation({ summary: 'Get all enrichment modules' })
  @ApiResponse({ status: 200, description: 'Returns all enrichment modules' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve enrichment modules' })
  async getEnrichmentModules(): Promise<EnrichmentModule[]> {
    try {
      return this.ingestionService.getEnrichmentModules();
    } catch (error) {
      throw new HttpException('Failed to retrieve enrichment modules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('enrichment-modules/:id')
  @ApiOperation({ summary: 'Get enrichment module by ID' })
  @ApiParam({ name: 'id', description: 'Enrichment module ID', example: 'module-123' })
  @ApiResponse({ status: 200, description: 'Returns the enrichment module' })
  @ApiResponse({ status: 404, description: 'Enrichment module not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve enrichment module' })
  async getEnrichmentModule(@Param('id') id: string): Promise<EnrichmentModule> {
    try {
      const module = this.ingestionService.getEnrichmentModule(id);
      if (!module) {
        throw new HttpException('Enrichment module not found', HttpStatus.NOT_FOUND);
      }
      return module;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('enrichment-modules')
  @ApiOperation({ summary: 'Create a new enrichment module' })
  @ApiBody({ type: CreateEnrichmentModuleDto })
  @ApiResponse({ status: 201, description: 'Enrichment module created' })
  @ApiResponse({ status: 500, description: 'Failed to create enrichment module' })
  async createEnrichmentModule(@Body() moduleData: CreateEnrichmentModuleDto): Promise<EnrichmentModule> {
    try {
      return this.ingestionService.createEnrichmentModule(moduleData as Omit<EnrichmentModule, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to create enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('enrichment-modules/:id')
  @ApiOperation({ summary: 'Update an enrichment module' })
  @ApiParam({ name: 'id', description: 'Enrichment module ID', example: 'module-123' })
  @ApiBody({ type: IngestionUpdateEnrichmentModuleDto })
  @ApiResponse({ status: 200, description: 'Enrichment module updated' })
  @ApiResponse({ status: 404, description: 'Enrichment module not found' })
  @ApiResponse({ status: 500, description: 'Failed to update enrichment module' })
  async updateEnrichmentModule(@Param('id') id: string, @Body() updates: IngestionUpdateEnrichmentModuleDto): Promise<EnrichmentModule> {
    try {
      const module = this.ingestionService.updateEnrichmentModule(id, updates as any);
      if (!module) {
        throw new HttpException('Enrichment module not found', HttpStatus.NOT_FOUND);
      }
      return module;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('enrichment-modules/:id/enable')
  @ApiOperation({ summary: 'Enable an enrichment module' })
  @ApiParam({ name: 'id', description: 'Enrichment module ID', example: 'module-123' })
  @ApiResponse({ status: 200, description: 'Enrichment module enabled' })
  @ApiResponse({ status: 404, description: 'Enrichment module not found' })
  @ApiResponse({ status: 500, description: 'Failed to enable enrichment module' })
  async enableEnrichmentModule(@Param('id') id: string): Promise<EnrichmentModule> {
    try {
      const module = this.ingestionService.enableEnrichmentModule(id);
      if (!module) {
        throw new HttpException('Enrichment module not found', HttpStatus.NOT_FOUND);
      }
      return module;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to enable enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('enrichment-modules/:id/disable')
  @ApiOperation({ summary: 'Disable an enrichment module' })
  @ApiParam({ name: 'id', description: 'Enrichment module ID', example: 'module-123' })
  @ApiResponse({ status: 200, description: 'Enrichment module disabled' })
  @ApiResponse({ status: 404, description: 'Enrichment module not found' })
  @ApiResponse({ status: 500, description: 'Failed to disable enrichment module' })
  async disableEnrichmentModule(@Param('id') id: string): Promise<EnrichmentModule> {
    try {
      const module = this.ingestionService.disableEnrichmentModule(id);
      if (!module) {
        throw new HttpException('Enrichment module not found', HttpStatus.NOT_FOUND);
      }
      return module;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to disable enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('enrichment-modules/:id/test')
  @ApiOperation({ summary: 'Test an enrichment module with sample data' })
  @ApiParam({ name: 'id', description: 'Enrichment module ID', example: 'module-123' })
  @ApiBody({ description: 'Test data object' })
  @ApiResponse({ status: 200, description: 'Test result with enriched data' })
  @ApiResponse({ status: 500, description: 'Failed to test enrichment module' })
  async testEnrichmentModule(@Param('id') id: string, @Body() testData: any): Promise<any> {
    try {
      return this.ingestionService.testEnrichmentModule(id, testData);
    } catch (error) {
      throw new HttpException('Failed to test enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Normalization Rules
  @Get('normalization-rules')
  @ApiOperation({ summary: 'Get all normalization rules' })
  @ApiResponse({ status: 200, description: 'Returns all normalization rules' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve normalization rules' })
  async getNormalizationRules(): Promise<NormalizationRule[]> {
    try {
      return this.ingestionService.getNormalizationRules();
    } catch (error) {
      throw new HttpException('Failed to retrieve normalization rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('normalization-rules/:id')
  @ApiOperation({ summary: 'Get normalization rule by ID' })
  @ApiParam({ name: 'id', description: 'Normalization rule ID', example: 'norm-123' })
  @ApiResponse({ status: 200, description: 'Returns the normalization rule' })
  @ApiResponse({ status: 404, description: 'Normalization rule not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve normalization rule' })
  async getNormalizationRule(@Param('id') id: string): Promise<NormalizationRule> {
    try {
      const rule = this.ingestionService.getNormalizationRule(id);
      if (!rule) {
        throw new HttpException('Normalization rule not found', HttpStatus.NOT_FOUND);
      }
      return rule;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve normalization rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('normalization-rules')
  @ApiOperation({ summary: 'Create a new normalization rule' })
  @ApiBody({ type: IngestionCreateNormalizationRuleDto })
  @ApiResponse({ status: 201, description: 'Normalization rule created' })
  @ApiResponse({ status: 500, description: 'Failed to create normalization rule' })
  async createNormalizationRule(@Body() ruleData: IngestionCreateNormalizationRuleDto): Promise<NormalizationRule> {
    try {
      return this.ingestionService.createNormalizationRule(ruleData as Omit<NormalizationRule, 'id'>);
    } catch (error) {
      throw new HttpException('Failed to create normalization rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('normalization-rules/:id')
  @ApiOperation({ summary: 'Update a normalization rule' })
  @ApiParam({ name: 'id', description: 'Normalization rule ID', example: 'norm-123' })
  @ApiBody({ type: UpdateNormalizationRuleDto })
  @ApiResponse({ status: 200, description: 'Normalization rule updated' })
  @ApiResponse({ status: 404, description: 'Normalization rule not found' })
  @ApiResponse({ status: 500, description: 'Failed to update normalization rule' })
  async updateNormalizationRule(@Param('id') id: string, @Body() updates: UpdateNormalizationRuleDto): Promise<NormalizationRule> {
    try {
      const rule = this.ingestionService.updateNormalizationRule(id, updates as any);
      if (!rule) {
        throw new HttpException('Normalization rule not found', HttpStatus.NOT_FOUND);
      }
      return rule;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update normalization rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  @Get('stats/overview')
  @ApiOperation({ summary: 'Get ingestion statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns ingestion statistics' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve ingestion statistics' })
  async getIngestionStats(): Promise<any> {
    try {
      return this.ingestionService.getIngestionStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve ingestion statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Data Processing
  @Post('process')
  @ApiOperation({ summary: 'Process ingestion data from source' })
  @ApiBody({ type: ProcessDataDto })
  @ApiResponse({ status: 201, description: 'Data processing initiated' })
  @ApiResponse({ status: 500, description: 'Failed to process ingestion data' })
  async processIngestionData(@Body() data: ProcessDataDto): Promise<IngestionJob> {
    try {
      return this.ingestionService.processIngestionData(data.source, data.format, data.rawData);
    } catch (error) {
      throw new HttpException('Failed to process ingestion data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
