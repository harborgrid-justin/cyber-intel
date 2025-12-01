import { IsString, IsOptional, IsDateString, IsEnum } from 'class-validator';

export class CreateTaskDto {
  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['Low', 'Medium', 'High', 'Critical'])
  priority: 'Low' | 'Medium' | 'High' | 'Critical';

  @IsEnum(['Pending', 'In Progress', 'Completed', 'Cancelled'])
  status: 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

  @IsOptional()
  @IsString()
  assignedTo?: string;

  @IsOptional()
  @IsDateString()
  dueDate?: string;

  @IsOptional()
  @IsString()
  caseId?: string;
}