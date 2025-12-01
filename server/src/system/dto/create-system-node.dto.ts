import { IsString, IsOptional, IsNumber, IsEnum, IsArray, Min, Max } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSystemNodeDto {
  @ApiPropertyOptional({
    description: 'Unique identifier for the system node',
    example: 'node-prod-db-01'
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Human-readable name of the system node',
    example: 'Production Database Server'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Current operational status of the node',
    enum: ['ONLINE', 'OFFLINE', 'DEGRADED', 'ISOLATED'],
    example: 'ONLINE'
  })
  @IsEnum(['ONLINE', 'OFFLINE', 'DEGRADED', 'ISOLATED'])
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'ISOLATED';

  @ApiProperty({
    description: 'Current CPU/memory load percentage (0-100)',
    example: 45.5,
    minimum: 0,
    maximum: 100
  })
  @IsNumber()
  @Min(0)
  @Max(100)
  load: number;

  @ApiProperty({
    description: 'Network latency in milliseconds',
    example: 12.5,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  latency: number;

  @ApiPropertyOptional({
    description: 'Type of system node',
    enum: ['Database', 'Sensor', 'Server', 'Firewall', 'Workstation'],
    example: 'Server'
  })
  @IsOptional()
  @IsEnum(['Database', 'Sensor', 'Server', 'Firewall', 'Workstation'])
  type?: 'Database' | 'Sensor' | 'Server' | 'Firewall' | 'Workstation';

  @ApiPropertyOptional({
    description: 'List of CVE IDs or vulnerability identifiers affecting this node',
    example: ['CVE-2023-1234', 'CVE-2023-5678'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  vulnerabilities?: string[];

  @ApiPropertyOptional({
    description: 'Hardware or software vendor name',
    example: 'Dell Technologies'
  })
  @IsOptional()
  @IsString()
  vendor?: string;

  @ApiPropertyOptional({
    description: 'Critical process running on this node',
    example: 'PostgreSQL'
  })
  @IsOptional()
  @IsString()
  criticalProcess?: string;

  @ApiPropertyOptional({
    description: 'List of node IDs this node depends on',
    example: ['node-dns-01', 'node-auth-01'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependencies?: string[];

  @ApiProperty({
    description: 'Security controls deployed on this node',
    enum: ['EDR', 'AV', 'DLP', 'FIREWALL', 'SIEM_AGENT'],
    example: ['EDR', 'SIEM_AGENT'],
    type: [String]
  })
  @IsArray()
  @IsEnum(['EDR', 'AV', 'DLP', 'FIREWALL', 'SIEM_AGENT'], { each: true })
  securityControls: ('EDR' | 'AV' | 'DLP' | 'FIREWALL' | 'SIEM_AGENT')[];

  @ApiProperty({
    description: 'Data sensitivity classification',
    enum: ['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'],
    example: 'CONFIDENTIAL'
  })
  @IsEnum(['PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'])
  dataSensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

  @ApiProperty({
    description: 'Total data volume in gigabytes',
    example: 500,
    minimum: 0
  })
  @IsNumber()
  @Min(0)
  dataVolumeGB: number;

  @ApiPropertyOptional({
    description: 'Network segment the node belongs to',
    enum: ['DMZ', 'PROD', 'DEV', 'CORP'],
    example: 'PROD'
  })
  @IsOptional()
  @IsEnum(['DMZ', 'PROD', 'DEV', 'CORP'])
  segment?: 'DMZ' | 'PROD' | 'DEV' | 'CORP';

  @ApiPropertyOptional({
    description: 'Number of active network connections',
    example: 150,
    minimum: 0
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  networkConnections?: number;
}
