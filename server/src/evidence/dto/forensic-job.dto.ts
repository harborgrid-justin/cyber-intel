import { IsString, IsEnum, IsNumber, IsOptional, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class EvidenceCreateForensicJobDto {
  @ApiProperty({
    description: 'Type of forensic analysis',
    example: 'Memory Analysis'
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Target of the forensic analysis',
    example: 'WORKSTATION-001'
  })
  @IsString()
  target: string;

  @ApiProperty({
    description: 'Status of the forensic job',
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    example: 'QUEUED'
  })
  @IsEnum(['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 0,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  progress: number;

  @ApiProperty({
    description: 'Technician assigned to the job',
    example: 'Jane Smith'
  })
  @IsString()
  technician: string;
}

export class EvidenceUpdateForensicJobDto {
  @ApiPropertyOptional({
    description: 'Type of forensic analysis',
    example: 'Disk Analysis'
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Target of the forensic analysis',
    example: 'SERVER-002'
  })
  @IsOptional()
  @IsString()
  target?: string;

  @ApiPropertyOptional({
    description: 'Status of the forensic job',
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    example: 'PROCESSING'
  })
  @IsOptional()
  @IsEnum(['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status?: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  @ApiPropertyOptional({
    description: 'Progress percentage (0-100)',
    example: 50,
    minimum: 0,
    maximum: 100
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  progress?: number;

  @ApiPropertyOptional({
    description: 'Technician assigned to the job',
    example: 'John Doe'
  })
  @IsOptional()
  @IsString()
  technician?: string;
}

export class ForensicJobResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the forensic job',
    example: 'fj-1234567890'
  })
  id: string;

  @ApiProperty({
    description: 'Type of forensic analysis',
    example: 'Memory Analysis'
  })
  type: string;

  @ApiProperty({
    description: 'Target of the forensic analysis',
    example: 'WORKSTATION-001'
  })
  target: string;

  @ApiProperty({
    description: 'Status of the forensic job',
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    example: 'PROCESSING'
  })
  status: 'QUEUED' | 'PROCESSING' | 'COMPLETED' | 'FAILED';

  @ApiProperty({
    description: 'Progress percentage (0-100)',
    example: 75
  })
  progress: number;

  @ApiProperty({
    description: 'Technician assigned to the job',
    example: 'Jane Smith'
  })
  technician: string;
}

export class ForensicJobQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'],
    example: 'PROCESSING'
  })
  @IsOptional()
  @IsEnum(['QUEUED', 'PROCESSING', 'COMPLETED', 'FAILED'])
  status?: string;
}
