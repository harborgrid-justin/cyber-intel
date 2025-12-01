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
import { CampaignsService } from './campaigns.service';
import {
  CreateCampaignDto,
  UpdateCampaignDto,
  CampaignResponseDto,
  DeleteCampaignResponseDto,
  CampaignStatsDto,
} from './dto/campaign.dto';

@ApiTags('campaigns')
@Controller('api/campaigns')
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all campaigns',
    description: 'Retrieves all threat campaigns with optional filtering by status and actor',
  })
  @ApiQuery({
    name: 'status',
    required: false,
    enum: ['ACTIVE', 'DORMANT', 'ARCHIVED'],
    description: 'Filter by campaign status',
  })
  @ApiQuery({
    name: 'actor',
    required: false,
    type: String,
    description: 'Filter by associated threat actor',
  })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns retrieved successfully',
    type: [CampaignResponseDto],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  findAll(
    @Query('status') status?: string,
    @Query('actor') actor?: string,
  ): Promise<CampaignResponseDto[]> {
    return this.campaignsService.findAll({ status, actor });
  }

  @Get('stats')
  @ApiOperation({
    summary: 'Get campaign statistics',
    description: 'Retrieves statistics about campaigns including total and active counts',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign statistics retrieved successfully',
    type: CampaignStatsDto,
  })
  getStats(): Promise<CampaignStatsDto> {
    return this.campaignsService.getCampaignStats();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get campaign by ID',
    description: 'Retrieves a specific campaign by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique campaign identifier',
    example: 'campaign-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign details retrieved successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaign not found',
  })
  findOne(@Param('id') id: string): Promise<CampaignResponseDto> {
    return this.campaignsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new campaign',
    description: 'Creates a new threat campaign in the system',
  })
  @ApiBody({ type: CreateCampaignDto })
  @ApiResponse({
    status: 201,
    description: 'Campaign created successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  create(@Body() createCampaignDto: CreateCampaignDto): Promise<CampaignResponseDto> {
    return this.campaignsService.create(createCampaignDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update a campaign',
    description: 'Updates an existing campaign with new data',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique campaign identifier',
    example: 'campaign-001',
  })
  @ApiBody({ type: UpdateCampaignDto })
  @ApiResponse({
    status: 200,
    description: 'Campaign updated successfully',
    type: CampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaign not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  update(
    @Param('id') id: string,
    @Body() updateCampaignDto: UpdateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.update(id, updateCampaignDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete a campaign',
    description: 'Removes a campaign from the system',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique campaign identifier',
    example: 'campaign-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign deleted successfully',
    type: DeleteCampaignResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Campaign not found',
  })
  remove(@Param('id') id: string): Promise<DeleteCampaignResponseDto> {
    return this.campaignsService.remove(id);
  }

  @Get(':id/threats')
  @ApiOperation({
    summary: 'Get campaign threats',
    description: 'Retrieves all threats associated with a specific campaign',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique campaign identifier',
    example: 'campaign-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign threats retrieved successfully',
    type: [Object],
  })
  @ApiResponse({
    status: 404,
    description: 'Campaign not found',
  })
  getCampaignThreats(@Param('id') id: string): Promise<any[]> {
    return this.campaignsService.getCampaignThreats(id);
  }

  @Get(':id/actors')
  @ApiOperation({
    summary: 'Get campaign actors',
    description: 'Retrieves all threat actors associated with a specific campaign',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique campaign identifier',
    example: 'campaign-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Campaign actors retrieved successfully',
    type: [Object],
  })
  @ApiResponse({
    status: 404,
    description: 'Campaign not found',
  })
  getCampaignActors(@Param('id') id: string): Promise<any[]> {
    return this.campaignsService.getCampaignActors(id);
  }

  @Get('objective/:objective')
  @ApiOperation({
    summary: 'Get campaigns by objective',
    description: 'Retrieves all campaigns with a specific objective',
  })
  @ApiParam({
    name: 'objective',
    type: String,
    enum: ['ESPIONAGE', 'FINANCIAL', 'DESTRUCTION', 'INFLUENCE', 'UNKNOWN'],
    description: 'Campaign objective to filter by',
    example: 'ESPIONAGE',
  })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns by objective retrieved successfully',
    type: [CampaignResponseDto],
  })
  findByObjective(@Param('objective') objective: string): Promise<CampaignResponseDto[]> {
    return this.campaignsService.findByObjective(objective);
  }

  @Get('sector/:sector')
  @ApiOperation({
    summary: 'Get campaigns by target sector',
    description: 'Retrieves all campaigns targeting a specific sector',
  })
  @ApiParam({
    name: 'sector',
    type: String,
    description: 'Target sector to filter by',
    example: 'Healthcare',
  })
  @ApiResponse({
    status: 200,
    description: 'List of campaigns by sector retrieved successfully',
    type: [CampaignResponseDto],
  })
  findBySector(@Param('sector') sector: string): Promise<CampaignResponseDto[]> {
    return this.campaignsService.findBySector(sector);
  }
}
