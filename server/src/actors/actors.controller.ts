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
import { ActorsService } from './actors.service';
import {
  CreateActorDto,
  UpdateActorDto,
  ActorResponseDto,
  DeleteActorResponseDto,
} from './dto/actor.dto';

@ApiTags('actors')
@Controller('api/actors')
export class ActorsController {
  constructor(private readonly actorsService: ActorsService) {}

  @Get()
  @ApiOperation({
    summary: 'Get all actors',
    description: 'Retrieves all threat actors with their associated campaigns',
  })
  @ApiResponse({
    status: 200,
    description: 'List of all threat actors retrieved successfully',
    type: [ActorResponseDto],
  })
  findAll(): Promise<ActorResponseDto[]> {
    return this.actorsService.findAll();
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get actor by ID',
    description: 'Retrieves a specific threat actor by its unique identifier',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique actor identifier',
    example: 'actor-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Actor details retrieved successfully',
    type: ActorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Actor not found',
  })
  findOne(@Param('id') id: string): Promise<ActorResponseDto> {
    return this.actorsService.findOne(id);
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new actor',
    description: 'Creates a new threat actor profile in the system',
  })
  @ApiBody({ type: CreateActorDto })
  @ApiResponse({
    status: 201,
    description: 'Actor created successfully',
    type: ActorResponseDto,
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  create(@Body() createActorDto: CreateActorDto): Promise<ActorResponseDto> {
    return this.actorsService.create(createActorDto);
  }

  @Put(':id')
  @ApiOperation({
    summary: 'Update an actor',
    description: 'Updates an existing threat actor with new data',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique actor identifier',
    example: 'actor-001',
  })
  @ApiBody({ type: UpdateActorDto })
  @ApiResponse({
    status: 200,
    description: 'Actor updated successfully',
    type: ActorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Actor not found',
  })
  @ApiResponse({
    status: 400,
    description: 'Bad request - Invalid input data',
  })
  update(
    @Param('id') id: string,
    @Body() updateActorDto: UpdateActorDto,
  ): Promise<ActorResponseDto> {
    return this.actorsService.update(id, updateActorDto);
  }

  @Delete(':id')
  @ApiOperation({
    summary: 'Delete an actor',
    description: 'Removes a threat actor from the system',
  })
  @ApiParam({
    name: 'id',
    type: String,
    description: 'Unique actor identifier',
    example: 'actor-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Actor deleted successfully',
    type: DeleteActorResponseDto,
  })
  @ApiResponse({
    status: 404,
    description: 'Actor not found',
  })
  remove(@Param('id') id: string): Promise<DeleteActorResponseDto> {
    return this.actorsService.remove(id);
  }

  @Get('country/:country')
  @ApiOperation({
    summary: 'Get actors by country',
    description: 'Retrieves all threat actors originating from a specific country',
  })
  @ApiParam({
    name: 'country',
    type: String,
    description: 'Country of origin',
    example: 'Russia',
  })
  @ApiResponse({
    status: 200,
    description: 'List of actors by country retrieved successfully',
    type: [ActorResponseDto],
  })
  findByCountry(@Param('country') country: string): Promise<ActorResponseDto[]> {
    return this.actorsService.findByCountry(country);
  }

  @Get('motivation/:motivation')
  @ApiOperation({
    summary: 'Get actors by motivation',
    description: 'Retrieves all threat actors with a specific motivation (searches in description)',
  })
  @ApiParam({
    name: 'motivation',
    type: String,
    description: 'Motivation keyword to search for',
    example: 'espionage',
  })
  @ApiResponse({
    status: 200,
    description: 'List of actors by motivation retrieved successfully',
    type: [ActorResponseDto],
  })
  findByMotivation(@Param('motivation') motivation: string): Promise<ActorResponseDto[]> {
    return this.actorsService.findByMotivation(motivation);
  }

  @Get('sophistication/:level')
  @ApiOperation({
    summary: 'Get actors by sophistication level',
    description: 'Retrieves all threat actors with a specific sophistication level',
  })
  @ApiParam({
    name: 'level',
    type: String,
    enum: ['Advanced', 'Intermediate', 'Novice'],
    description: 'Sophistication level',
    example: 'Advanced',
  })
  @ApiResponse({
    status: 200,
    description: 'List of actors by sophistication retrieved successfully',
    type: [ActorResponseDto],
  })
  findBySophistication(@Param('level') level: string): Promise<ActorResponseDto[]> {
    return this.actorsService.findBySophistication(level);
  }
}
