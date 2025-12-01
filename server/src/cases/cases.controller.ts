import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { CasesService } from './cases.service';
import {
  CreateCaseDto,
  UpdateCaseDto,
  CaseResponseDto,
  DeleteCaseResponseDto,
} from './dto/case.dto';

@ApiTags('cases')
@Controller('api/cases')
export class CasesController {
  constructor(private readonly casesService: CasesService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all cases',
    description: 'Retrieves all investigation cases with related threats and evidence',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all cases retrieved successfully',
    type: [CaseResponseDto],
  })
  findAll(): Promise<CaseResponseDto[]> {
    return this.casesService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get case by ID',
    description: 'Retrieves a specific case by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique case identifier',
    example: 'case-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Case details retrieved successfully',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Case not found',
  })
  findOne(@Param('id') id: string): Promise<CaseResponseDto> {
    return this.casesService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new case',
    description: 'Creates a new investigation case in the system',
  })
  @ApiBody({ type: CreateCaseDto })
  @ApiResponse({
    status: 201,
    description: 'Case created successfully',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  create(@Body() createCaseDto: CreateCaseDto): Promise<CaseResponseDto> {
    return this.casesService.create(createCaseDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a case',
    description: 'Updates an existing case with new data',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique case identifier',
    example: 'case-001',
  })
  @ApiBody({ type: UpdateCaseDto })
  @ApiResponse({
    status: 200,
    description: 'Case updated successfully',
    type: CaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Case not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  update(
    @Param('id') id: string,
    @Body() updateCaseDto: UpdateCaseDto,
  ): Promise<CaseResponseDto> {
    return this.casesService.update(id, updateCaseDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a case',
    description: 'Removes a case from the system',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique case identifier',
    example: 'case-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Case deleted successfully',
    type: DeleteCaseResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Case not found',
  })
  remove(@Param('id') id: string): Promise<DeleteCaseResponseDto> {
    return this.casesService.remove(id);
  }

  @Get('status/:status')
  @ApiOperation({
    summary: 'Get cases by status',
    description: 'Retrieves all cases with a specific status',
  })
  @ApiParam({
    name: 'status',
    type: String,
    enum: ['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'],
    description: 'Case status to filter by',
    example: 'OPEN',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cases by status retrieved successfully',
    type: [CaseResponseDto],
  })
  findByStatus(@Param('status') status: string): Promise<CaseResponseDto[]> {
    return this.casesService.findByStatus(status);
  }

  @Get('priority/:priority')
  @ApiOperation({
    summary: 'Get cases by priority',
    description: 'Retrieves all cases with a specific priority level',
  })
  @ApiParam({
    name: 'priority',
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    description: 'Priority level to filter by',
    example: 'CRITICAL',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cases by priority retrieved successfully',
    type: [CaseResponseDto],
  })
  findByPriority(@Param('priority') priority: string): Promise<CaseResponseDto[]> {
    return this.casesService.findByPriority(priority);
  }

  @Get('assigned/:assignedTo')
  @ApiOperation({
    summary: 'Get cases by assigned user',
    description: 'Retrieves all cases assigned to a specific user (partial match supported)',
  })
  @ApiParam({
    name: 'assignedTo',
    type: String,
    description: 'Assignee name or email (partial match)',
    example: 'john.doe',
  })
  @ApiResponse({
    status: 200,
    description: 'List of cases by assignee retrieved successfully',
    type: [CaseResponseDto],
  })
  findByAssignedTo(@Param('assignedTo') assignedTo: string): Promise<CaseResponseDto[]> {
    return this.casesService.findByAssignedTo(assignedTo);
  }
}
