import { IsString, IsOptional, IsNumber, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IsolateNodeDto {
  @ApiProperty({
    description: 'Reason for isolating the node',
    example: 'Suspected malware infection detected by EDR'
  })
  @IsString()
  reason: string;

  @ApiPropertyOptional({
    description: 'Duration of isolation in minutes (0 = indefinite)',
    example: 60,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  duration?: number;
}
