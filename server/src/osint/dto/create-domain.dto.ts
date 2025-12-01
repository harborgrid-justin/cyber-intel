import { IsString, IsOptional, IsArray, IsNumber, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDomainDto {
  @ApiProperty({ description: 'Domain name', example: 'example.com' })
  @IsString()
  domain: string;

  @ApiPropertyOptional({ description: 'IP address associated with domain', example: '192.168.1.1' })
  @IsOptional()
  @IsString()
  ip?: string;

  @ApiPropertyOptional({ description: 'Domain registrar', example: 'GoDaddy' })
  @IsOptional()
  @IsString()
  registrar?: string;

  @ApiPropertyOptional({ description: 'Registration date', example: '2020-01-01' })
  @IsOptional()
  @IsDateString()
  registrationDate?: string;

  @ApiPropertyOptional({ description: 'Expiration date', example: '2025-01-01' })
  @IsOptional()
  @IsDateString()
  expirationDate?: string;

  @ApiPropertyOptional({ description: 'Nameservers list', example: ['ns1.example.com', 'ns2.example.com'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  nameservers?: string[];

  @ApiPropertyOptional({ description: 'SSL certificate status', example: 'valid' })
  @IsOptional()
  @IsString()
  sslStatus?: string;

  @ApiPropertyOptional({ description: 'Risk score', example: 25 })
  @IsOptional()
  @IsNumber()
  riskScore?: number;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
