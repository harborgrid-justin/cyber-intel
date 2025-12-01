import { IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateBreachDto {
  @ApiProperty({ description: 'Email address affected', example: 'user@example.com' })
  @IsString()
  email: string;

  @ApiProperty({ description: 'Breach name', example: 'CompanyXYZ Data Breach' })
  @IsString()
  breach: string;

  @ApiProperty({ description: 'Breach date', example: '2023-06-15' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Data types exposed', example: 'email, password, name' })
  @IsString()
  data: string;

  @ApiProperty({ description: 'Hash or identifier', example: 'sha256:abc123' })
  @IsString()
  hash: string;

  @ApiProperty({ description: 'Source of breach data', example: 'HaveIBeenPwned' })
  @IsString()
  source: string;
}
