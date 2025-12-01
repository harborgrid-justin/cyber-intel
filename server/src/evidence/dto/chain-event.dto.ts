import { IsString, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateChainEventDto {
  @ApiProperty({
    description: 'Date of the chain of custody event',
    example: '2024-01-15T10:30:00Z'
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'ID of the artifact involved',
    example: 'artifact-001'
  })
  @IsString()
  artifactId: string;

  @ApiProperty({
    description: 'Name of the artifact',
    example: 'memory_dump.bin'
  })
  @IsString()
  artifactName: string;

  @ApiProperty({
    description: 'Action performed on the artifact',
    enum: ['CHECK_IN', 'CHECK_OUT', 'TRANSFER', 'ANALYSIS', 'ARCHIVE'],
    example: 'CHECK_IN'
  })
  @IsEnum(['CHECK_IN', 'CHECK_OUT', 'TRANSFER', 'ANALYSIS', 'ARCHIVE'])
  action: 'CHECK_IN' | 'CHECK_OUT' | 'TRANSFER' | 'ANALYSIS' | 'ARCHIVE';

  @ApiProperty({
    description: 'User who performed the action',
    example: 'john.doe@company.com'
  })
  @IsString()
  user: string;

  @ApiProperty({
    description: 'Additional notes about the event',
    example: 'Initial evidence intake from incident scene'
  })
  @IsString()
  notes: string;
}

export class ChainEventResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the chain event',
    example: 'ce-1234567890'
  })
  id: string;

  @ApiProperty({
    description: 'Date of the chain of custody event',
    example: '2024-01-15T10:30:00Z'
  })
  date: string;

  @ApiProperty({
    description: 'ID of the artifact involved',
    example: 'artifact-001'
  })
  artifactId: string;

  @ApiProperty({
    description: 'Name of the artifact',
    example: 'memory_dump.bin'
  })
  artifactName: string;

  @ApiProperty({
    description: 'Action performed on the artifact',
    enum: ['CHECK_IN', 'CHECK_OUT', 'TRANSFER', 'ANALYSIS', 'ARCHIVE'],
    example: 'CHECK_IN'
  })
  action: 'CHECK_IN' | 'CHECK_OUT' | 'TRANSFER' | 'ANALYSIS' | 'ARCHIVE';

  @ApiProperty({
    description: 'User who performed the action',
    example: 'john.doe@company.com'
  })
  user: string;

  @ApiProperty({
    description: 'Additional notes about the event',
    example: 'Initial evidence intake from incident scene'
  })
  notes: string;
}
