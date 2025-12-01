import { IsString, IsOptional, IsArray, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateParserRuleDto {
  @ApiProperty({ description: 'Parser rule name', example: 'Syslog Parser' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Data format this rule applies to',
    enum: ['STIX', 'CSV', 'JSON', 'SYSLOG', 'CEF', 'LEEF'],
    example: 'SYSLOG'
  })
  @IsEnum(['STIX', 'CSV', 'JSON', 'SYSLOG', 'CEF', 'LEEF'])
  format: 'STIX' | 'CSV' | 'JSON' | 'SYSLOG' | 'CEF' | 'LEEF';

  @ApiProperty({ description: 'Regex pattern for parsing', example: '^(?<timestamp>\\S+)\\s+(?<host>\\S+)\\s+(?<message>.*)$' })
  @IsString()
  pattern: string;

  @ApiProperty({ description: 'Field mapping from regex groups', example: ['timestamp', 'host', 'message'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  fieldMapping: string[];

  @ApiPropertyOptional({ description: 'Rule description', example: 'Parses standard syslog format' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Priority order (lower = higher priority)', example: 1 })
  @IsOptional()
  priority?: number;
}

export class UpdateParserRuleDto {
  @ApiPropertyOptional({ description: 'Parser rule name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Data format this rule applies to',
    enum: ['STIX', 'CSV', 'JSON', 'SYSLOG', 'CEF', 'LEEF']
  })
  @IsOptional()
  @IsEnum(['STIX', 'CSV', 'JSON', 'SYSLOG', 'CEF', 'LEEF'])
  format?: 'STIX' | 'CSV' | 'JSON' | 'SYSLOG' | 'CEF' | 'LEEF';

  @ApiPropertyOptional({ description: 'Regex pattern for parsing' })
  @IsOptional()
  @IsString()
  pattern?: string;

  @ApiPropertyOptional({ description: 'Field mapping from regex groups', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  fieldMapping?: string[];

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Rule status',
    enum: ['ACTIVE', 'INACTIVE', 'FAILED']
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'INACTIVE', 'FAILED'])
  status?: 'ACTIVE' | 'INACTIVE' | 'FAILED';

  @ApiPropertyOptional({ description: 'Priority order' })
  @IsOptional()
  priority?: number;
}

export class ValidateParserRuleDto {
  @ApiProperty({ description: 'Regex pattern to validate', example: '^(?<ip>\\d+\\.\\d+\\.\\d+\\.\\d+)\\s+' })
  @IsString()
  pattern: string;

  @ApiProperty({ description: 'Sample log to test against', example: '192.168.1.1 - - [01/Dec/2023:10:00:00 +0000] "GET / HTTP/1.1"' })
  @IsString()
  sampleLog: string;
}
