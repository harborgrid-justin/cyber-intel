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
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { TeamMessagesService } from './team-messages.service';
import { TeamMessage } from '../models';
import { CreateTeamMessageDto, UpdateTeamMessageDto } from './dto';

@ApiTags('team-messages')
@Controller('team-messages')
export class TeamMessagesController {
  constructor(private readonly teamMessagesService: TeamMessagesService) {}

  @Get()
  @ApiOperation({ summary: 'Get all team messages with optional filtering' })
  @ApiQuery({
    name: 'channelId',
    required: false,
    description: 'Filter messages by channel ID',
    example: 'channel-intel-ops',
  })
  @ApiQuery({
    name: 'userId',
    required: false,
    description: 'Filter messages by user ID',
    example: 'user-analyst-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of team messages',
    type: [TeamMessage],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll(
    @Query('channelId') channelId?: string,
    @Query('userId') userId?: string,
  ): Promise<TeamMessage[]> {
    try {
      return await this.teamMessagesService.findAll({ channelId, userId });
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve team messages');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific team message by ID' })
  @ApiParam({
    name: 'id',
    description: 'Team message unique identifier',
    example: 'msg-20231201-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the team message',
    type: TeamMessage,
  })
  @ApiResponse({
    status: 404,
    description: 'Team message not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findOne(@Param('id') id: string): Promise<TeamMessage> {
    try {
      const teamMessage = await this.teamMessagesService.findOne(id);
      if (!teamMessage) {
        throw new NotFoundException('Team message not found');
      }
      return teamMessage;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve team message');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new team message' })
  @ApiBody({ type: CreateTeamMessageDto })
  @ApiResponse({
    status: 201,
    description: 'Team message created successfully',
    type: TeamMessage,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() createTeamMessageDto: CreateTeamMessageDto): Promise<TeamMessage> {
    try {
      return await this.teamMessagesService.create(createTeamMessageDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create team message');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing team message' })
  @ApiParam({
    name: 'id',
    description: 'Team message unique identifier',
    example: 'msg-20231201-001',
  })
  @ApiBody({ type: UpdateTeamMessageDto })
  @ApiResponse({
    status: 200,
    description: 'Team message updated successfully',
    type: TeamMessage,
  })
  @ApiResponse({
    status: 404,
    description: 'Team message not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id') id: string,
    @Body() updateTeamMessageDto: UpdateTeamMessageDto,
  ): Promise<TeamMessage> {
    try {
      const teamMessage = await this.teamMessagesService.update(id, updateTeamMessageDto);
      if (!teamMessage) {
        throw new NotFoundException('Team message not found');
      }
      return teamMessage;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update team message');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a team message' })
  @ApiParam({
    name: 'id',
    description: 'Team message unique identifier',
    example: 'msg-20231201-001',
  })
  @ApiResponse({
    status: 200,
    description: 'Team message deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Team message not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.teamMessagesService.remove(id);
      if (!result) {
        throw new NotFoundException('Team message not found');
      }
      return { message: 'Team message deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete team message');
    }
  }
}
