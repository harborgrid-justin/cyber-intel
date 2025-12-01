import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { Vulnerability } from '../models';
import {
  CreateVulnerabilityDto,
  UpdateVulnerabilityDto,
  VulnerabilityQueryDto,
  MitigateVulnerabilityDto,
  VulnerabilityStatsDto,
} from './dto';

@ApiTags('vulnerabilities')
@Controller('api/vulnerabilities')
export class VulnerabilitiesController {
  constructor(private readonly vulnerabilitiesService: VulnerabilitiesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all vulnerabilities with optional filtering' })
  @ApiQuery({ name: 'status', required: false, enum: ['Open', 'Investigating', 'Mitigated', 'Closed'], description: 'Filter by vulnerability status' })
  @ApiQuery({ name: 'severity', required: false, enum: ['Low', 'Medium', 'High', 'Critical'], description: 'Filter by severity level' })
  @ApiResponse({ status: 200, description: 'List of vulnerabilities returned successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(@Query() query: VulnerabilityQueryDto): Promise<Vulnerability[]> {
    return this.vulnerabilitiesService.findAll({ status: query.status, severity: query.severity });
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get vulnerability statistics overview' })
  @ApiResponse({ status: 200, description: 'Vulnerability statistics returned successfully', type: VulnerabilityStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getStats(): Promise<VulnerabilityStatsDto> {
    return this.vulnerabilitiesService.getVulnerabilityStats();
  }

  @Get('high-risk/list')
  @ApiOperation({ summary: 'Get high-risk vulnerabilities (Critical and High severity, Open status)' })
  @ApiResponse({ status: 200, description: 'List of high-risk vulnerabilities returned successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getHighRiskVulnerabilities(): Promise<Vulnerability[]> {
    return this.vulnerabilitiesService.getHighRiskVulnerabilities();
  }

  @Get('cve/:cveId')
  @ApiOperation({ summary: 'Get vulnerabilities by CVE ID' })
  @ApiParam({ name: 'cveId', description: 'CVE identifier (e.g., CVE-2024-1234)', type: String })
  @ApiResponse({ status: 200, description: 'Vulnerabilities matching CVE ID returned successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getVulnerabilitiesByCveId(@Param('cveId') cveId: string): Promise<Vulnerability[]> {
    return this.vulnerabilitiesService.getVulnerabilitiesByCveId(cveId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get vulnerability by ID' })
  @ApiParam({ name: 'id', description: 'Vulnerability ID', type: String })
  @ApiResponse({ status: 200, description: 'Vulnerability details returned successfully' })
  @ApiResponse({ status: 404, description: 'Vulnerability not found' })
  async findOne(@Param('id') id: string): Promise<Vulnerability> {
    return this.vulnerabilitiesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new vulnerability' })
  @ApiBody({ type: CreateVulnerabilityDto, description: 'Vulnerability data' })
  @ApiResponse({ status: 201, description: 'Vulnerability created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async create(@Body() createVulnerabilityDto: CreateVulnerabilityDto): Promise<Vulnerability> {
    return this.vulnerabilitiesService.create(createVulnerabilityDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a vulnerability' })
  @ApiParam({ name: 'id', description: 'Vulnerability ID', type: String })
  @ApiBody({ type: UpdateVulnerabilityDto, description: 'Vulnerability update data' })
  @ApiResponse({ status: 200, description: 'Vulnerability updated successfully' })
  @ApiResponse({ status: 404, description: 'Vulnerability not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async update(
    @Param('id') id: string,
    @Body() updateVulnerabilityDto: UpdateVulnerabilityDto,
  ): Promise<Vulnerability> {
    return this.vulnerabilitiesService.update(id, updateVulnerabilityDto);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a vulnerability' })
  @ApiParam({ name: 'id', description: 'Vulnerability ID', type: String })
  @ApiResponse({ status: 200, description: 'Vulnerability deleted successfully' })
  @ApiResponse({ status: 404, description: 'Vulnerability not found' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    await this.vulnerabilitiesService.remove(id);
    return { message: 'Vulnerability deleted successfully' };
  }

  @Get(':id/affected-products')
  @ApiOperation({ summary: 'Get affected products for a vulnerability' })
  @ApiParam({ name: 'id', description: 'Vulnerability ID', type: String })
  @ApiResponse({ status: 200, description: 'List of affected products returned successfully' })
  @ApiResponse({ status: 404, description: 'Vulnerability not found' })
  async getAffectedProducts(@Param('id') id: string): Promise<string[]> {
    return this.vulnerabilitiesService.getAffectedProducts(id);
  }

  @Post(':id/mitigate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Apply mitigation to a vulnerability' })
  @ApiParam({ name: 'id', description: 'Vulnerability ID', type: String })
  @ApiBody({ type: MitigateVulnerabilityDto, description: 'Mitigation action data' })
  @ApiResponse({ status: 200, description: 'Vulnerability mitigation applied successfully' })
  @ApiResponse({ status: 404, description: 'Vulnerability not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid mitigation action' })
  async mitigate(
    @Param('id') id: string,
    @Body() mitigateVulnerabilityDto: MitigateVulnerabilityDto,
  ): Promise<Vulnerability> {
    return this.vulnerabilitiesService.mitigate(id, mitigateVulnerabilityDto);
  }
}
