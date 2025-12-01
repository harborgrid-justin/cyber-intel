import { ApiProperty } from '@nestjs/swagger';

export class NotesByAuthorDto {
  @ApiProperty({ description: 'Author user ID', example: 'user-001' })
  authorId: string;

  @ApiProperty({ description: 'Number of notes by this author', example: 15 })
  count: number;
}

export class NoteStatsDto {
  @ApiProperty({ description: 'Total number of notes', example: 100 })
  total: number;

  @ApiProperty({ description: 'Notes grouped by author', type: [NotesByAuthorDto] })
  notesByAuthor: NotesByAuthorDto[];
}
