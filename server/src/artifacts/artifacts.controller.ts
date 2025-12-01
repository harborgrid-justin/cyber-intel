import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  HttpCode,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ArtifactsService } from './artifacts.service';
import { Artifact } from '../models';
import { CreateArtifactDto, UpdateArtifactDto, ArtifactStatsDto } from './dto';

@ApiTags('artifacts')
@Controller('artifacts')
export class ArtifactsController {
  constructor(private readonly artifactsService: ArtifactsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all artifacts with optional filters' })
  @ApiQuery({ name: 'caseId', required: false, description: 'Filter by case ID' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by artifact type', enum: ['file', 'hash', 'ip', 'domain', 'url', 'email', 'other'] })
  @ApiResponse({ status: 200, description: 'Returns list of artifacts' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async findAll(
    @Query('caseId') caseId?: string,
    @Query('type') type?: string,
  ): Promise<Artifact[]> {
    try {
      return await this.artifactsService.findAll({ caseId, type });
    } catch (error) {
      throw new HttpException('Failed to retrieve artifacts', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('stats/overview')
  @ApiOperation({ summary: 'Get artifact statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns artifact statistics', type: ArtifactStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getArtifactStats(): Promise<ArtifactStatsDto> {
    try {
      return await this.artifactsService.getArtifactStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve artifact statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('case/:caseId')
  @ApiOperation({ summary: 'Get artifacts for a specific case' })
  @ApiParam({ name: 'caseId', description: 'Case ID', example: 'case-001' })
  @ApiResponse({ status: 200, description: 'Returns artifacts for the case' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getArtifactsByCase(@Param('caseId') caseId: string): Promise<Artifact[]> {
    try {
      return await this.artifactsService.getArtifactsByCase(caseId);
    } catch (error) {
      throw new HttpException('Failed to retrieve artifacts for case', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get artifacts by type' })
  @ApiParam({ name: 'type', description: 'Artifact type', example: 'file' })
  @ApiResponse({ status: 200, description: 'Returns artifacts of the specified type' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getArtifactsByType(@Param('type') type: string): Promise<Artifact[]> {
    try {
      return await this.artifactsService.getArtifactsByType(type);
    } catch (error) {
      throw new HttpException('Failed to retrieve artifacts by type', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get artifact by ID' })
  @ApiParam({ name: 'id', description: 'Artifact ID', example: 'artifact-001' })
  @ApiResponse({ status: 200, description: 'Returns the artifact' })
  @ApiResponse({ status: 404, description: 'Artifact not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new artifact' })
  @ApiBody({ type: CreateArtifactDto })
  @ApiResponse({ status: 201, description: 'Artifact created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async create(@Body() createArtifactDto: CreateArtifactDto): Promise<Artifact> {
    try {
      return await this.artifactsService.create(createArtifactDto);
    } catch (error) {
      throw new HttpException('Failed to create artifact', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing artifact' })
  @ApiParam({ name: 'id', description: 'Artifact ID', example: 'artifact-001' })
  @ApiBody({ type: UpdateArtifactDto })
  @ApiResponse({ status: 200, description: 'Artifact updated successfully' })
  @ApiResponse({ status: 404, description: 'Artifact not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async update(
    @Param('id') id: string,
    @Body() updateArtifactDto: UpdateArtifactDto,
  ): Promise<Artifact> {
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete an artifact' })
  @ApiParam({ name: 'id', description: 'Artifact ID', example: 'artifact-001' })
  @ApiResponse({ status: 200, description: 'Artifact deleted successfully' })
  @ApiResponse({ status: 404, description: 'Artifact not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
}
