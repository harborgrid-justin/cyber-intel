import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Channel, TeamMessage } from '@/types';
import {
  CreateChannelDto,
  UpdateChannelDto,
  CreateMessageDto,
  MessagingStatsDto,
  ChannelActivityDto,
} from './dto';

@Injectable()
export class MessagingService {
  private channels: Channel[] = [
    {
      id: 'channel-001',
      name: 'general',
      type: 'PUBLIC',
      members: ['user-001', 'user-002', 'user-003', 'user-004'],
      topic: 'General discussion and announcements',
    },
    {
      id: 'channel-002',
      name: 'threat-intel',
      type: 'PUBLIC',
      members: ['user-001', 'user-002', 'user-003'],
      topic: 'Threat intelligence sharing and analysis',
    },
    {
      id: 'channel-003',
      name: 'incident-response',
      type: 'PRIVATE',
      members: ['user-001', 'user-003'],
      topic: 'Active incident response coordination',
    },
    {
      id: 'channel-004',
      name: 'war-room',
      type: 'WAR_ROOM',
      members: ['user-001', 'user-002', 'user-003'],
      topic: 'Active cyber attack response',
    },
  ];

  private messages: TeamMessage[] = [
    {
      id: 'msg-001',
      channelId: 'channel-001',
      userId: 'user-001',
      content: 'Good morning team! Any new threats to report?',
      timestamp: '2024-12-01T08:30:00Z',
      type: 'TEXT',
    },
    {
      id: 'msg-002',
      channelId: 'channel-001',
      userId: 'user-002',
      content: 'Morning! We have a new phishing campaign targeting our sector.',
      timestamp: '2024-12-01T08:32:00Z',
      type: 'TEXT',
    },
    {
      id: 'msg-003',
      channelId: 'channel-002',
      userId: 'user-003',
      content: 'ALERT: New zero-day vulnerability detected in our perimeter systems',
      timestamp: '2024-12-01T09:15:00Z',
      type: 'ALERT',
    },
    {
      id: 'msg-004',
      channelId: 'channel-003',
      userId: 'user-001',
      content: 'Incident response team assembled. Starting containment procedures.',
      timestamp: '2024-12-01T09:20:00Z',
      type: 'SYSTEM',
    },
  ];

  async getChannels(type?: string): Promise<Channel[]> {
    let result = [...this.channels];

    if (type) {
      result = result.filter((channel) => channel.type === type);
    }

    return result.sort((a, b) => a.name.localeCompare(b.name));
  }

  async getChannel(id: string): Promise<Channel | null> {
    return this.channels.find((channel) => channel.id === id) || null;
  }

  async createChannel(createChannelDto: CreateChannelDto): Promise<Channel> {
    const newChannel: Channel = {
      id: `channel-${Date.now()}`,
      name: createChannelDto.name,
      type: createChannelDto.type,
      members: createChannelDto.members || [],
      topic: createChannelDto.topic,
    };

    this.channels.push(newChannel);
    return newChannel;
  }

  async updateChannel(
    id: string,
    updateChannelDto: UpdateChannelDto,
  ): Promise<Channel | null> {
    const index = this.channels.findIndex((channel) => channel.id === id);
    if (index === -1) {
      return null;
    }

    this.channels[index] = { ...this.channels[index], ...updateChannelDto };
    return this.channels[index];
  }

  async deleteChannel(id: string): Promise<boolean> {
    const index = this.channels.findIndex((channel) => channel.id === id);
    if (index === -1) {
      return false;
    }

    this.channels.splice(index, 1);
    // Also delete associated messages
    this.messages = this.messages.filter((msg) => msg.channelId !== id);
    return true;
  }

  async joinChannel(id: string, userId: string): Promise<Channel> {
    const channel = await this.getChannel(id);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    if (!channel.members.includes(userId)) {
      channel.members.push(userId);
    }

    return channel;
  }

