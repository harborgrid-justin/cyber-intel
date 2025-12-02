import { IsString, IsOptional, IsEnum, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateEnrichmentModuleDto {
  @ApiProperty({ description: 'Enrichment module name', example: 'GeoIP Enrichment' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of enrichment',
    enum: ['geoip', 'threat_intel', 'domain_lookup', 'asn_lookup', 'whois'],
    example: 'geoip'
  })
  @IsEnum(['geoip', 'threat_intel', 'domain_lookup', 'asn_lookup', 'whois'])
  type: 'geoip' | 'threat_intel' | 'domain_lookup' | 'asn_lookup' | 'whois';

  @ApiProperty({ description: 'Module description', example: 'Enriches IP addresses with geolocation data' })
  @IsString()
  description: string;

  @ApiPropertyOptional({ description: 'API endpoint for enrichment service', example: 'https://api.geoip.example.com/lookup' })
  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @ApiPropertyOptional({ description: 'API key for authentication' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Additional configuration', example: { timeout: 5000, retries: 3 } })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}

export class IngestionUpdateEnrichmentModuleDto {
  @ApiPropertyOptional({ description: 'Enrichment module name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of enrichment',
    enum: ['geoip', 'threat_intel', 'domain_lookup', 'asn_lookup', 'whois']
  })
  @IsOptional()
  @IsEnum(['geoip', 'threat_intel', 'domain_lookup', 'asn_lookup', 'whois'])
  type?: 'geoip' | 'threat_intel' | 'domain_lookup' | 'asn_lookup' | 'whois';

  @ApiPropertyOptional({ description: 'Module description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Module status',
    enum: ['ACTIVE', 'DISABLED', 'ERROR']
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'DISABLED', 'ERROR'])
  status?: 'ACTIVE' | 'DISABLED' | 'ERROR';

  @ApiPropertyOptional({ description: 'API endpoint for enrichment service' })
  @IsOptional()
  @IsString()
  apiEndpoint?: string;

  @ApiPropertyOptional({ description: 'API key for authentication' })
  @IsOptional()
  @IsString()
  apiKey?: string;

  @ApiPropertyOptional({ description: 'Additional configuration' })
  @IsOptional()
  @IsObject()
  config?: Record<string, any>;
}
