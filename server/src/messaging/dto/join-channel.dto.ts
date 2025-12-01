import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class JoinChannelDto {
  @ApiProperty({ description: 'User ID to join the channel', example: 'user-001' })
  @IsString()
  userId: string;
}
