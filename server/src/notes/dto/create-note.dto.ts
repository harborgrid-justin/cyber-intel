import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateNoteDto {
  @ApiProperty({ description: 'Note content', example: 'Initial investigation findings indicate a coordinated attack...' })
  @IsString()
  content: string;

  @ApiPropertyOptional({ description: 'Note title', example: 'Investigation Summary' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiProperty({ description: 'Author user ID', example: 'user-001' })
  @IsString()
  authorId: string;

  @ApiPropertyOptional({ description: 'Associated case ID', example: 'case-001' })
  @IsOptional()
  @IsString()
  caseId?: string;
}
