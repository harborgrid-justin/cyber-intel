import { IsString, IsArray, IsEnum } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class ProcessDataDto {
  @ApiProperty({ description: 'Data source name', example: 'AlienVault OTX' })
  @IsString()
  source: string;

  @ApiProperty({
    description: 'Data format',
    enum: ['STIX', 'CSV', 'JSON'],
    example: 'JSON'
  })
  @IsEnum(['STIX', 'CSV', 'JSON'])
  format: 'STIX' | 'CSV' | 'JSON';

  @ApiProperty({
    description: 'Raw data records to process',
    example: [{ ip: '192.168.1.1', threat_type: 'malware' }],
    type: [Object]
  })
  @IsArray()
  rawData: any[];
}
