import { IsString, IsOptional, IsEnum, IsEmail, IsObject } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User display name', example: 'John Doe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'User email address', example: 'john.doe@example.com' })
  @IsEmail()
  email: string;

  @ApiProperty({
    description: 'User role in the system',
    enum: ['Admin', 'Analyst', 'Operator', 'Viewer'],
    example: 'Analyst'
  })
  @IsEnum(['Admin', 'Analyst', 'Operator', 'Viewer'])
  role: 'Admin' | 'Analyst' | 'Operator' | 'Viewer';

  @ApiPropertyOptional({
    description: 'User status',
    enum: ['Active', 'Inactive', 'Suspended'],
    default: 'Active',
    example: 'Active'
  })
  @IsOptional()
  @IsEnum(['Active', 'Inactive', 'Suspended'])
  status?: 'Active' | 'Inactive' | 'Suspended';

  @ApiPropertyOptional({ description: 'User avatar URL', example: 'https://example.com/avatar.jpg' })
  @IsOptional()
  @IsString()
  avatar?: string;

  @ApiPropertyOptional({ description: 'User department', example: 'Security Operations' })
  @IsOptional()
  @IsString()
  department?: string;

  @ApiPropertyOptional({ description: 'User preferences object' })
  @IsOptional()
  @IsObject()
  preferences?: Record<string, any>;
}
