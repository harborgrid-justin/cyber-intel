import { IsString, IsOptional, IsBoolean, IsNumber, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class DetectionCreateParserRuleDto {
  @ApiProperty({ description: 'Name of the parser rule', example: 'Syslog Parser' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Description of the parser rule', example: 'Parses standard syslog format' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'Regex pattern for matching', example: '^<\\d+>.*$' })
  @IsString()
  pattern: string;

  @ApiProperty({ description: 'Source type this rule applies to', example: 'syslog' })
  @IsString()
  sourceType: string;

  @ApiPropertyOptional({ description: 'Extraction rules for parsing fields', example: { timestamp: 'group(1)', message: 'group(2)' } })
  @IsOptional()
  @IsObject()
  extractionRules?: Record<string, any>;

  @ApiProperty({ description: 'Whether the rule is enabled', example: true })
  @IsBoolean()
  enabled: boolean;

  @ApiProperty({ description: 'Rule priority (higher = evaluated first)', example: 100 })
  @IsNumber()
  priority: number;

  @ApiPropertyOptional({ description: 'Tags for categorization', example: ['syslog', 'linux', 'security'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];
}
