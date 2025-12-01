import { IsString, IsOptional, IsEnum, IsNumber, IsObject, IsDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class UpdateForensicJobDto {
  @ApiPropertyOptional({ description: 'Name of the forensic job', example: 'Updated Memory Analysis Job' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({ description: 'Description of the forensic job', example: 'Updated analysis scope' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Job status',
    enum: ['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'],
    example: 'RUNNING'
  })
  @IsOptional()
  @IsEnum(['PENDING', 'RUNNING', 'COMPLETED', 'FAILED'])
  status?: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

  @ApiPropertyOptional({ description: 'Target system or artifact', example: 'server-002.internal' })
  @IsOptional()
  @IsString()
  target?: string;

  @ApiPropertyOptional({ description: 'Job parameters', example: { depth: 'quick', timeout: 1800 } })
  @IsOptional()
  @IsObject()
  parameters?: Record<string, any>;

  @ApiPropertyOptional({ description: 'Job start timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  startedAt?: Date;

  @ApiPropertyOptional({ description: 'Job completion timestamp' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  completedAt?: Date;

  @ApiPropertyOptional({ description: 'Job result data', example: 'No malware indicators found' })
  @IsOptional()
  @IsString()
  result?: string;

  @ApiPropertyOptional({ description: 'Job priority', example: 10 })
  @IsOptional()
  @IsNumber()
  priority?: number;
}
