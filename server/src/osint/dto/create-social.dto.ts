import { IsString, IsOptional, IsNumber } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateSocialDto {
  @ApiProperty({ description: 'Social media handle', example: '@johndoe' })
  @IsString()
  handle: string;

  @ApiProperty({ description: 'Social media platform', example: 'Twitter' })
  @IsString()
  platform: string;

  @ApiProperty({ description: 'Profile status', example: 'Active' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Number of followers', example: 5000 })
  @IsNumber()
  followers: number;

  @ApiProperty({ description: 'Last post date', example: '2023-12-01' })
  @IsString()
  lastPost: string;

  @ApiProperty({ description: 'Sentiment analysis result', example: 'Neutral' })
  @IsString()
  sentiment: string;

  @ApiPropertyOptional({ description: 'Profile bio', example: 'Security researcher' })
  @IsOptional()
  @IsString()
  bio?: string;

  @ApiPropertyOptional({ description: 'Priority score (0-100)', example: 75 })
  @IsOptional()
  @IsNumber()
  priorityScore?: number;
}
