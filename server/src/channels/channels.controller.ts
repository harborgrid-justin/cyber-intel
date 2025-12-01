import { Controller, Get, Post, Put, Delete, Body, Param, HttpException, HttpStatus } from '@nestjs/common';
import { ChannelsService } from './channels.service';
import { Channel } from '../models';

@Controller('channels')
export class ChannelsController {
  constructor(private readonly channelsService: ChannelsService) {}

  @Get()
  async findAll(): Promise<Channel[]> {
    try {
      return await this.channelsService.findAll();
    } catch (error) {
      throw new HttpException('Failed to retrieve channels', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string): Promise<Channel> {
    try {
      const channel = await this.channelsService.findOne(id);
      if (!channel) {
        throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
      }
      return channel;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post()
  async create(@Body() createChannelDto: Omit<Channel, 'id' | 'createdAt' | 'updatedAt'>): Promise<Channel> {
    try {
      return await this.channelsService.create(createChannelDto);
    } catch (error) {
      throw new HttpException('Failed to create channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put(':id')
  async update(@Param('id') id: string, @Body() updateChannelDto: Partial<Channel>): Promise<Channel> {
    try {
      const channel = await this.channelsService.update(id, updateChannelDto);
      if (!channel) {
        throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
      }
      return channel;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.channelsService.remove(id);
      if (!result) {
        throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Channel deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}