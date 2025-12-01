import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { VulnerabilitiesService } from './vulnerabilities.service';
import { Vulnerability } from '@/types';

@Controller('vulnerabilities')
export class VulnerabilitiesController {
  constructor(private readonly vulnerabilitiesService: VulnerabilitiesService) {}

  @Get()
  async findAll(@Query('status') status?: string, @Query('severity') severity?: string): Promise<Vulnerability[]> {
    try {
      return await this.vulnerabilitiesService.findAll({ status, severity });
    } catch (error) {
      throw new HttpException('Failed to retrieve vulnerabilities', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Vulnerability> {
    try {
      const vulnerability = await this.vulnerabilitiesService.findOne(id);
      if (!vulnerability) {
        throw new HttpException('Vulnerability not found', HttpStatus.NOT_FOUND);
      }
      return vulnerability;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve vulnerability', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createVulnerabilityDto: Omit<Vulnerability, 'id'>): Promise<Vulnerability> {
    try {
      return await this.vulnerabilitiesService.create(createVulnerabilityDto);
    } catch (error) {
      throw new HttpException('Failed to create vulnerability', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateVulnerabilityDto: Partial<Vulnerability>): Promise<Vulnerability> {
    try {
      const vulnerability = await this.vulnerabilitiesService.update(id, updateVulnerabilityDto);
      if (!vulnerability) {
        throw new HttpException('Vulnerability not found', HttpStatus.NOT_FOUND);
      }
      return vulnerability;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update vulnerability', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.vulnerabilitiesService.remove(id);
      if (!result) {
        throw new HttpException('Vulnerability not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Vulnerability deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete vulnerability', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/affected-assets')
  async getAffectedAssets(@Param('id') id: string): Promise<string[]> {
    try {
      return await this.vulnerabilitiesService.getAffectedAssets(id);
    } catch (error) {
      throw new HttpException('Failed to retrieve affected assets', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post(':id/mitigate')
  async mitigate(@Param('id') id: string, @Body() mitigationData: { action: string; notes?: string }): Promise<Vulnerability> {
    try {
      return await this.vulnerabilitiesService.mitigate(id, mitigationData);
    } catch (error) {
      throw new HttpException('Failed to mitigate vulnerability', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  async getStats(): Promise<any> {
    try {
      return await this.vulnerabilitiesService.getVulnerabilityStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve vulnerability statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}