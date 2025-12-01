import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { ArtifactsService } from './artifacts.service';
import { Artifact } from '../models';

@Controller('artifacts')
export class ArtifactsController {
  constructor(private readonly artifactsService: ArtifactsService) {}

  @Get()
  async findAll(
    @Query('caseId') caseId?: string,
    @Query('type') type?: string
  ): Promise<Artifact[]> {
    try {
      return await this.artifactsService.findAll({ caseId, type });
    } catch (error) {
      throw new HttpException('Failed to retrieve artifacts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Artifact> {
    try {
      const artifact = await this.artifactsService.findOne(id);
      if (!artifact) {
        throw new HttpException('Artifact not found', HttpStatus.NOT_FOUND);
      }
      return artifact;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve artifact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createArtifactDto: Omit<Artifact, 'id' | 'createdAt' | 'updatedAt'>): Promise<Artifact> {
    try {
      return await this.artifactsService.create(createArtifactDto);
    } catch (error) {
      throw new HttpException('Failed to create artifact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateArtifactDto: Partial<Artifact>): Promise<Artifact> {
    try {
      const artifact = await this.artifactsService.update(id, updateArtifactDto);
      if (!artifact) {
        throw new HttpException('Artifact not found', HttpStatus.NOT_FOUND);
      }
      return artifact;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update artifact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.artifactsService.remove(id);
      if (!result) {
        throw new HttpException('Artifact not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Artifact deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete artifact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('case/:caseId')
  async getArtifactsByCase(@Param('caseId') caseId: string): Promise<Artifact[]> {
    try {
      return await this.artifactsService.getArtifactsByCase(caseId);
    } catch (error) {
      throw new HttpException('Failed to retrieve artifacts for case', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('type/:type')
  async getArtifactsByType(@Param('type') type: string): Promise<Artifact[]> {
    try {
      return await this.artifactsService.getArtifactsByType(type);
    } catch (error) {
      throw new HttpException('Failed to retrieve artifacts by type', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  async getArtifactStats(): Promise<any> {
    try {
      return await this.artifactsService.getArtifactStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve artifact statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}