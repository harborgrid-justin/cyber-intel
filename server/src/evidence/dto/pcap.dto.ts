import { IsString, IsEnum, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePcapDto {
  @ApiProperty({
    description: 'Name of the PCAP file',
    example: 'network_capture_2024.pcap'
  })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Size of the PCAP file',
    example: '256 MB'
  })
  @IsString()
  size: string;

  @ApiProperty({
    description: 'Date of capture',
    example: '2024-01-15'
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'Source of the capture',
    example: 'Firewall-01'
  })
  @IsString()
  source: string;

  @ApiProperty({
    description: 'Primary protocol captured',
    example: 'TCP/IP'
  })
  @IsString()
  protocol: string;

  @ApiProperty({
    description: 'Analysis status of the PCAP',
    enum: ['PENDING', 'ANALYZED'],
    example: 'PENDING'
  })
  @IsEnum(['PENDING', 'ANALYZED'])
  analysisStatus: 'PENDING' | 'ANALYZED';

  @ApiPropertyOptional({
    description: 'Associated threat actor ID',
    example: 'apt-001'
  })
  @IsOptional()
  @IsString()
  associatedActor?: string;
}

export class UpdatePcapDto {
  @ApiPropertyOptional({
    description: 'Name of the PCAP file',
    example: 'network_capture_updated.pcap'
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Size of the PCAP file',
    example: '512 MB'
  })
  @IsOptional()
  @IsString()
  size?: string;

  @ApiPropertyOptional({
    description: 'Date of capture',
    example: '2024-01-20'
  })
  @IsOptional()
  @IsString()
  date?: string;

  @ApiPropertyOptional({
    description: 'Source of the capture',
    example: 'Switch-02'
  })
  @IsOptional()
  @IsString()
  source?: string;

  @ApiPropertyOptional({
    description: 'Primary protocol captured',
    example: 'UDP'
  })
  @IsOptional()
  @IsString()
  protocol?: string;

  @ApiPropertyOptional({
    description: 'Analysis status of the PCAP',
    enum: ['PENDING', 'ANALYZED'],
    example: 'ANALYZED'
  })
  @IsOptional()
  @IsEnum(['PENDING', 'ANALYZED'])
  analysisStatus?: 'PENDING' | 'ANALYZED';

  @ApiPropertyOptional({
    description: 'Associated threat actor ID',
    example: 'apt-002'
  })
  @IsOptional()
  @IsString()
  associatedActor?: string;
}

export class PcapResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the PCAP',
    example: 'pcap-1234567890'
  })
  id: string;

  @ApiProperty({
    description: 'Name of the PCAP file',
    example: 'network_capture_2024.pcap'
  })
  name: string;

  @ApiProperty({
    description: 'Size of the PCAP file',
    example: '256 MB'
  })
  size: string;

  @ApiProperty({
    description: 'Date of capture',
    example: '2024-01-15'
  })
  date: string;

  @ApiProperty({
    description: 'Source of the capture',
    example: 'Firewall-01'
  })
  source: string;

  @ApiProperty({
    description: 'Primary protocol captured',
    example: 'TCP/IP'
  })
  protocol: string;

  @ApiProperty({
    description: 'Analysis status of the PCAP',
    enum: ['PENDING', 'ANALYZED'],
    example: 'ANALYZED'
  })
  analysisStatus: 'PENDING' | 'ANALYZED';

  @ApiPropertyOptional({
    description: 'Associated threat actor ID',
    example: 'apt-001'
  })
  associatedActor?: string;
}

export class PcapQueryDto {
  @ApiPropertyOptional({
    description: 'Filter by analysis status',
    enum: ['PENDING', 'ANALYZED'],
    example: 'PENDING'
  })
  @IsOptional()
  @IsEnum(['PENDING', 'ANALYZED'])
  status?: string;
}
