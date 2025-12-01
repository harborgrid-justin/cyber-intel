import { IsString, IsEnum, IsNumber, IsOptional, IsObject, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateFeedDto {
  @ApiProperty({
    description: 'Name of the threat intelligence feed',
    example: 'AlienVault OTX'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'URL of the feed endpoint',
    example: 'https://otx.alienvault.com/api/v1/pulses'
  })
  @IsString()
  url: string;

  @ApiProperty({
    description: 'Type of the feed',
    example: 'STIX/TAXII'
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Status of the feed',
    enum: ['ACTIVE', 'INACTIVE', 'ERROR'],
    example: 'ACTIVE'
  })
  @IsEnum(['ACTIVE', 'INACTIVE', 'ERROR'])
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';

  @ApiProperty({
    description: 'Update interval in seconds',
    example: 3600,
    minimum: 60
  })
  @IsNumber()
  @Min(60)
  updateInterval: number;

  @ApiProperty({
    description: 'Number of items in the feed',
    example: 0
  })
  @IsNumber()
  @Min(0)
  itemCount: number;

  @ApiPropertyOptional({
    description: 'Feed credentials (API keys, tokens, etc.)',
    example: { apiKey: 'xxx-xxx-xxx' }
  })
  @IsOptional()
  @IsObject()
  credentials?: Record<string, any>;

  @ApiPropertyOptional({
    description: 'Format of the feed data',
    example: 'JSON'
  })
  @IsOptional()
  @IsString()
  format?: string;

  @ApiPropertyOptional({
    description: 'Filters to apply to the feed',
    example: { severity: 'HIGH', type: 'IP' }
  })
  @IsOptional()
  @IsObject()
  filters?: Record<string, any>;
}
