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
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiBody,
} from '@nestjs/swagger';
import { ChannelsService } from './channels.service';
import { Channel } from '../models';
import { CreateChannelDto, UpdateChannelDto } from './dto';

@ApiTags('channels')
@Controller('api/channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  @ApiOperation({ summary: 'Get all communication channels' })
  @ApiResponse({
    status: 200,
    description: 'Returns a list of all channels with their messages',
    type: [Channel],
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findAll(): Promise<Channel[]> {
    try {
      return await this.channelsService.findAll();
    } catch (error) {
      throw new InternalServerErrorException('Failed to retrieve channels');
    }
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get a specific channel by ID' })
  @ApiParam({
    name: 'id',
    description: 'Channel unique identifier',
    example: 'channel-intel-ops',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns the channel with its messages',
    type: Channel,
  })
  @ApiResponse({
    status: 404,
    description: 'Channel not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async findOne(@Param('id') id: string): Promise<Channel> {
    try {
      const channel = await this.channelsService.findOne(id);
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }
      return channel;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to retrieve channel');
    }
  }

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new communication channel' })
  @ApiBody({ type: CreateChannelDto })
  @ApiResponse({
    status: 201,
    description: 'Channel created successfully',
    type: Channel,
  })
  @ApiResponse({
    status: 400,
    description: 'Invalid input data',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async create(@Body() createChannelDto: CreateChannelDto): Promise<Channel> {
    try {
      return await this.channelsService.create(createChannelDto);
    } catch (error) {
      throw new InternalServerErrorException('Failed to create channel');
    }
  }

  @Put(':id')
  @ApiOperation({ summary: 'Update an existing channel' })
  @ApiParam({
    name: 'id',
    description: 'Channel unique identifier',
    example: 'channel-intel-ops',
  })
  @ApiBody({ type: UpdateChannelDto })
  @ApiResponse({
    status: 200,
    description: 'Channel updated successfully',
    type: Channel,
  })
  @ApiResponse({
    status: 404,
    description: 'Channel not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async update(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
    try {
      const channel = await this.channelsService.update(id, updateChannelDto);
      if (!channel) {
        throw new NotFoundException('Channel not found');
      }
      return channel;
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to update channel');
    }
  }

  @Delete(':id')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a channel' })
  @ApiParam({
    name: 'id',
    description: 'Channel unique identifier',
    example: 'channel-intel-ops',
  })
  @ApiResponse({
    status: 200,
    description: 'Channel deleted successfully',
  })
  @ApiResponse({
    status: 404,
    description: 'Channel not found',
  })
  @ApiResponse({
    status: 500,
    description: 'Internal server error',
  })
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.channelsService.remove(id);
      if (!result) {
        throw new NotFoundException('Channel not found');
      }
      return { message: 'Channel deleted successfully' };
    } catch (error) {
      if (error instanceof NotFoundException) throw error;
      throw new InternalServerErrorException('Failed to delete channel');
    }
  }
}
