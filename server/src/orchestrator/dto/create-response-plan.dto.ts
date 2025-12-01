import { IsString, IsOptional, IsArray, IsNumber, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateResponsePlanDto {
  @ApiProperty({ description: 'Response plan name', example: 'Ransomware Isolation Protocol' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of response plan',
    enum: ['ISOLATION', 'PATCH', 'BLOCK_IP', 'DECEPTION'],
    example: 'ISOLATION'
  })
  @IsEnum(['ISOLATION', 'PATCH', 'BLOCK_IP', 'DECEPTION'])
  type: 'ISOLATION' | 'PATCH' | 'BLOCK_IP' | 'DECEPTION';

  @ApiProperty({ description: 'Target nodes for the response', example: ['node-1', 'node-2'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  targetNodes: string[];

  @ApiPropertyOptional({ description: 'Collateral damage score (0-100)', example: 15 })
  @IsOptional()
  @IsNumber()
  collateralDamageScore?: number;

  @ApiPropertyOptional({ description: 'Business impact descriptions', example: ['Temporary service disruption'], type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessImpact?: string[];

  @ApiPropertyOptional({ description: 'Expected success rate percentage', example: 85 })
  @IsOptional()
  @IsNumber()
  successRate?: number;

  @ApiPropertyOptional({
    description: 'Current status of the plan',
    enum: ['DRAFT', 'EXECUTING', 'COMPLETED'],
    example: 'DRAFT'
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'EXECUTING', 'COMPLETED'])
  status?: 'DRAFT' | 'EXECUTING' | 'COMPLETED';

  @ApiPropertyOptional({ description: 'Required authorization level', example: 'ADMIN' })
  @IsOptional()
  @IsString()
  requiredAuth?: string;

  @ApiPropertyOptional({ description: 'Estimated time to recovery', example: '30 minutes' })
  @IsOptional()
  @IsString()
  estimatedTTR?: string;
}

export class UpdateResponsePlanDto {
  @ApiPropertyOptional({ description: 'Response plan name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of response plan',
    enum: ['ISOLATION', 'PATCH', 'BLOCK_IP', 'DECEPTION']
  })
  @IsOptional()
  @IsEnum(['ISOLATION', 'PATCH', 'BLOCK_IP', 'DECEPTION'])
  type?: 'ISOLATION' | 'PATCH' | 'BLOCK_IP' | 'DECEPTION';

  @ApiPropertyOptional({ description: 'Target nodes for the response', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  targetNodes?: string[];

  @ApiPropertyOptional({ description: 'Collateral damage score (0-100)' })
  @IsOptional()
  @IsNumber()
  collateralDamageScore?: number;

  @ApiPropertyOptional({ description: 'Business impact descriptions', type: [String] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  businessImpact?: string[];

  @ApiPropertyOptional({ description: 'Expected success rate percentage' })
  @IsOptional()
  @IsNumber()
  successRate?: number;

  @ApiPropertyOptional({
    description: 'Current status of the plan',
    enum: ['DRAFT', 'EXECUTING', 'COMPLETED']
  })
  @IsOptional()
  @IsEnum(['DRAFT', 'EXECUTING', 'COMPLETED'])
  status?: 'DRAFT' | 'EXECUTING' | 'COMPLETED';

  @ApiPropertyOptional({ description: 'Required authorization level' })
  @IsOptional()
  @IsString()
  requiredAuth?: string;

  @ApiPropertyOptional({ description: 'Estimated time to recovery' })
  @IsOptional()
  @IsString()
  estimatedTTR?: string;
}
