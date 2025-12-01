import { IsString, IsOptional } from 'class-validator';

export class CreateNoteDto {
  @IsString()
  content: string;

  @IsOptional()
  @IsString()
  title?: string;

  @IsString()
  authorId: string;

  @IsOptional()
  @IsString()
  caseId?: string;
}