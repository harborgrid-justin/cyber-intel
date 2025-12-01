import { ApiProperty } from '@nestjs/swagger';

export class ArtifactsByTypeDto {
  @ApiProperty({ description: 'Artifact type', example: 'file' })
  type: string;

  @ApiProperty({ description: 'Number of artifacts of this type', example: 25 })
  count: number;
}

export class ArtifactStatsDto {
  @ApiProperty({ description: 'Total number of artifacts', example: 150 })
  total: number;

  @ApiProperty({ description: 'Artifacts grouped by type', type: [ArtifactsByTypeDto] })
  artifactsByType: ArtifactsByTypeDto[];
}
