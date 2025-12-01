import { Controller, Get, Put, Param, Body, Post } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { IncidentsService } from './incidents.service';
import { Incident } from '../models/incident.model';

@ApiTags('incidents')
@Controller('api/incidents')
export class IncidentsController {
  constructor(private readonly incidentsService: IncidentsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all incidents' })
  @ApiResponse({ status: 200, description: 'List of incidents' })
  getIncidents(): Promise<Incident[]> {
    return this.incidentsService.getIncidents();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get incident by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Incident details' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  getIncident(@Param('id') id: string): Promise<Incident> {
    return this.incidentsService.getIncident(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update incident status' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Incident not found' })
  updateIncidentStatus(@Param('id') id: string, @Body() body: { status: string }): Promise<Incident> {
    return this.incidentsService.updateIncidentStatus(id, body.status);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new incident' })
  @ApiResponse({ status: 201, description: 'Incident created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  createIncident(@Body() incidentData: Partial<Incident>): Promise<Incident> {
    return this.incidentsService.createIncident(incidentData);
  }
}