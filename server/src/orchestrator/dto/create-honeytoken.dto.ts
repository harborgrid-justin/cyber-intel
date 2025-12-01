import { IsString, IsOptional, IsEnum, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateHoneytokenDto {
  @ApiProperty({ description: 'Honeytoken name', example: 'AWS Credentials Token' })
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Type of honeytoken',
    enum: ['FILE', 'CREDENTIAL', 'SERVICE'],
    example: 'CREDENTIAL'
  })
  @IsEnum(['FILE', 'CREDENTIAL', 'SERVICE'])
  type: 'FILE' | 'CREDENTIAL' | 'SERVICE';

  @ApiProperty({ description: 'Location where token is deployed', example: '/home/admin/.aws/credentials' })
  @IsString()
  location: string;

  @ApiPropertyOptional({
    description: 'Current status',
    enum: ['ACTIVE', 'TRIGGERED', 'DORMANT'],
    example: 'ACTIVE'
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'TRIGGERED', 'DORMANT'])
  status?: 'ACTIVE' | 'TRIGGERED' | 'DORMANT';

  @ApiPropertyOptional({ description: 'Last triggered timestamp' })
  @IsOptional()
  @IsDateString()
  lastTriggered?: string;

  @ApiPropertyOptional({ description: 'Description or purpose' })
  @IsOptional()
  @IsString()
  description?: string;
}

export class UpdateHoneytokenDto {
  @ApiPropertyOptional({ description: 'Honeytoken name' })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiPropertyOptional({
    description: 'Type of honeytoken',
    enum: ['FILE', 'CREDENTIAL', 'SERVICE']
  })
  @IsOptional()
  @IsEnum(['FILE', 'CREDENTIAL', 'SERVICE'])
  type?: 'FILE' | 'CREDENTIAL' | 'SERVICE';

  @ApiPropertyOptional({ description: 'Location where token is deployed' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiPropertyOptional({
    description: 'Current status',
    enum: ['ACTIVE', 'TRIGGERED', 'DORMANT']
  })
  @IsOptional()
  @IsEnum(['ACTIVE', 'TRIGGERED', 'DORMANT'])
  status?: 'ACTIVE' | 'TRIGGERED' | 'DORMANT';

  @ApiPropertyOptional({ description: 'Last triggered timestamp' })
  @IsOptional()
  @IsDateString()
  lastTriggered?: string;

  @ApiPropertyOptional({ description: 'Effectiveness score (0-100)' })
  @IsOptional()
  effectiveness?: number;

  @ApiPropertyOptional({ description: 'Deployment date' })
  @IsOptional()
  @IsString()
  deploymentDate?: string;
}
