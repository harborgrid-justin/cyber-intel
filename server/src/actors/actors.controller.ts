import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ActorsService } from './actors.service';
import { Actor } from '../models/actor.model';

@ApiTags('actors')
@Controller('api/actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all actors' })
  @ApiResponse({ status: 200, description: 'List of actors' })
  findAll(): Promise<Actor[]> {
    return this.actorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get actor by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Actor details' })
  @ApiResponse({ status: 404, description: 'Actor not found' })
  findOne(@Param('id') id: string): Promise<Actor> {
    return this.actorsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new actor' })
  @ApiResponse({ status: 201, description: 'Actor created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() actorData: Partial<Actor>): Promise<Actor> {
    return this.actorsService.create(actorData);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an actor' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Actor updated' })
  @ApiResponse({ status: 404, description: 'Actor not found' })
  update(@Param('id') id: string, @Body() actorData: Partial<Actor>): Promise<Actor> {
    return this.actorsService.update(id, actorData);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete an actor' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Actor deleted' })
  @ApiResponse({ status: 404, description: 'Actor not found' })
  remove(@Param('id') id: string): Promise<{ deleted: boolean }> {
    return this.actorsService.remove(id);
  }

  @Get('country/:country')
  @ApiOperation({ summary: 'Get actors by country' })
  @ApiParam({ name: 'country', type: String })
  @ApiResponse({ status: 200, description: 'List of actors by country' })
  findByCountry(@Param('country') country: string): Promise<Actor[]> {
    return this.actorsService.findByCountry(country);
  }

  @Get('motivation/:motivation')
  @ApiOperation({ summary: 'Get actors by motivation' })
  @ApiParam({ name: 'motivation', type: String })
  @ApiResponse({ status: 200, description: 'List of actors by motivation' })
  findByMotivation(@Param('motivation') motivation: string): Promise<Actor[]> {
    return this.actorsService.findByMotivation(motivation);
  }
}
