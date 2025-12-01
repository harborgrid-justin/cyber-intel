import { IsString, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateVipProfileDto {
  @ApiProperty({ description: 'User ID of the VIP', example: 'user-123' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Name of the VIP', example: 'John Smith' })
  @IsString()
  name: string;

  @ApiPropertyOptional({ description: 'Role or title', example: 'CEO' })
  @IsOptional()
  @IsString()
  role?: string;

  @ApiPropertyOptional({ description: 'Department', example: 'Executive' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({
    description: 'Risk level',
    enum: ['Low', 'Medium', 'High', 'Critical'],
    example: 'High'
  })
  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Critical';

  @ApiPropertyOptional({ description: 'Associated assets', example: ['laptop-001', 'phone-002'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  assets?: string[];

  @ApiPropertyOptional({ description: 'Special monitoring enabled', example: true })
  @IsOptional()
  specialMonitoring?: boolean;

  @ApiPropertyOptional({ description: 'Threat score (0-100)', example: 75 })
  @IsOptional()
  @IsNumber()
  threatScore?: number;

  @ApiPropertyOptional({ description: 'Additional notes' })
  @IsOptional()
  @IsString()
  notes?: string;
}
