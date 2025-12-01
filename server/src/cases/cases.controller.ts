import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { CasesService } from './cases.service';
import { CreateCaseDto, UpdateCaseDto } from './dto/case.dto';

@ApiTags('cases')
@Controller('api/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all cases' })
  @ApiResponse({ status: 200, description: 'List of cases' })
  findAll() {
    return this.casesService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get case by ID' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Case details' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  findOne(@Param('id') id: string) {
    return this.casesService.findOne(id);
  }

  @Post()
  @ApiOperation({ summary: 'Create a new case' })
  @ApiResponse({ status: 201, description: 'Case created' })
  @ApiResponse({ status: 400, description: 'Bad request' })
  create(@Body() createCaseDto: CreateCaseDto) {
    return this.casesService.create(createCaseDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a case' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Case updated' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  update(@Param('id') id: string, @Body() updateCaseDto: UpdateCaseDto) {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a case' })
  @ApiParam({ name: 'id', type: String })
  @ApiResponse({ status: 200, description: 'Case deleted' })
  @ApiResponse({ status: 404, description: 'Case not found' })
  remove(@Param('id') id: string) {
    return this.casesService.remove(id);
  }

  @Get('status/:status')
  @ApiOperation({ summary: 'Get cases by status' })
  @ApiParam({ name: 'status', type: String })
  @ApiResponse({ status: 200, description: 'List of cases by status' })
  findByStatus(@Param('status') status: string) {
    return this.casesService.findByStatus(status);
  }

  @Get('priority/:priority')
  @ApiOperation({ summary: 'Get cases by priority' })
  @ApiParam({ name: 'priority', type: String })
  @ApiResponse({ status: 200, description: 'List of cases by priority' })
  findByPriority(@Param('priority') priority: string) {
    return this.casesService.findByPriority(priority);
  }

  @Get('assigned/:assignedTo')
  @ApiOperation({ summary: 'Get cases by assigned user' })
  @ApiParam({ name: 'assignedTo', type: String })
  @ApiResponse({ status: 200, description: 'List of cases by assigned user' })
  findByAssignedTo(@Param('assignedTo') assignedTo: string) {
    return this.casesService.findByAssignedTo(assignedTo);
  }
}
