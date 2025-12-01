import { IsString, IsEnum, IsOptional, IsObject, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateOsintResultDto {
  @ApiProperty({ description: 'Source of the OSINT data', example: 'Shodan' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Type of OSINT result', example: 'ip_scan' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Content of the OSINT result', example: 'Open ports found: 22, 80, 443' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Additional metadata', example: { ports: [22, 80, 443], hostname: 'example.com' } })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiProperty({
    description: 'Confidence level of the result',
    enum: ['Low', 'Medium', 'High', 'Critical'],
    example: 'High'
  })
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  confidence: 'Low' | 'Medium' | 'High' | 'Critical';

  @ApiProperty({ description: 'Date when data was collected', example: '2023-12-01T10:30:00Z' })
  @IsDateString()
  collectedAt: string;

  @ApiPropertyOptional({ description: 'Associated case ID', example: 'case-123' })
  @IsOptional()
  @IsString()
  caseId?: string;
}
