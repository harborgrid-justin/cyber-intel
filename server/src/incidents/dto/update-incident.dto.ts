import { IsString, IsOptional, IsEnum, IsDate, IsArray, IsObject } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateIncidentDto {
  @ApiPropertyOptional({ description: 'Incident title', example: 'Updated: Ransomware Attack on Finance Server' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({ description: 'Detailed incident description', example: 'Updated description with additional findings...' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Incident status',
    enum: ['OPEN', 'INVESTIGATING', 'CONTAINED', 'CLOSED'],
    example: 'CONTAINED'
  })
  @IsOptional()
  @IsEnum(['OPEN', 'INVESTIGATING', 'CONTAINED', 'CLOSED'])
  status?: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';

  @ApiPropertyOptional({
    description: 'Incident severity',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH'
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiPropertyOptional({ description: 'Incident category', example: 'Malware' })
  @IsOptional()
  @IsString()
  category?: string;

  @ApiPropertyOptional({ description: 'Date and time incident was detected' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  detectedAt?: Date;

  @ApiPropertyOptional({ description: 'Source of incident detection', example: 'SIEM Alert' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'User ID or name assigned to the incident', example: 'analyst-002' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'List of affected assets', example: ['server-fin-001', 'server-fin-002'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  affectedAssets?: string[];

  @ApiPropertyOptional({ description: 'Impact assessment details', example: { financialImpact: 'Medium', dataLoss: 'None' } })
  @IsOptional()
  @IsObject()
  impact?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Resolution details', example: 'Malware contained and systems restored from backup' })
  @IsOptional()
  @IsString()
  resolution?: string;

  @ApiPropertyOptional({ description: 'Date and time incident was resolved' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  resolvedAt?: Date;
}