  async leaveChannel(id: string, userId: string): Promise<Channel> {
    const channel = await this.getChannel(id);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${id} not found`);
    }

    channel.members = channel.members.filter((member) => member !== userId);
    return channel;
  }

  async getChannelMessages(
    channelId: string,
    options?: { limit?: number; before?: string },
  ): Promise<TeamMessage[]> {
    const channel = await this.getChannel(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }

    let result = this.messages
      .filter((msg) => msg.channelId === channelId)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );

    if (options?.before) {
      const beforeDate = new Date(options.before);
      result = result.filter((msg) => new Date(msg.timestamp) < beforeDate);
    }

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result.reverse(); // Return in chronological order
  }

  async sendMessage(
    channelId: string,
    messageData: CreateMessageDto,
  ): Promise<TeamMessage> {
    const channel = await this.getChannel(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }

    // Check if user is a member of the channel
    if (!channel.members.includes(messageData.userId)) {
      throw new BadRequestException('User is not a member of this channel');
    }

    const newMessage: TeamMessage = {
      id: `msg-${Date.now()}`,
      channelId,
      userId: messageData.userId,
      content: messageData.content,
      type: messageData.type,
      timestamp: new Date().toISOString(),
    };

    this.messages.push(newMessage);
    return newMessage;
  }

  async updateMessage(id: string, content: string): Promise<TeamMessage | null> {
    const index = this.messages.findIndex((msg) => msg.id === id);
    if (index === -1) {
      return null;
    }

    this.messages[index].content = content;
    return this.messages[index];
  }

  async deleteMessage(id: string): Promise<boolean> {
    const index = this.messages.findIndex((msg) => msg.id === id);
    if (index === -1) {
      return false;
    }

    this.messages.splice(index, 1);
    return true;
  }

  async createDM(userId1: string, userId2: string): Promise<Channel> {
    // Check if DM already exists
    const existingDM = this.channels.find(
      (channel) =>
        channel.type === 'DM' &&
        channel.members.includes(userId1) &&
        channel.members.includes(userId2) &&
        channel.members.length === 2,
    );

    if (existingDM) {
      return existingDM;
    }

    const newDM: Channel = {
      id: `dm-${Date.now()}`,
      name: `DM-${userId1}-${userId2}`,
      type: 'DM',
      members: [userId1, userId2],
      topic: 'Direct message',
    };

    this.channels.push(newDM);
    return newDM;
  }

  async getUserDMs(userId: string): Promise<Channel[]> {
    return this.channels.filter(
      (channel) => channel.type === 'DM' && channel.members.includes(userId),
    );
  }

  async getMessagingStats(): Promise<MessagingStatsDto> {
    const totalChannels = this.channels.length;
    const publicChannels = this.channels.filter((c) => c.type === 'PUBLIC').length;
    const privateChannels = this.channels.filter((c) => c.type === 'PRIVATE').length;
    const warRooms = this.channels.filter((c) => c.type === 'WAR_ROOM').length;
    const dms = this.channels.filter((c) => c.type === 'DM').length;

    const totalMessages = this.messages.length;
    const alertMessages = this.messages.filter((m) => m.type === 'ALERT').length;
    const systemMessages = this.messages.filter((m) => m.type === 'SYSTEM').length;

    const channelTypes = this.channels.reduce(
      (acc, channel) => {
        acc[channel.type] = (acc[channel.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const messageTypes = this.messages.reduce(
      (acc, message) => {
        acc[message.type] = (acc[message.type] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const avgMembersPerChannel =
      this.channels.reduce((sum, channel) => sum + channel.members.length, 0) /
      totalChannels;

    return {
      channels: {
        total: totalChannels,
        public: publicChannels,
        private: privateChannels,
        warRooms,
        dms,
        avgMembersPerChannel: Math.round(avgMembersPerChannel * 10) / 10,
      },
      messages: {
        total: totalMessages,
        alerts: alertMessages,
        system: systemMessages,
        text: totalMessages - alertMessages - systemMessages,
      },
      channelTypes,
      messageTypes,
    };
  }

  async getChannelActivity(
    channelId: string,
    days: number = 7,
  ): Promise<ChannelActivityDto> {
    const channel = await this.getChannel(channelId);
    if (!channel) {
      throw new NotFoundException(`Channel with ID ${channelId} not found`);
    }

    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);

    const channelMessages = this.messages.filter(
      (msg) =>
        msg.channelId === channelId && new Date(msg.timestamp) >= cutoffDate,
    );

    const messagesByDay = channelMessages.reduce(
      (acc, msg) => {
        const day = new Date(msg.timestamp).toISOString().split('T')[0];
        acc[day] = (acc[day] || 0) + 1;
        return acc;
      },
      {} as Record<string, number>,
    );

    const activeUsers = [...new Set(channelMessages.map((msg) => msg.userId))];

    return {
      channelId,
      channelName: channel.name,
      periodDays: days,
      totalMessages: channelMessages.length,
      activeUsers: activeUsers.length,
      messagesByDay,
      avgMessagesPerDay: Math.round((channelMessages.length / days) * 10) / 10,
    };
  }

  async searchMessages(query: string, channelId?: string): Promise<TeamMessage[]> {
    let result = this.messages;

    if (channelId) {
      result = result.filter((msg) => msg.channelId === channelId);
    }

    return result
      .filter((msg) => msg.content.toLowerCase().includes(query.toLowerCase()))
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  async getUnreadCount(userId: string, channelId: string): Promise<number> {
    // In a real implementation, this would track last read timestamps per user per channel
    // For now, return a mock count
    const channelMessages = this.messages.filter(
      (msg) => msg.channelId === channelId,
    );
    return Math.floor(channelMessages.length * 0.3); // Mock 30% unread
  }
}
