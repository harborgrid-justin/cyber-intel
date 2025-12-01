import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTaskDto {
  @ApiProperty({ description: 'Task title', example: 'Investigate suspicious IP addresses' })
  @IsString()
  title: string;

  @ApiPropertyOptional({ description: 'Task description', example: 'Analyze network traffic from the identified IP ranges' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Task priority level',
    enum: ['Low', 'Medium', 'High', 'Critical'],
    example: 'High'
  })
  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  priority: 'Low' | 'Medium' | 'High' | 'Critical';

  @ApiProperty({
    description: 'Task status',
    enum: ['Pending', 'In Progress', 'Completed', 'Cancelled'],
    example: 'Pending'
  })
  @IsEnum(['Pending', 'In Progress', 'Completed', 'Cancelled'])
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

  @ApiPropertyOptional({ description: 'User ID of the assignee', example: 'user-001' })
  @IsOptional()
  @IsString()
  assignedTo?: string;

  @ApiPropertyOptional({ description: 'Task due date in ISO format', example: '2024-12-31T23:59:59Z' })
  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Associated case ID', example: 'case-001' })
  @IsOptional()
  @IsString()
  caseId?: string;
}
