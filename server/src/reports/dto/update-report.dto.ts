import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class UpdateReportDto {
  @ApiPropertyOptional({
    description: 'Title of the incident report',
    example: 'SolarWinds Supply Chain Compromise - Updated Summary'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Type of the report',
    enum: ['Executive', 'Forensic', 'Compliance', 'Technical'],
    example: 'Executive'
  })
  @IsOptional()
  @IsEnum(['Executive', 'Forensic', 'Compliance', 'Technical'])
  type?: 'Executive' | 'Forensic' | 'Compliance' | 'Technical';

  @ApiPropertyOptional({
    description: 'Date of the report',
    example: '2024-01-15'
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Author of the report',
    example: 'Alice Johnson'
  })
  @IsOptional()
  @IsString()
  author?: string;

  @ApiPropertyOptional({
    description: 'Status of the report',
    enum: ['DRAFT', 'READY', 'ARCHIVED'],
    example: 'READY'
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'READY', 'ARCHIVED'])
  status?: 'DRAFT' | 'READY' | 'ARCHIVED';

  @ApiPropertyOptional({
    description: 'Main content of the report',
    example: 'Updated executive summary of the SolarWinds supply chain attack...'
  })
  @IsOptional()
  @IsString()
  content?: string;

  @ApiPropertyOptional({
    description: 'ID of the related case',
    example: 'case-001'
  })
  @IsOptional()
  @IsString()
  relatedCaseId?: string;

  @ApiPropertyOptional({
    description: 'ID of the related threat actor',
    example: 'apt-001'
  })
  @IsOptional()
  @IsString()
  relatedActorId?: string;

  @ApiPropertyOptional({
    description: 'ID of the related threat',
    example: 'threat-001'
  })
  @IsOptional()
  @IsString()
  relatedThreatId?: string;
}
