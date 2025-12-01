import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  HttpException,
  HttpStatus,
  HttpCode,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { MessagingService } from './messaging.service';
import { Channel, TeamMessage } from '@/types';
import {
  CreateChannelDto,
  UpdateChannelDto,
  CreateMessageDto,
  UpdateMessageDto,
  JoinChannelDto,
  LeaveChannelDto,
  CreateDMDto,
  MessagingStatsDto,
  ChannelActivityDto,
} from './dto';

@ApiTags('messaging')
@Controller('messaging')
export class MessagingController {
  constructor(private readonly messagingService: MessagingService) {}

  // Channel endpoints
  @Get('channels')
  @ApiOperation({ summary: 'Get all channels with optional type filter' })
  @ApiQuery({ name: 'type', required: false, description: 'Filter by channel type', enum: ['PUBLIC', 'PRIVATE', 'DM', 'WAR_ROOM'] })
  @ApiResponse({ status: 200, description: 'Returns list of channels' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getChannels(@Query('type') type?: string): Promise<Channel[]> {
    try {
      return await this.messagingService.getChannels(type);
    } catch (error) {
      throw new HttpException('Failed to retrieve channels', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('channels/:id')
  @ApiOperation({ summary: 'Get channel by ID' })
  @ApiParam({ name: 'id', description: 'Channel ID', example: 'channel-001' })
  @ApiResponse({ status: 200, description: 'Returns the channel' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a new channel' })
  @ApiBody({ type: CreateChannelDto })
  @ApiResponse({ status: 201, description: 'Channel created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createChannel(@Body() createChannelDto: CreateChannelDto): Promise<Channel> {
    try {
      return await this.messagingService.createChannel(createChannelDto);
    } catch (error) {
      throw new HttpException('Failed to create channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('channels/:id')
  @ApiOperation({ summary: 'Update an existing channel' })
  @ApiParam({ name: 'id', description: 'Channel ID', example: 'channel-001' })
  @ApiBody({ type: UpdateChannelDto })
  @ApiResponse({ status: 200, description: 'Channel updated successfully' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateChannel(
    @Param('id') id: string,
    @Body() updateChannelDto: UpdateChannelDto,
  ): Promise<Channel> {
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a channel' })
  @ApiParam({ name: 'id', description: 'Channel ID', example: 'channel-001' })
  @ApiResponse({ status: 200, description: 'Channel deleted successfully' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @ApiOperation({ summary: 'Join a channel' })
  @ApiParam({ name: 'id', description: 'Channel ID', example: 'channel-001' })
  @ApiBody({ type: JoinChannelDto })
  @ApiResponse({ status: 200, description: 'User joined channel successfully' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async joinChannel(
    @Param('id') id: string,
    @Body() joinData: JoinChannelDto,
  ): Promise<Channel> {
    try {
      return await this.messagingService.joinChannel(id, joinData.userId);
    } catch (error) {
      throw new HttpException('Failed to join channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('channels/:id/leave')
  @ApiOperation({ summary: 'Leave a channel' })
  @ApiParam({ name: 'id', description: 'Channel ID', example: 'channel-001' })
  @ApiBody({ type: LeaveChannelDto })
  @ApiResponse({ status: 200, description: 'User left channel successfully' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async leaveChannel(
    @Param('id') id: string,
    @Body() leaveData: LeaveChannelDto,
  ): Promise<Channel> {
    try {
      return await this.messagingService.leaveChannel(id, leaveData.userId);
    } catch (error) {
      throw new HttpException('Failed to leave channel', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('channels/:id/activity')
  @ApiOperation({ summary: 'Get channel activity statistics' })
  @ApiParam({ name: 'id', description: 'Channel ID', example: 'channel-001' })
  @ApiQuery({ name: 'days', required: false, description: 'Number of days to analyze', example: 7 })
  @ApiResponse({ status: 200, description: 'Returns channel activity', type: ChannelActivityDto })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getChannelActivity(
    @Param('id') id: string,
    @Query('days') days?: number,
  ): Promise<ChannelActivityDto> {
    try {
      return await this.messagingService.getChannelActivity(id, days);
    } catch (error) {
      throw new HttpException('Failed to retrieve channel activity', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Message endpoints
  @Get('channels/:channelId/messages')
  @ApiOperation({ summary: 'Get messages for a channel' })
  @ApiParam({ name: 'channelId', description: 'Channel ID', example: 'channel-001' })
  @ApiQuery({ name: 'limit', required: false, description: 'Maximum number of messages to return', example: 50 })
  @ApiQuery({ name: 'before', required: false, description: 'Get messages before this timestamp (ISO format)' })
  @ApiResponse({ status: 200, description: 'Returns list of messages' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getChannelMessages(
    @Param('channelId') channelId: string,
    @Query('limit') limit?: number,
    @Query('before') before?: string,
  ): Promise<TeamMessage[]> {
    try {
      return await this.messagingService.getChannelMessages(channelId, { limit, before });
    } catch (error) {
      throw new HttpException('Failed to retrieve messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('channels/:channelId/messages')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Send a message to a channel' })
  @ApiParam({ name: 'channelId', description: 'Channel ID', example: 'channel-001' })
  @ApiBody({ type: CreateMessageDto })
  @ApiResponse({ status: 201, description: 'Message sent successfully' })
  @ApiResponse({ status: 400, description: 'Invalid request data' })
  @ApiResponse({ status: 404, description: 'Channel not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async sendMessage(
    @Param('channelId') channelId: string,
    @Body() messageData: CreateMessageDto,
  ): Promise<TeamMessage> {
    try {
      return await this.messagingService.sendMessage(channelId, messageData);
    } catch (error) {
      throw new HttpException('Failed to send message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Put('messages/:id')
  @ApiOperation({ summary: 'Update a message' })
  @ApiParam({ name: 'id', description: 'Message ID', example: 'msg-001' })
  @ApiBody({ type: UpdateMessageDto })
  @ApiResponse({ status: 200, description: 'Message updated successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async updateMessage(
    @Param('id') id: string,
    @Body() updateData: UpdateMessageDto,
  ): Promise<TeamMessage> {
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
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Delete a message' })
  @ApiParam({ name: 'id', description: 'Message ID', example: 'msg-001' })
  @ApiResponse({ status: 200, description: 'Message deleted successfully' })
  @ApiResponse({ status: 404, description: 'Message not found' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
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
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: 'Create a direct message channel between two users' })
  @ApiBody({ type: CreateDMDto })
  @ApiResponse({ status: 201, description: 'Direct message channel created' })
  @ApiResponse({ status: 200, description: 'Existing direct message channel returned' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async createDM(@Body() dmData: CreateDMDto): Promise<Channel> {
    try {
      return await this.messagingService.createDM(dmData.userId1, dmData.userId2);
    } catch (error) {
      throw new HttpException('Failed to create direct message', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('dm/:userId')
  @ApiOperation({ summary: 'Get all direct message channels for a user' })
  @ApiParam({ name: 'userId', description: 'User ID', example: 'user-001' })
  @ApiResponse({ status: 200, description: 'Returns list of DM channels' })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getUserDMs(@Param('userId') userId: string): Promise<Channel[]> {
    try {
      return await this.messagingService.getUserDMs(userId);
    } catch (error) {
      throw new HttpException('Failed to retrieve direct messages', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // Analytics
  @Get('stats/overview')
  @ApiOperation({ summary: 'Get messaging statistics overview' })
  @ApiResponse({ status: 200, description: 'Returns messaging statistics', type: MessagingStatsDto })
  @ApiResponse({ status: 500, description: 'Internal server error' })
  async getMessagingStats(): Promise<MessagingStatsDto> {
    try {
      return await this.messagingService.getMessagingStats();
    } catch (error) {
      throw new HttpException('Failed to retrieve messaging statistics', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
