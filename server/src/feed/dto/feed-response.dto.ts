import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class FeedResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the feed',
    example: 'feed-001'
  })
  id: string;

  @ApiProperty({
    description: 'Name of the threat intelligence feed',
    example: 'AlienVault OTX'
  })
  name: string;

  @ApiProperty({
    description: 'URL of the feed endpoint',
    example: 'https://otx.alienvault.com/api/v1/pulses'
  })
  url: string;

  @ApiProperty({
    description: 'Type of the feed',
    example: 'STIX/TAXII'
  })
  type: string;

  @ApiProperty({
    description: 'Status of the feed',
    enum: ['ACTIVE', 'INACTIVE', 'ERROR'],
    example: 'ACTIVE'
  })
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';

  @ApiProperty({
    description: 'Update interval in seconds',
    example: 3600
  })
  updateInterval: number;

  @ApiPropertyOptional({
    description: 'Last updated timestamp',
    example: '2024-01-15T10:30:00Z'
  })
  lastUpdated?: Date;

  @ApiProperty({
    description: 'Number of items in the feed',
    example: 150
  })
  itemCount: number;

  @ApiPropertyOptional({
    description: 'Format of the feed data',
    example: 'JSON'
  })
  format?: string;

  @ApiPropertyOptional({
    description: 'Filters applied to the feed',
    example: { severity: 'HIGH', type: 'IP' }
  })
  filters?: Record<string, any>;
}

export class FeedDeleteResponseDto {
  @ApiProperty({
    description: 'Whether the feed was successfully deleted',
    example: true
  })
  deleted: boolean;
}
