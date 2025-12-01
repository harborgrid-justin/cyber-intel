import { ApiProperty } from '@nestjs/swagger';

export class ComplianceStatsDto {
  @ApiProperty({
    description: 'Total number of compliance items',
    example: 100
  })
  total: number;

  @ApiProperty({
    description: 'Number of compliant items',
    example: 75
  })
  compliant: number;

  @ApiProperty({
    description: 'Number of non-compliant items',
    example: 15
  })
  nonCompliant: number;

  @ApiProperty({
    description: 'Overall compliance rate percentage',
    example: 75
  })
  complianceRate: number;
}
