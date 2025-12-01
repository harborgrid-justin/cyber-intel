import { IsString, IsEnum, IsNumber, IsOptional, IsObject, IsDate, Min } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateFeedDto {
  @ApiPropertyOptional({
    description: 'Name of the threat intelligence feed',
    example: 'AlienVault OTX Updated'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'URL of the feed endpoint',
    example: 'https://otx.alienvault.com/api/v2/pulses'
  })
  @IsOptional()
  @IsString()
  url?: string;

  @ApiPropertyOptional({
    description: 'Type of the feed',
    example: 'MISP'
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Status of the feed',
    enum: ['ACTIVE', 'INACTIVE', 'ERROR'],
    example: 'ACTIVE'
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'ERROR'])
  status?: 'ACTIVE' | 'INACTIVE' | 'ERROR';

  @ApiPropertyOptional({
    description: 'Update interval in seconds',
    example: 7200,
    minimum: 60
  })
  @IsOptional()
  @IsNumber()
  @Min(60)
  updateInterval?: number;

  @ApiPropertyOptional({
    description: 'Last updated timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  @IsOptional()
  @IsDate()
  @Type(() => Date)
  lastUpdated?: Date;

  @ApiPropertyOptional({
    description: 'Number of items in the feed',
    example: 150
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  itemCount?: number;

  @ApiPropertyOptional({
    description: 'Feed credentials (API keys, tokens, etc.)',
    example: { apiKey: 'new-xxx-xxx' }
  })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Format of the feed data',
    example: 'STIX'
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({
    description: 'Filters to apply to the feed',
    example: { severity: 'CRITICAL', type: 'DOMAIN' }
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
