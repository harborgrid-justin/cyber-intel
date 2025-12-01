import { IsString, IsEnum, IsNumber, IsOptional, Min } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateDeviceDto {
  @ApiProperty({
    description: 'Name of the device',
    example: 'iPhone 12 Pro'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of the device',
    enum: ['Mobile', 'Laptop', 'Server', 'Drive'],
    example: 'Mobile'
  })
  @IsEnum(['Mobile', 'Laptop', 'Server', 'Drive'])
  type: 'Mobile' | 'Laptop' | 'Server' | 'Drive';

  @ApiProperty({
    description: 'Serial number of the device',
    example: 'SN-123456789'
  })
  @IsString()
  serial: string;

  @ApiProperty({
    description: 'Custodian responsible for the device',
    example: 'Evidence Room A'
  })
  @IsString()
  custodian: string;

  @ApiProperty({
    description: 'Status of the device',
    enum: ['SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'],
    example: 'SECURE'
  })
  @IsEnum(['SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'])
  status: 'SECURE' | 'ANALYSIS' | 'RELEASED' | 'QUARANTINED';

  @ApiPropertyOptional({
    description: 'Number of missed security patches',
    example: 3
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  missedPatches?: number;
}

export class UpdateDeviceDto {
  @ApiPropertyOptional({
    description: 'Name of the device',
    example: 'iPhone 12 Pro'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of the device',
    enum: ['Mobile', 'Laptop', 'Server', 'Drive'],
    example: 'Mobile'
  })
  @IsOptional()
  @IsEnum(['Mobile', 'Laptop', 'Server', 'Drive'])
  type?: 'Mobile' | 'Laptop' | 'Server' | 'Drive';

  @ApiPropertyOptional({
    description: 'Serial number of the device',
    example: 'SN-123456789'
  })
  @IsOptional()
  @IsString()
  serial?: string;

  @ApiPropertyOptional({
    description: 'Custodian responsible for the device',
    example: 'Evidence Room B'
  })
  @IsOptional()
  @IsString()
  custodian?: string;

  @ApiPropertyOptional({
    description: 'Status of the device',
    enum: ['SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'],
    example: 'ANALYSIS'
  })
  @IsOptional()
  @IsEnum(['SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'])
  status?: 'SECURE' | 'ANALYSIS' | 'RELEASED' | 'QUARANTINED';

  @ApiPropertyOptional({
    description: 'Number of missed security patches',
    example: 5
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  missedPatches?: number;
}

export class DeviceResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the device',
    example: 'dev-1234567890'
  })
  id: string;

  @ApiProperty({
    description: 'Name of the device',
    example: 'iPhone 12 Pro'
  })
  name: string;

  @ApiProperty({
    description: 'Type of the device',
    enum: ['Mobile', 'Laptop', 'Server', 'Drive'],
    example: 'Mobile'
  })
  type: 'Mobile' | 'Laptop' | 'Server' | 'Drive';

  @ApiProperty({
    description: 'Serial number of the device',
    example: 'SN-123456789'
  })
  serial: string;

  @ApiProperty({
    description: 'Custodian responsible for the device',
    example: 'Evidence Room A'
  })
  custodian: string;

  @ApiProperty({
    description: 'Status of the device',
    enum: ['SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'],
    example: 'SECURE'
  })
  status: 'SECURE' | 'ANALYSIS' | 'RELEASED' | 'QUARANTINED';

  @ApiPropertyOptional({
    description: 'Number of missed security patches',
    example: 3
  })
  missedPatches?: number;
}

export class DeviceQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by status',
    enum: ['SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'],
    example: 'SECURE'
  })
  @IsOptional()
  @IsEnum(['SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'])
  status?: string;
}
