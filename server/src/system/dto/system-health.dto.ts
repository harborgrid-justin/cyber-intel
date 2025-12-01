import { ApiProperty } from '@nestjs/swagger';

export class SegmentCountDto {
  @ApiProperty({ description: 'Segment name', example: 'PROD' })
  segment: string;

  @ApiProperty({ description: 'Number of nodes in segment', example: 15 })
  count: number;
}

export class SystemHealthDto {
  @ApiProperty({ description: 'Total number of system nodes', example: 50 })
  total: number;

  @ApiProperty({ description: 'Number of online nodes', example: 45 })
  online: number;

  @ApiProperty({ description: 'Number of offline nodes', example: 2 })
  offline: number;

  @ApiProperty({ description: 'Number of degraded nodes', example: 2 })
  degraded: number;

  @ApiProperty({ description: 'Number of isolated nodes', example: 1 })
  isolated: number;

  @ApiProperty({ description: 'System uptime percentage', example: 90 })
  uptime: number;

  @ApiProperty({ description: 'Average system load percentage', example: 55 })
  avgLoad: number;

  @ApiProperty({ description: 'Average latency in milliseconds', example: 25 })
  avgLatency: number;

  @ApiProperty({
    description: 'Node count per segment',
    example: { DMZ: 5, PROD: 20, DEV: 15, CORP: 10 }
  })
  segments: Record<string, number>;

  @ApiProperty({ description: 'Number of nodes in critical state', example: 3 })
  criticalNodes: number;
}
