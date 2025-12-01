import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class LockUserDto {
  @ApiProperty({ description: 'Reason for locking the user account', example: 'Suspicious activity detected' })
  @IsString()
  reason: string;

  @ApiPropertyOptional({ description: 'Duration of the lock in minutes (0 for indefinite)', example: 60 })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}
