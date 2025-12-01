import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class LeaveChannelDto {
  @ApiProperty({ description: 'User ID to leave the channel', example: 'user-001' })
  @IsString()
  userId: string;
}
