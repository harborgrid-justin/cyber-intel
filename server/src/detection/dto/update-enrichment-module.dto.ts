import { IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class DetectionUpdateEnrichmentModuleDto {
  @ApiProperty({
    description: 'New status for the enrichment module',
    enum: ['ACTIVE', 'DISABLED', 'ERROR'],
    example: 'ACTIVE'
  })
  @IsEnum(['ACTIVE', 'DISABLED', 'ERROR'])
  status: 'ACTIVE' | 'DISABLED' | 'ERROR';
}
