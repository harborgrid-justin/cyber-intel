import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNormalizationRuleDto {
  @ApiProperty({ description: 'Field name to normalize', example: 'ip_address' })
  @IsString()
  field: string;

  @ApiProperty({
    description: 'Transformation to apply',
    enum: ['lowercase', 'uppercase', 'trim', 'normalize_ip', 'normalize_mac', 'normalize_timestamp'],
    example: 'normalize_ip'
  })
  @IsEnum(['lowercase', 'uppercase', 'trim', 'normalize_ip', 'normalize_mac', 'normalize_timestamp'])
  transformation: 'lowercase' | 'uppercase' | 'trim' | 'normalize_ip' | 'normalize_mac' | 'normalize_timestamp';

  @ApiPropertyOptional({ description: 'Rule description', example: 'Normalizes IP addresses to consistent format' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Priority order (lower = higher priority)', example: 1 })
  @IsOptional()
  priority?: number;
}

export class UpdateNormalizationRuleDto {
  @ApiPropertyOptional({ description: 'Field name to normalize' })
  @IsOptional()
  @IsString()
  field?: string;

  @ApiPropertyOptional({
    description: 'Transformation to apply',
    enum: ['lowercase', 'uppercase', 'trim', 'normalize_ip', 'normalize_mac', 'normalize_timestamp']
  })
  @IsOptional()
  @IsEnum(['lowercase', 'uppercase', 'trim', 'normalize_ip', 'normalize_mac', 'normalize_timestamp'])
  transformation?: 'lowercase' | 'uppercase' | 'trim' | 'normalize_ip' | 'normalize_mac' | 'normalize_timestamp';

  @ApiPropertyOptional({ description: 'Rule description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Priority order' })
  @IsOptional()
  priority?: number;
}
