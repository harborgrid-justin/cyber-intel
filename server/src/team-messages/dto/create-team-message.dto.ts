import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTeamMessageDto {
  @ApiPropertyOptional({
    description: 'Unique identifier for the message',
    example: 'msg-20231201-001'
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'ID of the channel this message belongs to',
    example: 'channel-intel-ops'
  })
  @IsString()
  channelId: string;

  @ApiProperty({
    description: 'ID of the user who sent the message',
    example: 'user-analyst-001'
  })
  @IsString()
  userId: string;

  @ApiProperty({
    description: 'Message content text',
    example: 'New APT activity detected in APAC region. Initiating threat analysis.'
  })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'ISO timestamp of when the message was sent',
    example: '2023-12-01T14:30:00Z'
  })
  @IsString()
  timestamp: string;

  @ApiProperty({
    description: 'Type of message',
    enum: ['TEXT', 'SYSTEM', 'ALERT'],
    example: 'TEXT'
  })
  @IsEnum(['TEXT', 'SYSTEM', 'ALERT'])
  type: 'TEXT' | 'SYSTEM' | 'ALERT';
}
