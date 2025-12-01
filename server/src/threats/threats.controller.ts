import { Controller, Get, Post, Put, Delete, Body, Param, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam, ApiQuery } from '@nestjs/swagger';
import { ThreatsService } from './threats.service';
import { CreateThreatDto, UpdateThreatDto } from './dto/threat.dto';

@ApiTags('threats')
@Controller('api/threats')
export class ThreatsController {
  constructor(private readonly threatsService: ThreatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all threats' })
  @ApiQuery({ name: 'sort', required: false, type: Boolean })
  @ApiResponse({ status: 200, description: 'List of threats' })
  findAll(@Query('sort') sort?: string) {
    return this.threatsService.findAll(sort === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get threat by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Threat details' })
  @ApiResponse({ status: 404, description: 'Threat not found' })
  findOne(@Param('id') id: string) {
    return this.threatsService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new threat' })
  @ApiResponse({ status: 201, description: 'Threat created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createThreatDto: CreateThreatDto) {
    return this.threatsService.create(createThreatDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a threat' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Threat updated' })
  @ApiResponse({ status: 404, description: 'Threat not found' })
  update(@Param('id') id: string, @Body() updateThreatDto: UpdateThreatDto) {
    return this.threatsService.update(id, updateThreatDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a threat' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Threat deleted' })
  @ApiResponse({ status: 404, description: 'Threat not found' })
  remove(@Param('id') id: string) {
    return this.threatsService.remove(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update threat status' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Status updated' })
  @ApiResponse({ status: 404, description: 'Threat not found' })
  updateStatus(@Param('id') id: string, @Body('status') status: string) {
    return this.threatsService.updateStatus(id, status);
  }

  @Get('actor/:name')
  @ApiOperation({ summary: 'Get threats by actor' })
  @ApiParam({ name: 'name', type: String })
  @ApiResponse({ status: 200, description: 'List of threats by actor' })
  findByActor(@Param('name') name: string) {
    return this.threatsService.findByActor(name);
  }
}
