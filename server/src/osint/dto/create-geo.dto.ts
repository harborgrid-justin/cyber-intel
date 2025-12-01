import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateGeoDto {
  @ApiProperty({ description: 'IP address', example: '192.168.1.1' })
  @IsString()
  ip: string;

  @ApiPropertyOptional({ description: 'Country name', example: 'United States' })
  @IsOptional()
  @IsString()
  country?: string;

  @ApiPropertyOptional({ description: 'Country code', example: 'US' })
  @IsOptional()
  @IsString()
  countryCode?: string;

  @ApiPropertyOptional({ description: 'Region or state', example: 'California' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({ description: 'City name', example: 'Los Angeles' })
  @IsOptional()
  @IsString()
  city?: string;

  @ApiPropertyOptional({ description: 'Latitude coordinate', example: 34.0522 })
  @IsOptional()
  @IsNumber()
  latitude?: number;

  @ApiPropertyOptional({ description: 'Longitude coordinate', example: -118.2437 })
  @IsOptional()
  @IsNumber()
  longitude?: number;

  @ApiPropertyOptional({ description: 'Internet Service Provider', example: 'Comcast' })
  @IsOptional()
  @IsString()
  isp?: string;

  @ApiPropertyOptional({ description: 'Autonomous System Number', example: 'AS7922' })
  @IsOptional()
  @IsString()
  asn?: string;

  @ApiPropertyOptional({ description: 'Threat score (0-100)', example: 75 })
  @IsOptional()
  @IsNumber()
  threatScore?: number;

  @ApiPropertyOptional({ description: 'VPN detection flag', example: false })
  @IsOptional()
  isVpn?: boolean;

  @ApiPropertyOptional({ description: 'Proxy detection flag', example: false })
  @IsOptional()
  isProxy?: boolean;

  @ApiPropertyOptional({ description: 'Tor exit node flag', example: false })
  @IsOptional()
  isTor?: boolean;

  @ApiPropertyOptional({ description: 'Additional metadata' })
  @IsOptional()
  metadata?: Record<string, any>;
}
