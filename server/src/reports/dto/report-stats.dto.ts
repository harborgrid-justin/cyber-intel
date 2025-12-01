import { ApiProperty } from '@nestjs/swagger';

export class ReportStatsDto {
  @ApiProperty({
    description: 'Total number of reports',
    example: 10
  })
  total: number;

  @ApiProperty({
    description: 'Number of draft reports',
    example: 3
  })
  drafts: number;

  @ApiProperty({
    description: 'Number of ready reports',
    example: 5
  })
  ready: number;

  @ApiProperty({
    description: 'Number of archived reports',
    example: 2
  })
  archived: number;

  @ApiProperty({
    description: 'Count of reports by type',
    example: { Executive: 4, Forensic: 3, Technical: 2, Compliance: 1 }
  })
  types: Record<string, number>;

  @ApiProperty({
    description: 'Count of reports by author',
    example: { 'Alice Johnson': 5, 'Bob Smith': 3, 'Carol Williams': 2 }
  })
  authors: Record<string, number>;

  @ApiProperty({
    description: 'Average number of sections per report',
    example: 3.5
  })
  avgSections: number;

  @ApiProperty({
    description: 'Percentage of reports in READY status',
    example: 50
  })
  completionRate: number;
}

export class ReportTemplateDto {
  @ApiProperty({
    description: 'Template type',
    example: 'Executive'
  })
  type: string;

  @ApiProperty({
    description: 'Template sections',
    example: [
      { title: 'Executive Summary', content: 'High-level overview of the incident...' },
      { title: 'Impact Assessment', content: 'Business and operational impact...' }
    ]
  })
  sections: Array<{ title: string; content: string }>;
}
