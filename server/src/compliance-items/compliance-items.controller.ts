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
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ComplianceItemsService } from './compliance-items.service';
import { ComplianceItem } from '../models';
import {
  CreateComplianceItemDto,
  UpdateComplianceItemDto,
  ComplianceStatsDto,
} from './dto';

@ApiTags('compliance-items')
@Controller('compliance-items')
export class ComplianceItemsController {
  constructor(private readonly complianceItemsService: ComplianceItemsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all compliance items with optional filtering' })
  @ApiQuery({
    name: 'framework',
    required: false,
    description: 'Filter by compliance framework',
    example: 'NIST CSF',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by compliance status',
    enum: ['Compliant', 'Non-Compliant', 'Not-Applicable', 'Compensated'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of compliance items',
    type: [ComplianceItem],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll(
    @Query('framework') framework?: string,
    @Query('status') status?: string,
  ): Promise<ComplianceItem[]> {
    try {
      return await this.complianceItemsService.findAll({ framework, status });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve compliance items');
    }
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get compliance statistics overview' })
  @ApiResponse({
    status: 200,
    description: 'Returns compliance statistics',
    type: ComplianceStatsDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getComplianceStats(): Promise<ComplianceStatsDto> {
    try {
      return await this.complianceItemsService.getComplianceStats();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve compliance statistics');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific compliance item by ID' })
  @ApiParam({
    name: 'id',
    description: 'Compliance item unique identifier',
    example: 'compliance-nist-ac-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the compliance item',
    type: ComplianceItem,
  })
  @ApiResponse({
    status: 404,
    description: 'Compliance item not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findOne(@Param('id') id: string): Promise<ComplianceItem> {
    try {
      const item = await this.complianceItemsService.findOne(id);
      if (!item) {
        throw new NotFoundException('Compliance item not found');
      }
      return item;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve compliance item');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new compliance item' })
  @ApiBody({ type: CreateComplianceItemDto })
  @ApiResponse({
    status: 201,
    description: 'Compliance item created successfully',
    type: ComplianceItem,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() createComplianceItemDto: CreateComplianceItemDto): Promise<ComplianceItem> {
    try {
      return await this.complianceItemsService.create(createComplianceItemDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create compliance item');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing compliance item' })
  @ApiParam({
    name: 'id',
    description: 'Compliance item unique identifier',
    example: 'compliance-nist-ac-1',
  })
  @ApiBody({ type: UpdateComplianceItemDto })
  @ApiResponse({
    status: 200,
    description: 'Compliance item updated successfully',
    type: ComplianceItem,
  })
  @ApiResponse({
    status: 404,
    description: 'Compliance item not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id') id: string,
    @Body() updateComplianceItemDto: UpdateComplianceItemDto,
  ): Promise<ComplianceItem> {
    try {
      const item = await this.complianceItemsService.update(id, updateComplianceItemDto);
      if (!item) {
        throw new NotFoundException('Compliance item not found');
      }
      return item;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update compliance item');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a compliance item' })
  @ApiParam({
    name: 'id',
    description: 'Compliance item unique identifier',
    example: 'compliance-nist-ac-1',
  })
  @ApiResponse({
    status: 200,
    description: 'Compliance item deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Compliance item not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.complianceItemsService.remove(id);
      if (!result) {
        throw new NotFoundException('Compliance item not found');
      }
      return { message: 'Compliance item deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete compliance item');
    }
  }
}
