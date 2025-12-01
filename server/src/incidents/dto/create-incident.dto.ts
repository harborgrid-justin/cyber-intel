import { IsString, IsOptional, IsEnum, IsDate, IsArray, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateIncidentDto {
  @ApiProperty({ description: 'Incident title', example: 'Ransomware Attack on Finance Server' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Detailed incident description', example: 'A ransomware variant was detected encrypting files on the finance department server...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Incident status',
    enum: ['OPEN', 'INVESTIGATING', 'CONTAINED', 'CLOSED'],
    example: 'OPEN'
  })
  @IsEnum(['OPEN', 'INVESTIGATING', 'CONTAINED', 'CLOSED'])
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';

  @ApiProperty({
    description: 'Incident severity',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'CRITICAL'
  })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiProperty({ description: 'Incident category', example: 'Malware' })
  @IsString()
  category: string;

  @ApiProperty({ description: 'Date and time incident was detected' })
  @Type(() => Date)
  @IsDate()
  detectedAt: Date;

  @ApiProperty({ description: 'Source of incident detection', example: 'EDR Alert' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'User ID or name assigned to the incident', example: 'analyst-001' })
  @IsString()
  assignedTo: string;

  @ApiPropertyOptional({ description: 'List of affected assets', example: ['server-fin-001', 'workstation-fin-015'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedAssets?: string[];

  @ApiPropertyOptional({ description: 'Impact assessment details', example: { financialImpact: 'High', dataLoss: 'Potential' } })
  @IsOptional()
  @IsObject()
  impact?: Record<string, any>;
}
