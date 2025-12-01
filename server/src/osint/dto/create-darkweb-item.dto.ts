import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateDarkWebItemDto {
  @ApiProperty({ description: 'Source marketplace or forum', example: 'Dark Market XYZ' })
  @IsString()
  source: string;

  @ApiProperty({ description: 'Title of the listing', example: 'Database leak - Company XYZ' })
  @IsString()
  title: string;

  @ApiProperty({ description: 'Date discovered', example: '2023-11-15' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Author/seller username', example: 'darkvendor123' })
  @IsString()
  author: string;

  @ApiProperty({ description: 'Item status', example: 'Active' })
  @IsString()
  status: string;

  @ApiProperty({ description: 'Price', example: '$500 BTC' })
  @IsString()
  price: string;
}
