import { IsString, IsArray, IsOptional, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class ChatHistoryItemDto {
  @ApiProperty({ description: 'Role of the message sender', example: 'user', enum: ['user', 'assistant', 'system'] })
  @IsString()
  role: string;

  @ApiProperty({ description: 'Content of the message', example: 'Analyze this IOC: 192.168.1.1' })
  @IsString()
  content: string;
}

export class ChatRequestDto {
  @ApiProperty({
    description: 'The message to send to the AI analyst',
    example: 'What are the latest TTPs used by APT29?'
  })
  @IsString()
  message: string;

  @ApiPropertyOptional({
    description: 'Previous conversation history for context',
    type: [ChatHistoryItemDto]
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ChatHistoryItemDto)
  history?: ChatHistoryItemDto[];
}

export class ChatResponseDto {
  @ApiProperty({
    description: 'AI analyst response',
    example: 'Based on recent intelligence, APT29 has been observed using...'
  })
  response: string;
}
