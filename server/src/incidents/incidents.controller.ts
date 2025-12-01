import { Controller, Get, Put, Param, Body, Post, HttpCode, HttpStatus } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiBody } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { Incident } from '../models/incident.model';
import {
  CreateIncidentDto,
  UpdateIncidentDto,
  UpdateIncidentStatusDto,
} from './dto';

@ApiTags('incidents')
@Controller('api/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all incidents' })
  @ApiResponse({ status: 200, description: 'List of incidents returned successfully' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getIncidents(): Promise<Incident[]> {
    return this.incidentsService.getIncidents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  @ApiParam({ name: 'id', description: 'Incident ID', type: String })
  @ApiResponse({ status: 200, description: 'Incident details returned successfully' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  async getIncident(@Param('id') id: string): Promise<Incident> {
    return this.incidentsService.getIncident(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new incident' })
  @ApiBody({ type: CreateIncidentDto, description: 'Incident data' })
  @ApiResponse({ status: 201, description: 'Incident created successfully' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async createIncident(@Body() createIncidentDto: CreateIncidentDto): Promise<Incident> {
    return this.incidentsService.createIncident(createIncidentDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an incident' })
  @ApiParam({ name: 'id', description: 'Incident ID', type: String })
  @ApiBody({ type: UpdateIncidentDto, description: 'Incident update data' })
  @ApiResponse({ status: 200, description: 'Incident updated successfully' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid input data' })
  async updateIncident(
    @Param('id') id: string,
    @Body() updateIncidentDto: UpdateIncidentDto,
  ): Promise<Incident> {
    return this.incidentsService.updateIncident(id, updateIncidentDto);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update incident status' })
  @ApiParam({ name: 'id', description: 'Incident ID', type: String })
  @ApiBody({ type: UpdateIncidentStatusDto, description: 'New incident status' })
  @ApiResponse({ status: 200, description: 'Incident status updated successfully' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  @ApiResponse({ status: 400, description: 'Bad request - Invalid status value' })
  async updateIncidentStatus(
    @Param('id') id: string,
    @Body() updateIncidentStatusDto: UpdateIncidentStatusDto,
  ): Promise<Incident> {
    return this.incidentsService.updateIncidentStatus(id, updateIncidentStatusDto.status);
  }
}
