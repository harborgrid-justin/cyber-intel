import {
  IsString,
  IsEnum,
  IsOptional,
  IsNumber,
  IsArray,
  IsBoolean,
  Min,
  Max,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateThreatDto {
  @ApiProperty({
    description: 'Unique identifier for the threat',
    example: 'threat-001',
  })
  @IsString()
  id: string;

  @ApiProperty({
    description: 'The threat indicator (IP, domain, hash, etc.)',
    example: '192.168.1.100',
  })
  @IsString()
  indicator: string;

  @ApiProperty({
    description: 'Type of threat indicator',
    example: 'IP_ADDRESS',
  })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Severity level of the threat',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiProperty({
    description: 'Last time the threat was observed',
    example: '2024-01-15T10:30:00Z',
  })
  @IsString()
  lastSeen: string;

  @ApiProperty({
    description: 'Source of the threat intelligence',
    example: 'OSINT Feed',
  })
  @IsString()
  source: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the threat',
    example: 'Malicious IP associated with botnet C2 infrastructure',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Current status of the threat',
    enum: ['NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'],
    example: 'NEW',
  })
  @IsEnum(['NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'])
  status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';

  @ApiProperty({
    description: 'Confidence score (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence: number;

  @ApiProperty({
    description: 'Geographic region associated with the threat',
    example: 'Eastern Europe',
  })
  @IsString()
  region: string;

  @ApiProperty({
    description: 'Associated threat actor name',
    example: 'APT29',
  })
  @IsString()
  threatActor: string;

  @ApiProperty({
    description: 'Reputation score (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  reputation: number;

  @ApiProperty({
    description: 'Overall threat score (0-100)',
    example: 90,
    minimum: 0,
    maximum: 100,
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  score: number;

  @ApiPropertyOptional({
    description: 'Traffic Light Protocol classification',
    enum: ['RED', 'AMBER', 'GREEN', 'CLEAR'],
    example: 'AMBER',
  })
  @IsOptional()
  @IsEnum(['RED', 'AMBER', 'GREEN', 'CLEAR'])
  tlp?: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @ApiPropertyOptional({
    description: 'Whether the indicator is sanctioned',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  sanctioned?: boolean;

  @ApiPropertyOptional({
    description: 'Flag for ML model retraining',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  mlRetrain?: boolean;

  @ApiPropertyOptional({
    description: 'Tags associated with the threat',
    example: ['malware', 'botnet', 'c2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Origin of the threat data',
    example: 'internal-feed',
  })
  @IsOptional()
  @IsString()
  origin?: string;
}

export class UpdateThreatDto {
  @ApiPropertyOptional({
    description: 'The threat indicator (IP, domain, hash, etc.)',
    example: '192.168.1.100',
  })
  @IsOptional()
  @IsString()
  indicator?: string;

  @ApiPropertyOptional({
    description: 'Type of threat indicator',
    example: 'IP_ADDRESS',
  })
  @IsOptional()
  @IsString()
  type?: string;

  @ApiPropertyOptional({
    description: 'Severity level of the threat',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiPropertyOptional({
    description: 'Last time the threat was observed',
    example: '2024-01-15T10:30:00Z',
  })
  @IsOptional()
  @IsString()
  lastSeen?: string;

  @ApiPropertyOptional({
    description: 'Source of the threat intelligence',
    example: 'OSINT Feed',
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Detailed description of the threat',
    example: 'Malicious IP associated with botnet C2 infrastructure',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Current status of the threat',
    enum: ['NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'],
    example: 'NEW',
  })
  @IsOptional()
  @IsEnum(['NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'])
  status?: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';

  @ApiPropertyOptional({
    description: 'Confidence score (0-100)',
    example: 85,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  confidence?: number;

  @ApiPropertyOptional({
    description: 'Geographic region associated with the threat',
    example: 'Eastern Europe',
  })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Associated threat actor name',
    example: 'APT29',
  })
  @IsOptional()
  @IsString()
  threatActor?: string;

  @ApiPropertyOptional({
    description: 'Reputation score (0-100)',
    example: 25,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  reputation?: number;

  @ApiPropertyOptional({
    description: 'Overall threat score (0-100)',
    example: 90,
    minimum: 0,
    maximum: 100,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  @Max(100)
  score?: number;

  @ApiPropertyOptional({
    description: 'Traffic Light Protocol classification',
    enum: ['RED', 'AMBER', 'GREEN', 'CLEAR'],
    example: 'AMBER',
  })
  @IsOptional()
  @IsEnum(['RED', 'AMBER', 'GREEN', 'CLEAR'])
  tlp?: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @ApiPropertyOptional({
    description: 'Whether the indicator is sanctioned',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  sanctioned?: boolean;

  @ApiPropertyOptional({
    description: 'Flag for ML model retraining',
    example: false,
  })
  @IsOptional()
  @IsBoolean()
  mlRetrain?: boolean;

  @ApiPropertyOptional({
    description: 'Tags associated with the threat',
    example: ['malware', 'botnet', 'c2'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @ApiPropertyOptional({
    description: 'Origin of the threat data',
    example: 'internal-feed',
  })
  @IsOptional()
  @IsString()
  origin?: string;
}

export class UpdateThreatStatusDto {
  @ApiProperty({
    description: 'New status for the threat',
    enum: ['NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'],
    example: 'INVESTIGATING',
  })
  @IsEnum(['NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'])
  status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';
}

export class ThreatResponseDto {
  @ApiProperty({ description: 'Unique identifier', example: 'threat-001' })
  id: string;

  @ApiProperty({ description: 'Threat indicator', example: '192.168.1.100' })
  indicator: string;

  @ApiProperty({ description: 'Indicator type', example: 'IP_ADDRESS' })
  type: string;

  @ApiProperty({ description: 'Severity level', example: 'HIGH' })
  severity: string;

  @ApiProperty({ description: 'Last seen timestamp', example: '2024-01-15T10:30:00Z' })
  lastSeen: string;

  @ApiProperty({ description: 'Intelligence source', example: 'OSINT Feed' })
  source: string;

  @ApiPropertyOptional({ description: 'Description', example: 'Malicious IP' })
  description?: string;

  @ApiProperty({ description: 'Current status', example: 'NEW' })
  status: string;

  @ApiProperty({ description: 'Confidence score', example: 85 })
  confidence: number;

  @ApiProperty({ description: 'Region', example: 'Eastern Europe' })
  region: string;

  @ApiProperty({ description: 'Associated threat actor', example: 'APT29' })
  threatActor: string;

  @ApiProperty({ description: 'Reputation score', example: 25 })
  reputation: number;

  @ApiProperty({ description: 'Threat score', example: 90 })
  score: number;

  @ApiPropertyOptional({ description: 'TLP classification', example: 'AMBER' })
  tlp?: string;

  @ApiPropertyOptional({ description: 'Sanctioned flag', example: false })
  sanctioned?: boolean;

  @ApiPropertyOptional({ description: 'ML retrain flag', example: false })
  mlRetrain?: boolean;

  @ApiPropertyOptional({ description: 'Tags', example: ['malware'] })
  tags?: string[];

  @ApiPropertyOptional({ description: 'Origin', example: 'internal-feed' })
  origin?: string;
}

export class DeleteThreatResponseDto {
  @ApiProperty({
    description: 'Whether the deletion was successful',
    example: true,
  })
  deleted: boolean;
}
