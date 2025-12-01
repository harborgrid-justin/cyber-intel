import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateMessageDto {
  @ApiProperty({ description: 'Updated message content', example: 'Updated: New threat detected in sector 7' })
  @IsString()
  content: string;
}
