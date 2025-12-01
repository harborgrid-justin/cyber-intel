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
import { SystemService } from './system.service';
import { SystemNode } from '../models';
import {
  CreateSystemNodeDto,
  UpdateSystemNodeDto,
  IsolateNodeDto,
  SystemHealthDto,
  VulnerabilitySummaryDto,
} from './dto';

@ApiTags('system')
@Controller('api/system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('nodes')
  @ApiOperation({ summary: 'Get all system nodes with optional filtering' })
  @ApiQuery({
    name: 'status',
    required: false,
    description: 'Filter by node status',
    enum: ['ONLINE', 'OFFLINE', 'DEGRADED', 'ISOLATED'],
  })
  @ApiQuery({
    name: 'segment',
    required: false,
    description: 'Filter by network segment',
    enum: ['DMZ', 'PROD', 'DEV', 'CORP'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of system nodes',
    type: [SystemNode],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll(
    @Query('status') status?: string,
    @Query('segment') segment?: string,
  ): Promise<SystemNode[]> {
    try {
      return await this.systemService.findAllNodes({ status, segment });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve system nodes');
    }
  }

  @Get('health')
  @ApiOperation({ summary: 'Get overall system health metrics' })
  @ApiResponse({
    status: 200,
    description: 'Returns system health statistics',
    type: SystemHealthDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getSystemHealth(): Promise<SystemHealthDto> {
    try {
      return await this.systemService.getSystemHealth();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve system health');
    }
  }

  @Get('vulnerabilities/summary')
  @ApiOperation({ summary: 'Get vulnerability summary across all system nodes' })
  @ApiResponse({
    status: 200,
    description: 'Returns vulnerability statistics and distribution',
    type: VulnerabilitySummaryDto,
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getVulnerabilitySummary(): Promise<VulnerabilitySummaryDto> {
    try {
      return await this.systemService.getVulnerabilitySummary();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve vulnerability summary');
    }
  }

  @Get('segments/:segment')
  @ApiOperation({ summary: 'Get all nodes in a specific network segment' })
  @ApiParam({
    name: 'segment',
    description: 'Network segment identifier',
    enum: ['DMZ', 'PROD', 'DEV', 'CORP'],
  })
  @ApiResponse({
    status: 200,
    description: 'Returns nodes in the specified segment',
    type: [SystemNode],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async getNodesBySegment(@Param('segment') segment: string): Promise<SystemNode[]> {
    try {
      return await this.systemService.getNodesBySegment(segment);
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve nodes by segment');
    }
  }

  @Get('nodes/:id')
  @ApiOperation({ summary: 'Get a specific system node by ID' })
  @ApiParam({
    name: 'id',
    description: 'System node unique identifier',
    example: 'node-prod-db-01',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the system node',
    type: SystemNode,
  })
  @ApiResponse({
    status: 404,
    description: 'System node not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findOne(@Param('id') id: string): Promise<SystemNode> {
    try {
      const node = await this.systemService.findNodeById(id);
      if (!node) {
        throw new NotFoundException('System node not found');
      }
      return node;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve system node');
    }
  }

  @Post('nodes')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new system node' })
  @ApiBody({ type: CreateSystemNodeDto })
  @ApiResponse({
    status: 201,
    description: 'System node created successfully',
    type: SystemNode,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() createNodeDto: CreateSystemNodeDto): Promise<SystemNode> {
    try {
      return await this.systemService.createNode(createNodeDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create system node');
    }
  }

  @Put('nodes/:id')
  @ApiOperation({ summary: 'Update an existing system node' })
  @ApiParam({
    name: 'id',
    description: 'System node unique identifier',
    example: 'node-prod-db-01',
  })
  @ApiBody({ type: UpdateSystemNodeDto })
  @ApiResponse({
    status: 200,
    description: 'System node updated successfully',
    type: SystemNode,
  })
  @ApiResponse({
    status: 404,
    description: 'System node not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id') id: string,
    @Body() updateNodeDto: UpdateSystemNodeDto,
  ): Promise<SystemNode> {
    try {
      const node = await this.systemService.updateNode(id, updateNodeDto);
      if (!node) {
        throw new NotFoundException('System node not found');
      }
      return node;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update system node');
    }
  }

  @Delete('nodes/:id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a system node' })
  @ApiParam({
    name: 'id',
    description: 'System node unique identifier',
    example: 'node-prod-db-01',
  })
  @ApiResponse({
    status: 200,
    description: 'System node deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'System node not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.systemService.removeNode(id);
      if (!result) {
        throw new NotFoundException('System node not found');
      }
      return { message: 'System node deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete system node');
    }
  }

  @Post('nodes/:id/isolate')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Isolate a system node from the network' })
  @ApiParam({
    name: 'id',
    description: 'System node unique identifier',
    example: 'node-prod-db-01',
  })
  @ApiBody({ type: IsolateNodeDto })
  @ApiResponse({
    status: 200,
    description: 'System node isolated successfully',
    type: SystemNode,
  })
  @ApiResponse({
    status: 404,
    description: 'System node not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async isolateNode(
    @Param('id') id: string,
    @Body() isolationData: IsolateNodeDto,
  ): Promise<SystemNode> {
    try {
      return await this.systemService.isolateNode(id, isolationData);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to isolate node');
    }
  }

  @Post('nodes/:id/restore')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Restore an isolated system node to normal operation' })
  @ApiParam({
    name: 'id',
    description: 'System node unique identifier',
    example: 'node-prod-db-01',
  })
  @ApiResponse({
    status: 200,
    description: 'System node restored successfully',
    type: SystemNode,
  })
  @ApiResponse({
    status: 404,
    description: 'System node not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async restoreNode(@Param('id') id: string): Promise<SystemNode> {
    try {
      return await this.systemService.restoreNode(id);
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to restore node');
    }
  }
}
