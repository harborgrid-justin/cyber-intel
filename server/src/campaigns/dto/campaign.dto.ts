import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateCampaignDto {
  @ApiPropertyOptional({
    description: 'Unique campaign identifier (auto-generated if not provided)',
    example: 'campaign-001',
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({ description: 'Campaign name', example: 'SolarWinds Compromise' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Campaign description',
    example: 'Supply chain attack targeting government and enterprise networks',
  })
  @IsString()
  description: string;

  @ApiProperty({
    description: 'Campaign status',
    enum: ['ACTIVE', 'DORMANT', 'ARCHIVED'],
    example: 'ACTIVE',
  })
  @IsEnum(['ACTIVE', 'DORMANT', 'ARCHIVED'])
  status: 'ACTIVE' | 'DORMANT' | 'ARCHIVED';

  @ApiProperty({
    description: 'Campaign objective',
    enum: ['ESPIONAGE', 'FINANCIAL', 'DESTRUCTION', 'INFLUENCE', 'UNKNOWN'],
    example: 'ESPIONAGE',
  })
  @IsEnum(['ESPIONAGE', 'FINANCIAL', 'DESTRUCTION', 'INFLUENCE', 'UNKNOWN'])
  objective: 'ESPIONAGE' | 'FINANCIAL' | 'DESTRUCTION' | 'INFLUENCE' | 'UNKNOWN';

  @ApiProperty({
    description: 'Associated threat actor IDs',
    example: ['actor-001', 'actor-002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  actors: string[];

  @ApiProperty({ description: 'First seen date', example: '2020-12-13' })
  @IsString()
  firstSeen: string;

  @ApiProperty({ description: 'Last seen date', example: '2021-03-15' })
  @IsString()
  lastSeen: string;

  @ApiProperty({
    description: 'Target sectors',
    example: ['Government', 'Technology', 'Healthcare'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  targetSectors: string[];

  @ApiProperty({
    description: 'Target regions',
    example: ['North America', 'Europe'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  targetRegions: string[];

  @ApiProperty({
    description: 'Related threat IDs',
    example: ['threat-001', 'threat-002'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  threatIds: string[];

  @ApiProperty({
    description: 'Associated TTPs (MITRE ATT&CK)',
    example: ['T1195.002', 'T1071.001', 'T1027'],
    type: [String],
  })
  @IsArray()
  @IsString({ each: true })
  ttps: string[];
}

export class UpdateCampaignDto {
  @ApiPropertyOptional({ description: 'Campaign name', example: 'SolarWinds Compromise' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Campaign description',
    example: 'Supply chain attack targeting government and enterprise networks',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Campaign status',
    enum: ['ACTIVE', 'DORMANT', 'ARCHIVED'],
    example: 'DORMANT',
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'DORMANT', 'ARCHIVED'])
  status?: 'ACTIVE' | 'DORMANT' | 'ARCHIVED';

  @ApiPropertyOptional({
    description: 'Campaign objective',
    enum: ['ESPIONAGE', 'FINANCIAL', 'DESTRUCTION', 'INFLUENCE', 'UNKNOWN'],
    example: 'ESPIONAGE',
  })
  @IsOptional()
  @IsEnum(['ESPIONAGE', 'FINANCIAL', 'DESTRUCTION', 'INFLUENCE', 'UNKNOWN'])
  objective?: 'ESPIONAGE' | 'FINANCIAL' | 'DESTRUCTION' | 'INFLUENCE' | 'UNKNOWN';

  @ApiPropertyOptional({
    description: 'Associated threat actor IDs',
    example: ['actor-001', 'actor-002'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  actors?: string[];

  @ApiPropertyOptional({ description: 'First seen date', example: '2020-12-13' })
  @IsOptional()
  @IsString()
  firstSeen?: string;

  @ApiPropertyOptional({ description: 'Last seen date', example: '2021-03-15' })
  @IsOptional()
  @IsString()
  lastSeen?: string;

  @ApiPropertyOptional({
    description: 'Target sectors',
    example: ['Government', 'Technology', 'Healthcare'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetSectors?: string[];

  @ApiPropertyOptional({
    description: 'Target regions',
    example: ['North America', 'Europe'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetRegions?: string[];

  @ApiPropertyOptional({
    description: 'Related threat IDs',
    example: ['threat-001', 'threat-002'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  threatIds?: string[];

  @ApiPropertyOptional({
    description: 'Associated TTPs (MITRE ATT&CK)',
    example: ['T1195.002', 'T1071.001', 'T1027'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  ttps?: string[];
}

export class CampaignResponseDto {
  @ApiProperty({ description: 'Campaign ID', example: 'campaign-001' })
  id: string;

  @ApiProperty({ description: 'Campaign name', example: 'SolarWinds Compromise' })
  name: string;

  @ApiProperty({ description: 'Campaign description' })
  description: string;

  @ApiProperty({ description: 'Campaign status', example: 'ACTIVE' })
  status: string;

  @ApiProperty({ description: 'Campaign objective', example: 'ESPIONAGE' })
  objective: string;

  @ApiProperty({ description: 'Associated actors' })
  actors: string[];

  @ApiProperty({ description: 'First seen date' })
  firstSeen: string;

  @ApiProperty({ description: 'Last seen date' })
  lastSeen: string;

  @ApiProperty({ description: 'Target sectors' })
  targetSectors: string[];

  @ApiProperty({ description: 'Target regions' })
  targetRegions: string[];

  @ApiProperty({ description: 'Related threat IDs' })
  threatIds: string[];

  @ApiProperty({ description: 'Associated TTPs' })
  ttps: string[];
}

export class DeleteCampaignResponseDto {
  @ApiProperty({ description: 'Success message', example: 'Campaign deleted successfully' })
  message: string;
}

export class CampaignStatsDto {
  @ApiProperty({ description: 'Total number of campaigns', example: 15 })
  total: number;

  @ApiProperty({ description: 'Number of active campaigns', example: 8 })
  active: number;
}
