import { IsString, IsOptional, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateIngestionJobDto {
  @ApiProperty({ description: 'Data source name', example: 'AlienVault OTX' })
  @IsString()
  source: string;

  @ApiProperty({
    description: 'Data format',
    enum: ['STIX', 'CSV', 'JSON'],
    example: 'STIX'
  })
  @IsEnum(['STIX', 'CSV', 'JSON'])
  format: 'STIX' | 'CSV' | 'JSON';

  @ApiPropertyOptional({ description: 'Job description', example: 'Daily threat feed ingestion' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Total records to process', example: 5000 })
  @IsOptional()
  @IsNumber()
  totalRecords?: number;
}

export class UpdateIngestionJobDto {
  @ApiPropertyOptional({ description: 'Data source name' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Data format',
    enum: ['STIX', 'CSV', 'JSON']
  })
  @IsOptional()
  @IsEnum(['STIX', 'CSV', 'JSON'])
  format?: 'STIX' | 'CSV' | 'JSON';

  @ApiPropertyOptional({ description: 'Job description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Job status',
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED']
  })
  @IsOptional()
  @IsEnum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'])
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

  @ApiPropertyOptional({ description: 'Total records to process' })
  @IsOptional()
  @IsNumber()
  totalRecords?: number;

  @ApiPropertyOptional({ description: 'Records processed count' })
  @IsOptional()
  @IsNumber()
  recordsProcessed?: number;
}

export class CompleteIngestionJobDto {
  @ApiProperty({ description: 'Number of records processed', example: 4500 })
  @IsNumber()
  count: number;
}
