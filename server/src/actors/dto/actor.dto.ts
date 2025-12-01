import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TTPDto {
  @ApiProperty({ description: 'TTP ID', example: 'T1566' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'TTP code', example: 'T1566.001' })
  @IsString()
  code: string;

  @ApiProperty({ description: 'TTP name', example: 'Spearphishing Attachment' })
  @IsString()
  name: string;
}

export class InfrastructureDto {
  @ApiProperty({ description: 'Infrastructure ID', example: 'infra-001' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Infrastructure value', example: '192.168.1.100' })
  @IsString()
  value: string;

  @ApiProperty({ description: 'Infrastructure type', example: 'C2_SERVER' })
  @IsString()
  type: string;

  @ApiProperty({
    description: 'Infrastructure status',
    enum: ['ACTIVE', 'DOWN'],
    example: 'ACTIVE',
  })
  @IsEnum(['ACTIVE', 'DOWN'])
  status: 'ACTIVE' | 'DOWN';
}

export class ActorHistoryDto {
  @ApiProperty({ description: 'Event date', example: '2024-01-15' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Event title', example: 'New campaign detected' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Event description', example: 'APT29 launched new phishing campaign' })
  @IsString()
  description: string;
}

export class CreateActorDto {
  @ApiProperty({ description: 'Unique actor identifier', example: 'actor-001' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Actor name', example: 'APT29' })
  @IsString()
  name: string;

  @ApiPropertyOptional({
    description: 'Known aliases',
    example: ['Cozy Bear', 'The Dukes', 'YTTRIUM'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @ApiProperty({ description: 'Country of origin', example: 'Russia' })
  @IsString()
  origin: string;

  @ApiPropertyOptional({
    description: 'Actor description',
    example: 'State-sponsored APT group attributed to Russian intelligence',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Sophistication level',
    enum: ['Advanced', 'Intermediate', 'Novice'],
    example: 'Advanced',
  })
  @IsEnum(['Advanced', 'Intermediate', 'Novice'])
  sophistication: 'Advanced' | 'Intermediate' | 'Novice';

  @ApiPropertyOptional({
    description: 'Target sectors',
    example: ['Government', 'Defense', 'Healthcare'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targets?: string[];

  @ApiPropertyOptional({
    description: 'Tactics, Techniques, and Procedures',
    type: [TTPDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TTPDto)
  ttps?: TTPDto[];

  @ApiPropertyOptional({
    description: 'Associated campaign IDs',
    example: ['campaign-001', 'campaign-002'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaigns?: string[];

  @ApiPropertyOptional({
    description: 'Known infrastructure',
    type: [InfrastructureDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfrastructureDto)
  infrastructure?: InfrastructureDto[];

  @ApiPropertyOptional({
    description: 'Known exploits used',
    example: ['CVE-2021-44228', 'CVE-2022-26134'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exploits?: string[];

  @ApiPropertyOptional({
    description: 'Reference URLs',
    example: ['https://attack.mitre.org/groups/G0016/'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];

  @ApiPropertyOptional({
    description: 'Actor history and timeline',
    type: [ActorHistoryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActorHistoryDto)
  history?: ActorHistoryDto[];

  @ApiPropertyOptional({
    description: 'Related actor IDs',
    example: ['actor-002', 'actor-003'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedActors?: string[];

  @ApiPropertyOptional({
    description: 'Campaign date ranges',
    example: ['2020-2021', '2022-present'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignDates?: string[];

  @ApiPropertyOptional({
    description: 'Known evasion techniques',
    example: ['Process hollowing', 'DLL sideloading'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evasionTechniques?: string[];
}

export class UpdateActorDto {
  @ApiPropertyOptional({ description: 'Actor name', example: 'APT29' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Known aliases',
    example: ['Cozy Bear', 'The Dukes', 'YTTRIUM'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  aliases?: string[];

  @ApiPropertyOptional({ description: 'Country of origin', example: 'Russia' })
  @IsOptional()
  @IsString()
  origin?: string;

  @ApiPropertyOptional({
    description: 'Actor description',
    example: 'State-sponsored APT group attributed to Russian intelligence',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Sophistication level',
    enum: ['Advanced', 'Intermediate', 'Novice'],
    example: 'Advanced',
  })
  @IsOptional()
  @IsEnum(['Advanced', 'Intermediate', 'Novice'])
  sophistication?: 'Advanced' | 'Intermediate' | 'Novice';

  @ApiPropertyOptional({
    description: 'Target sectors',
    example: ['Government', 'Defense', 'Healthcare'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targets?: string[];

  @ApiPropertyOptional({
    description: 'Tactics, Techniques, and Procedures',
    type: [TTPDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TTPDto)
  ttps?: TTPDto[];

  @ApiPropertyOptional({
    description: 'Associated campaign IDs',
    example: ['campaign-001', 'campaign-002'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaigns?: string[];

  @ApiPropertyOptional({
    description: 'Known infrastructure',
    type: [InfrastructureDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => InfrastructureDto)
  infrastructure?: InfrastructureDto[];

  @ApiPropertyOptional({
    description: 'Known exploits used',
    example: ['CVE-2021-44228', 'CVE-2022-26134'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  exploits?: string[];

  @ApiPropertyOptional({
    description: 'Reference URLs',
    example: ['https://attack.mitre.org/groups/G0016/'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  references?: string[];

  @ApiPropertyOptional({
    description: 'Actor history and timeline',
    type: [ActorHistoryDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ActorHistoryDto)
  history?: ActorHistoryDto[];

  @ApiPropertyOptional({
    description: 'Related actor IDs',
    example: ['actor-002', 'actor-003'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedActors?: string[];

  @ApiPropertyOptional({
    description: 'Campaign date ranges',
    example: ['2020-2021', '2022-present'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  campaignDates?: string[];

  @ApiPropertyOptional({
    description: 'Known evasion techniques',
    example: ['Process hollowing', 'DLL sideloading'],
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evasionTechniques?: string[];
}

export class ActorResponseDto {
  @ApiProperty({ description: 'Actor ID', example: 'actor-001' })
  id: string;

  @ApiProperty({ description: 'Actor name', example: 'APT29' })
  name: string;

  @ApiPropertyOptional({ description: 'Known aliases' })
  aliases?: string[];

  @ApiProperty({ description: 'Country of origin', example: 'Russia' })
  origin: string;

  @ApiPropertyOptional({ description: 'Actor description' })
  description?: string;

  @ApiProperty({ description: 'Sophistication level', example: 'Advanced' })
  sophistication: string;

  @ApiPropertyOptional({ description: 'Target sectors' })
  targets?: string[];

  @ApiPropertyOptional({ description: 'TTPs' })
  ttps?: any[];

  @ApiPropertyOptional({ description: 'Campaign IDs' })
  campaigns?: string[];

  @ApiPropertyOptional({ description: 'Infrastructure' })
  infrastructure?: any[];

  @ApiPropertyOptional({ description: 'Exploits' })
  exploits?: string[];

  @ApiPropertyOptional({ description: 'References' })
  references?: string[];

  @ApiPropertyOptional({ description: 'History' })
  history?: any[];

  @ApiPropertyOptional({ description: 'Related actors' })
  relatedActors?: string[];

  @ApiPropertyOptional({ description: 'Campaign dates' })
  campaignDates?: string[];

  @ApiPropertyOptional({ description: 'Evasion techniques' })
  evasionTechniques?: string[];
}

export class DeleteActorResponseDto {
  @ApiProperty({ description: 'Whether the deletion was successful', example: true })
  deleted: boolean;
}
