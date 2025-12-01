import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { SystemService } from './system.service';
import { SystemNode } from '@/types';

@Controller('system')
export class SystemController {
  constructor(private readonly systemService: SystemService) {}

  @Get('nodes')
  async findAll(@Query('status') status?: string, @Query('segment') segment?: string): Promise<SystemNode[]> {
    try {
      return await this.systemService.findAllNodes({ status, segment });
    } catch (error) {
      throw new HttpException('Failed to retrieve system nodes', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('nodes/:id')
  async findOne(@Param('id') id: string): Promise<SystemNode> {
    try {
      const node = await this.systemService.findNodeById(id);
      if (!node) {
        throw new HttpException('System node not found', HttpStatus.NOT_FOUND);
      }
      return node;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve system node', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('nodes')
  async create(@Body() createNodeDto: Omit<SystemNode, 'id'>): Promise<SystemNode> {
    try {
      return await this.systemService.createNode(createNodeDto);
    } catch (error) {
      throw new HttpException('Failed to create system node', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('nodes/:id')
  async update(@Param('id') id: string, @Body() updateNodeDto: Partial<SystemNode>): Promise<SystemNode> {
    try {
      const node = await this.systemService.updateNode(id, updateNodeDto);
      if (!node) {
        throw new HttpException('System node not found', HttpStatus.NOT_FOUND);
      }
      return node;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update system node', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('nodes/:id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.systemService.removeNode(id);
      if (!result) {
        throw new HttpException('System node not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'System node deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete system node', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('health')
  async getSystemHealth(): Promise<any> {
    try {
      return await this.systemService.getSystemHealth();
    } catch (error) {
      throw new HttpException('Failed to retrieve system health', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('segments/:segment')
  async getNodesBySegment(@Param('segment') segment: string): Promise<SystemNode[]> {
    try {
      return await this.systemService.getNodesBySegment(segment);
    } catch (error) {
      throw new HttpException('Failed to retrieve nodes by segment', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('nodes/:id/isolate')
  async isolateNode(@Param('id') id: string, @Body() isolationData: { reason: string; duration?: number }): Promise<SystemNode> {
    try {
      return await this.systemService.isolateNode(id, isolationData);
    } catch (error) {
      throw new HttpException('Failed to isolate node', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('nodes/:id/restore')
  async restoreNode(@Param('id') id: string): Promise<SystemNode> {
    try {
      return await this.systemService.restoreNode(id);
    } catch (error) {
      throw new HttpException('Failed to restore node', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('vulnerabilities/summary')
  async getVulnerabilitySummary(): Promise<any> {
    try {
      return await this.systemService.getVulnerabilitySummary();
    } catch (error) {
      throw new HttpException('Failed to retrieve vulnerability summary', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}