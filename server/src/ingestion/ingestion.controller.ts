import { Controller, Get, Post, Put, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { IngestionService } from './ingestion.service';
import {
  IngestionJob,
  ParserRule,
  EnrichmentModule,
  NormalizationRule
} from '@/types';

@Controller('ingestion')
export class IngestionController {
  constructor(private readonly ingestionService: IngestionService) {}

  // Ingestion Jobs
  @Get('jobs')
  async getIngestionJobs(): Promise<IngestionJob[]> {
    try {
      return this.ingestionService.getIngestionJobs();
    } catch (error) {
      throw new HttpException('Failed to retrieve ingestion jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('jobs/:id')
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
  async createIngestionJob(@Body() jobData: Omit<IngestionJob, 'id'>): Promise<IngestionJob> {
    try {
      return this.ingestionService.createIngestionJob(jobData);
    } catch (error) {
      throw new HttpException('Failed to create ingestion job', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('jobs/:id')
  async updateIngestionJob(@Param('id') id: string, @Body() updates: Partial<IngestionJob>): Promise<IngestionJob> {
    try {
      const job = this.ingestionService.updateIngestionJob(id, updates);
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
  async completeIngestionJob(@Param('id') id: string, @Body() data: { count: number }): Promise<IngestionJob> {
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
  async getParserRules(): Promise<ParserRule[]> {
    try {
      return this.ingestionService.getParserRules();
    } catch (error) {
      throw new HttpException('Failed to retrieve parser rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('parser-rules/:id')
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
  async createParserRule(@Body() ruleData: Omit<ParserRule, 'id'>): Promise<ParserRule> {
    try {
      return this.ingestionService.createParserRule(ruleData);
    } catch (error) {
      throw new HttpException('Failed to create parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('parser-rules/:id')
  async updateParserRule(@Param('id') id: string, @Body() updates: Partial<ParserRule>): Promise<ParserRule> {
    try {
      const rule = this.ingestionService.updateParserRule(id, updates);
      if (!rule) {
        throw new HttpException('Parser rule not found', HttpStatus.NOT_FOUND);
      }
      return rule;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update parser rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Enrichment Modules
  @Get('enrichment-modules')
  async getEnrichmentModules(): Promise<EnrichmentModule[]> {
    try {
      return this.ingestionService.getEnrichmentModules();
    } catch (error) {
      throw new HttpException('Failed to retrieve enrichment modules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('enrichment-modules/:id')
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
  async createEnrichmentModule(@Body() moduleData: Omit<EnrichmentModule, 'id'>): Promise<EnrichmentModule> {
    try {
      return this.ingestionService.createEnrichmentModule(moduleData);
    } catch (error) {
      throw new HttpException('Failed to create enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('enrichment-modules/:id')
  async updateEnrichmentModule(@Param('id') id: string, @Body() updates: Partial<EnrichmentModule>): Promise<EnrichmentModule> {
    try {
      const module = this.ingestionService.updateEnrichmentModule(id, updates);
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

  // Normalization Rules
  @Get('normalization-rules')
  async getNormalizationRules(): Promise<NormalizationRule[]> {
    try {
      return this.ingestionService.getNormalizationRules();
    } catch (error) {
      throw new HttpException('Failed to retrieve normalization rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('normalization-rules/:id')
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
  async createNormalizationRule(@Body() ruleData: Omit<NormalizationRule, 'id'>): Promise<NormalizationRule> {
    try {
      return this.ingestionService.createNormalizationRule(ruleData);
    } catch (error) {
      throw new HttpException('Failed to create normalization rule', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('normalization-rules/:id')
  async updateNormalizationRule(@Param('id') id: string, @Body() updates: Partial<NormalizationRule>): Promise<NormalizationRule> {
    try {
      const rule = this.ingestionService.updateNormalizationRule(id, updates);
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
  async getIngestionStats(): Promise<any> {
    try {
      return this.ingestionService.getIngestionStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve ingestion statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('jobs/active')
  async getActiveIngestionJobs(): Promise<IngestionJob[]> {
    try {
      return this.ingestionService.getActiveIngestionJobs();
    } catch (error) {
      throw new HttpException('Failed to retrieve active ingestion jobs', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('parser-rules/failed')
  async getFailedParserRules(): Promise<ParserRule[]> {
    try {
      return this.ingestionService.getFailedParserRules();
    } catch (error) {
      throw new HttpException('Failed to retrieve failed parser rules', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Data Processing
  @Post('process')
  async processIngestionData(@Body() data: { source: string; format: string; rawData: any[] }): Promise<IngestionJob> {
    try {
      return this.ingestionService.processIngestionData(data.source, data.format, data.rawData);
    } catch (error) {
      throw new HttpException('Failed to process ingestion data', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('parser-rules/:id/validate')
  async validateParserRule(@Param('id') id: string, @Body() data: { pattern: string; sampleLog: string }): Promise<{ valid: boolean }> {
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

  @Post('enrichment-modules/:id/test')
  async testEnrichmentModule(@Param('id') id: string, @Body() testData: any): Promise<any> {
    try {
      return this.ingestionService.testEnrichmentModule(id, testData);
    } catch (error) {
      throw new HttpException('Failed to test enrichment module', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}