import { Controller, Get, Post, Put, Delete, Body, Param, Query, HttpException, HttpStatus } from '@nestjs/common';
import { MessagingService } from './messaging.service';
import { Channel, TeamMessage } from '@/types';

@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // Channel endpoints
  @Get('channels')
  async getChannels(@Query('type') type?: string): Promise<Channel[]> {
    try {
      return await this.messagingService.getChannels(type);
    } catch (error) {
      throw new HttpException('Failed to retrieve channels', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('channels/:id')
  async getChannel(@Param('id') id: string): Promise<Channel> {
    try {
      const channel = await this.messagingService.getChannel(id);
      if (!channel) {
        throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
      }
      return channel;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to retrieve channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('channels')
  async createChannel(@Body() createChannelDto: Omit<Channel, 'id'>): Promise<Channel> {
    try {
      return await this.messagingService.createChannel(createChannelDto);
    } catch (error) {
      throw new HttpException('Failed to create channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('channels/:id')
  async updateChannel(@Param('id') id: string, @Body() updateChannelDto: Partial<Channel>): Promise<Channel> {
    try {
      const channel = await this.messagingService.updateChannel(id, updateChannelDto);
      if (!channel) {
        throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
      }
      return channel;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('channels/:id')
  async deleteChannel(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.messagingService.deleteChannel(id);
      if (!result) {
        throw new HttpException('Channel not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Channel deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('channels/:id/join')
  async joinChannel(@Param('id') id: string, @Body() joinData: { userId: string }): Promise<Channel> {
    try {
      return await this.messagingService.joinChannel(id, joinData.userId);
    } catch (error) {
      throw new HttpException('Failed to join channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('channels/:id/leave')
  async leaveChannel(@Param('id') id: string, @Body() leaveData: { userId: string }): Promise<Channel> {
    try {
      return await this.messagingService.leaveChannel(id, leaveData.userId);
    } catch (error) {
      throw new HttpException('Failed to leave channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Message endpoints
  @Get('channels/:channelId/messages')
  async getChannelMessages(
    @Param('channelId') channelId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string
  ): Promise<TeamMessage[]> {
    try {
      return await this.messagingService.getChannelMessages(channelId, { limit, before });
    } catch (error) {
      throw new HttpException('Failed to retrieve messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('channels/:channelId/messages')
  async sendMessage(
    @Param('channelId') channelId: string,
    @Body() messageData: Omit<TeamMessage, 'id' | 'timestamp'>
  ): Promise<TeamMessage> {
    try {
      return await this.messagingService.sendMessage(channelId, messageData);
    } catch (error) {
      throw new HttpException('Failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('messages/:id')
  async updateMessage(@Param('id') id: string, @Body() updateData: { content: string }): Promise<TeamMessage> {
    try {
      const message = await this.messagingService.updateMessage(id, updateData.content);
      if (!message) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return message;
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to update message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete('messages/:id')
  async deleteMessage(@Param('id') id: string): Promise<{ message: string }> {
    try {
      const result = await this.messagingService.deleteMessage(id);
      if (!result) {
        throw new HttpException('Message not found', HttpStatus.NOT_FOUND);
      }
      return { message: 'Message deleted successfully' };
    } catch (error) {
      if (error instanceof HttpException) throw error;
      throw new HttpException('Failed to delete message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Direct messaging
  @Post('dm')
  async createDM(@Body() dmData: { userId1: string; userId2: string }): Promise<Channel> {
    try {
      return await this.messagingService.createDM(dmData.userId1, dmData.userId2);
    } catch (error) {
      throw new HttpException('Failed to create direct message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('dm/:userId')
  async getUserDMs(@Param('userId') userId: string): Promise<Channel[]> {
    try {
      return await this.messagingService.getUserDMs(userId);
    } catch (error) {
      throw new HttpException('Failed to retrieve direct messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  @Get('stats/overview')
  async getMessagingStats(): Promise<any> {
    try {
      return await this.messagingService.getMessagingStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve messaging statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('channels/:id/activity')
  async getChannelActivity(@Param('id') id: string, @Query('days') days?: number): Promise<any> {
    try {
      return await this.messagingService.getChannelActivity(id, days);
    } catch (error) {
      throw new HttpException('Failed to retrieve channel activity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}