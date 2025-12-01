import { IsString, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreatePatchPrioritizationDto {
  @ApiProperty({ description: 'Vulnerability ID', example: 'CVE-2023-12345' })
  @IsString()
  vulnId: string;

  @ApiProperty({ description: 'Asset ID', example: 'asset-001' })
  @IsString()
  assetId: string;

  @ApiProperty({ description: 'Priority score (0-100)', example: 95 })
  @IsNumber()
  score: number;

  @ApiProperty({ description: 'Reason for prioritization', example: 'Critical internet-facing asset with active exploitation' })
  @IsString()
  reason: string;

  @ApiProperty({ description: 'CVSS score', example: 9.8 })
  @IsNumber()
  cvss: number;

  @ApiProperty({
    description: 'Business criticality level',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'CRITICAL'
  })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  businessCriticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}
