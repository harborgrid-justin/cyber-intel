import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdateIncidentStatusDto {
  @ApiProperty({
    description: 'New incident status',
    enum: ['OPEN', 'INVESTIGATING', 'CONTAINED', 'CLOSED'],
    example: 'INVESTIGATING'
  })
  @IsEnum(['OPEN', 'INVESTIGATING', 'CONTAINED', 'CLOSED'])
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';
}
