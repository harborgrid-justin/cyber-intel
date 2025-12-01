import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';

export class ReportQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by report type',
    enum: ['Executive', 'Forensic', 'Compliance', 'Technical'],
    example: 'Executive'
  })
  @IsOptional()
  @IsEnum(['Executive', 'Forensic', 'Compliance', 'Technical'])
  type?: string;

  @ApiPropertyOptional({
    description: 'Filter by report status',
    enum: ['DRAFT', 'READY', 'ARCHIVED'],
    example: 'READY'
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'READY', 'ARCHIVED'])
  status?: string;
}
