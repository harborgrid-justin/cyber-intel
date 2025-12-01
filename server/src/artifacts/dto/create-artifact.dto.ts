import { IsString, IsOptional, IsObject } from 'class-validator';

export class CreateArtifactDto {
  @IsString()
  name: string;

  @IsString()
  type: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsObject()
  metadata?: any;

  @IsOptional()
  @IsString()
  caseId?: string;
}