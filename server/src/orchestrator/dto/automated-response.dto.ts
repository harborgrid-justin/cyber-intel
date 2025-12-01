import { IsString, IsArray } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class AutomatedResponseDto {
  @ApiProperty({ description: 'Threat ID to respond to', example: 'threat-123' })
  @IsString()
  threatId: string;

  @ApiProperty({ description: 'Target nodes for automated response', example: ['node-1', 'node-2'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  targetNodes: string[];
}
