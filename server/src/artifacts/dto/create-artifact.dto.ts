import { IsString, IsOptional, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateArtifactDto {
  @ApiProperty({ description: 'Artifact name', example: 'suspicious_file.exe' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Artifact type',
    example: 'file',
    enum: ['file', 'hash', 'ip', 'domain', 'url', 'email', 'other']
  })
  @IsString()
  type: string;

  @ApiPropertyOptional({ description: 'Artifact description', example: 'Malware sample extracted from phishing email' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Additional metadata for the artifact',
    example: { hash: 'abc123', size: 1024, fileType: 'PE32 executable' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Associated case ID', example: 'case-001' })
  @IsOptional()
  @IsString()
  caseId?: string;
}
