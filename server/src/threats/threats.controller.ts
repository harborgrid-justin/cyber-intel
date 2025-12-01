import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { ThreatsService } from './threats.service';
import {
  CreateThreatDto,
  UpdateThreatDto,
  UpdateThreatStatusDto,
  ThreatResponseDto,
  DeleteThreatResponseDto,
} from './dto/threat.dto';

@ApiTags('threats')
@Controller('api/threats')
export class ThreatsController {
  constructor(private readonly threatsService: ThreatsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all threats', description: 'Retrieves all threat indicators with optional sorting by last seen date' })
  @ApiQuery({
    name: 'sort',
    required: false,
    type: Boolean,
    description: 'Sort by last seen date (descending) when true',
    example: true,
  })
  @ApiResponse({
    status: 200,
    description: 'List of all threats retrieved successfully',
    type: [ThreatResponseDto],
  })
  findAll(@Query('sort') sort?: string): Promise<ThreatResponseDto[]> {
    return this.threatsService.findAll(sort === 'true');
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get threat by ID', description: 'Retrieves a specific threat by its unique identifier' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique threat identifier',
    example: 'threat-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Threat details retrieved successfully',
    type: ThreatResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Threat not found',
  })
  findOne(@Param('id') id: string): Promise<ThreatResponseDto> {
    return this.threatsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new threat', description: 'Creates a new threat indicator in the system' })
  @ApiBody({ type: CreateThreatDto })
  @ApiResponse({
    status: 201,
    description: 'Threat created successfully',
    type: ThreatResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  create(@Body() createThreatDto: CreateThreatDto): Promise<ThreatResponseDto> {
    return this.threatsService.create(createThreatDto);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update a threat', description: 'Updates an existing threat with new data' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique threat identifier',
    example: 'threat-001',
  })
  @ApiBody({ type: UpdateThreatDto })
  @ApiResponse({
    status: 200,
    description: 'Threat updated successfully',
    type: ThreatResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Threat not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  update(
    @Param('id') id: string,
    @Body() updateThreatDto: UpdateThreatDto,
  ): Promise<ThreatResponseDto> {
    return this.threatsService.update(id, updateThreatDto);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Delete a threat', description: 'Removes a threat from the system' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique threat identifier',
    example: 'threat-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Threat deleted successfully',
    type: DeleteThreatResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Threat not found',
  })
  remove(@Param('id') id: string): Promise<DeleteThreatResponseDto> {
    return this.threatsService.remove(id);
  }

  @Put(':id/status')
  @ApiOperation({ summary: 'Update threat status', description: 'Updates only the status field of a threat' })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique threat identifier',
    example: 'threat-001',
  })
  @ApiBody({ type: UpdateThreatStatusDto })
  @ApiResponse({
    status: 200,
    description: 'Threat status updated successfully',
    type: ThreatResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Threat not found',
  })
  updateStatus(
    @Param('id') id: string,
    @Body() updateStatusDto: UpdateThreatStatusDto,
  ): Promise<ThreatResponseDto> {
    return this.threatsService.updateStatus(id, updateStatusDto.status);
  }

  @Get('actor/:name')
  @ApiOperation({ summary: 'Get threats by actor', description: 'Retrieves all threats associated with a specific threat actor' })
  @ApiParam({
    name: 'name',
    type: String,
    description: 'Threat actor name (partial match supported)',
    example: 'APT29',
  })
  @ApiResponse({
    status: 200,
    description: 'List of threats by actor retrieved successfully',
    type: [ThreatResponseDto],
  })
  findByActor(@Param('name') name: string): Promise<ThreatResponseDto[]> {
    return this.threatsService.findByActor(name);
  }

  @Get('severity/:severity')
  @ApiOperation({ summary: 'Get threats by severity', description: 'Retrieves all threats with a specific severity level' })
  @ApiParam({
    name: 'severity',
    type: String,
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    description: 'Severity level to filter by',
    example: 'CRITICAL',
  })
  @ApiResponse({
    status: 200,
    description: 'List of threats by severity retrieved successfully',
    type: [ThreatResponseDto],
  })
  findBySeverity(@Param('severity') severity: string): Promise<ThreatResponseDto[]> {
    return this.threatsService.findBySeverity(severity);
  }

  @Get('type/:type')
  @ApiOperation({ summary: 'Get threats by type', description: 'Retrieves all threats of a specific indicator type' })
  @ApiParam({
    name: 'type',
    type: String,
    description: 'Indicator type to filter by (e.g., IP_ADDRESS, DOMAIN, HASH)',
    example: 'IP_ADDRESS',
  })
  @ApiResponse({
    status: 200,
    description: 'List of threats by type retrieved successfully',
    type: [ThreatResponseDto],
  })
  findByType(@Param('type') type: string): Promise<ThreatResponseDto[]> {
    return this.threatsService.findByType(type);
  }
}
