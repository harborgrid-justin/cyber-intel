import { IsString, IsOptional, IsEnum, IsArray, IsDate } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class CreateComplianceItemDto {
  @ApiPropertyOptional({
    description: 'Unique identifier for the compliance item',
    example: 'compliance-nist-ac-1'
  })
  @IsOptional()
  @IsString()
  id?: string;

  @ApiProperty({
    description: 'Compliance framework name',
    example: 'NIST CSF'
  })
  @IsString()
  framework: string;

  @ApiProperty({
    description: 'Control identifier within the framework',
    example: 'AC-1'
  })
  @IsString()
  controlId: string;

  @ApiProperty({
    description: 'Control title',
    example: 'Access Control Policy and Procedures'
  })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Detailed description of the control requirement',
    example: 'The organization develops, documents, and disseminates access control policy and procedures.'
  })
  @IsString()
  description: string;

  @ApiPropertyOptional({
    description: 'Current compliance status',
    enum: ['Compliant', 'Non-Compliant', 'Not-Applicable', 'Compensated'],
    example: 'Compliant',
    default: 'Not-Applicable'
  })
  @IsOptional()
  @IsEnum(['Compliant', 'Non-Compliant', 'Not-Applicable', 'Compensated'])
  status?: 'Compliant' | 'Non-Compliant' | 'Not-Applicable' | 'Compensated';

  @ApiPropertyOptional({
    description: 'Severity level if non-compliant',
    enum: ['Low', 'Medium', 'High', 'Critical'],
    example: 'Medium',
    default: 'Medium'
  })
  @IsOptional()
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  severity?: 'Low' | 'Medium' | 'High' | 'Critical';

  @ApiPropertyOptional({
    description: 'List of evidence document references',
    example: ['DOC-001', 'SCREENSHOT-002', 'AUDIT-LOG-003'],
    type: [String]
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  evidence?: string[];

  @ApiPropertyOptional({
    description: 'Date of last compliance assessment',
    example: '2023-12-01T00:00:00Z'
  })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  lastAssessed?: Date;

  @ApiPropertyOptional({
    description: 'Remediation steps or compensating controls',
    example: 'Implement role-based access control and document in security policy.'
  })
  @IsOptional()
  @IsString()
  remediation?: string;
}
