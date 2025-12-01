import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDMDto {
  @ApiProperty({ description: 'First user ID', example: 'user-001' })
  @IsString()
  userId1: string;

  @ApiProperty({ description: 'Second user ID', example: 'user-002' })
  @IsString()
  userId2: string;
}
