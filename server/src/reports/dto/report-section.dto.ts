import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateReportSectionDto {
  @ApiProperty({
    description: 'Title of the report section',
    example: 'Executive Summary'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Content of the report section',
    example: 'The SolarWinds supply chain compromise represents one of the most sophisticated cyber attacks in history...'
  })
  @IsString()
  content: string;
}

export class UpdateReportSectionDto {
  @ApiPropertyOptional({
    description: 'Title of the report section',
    example: 'Updated Executive Summary'
  })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Content of the report section',
    example: 'Updated content for the executive summary...'
  })
  @IsOptional()
  @IsString()
  content?: string;
}

export class ReportSectionResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the section',
    example: 'section-001'
  })
  id: string;

  @ApiProperty({
    description: 'Title of the report section',
    example: 'Executive Summary'
  })
  title: string;

  @ApiProperty({
    description: 'Content of the report section',
    example: 'The SolarWinds supply chain compromise represents one of the most sophisticated cyber attacks in history...'
  })
  content: string;
}
