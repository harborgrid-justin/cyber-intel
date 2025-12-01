import { IsString, IsOptional, IsBoolean } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTrafficFlowDto {
  @ApiProperty({ description: 'Source IP or network', example: '192.168.1.100' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Destination IP or network', example: '10.0.0.50' })
  @IsString()
  dest: string;

  @ApiProperty({ description: 'Port or port range', example: '443' })
  @IsString()
  port: string;

  @ApiProperty({ description: 'Whether the traffic is allowed', example: true })
  @IsBoolean()
  allowed: boolean;

  @ApiProperty({ description: 'Timestamp of the traffic flow', example: '2024-01-15T10:30:00Z' })
  @IsString()
  timestamp: string;

  @ApiPropertyOptional({ description: 'Matched policy name', example: 'default-allow' })
  @IsOptional()
  @IsString()
  policyMatched?: string;
}
