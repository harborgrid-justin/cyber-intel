import { IsString, IsOptional, IsEnum, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessagingCreateChannelDto {
  @ApiProperty({ description: 'Channel name', example: 'threat-intel' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Channel type',
    enum: ['PUBLIC', 'PRIVATE', 'DM', 'WAR_ROOM'],
    example: 'PUBLIC'
  })
  @IsEnum(['PUBLIC', 'PRIVATE', 'DM', 'WAR_ROOM'])
  type: 'PUBLIC' | 'PRIVATE' | 'DM' | 'WAR_ROOM';

  @ApiPropertyOptional({ description: 'Channel topic or description', example: 'Threat intelligence sharing and analysis' })
  @IsOptional()
  @IsString()
  topic?: string;

  @ApiPropertyOptional({
    description: 'Initial member user IDs',
    type: [String],
    example: ['user-001', 'user-002']
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  members?: string[];
}
