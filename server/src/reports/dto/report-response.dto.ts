import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class ReportResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the report',
    example: 'report-001'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the incident report',
    example: 'SolarWinds Supply Chain Compromise - Executive Summary'
  })
  title: string;

  @ApiProperty({
    description: 'Type of the report',
    enum: ['Executive', 'Forensic', 'Compliance', 'Technical'],
    example: 'Executive'
  })
  type: 'Executive' | 'Forensic' | 'Compliance' | 'Technical';

  @ApiProperty({
    description: 'Date of the report',
    example: '2024-01-15'
  })
  date: string;

  @ApiProperty({
    description: 'Author of the report',
    example: 'Alice Johnson'
  })
  author: string;

  @ApiProperty({
    description: 'Status of the report',
    enum: ['DRAFT', 'READY', 'ARCHIVED'],
    example: 'READY'
  })
  status: 'DRAFT' | 'READY' | 'ARCHIVED';

  @ApiProperty({
    description: 'Main content of the report',
    example: 'Executive summary of the SolarWinds supply chain attack...'
  })
  content: string;

  @ApiPropertyOptional({
    description: 'ID of the related case',
    example: 'case-001'
  })
  relatedCaseId?: string;

  @ApiPropertyOptional({
    description: 'ID of the related threat actor',
    example: 'apt-001'
  })
  relatedActorId?: string;

  @ApiPropertyOptional({
    description: 'ID of the related threat',
    example: 'threat-001'
  })
  relatedThreatId?: string;
}

export class DeleteReportResponseDto {
  @ApiProperty({
    description: 'Confirmation message',
    example: 'Report deleted successfully'
  })
  message: string;
}
