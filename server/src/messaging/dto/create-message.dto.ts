import { IsString, IsOptional, IsEnum, IsObject, IsArray } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateMessageDto {
  @ApiProperty({ description: 'User ID of the message sender', example: 'user-001' })
  @IsString()
  userId: string;

  @ApiProperty({ description: 'Message content', example: 'New threat detected in sector 7' })
  @IsString()
  content: string;

  @ApiProperty({
    description: 'Message type',
    enum: ['TEXT', 'ALERT', 'SYSTEM'],
    example: 'TEXT'
  })
  @IsEnum(['TEXT', 'ALERT', 'SYSTEM'])
  type: 'TEXT' | 'ALERT' | 'SYSTEM';

  @ApiPropertyOptional({
    description: 'File attachments metadata',
    type: [Object],
    example: [{ name: 'report.pdf', size: 1024 }]
  })
  @IsOptional()
  @IsArray()
  attachments?: any[];

  @ApiPropertyOptional({
    description: 'Additional message metadata',
    example: { priority: 'high', category: 'threat' }
  })
  @IsOptional()
  @IsObject()
  metadata?: Record<string, any>;
}
