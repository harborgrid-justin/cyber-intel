import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ChannelsCreateChannelDto {
  @ApiPropertyOptional({
    description: 'Unique identifier for the channel',
    example: 'channel-intel-ops'
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Channel display name',
    example: 'Intelligence Operations'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Channel type classification',
    enum: ['PUBLIC', 'PRIVATE', 'DM', 'WAR_ROOM'],
    example: 'PUBLIC'
  })
  @IsEnum(['PUBLIC', 'PRIVATE', 'DM', 'WAR_ROOM'])
  type: 'PUBLIC' | 'PRIVATE' | 'DM' | 'WAR_ROOM';

  @ApiProperty({
    description: 'List of user IDs who are members of this channel',
    example: ['user-001', 'user-002', 'user-003'],
    type: [String]
  })
  @IsArray()
  @IsString({ each: true })
  members: string[];

  @ApiPropertyOptional({
    description: 'Channel topic or purpose description',
    example: 'Daily intelligence briefings and threat updates'
  })
  @IsOptional()
  @IsString()
  topic?: string;
}
