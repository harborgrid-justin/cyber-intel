import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery, ApiBody } from '@nestjs/swagger';
import { OsintResultsService } from './osint-results.service';
import { CreateOsintResultDto, UpdateOsintResultDto } from './dto';
import { OsintResult } from '../models';

@ApiTags('osint-results')
@Controller('osint-results')
export class OsintResultsController {
  constructor(private readonly osintResultsService: OsintResultsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all OSINT results with optional filters' })
  @ApiQuery({ name: 'source', required: false, description: 'Filter by data source', example: 'Shodan' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by result type', example: 'ip_scan' })
  @ApiQuery({ name: 'caseId', required: false, description: 'Filter by associated case ID', example: 'case-123' })
  @ApiResponse({ status: 200, description: 'Returns filtered OSINT results' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve OSINT results' })
  async findAll(
    @Query('source') source?: string,
    @Query('type') type?: string,
    @Query('caseId') caseId?: string,
  ): Promise<OsintResult[]> {
    try {
      return await this.osintResultsService.findAll({ source, type, caseId });
    } catch (error) {
      throw new HttpException('Failed to retrieve OSINT results', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get OSINT result by ID' })
  @ApiParam({ name: 'id', description: 'OSINT result ID', example: 'osint-123' })
  @ApiResponse({ status: 200, description: 'Returns the OSINT result' })
  @ApiResponse({ status: 404, description: 'OSINT result not found' })
  @ApiResponse({ status: 500, description: 'Failed to retrieve OSINT result' })
  async findOne(@Param('id') id: string): Promise<OsintResult> {
    try {
      const result = await this.osintResultsService.findOne(id);
      if (!result) {
        throw new HttpException('OSINT result not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve OSINT result', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  @ApiOperation({ summary: 'Create a new OSINT result' })
  @ApiBody({ type: CreateOsintResultDto })
  @ApiResponse({ status: 201, description: 'OSINT result created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Failed to create OSINT result' })
  async create(@Body() createOsintResultDto: CreateOsintResultDto): Promise<OsintResult> {
    try {
      return await this.osintResultsService.create(createOsintResultDto);
    } catch (error) {
      throw new HttpException('Failed to create OSINT result', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an OSINT result' })
  @ApiParam({ name: 'id', description: 'OSINT result ID', example: 'osint-123' })
  @ApiBody({ type: UpdateOsintResultDto })
  @ApiResponse({ status: 200, description: 'OSINT result updated successfully' })
  @ApiResponse({ status: 404, description: 'OSINT result not found' })
  @ApiResponse({ status: 500, description: 'Failed to update OSINT result' })
  async update(@Param('id') id: string, @Body() updateOsintResultDto: UpdateOsintResultDto): Promise<OsintResult> {
    try {
      const result = await this.osintResultsService.update(id, updateOsintResultDto);
      if (!result) {
        throw new HttpException('OSINT result not found', HttpStatus.NOT_FOUND);
      }
      return result;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update OSINT result', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an OSINT result' })
  @ApiParam({ name: 'id', description: 'OSINT result ID', example: 'osint-123' })
  @ApiResponse({ status: 200, description: 'OSINT result deleted successfully' })
  @ApiResponse({ status: 404, description: 'OSINT result not found' })
  @ApiResponse({ status: 500, description: 'Failed to delete OSINT result' })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.osintResultsService.remove(id);
      if (!result) {
        throw new HttpException('OSINT result not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'OSINT result deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete OSINT result', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
