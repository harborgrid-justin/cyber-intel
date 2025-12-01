import { IsString, IsOptional, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSegmentationPolicyDto {
  @ApiProperty({ description: 'Policy name', example: 'Isolate Infected Workstations' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Source network/host', example: '192.168.1.0/24' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Destination network/host', example: '10.0.0.0/8' })
  @IsString()
  destination: string;

  @ApiProperty({ description: 'Port or port range', example: '443' })
  @IsString()
  port: string;

  @ApiProperty({
    description: 'Policy action',
    enum: ['ALLOW', 'DENY'],
    example: 'DENY'
  })
  @IsEnum(['ALLOW', 'DENY'])
  action: 'ALLOW' | 'DENY';

  @ApiPropertyOptional({
    description: 'Policy status',
    enum: ['ACTIVE', 'DRAFT', 'CONFLICT'],
    example: 'ACTIVE'
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'DRAFT', 'CONFLICT'])
  status?: 'ACTIVE' | 'DRAFT' | 'CONFLICT';

  @ApiPropertyOptional({ description: 'Policy description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Protocol (TCP, UDP, ICMP, etc.)', example: 'TCP' })
  @IsOptional()
  @IsString()
  protocol?: string;
}

export class UpdateSegmentationPolicyDto {
  @ApiPropertyOptional({ description: 'Policy name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Source network/host' })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({ description: 'Destination network/host' })
  @IsOptional()
  @IsString()
  destination?: string;

  @ApiPropertyOptional({ description: 'Port or port range' })
  @IsOptional()
  @IsString()
  port?: string;

  @ApiPropertyOptional({
    description: 'Policy action',
    enum: ['ALLOW', 'DENY']
  })
  @IsOptional()
  @IsEnum(['ALLOW', 'DENY'])
  action?: 'ALLOW' | 'DENY';

  @ApiPropertyOptional({
    description: 'Policy status',
    enum: ['ACTIVE', 'DRAFT', 'CONFLICT']
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'DRAFT', 'CONFLICT'])
  status?: 'ACTIVE' | 'DRAFT' | 'CONFLICT';

  @ApiPropertyOptional({ description: 'Policy description' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({ description: 'Protocol (TCP, UDP, ICMP, etc.)' })
  @IsOptional()
  @IsString()
  protocol?: string;
}
