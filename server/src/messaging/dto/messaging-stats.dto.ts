import { ApiProperty } from '@nestjs/swagger';

export class ChannelStatsDto {
  @ApiProperty({ description: 'Total number of channels', example: 10 })
  total: number;

  @ApiProperty({ description: 'Number of public channels', example: 5 })
  public: number;

  @ApiProperty({ description: 'Number of private channels', example: 3 })
  private: number;

  @ApiProperty({ description: 'Number of war rooms', example: 1 })
  warRooms: number;

  @ApiProperty({ description: 'Number of direct message channels', example: 1 })
  dms: number;

  @ApiProperty({ description: 'Average members per channel', example: 4.5 })
  avgMembersPerChannel: number;
}

export class MessageStatsDto {
  @ApiProperty({ description: 'Total number of messages', example: 500 })
  total: number;

  @ApiProperty({ description: 'Number of alert messages', example: 25 })
  alerts: number;

  @ApiProperty({ description: 'Number of system messages', example: 50 })
  system: number;

  @ApiProperty({ description: 'Number of text messages', example: 425 })
  text: number;
}

export class MessagingStatsDto {
  @ApiProperty({ description: 'Channel statistics', type: ChannelStatsDto })
  channels: ChannelStatsDto;

  @ApiProperty({ description: 'Message statistics', type: MessageStatsDto })
  messages: MessageStatsDto;

  @ApiProperty({ description: 'Channel count by type', example: { PUBLIC: 5, PRIVATE: 3 } })
  channelTypes: Record<string, number>;

  @ApiProperty({ description: 'Message count by type', example: { TEXT: 425, ALERT: 25 } })
  messageTypes: Record<string, number>;
}

export class ChannelActivityDto {
  @ApiProperty({ description: 'Channel ID', example: 'channel-001' })
  channelId: string;

  @ApiProperty({ description: 'Channel name', example: 'threat-intel' })
  channelName: string;

  @ApiProperty({ description: 'Period in days', example: 7 })
  periodDays: number;

  @ApiProperty({ description: 'Total messages in period', example: 150 })
  totalMessages: number;

  @ApiProperty({ description: 'Number of active users', example: 8 })
  activeUsers: number;

  @ApiProperty({ description: 'Messages by day', example: { '2024-12-01': 20, '2024-12-02': 25 } })
  messagesByDay: Record<string, number>;

  @ApiProperty({ description: 'Average messages per day', example: 21.4 })
  avgMessagesPerDay: number;
}
