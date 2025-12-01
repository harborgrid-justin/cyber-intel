import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportDto {
  @ApiProperty({
    description: 'Title of the incident report',
    example: 'SolarWinds Supply Chain Compromise - Executive Summary'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Type of the report',
    enum: ['Executive', 'Forensic', 'Compliance', 'Technical'],
    example: 'Executive'
  })
  @IsEnum(['Executive', 'Forensic', 'Compliance', 'Technical'])
  type: 'Executive' | 'Forensic' | 'Compliance' | 'Technical';

  @ApiProperty({
    description: 'Date of the report',
    example: '2024-01-15'
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Author of the report',
    example: 'Alice Johnson'
  })
  @IsString()
  author: string;

  @ApiProperty({
    description: 'Status of the report',
    enum: ['DRAFT', 'READY', 'ARCHIVED'],
    example: 'DRAFT'
  })
  @IsEnum(['DRAFT', 'READY', 'ARCHIVED'])
  status: 'DRAFT' | 'READY' | 'ARCHIVED';

  @ApiProperty({
    description: 'Main content of the report',
    example: 'Executive summary of the SolarWinds supply chain attack...'
  })
  @IsString()
  content: string;

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
