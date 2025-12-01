import { IsString, IsEnum, IsOptional, IsArray } from 'class-validator';

export class CreateCaseDto {
  @IsString()
  id: string;

  @IsString()
  title: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'])
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsString()
  assignee: string;

  @IsString()
  reporter: string;

  @IsOptional()
  @IsArray()
  tasks?: any[];

  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedThreatIds?: string[];

  @IsString()
  created: string;

  @IsOptional()
  @IsArray()
  notes?: any[];

  @IsOptional()
  @IsArray()
  artifacts?: any[];

  @IsOptional()
  @IsArray()
  timeline?: any[];

  @IsString()
  agency: string;

  @IsEnum(['INTERNAL', 'JOINT_TASK_FORCE', 'PUBLIC'])
  sharingScope: 'INTERNAL' | 'JOINT_TASK_FORCE' | 'PUBLIC';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWith?: string[];

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsEnum(['RED', 'AMBER', 'GREEN', 'CLEAR'])
  tlp: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @IsOptional()
  slaBreach?: boolean;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedCaseIds?: string[];
}

export class UpdateCaseDto {
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'])
  status?: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsOptional()
  @IsString()
  assignee?: string;

  @IsOptional()
  @IsString()
  reporter?: string;

  @IsOptional()
  @IsArray()
  tasks?: any[];

  @IsOptional()
  @IsString()
  findings?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedThreatIds?: string[];

  @IsOptional()
  @IsString()
  created?: string;

  @IsOptional()
  @IsArray()
  notes?: any[];

  @IsOptional()
  @IsArray()
  artifacts?: any[];

  @IsOptional()
  @IsArray()
  timeline?: any[];

  @IsOptional()
  @IsString()
  agency?: string;

  @IsOptional()
  @IsEnum(['INTERNAL', 'JOINT_TASK_FORCE', 'PUBLIC'])
  sharingScope?: 'INTERNAL' | 'JOINT_TASK_FORCE' | 'PUBLIC';

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWith?: string[];

  @IsOptional()
  @IsString()
  dueDate?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @IsOptional()
  @IsEnum(['RED', 'AMBER', 'GREEN', 'CLEAR'])
  tlp?: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @IsOptional()
  slaBreach?: boolean;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedCaseIds?: string[];
}