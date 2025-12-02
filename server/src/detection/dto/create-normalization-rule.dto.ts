import { IsString, IsOptional, IsBoolean, IsNumber, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DetectionCreateNormalizationRuleDto {
  @ApiProperty({ description: 'Name of the normalization rule', example: 'Windows Event Normalizer' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the normalization rule', example: 'Normalizes Windows Security events to common schema' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Input format identifier', example: 'windows-evtx' })
  @IsString()
  inputFormat: string;

  @ApiProperty({ description: 'Output format identifier', example: 'ecs' })
  @IsString()
  outputFormat: string;

  @ApiPropertyOptional({ description: 'Transformation rules', example: { 'EventID': 'event.code', 'Computer': 'host.name' } })
  @IsOptional()
  @IsObject()
  transformationRules?: Record<string, any>;

  @ApiProperty({ description: 'Whether the rule is enabled', example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Rule priority (higher = evaluated first)', example: 50 })
  @IsNumber()
  priority: number;

  @ApiPropertyOptional({ description: 'Conditions for rule application', example: { source: 'windows', eventType: 'security' } })
  @IsOptional()
  @IsObject()
  conditions?: Record<string, any>;
}
