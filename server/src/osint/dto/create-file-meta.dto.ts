import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateFileMetaDto {
  @ApiProperty({ description: 'Filename', example: 'document.pdf' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'File size', example: '1.5 MB' })
  @IsString()
  size: string;

  @ApiProperty({ description: 'File type', example: 'PDF Document' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'Author metadata', example: 'John Doe' })
  @IsString()
  author: string;

  @ApiProperty({ description: 'Creation date', example: '2023-01-15' })
  @IsString()
  created: string;

  @ApiProperty({ description: 'GPS coordinates if available', example: '40.7128,-74.0060' })
  @IsString()
  gps: string;
}
