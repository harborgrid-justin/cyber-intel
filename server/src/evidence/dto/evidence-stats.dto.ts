import { ApiProperty } from '@nestjs/swagger';

export class EvidenceStatsDto {
  @ApiProperty({
    description: 'Total number of chain of custody events',
    example: 25
  })
  chainEvents: number;

  @ApiProperty({
    description: 'Total number of malware samples',
    example: 15
  })
  malware: number;

  @ApiProperty({
    description: 'Total number of forensic jobs',
    example: 8
  })
  forensicJobs: number;

  @ApiProperty({
    description: 'Total number of devices',
    example: 20
  })
  devices: number;

  @ApiProperty({
    description: 'Total number of PCAP files',
    example: 12
  })
  pcaps: number;

  @ApiProperty({
    description: 'Number of malicious samples',
    example: 10
  })
  maliciousSamples: number;

  @ApiProperty({
    description: 'Number of active forensic jobs',
    example: 3
  })
  activeJobs: number;

  @ApiProperty({
    description: 'Number of quarantined devices',
    example: 3
  })
  quarantinedDevices: number;

  @ApiProperty({
    description: 'Number of analyzed PCAP files',
    example: 8
  })
  analyzedPcaps: number;
}
