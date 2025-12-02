import { IsString, IsOptional, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DetectionCreateForensicJobDto {
  @ApiProperty({ description: 'Name of the forensic job', example: 'Memory Analysis Job' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the forensic job', example: 'Analyze memory dump for malware indicators' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Target system or artifact', example: 'workstation-001.internal' })
  @IsString()
  target: string;

  @ApiPropertyOptional({ description: 'Job parameters', example: { depth: 'full', timeout: 3600 } })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiProperty({ description: 'Job priority (higher = more urgent)', example: 5 })
  @IsNumber()
  priority: number;
}
