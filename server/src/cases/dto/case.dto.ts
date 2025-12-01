import {
  IsString,
  IsEnum,
  IsOptional,
  IsArray,
  IsBoolean,
  ValidateNested,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class TaskDto {
  @ApiProperty({ description: 'Task ID', example: 'task-001' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Task title', example: 'Analyze malware sample' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Task status',
    enum: ['PENDING', 'DONE', 'SKIPPED'],
    example: 'PENDING',
  })
  @IsEnum(['PENDING', 'DONE', 'SKIPPED'])
  status: 'PENDING' | 'DONE' | 'SKIPPED';

  @ApiPropertyOptional({ description: 'Assigned user', example: 'analyst@example.com' })
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiPropertyOptional({ description: 'Due date', example: '2024-01-20' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Task dependencies', example: ['task-000'] })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  dependsOn?: string[];
}

export class NoteDto {
  @ApiProperty({ description: 'Note ID', example: 'note-001' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Note author', example: 'analyst@example.com' })
  @IsString()
  author: string;

  @ApiProperty({ description: 'Note date', example: '2024-01-15T10:30:00Z' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Note content', example: 'Initial analysis complete' })
  @IsString()
  content: string;

  @ApiProperty({ description: 'Is internal note', example: true })
  @IsBoolean()
  isInternal: boolean;
}

export class ArtifactDto {
  @ApiProperty({ description: 'Artifact ID', example: 'artifact-001' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Artifact name', example: 'malware_sample.exe' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'Artifact type', example: 'executable' })
  @IsString()
  type: string;

  @ApiProperty({ description: 'File size', example: '1.5MB' })
  @IsString()
  size: string;

  @ApiProperty({ description: 'File hash', example: 'abc123def456...' })
  @IsString()
  hash: string;

  @ApiProperty({ description: 'Uploaded by', example: 'analyst@example.com' })
  @IsString()
  uploadedBy: string;

  @ApiProperty({ description: 'Upload date', example: '2024-01-15T10:30:00Z' })
  @IsString()
  uploadDate: string;

  @ApiPropertyOptional({
    description: 'Artifact status',
    enum: ['SECURE', 'CHECKED_OUT', 'ARCHIVED', 'COMPROMISED'],
    example: 'SECURE',
  })
  @IsOptional()
  @IsEnum(['SECURE', 'CHECKED_OUT', 'ARCHIVED', 'COMPROMISED'])
  status?: 'SECURE' | 'CHECKED_OUT' | 'ARCHIVED' | 'COMPROMISED';

  @ApiPropertyOptional({ description: 'Original hash', example: 'abc123...' })
  @IsOptional()
  @IsString()
  originalHash?: string;
}

export class TimelineEventDto {
  @ApiProperty({ description: 'Event ID', example: 'event-001' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Event date', example: '2024-01-15T10:30:00Z' })
  @IsString()
  date: string;

  @ApiProperty({ description: 'Event title', example: 'Case opened' })
  @IsString()
  title: string;

  @ApiProperty({
    description: 'Event type',
    enum: ['ALERT', 'ACTION', 'SYSTEM', 'TRANSFER'],
    example: 'ACTION',
  })
  @IsEnum(['ALERT', 'ACTION', 'SYSTEM', 'TRANSFER'])
  type: 'ALERT' | 'ACTION' | 'SYSTEM' | 'TRANSFER';
}

export class CreateCaseDto {
  @ApiProperty({ description: 'Unique case identifier', example: 'case-001' })
  @IsString()
  id: string;

  @ApiProperty({ description: 'Case title', example: 'APT29 Intrusion Investigation' })
  @IsString()
  title: string;

  @ApiPropertyOptional({
    description: 'Case description',
    example: 'Investigation of suspected APT29 activity in corporate network',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Case status',
    enum: ['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'],
    example: 'OPEN',
  })
  @IsEnum(['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'])
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';

  @ApiProperty({
    description: 'Case priority',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  })
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiProperty({ description: 'Assigned analyst', example: 'john.doe@example.com' })
  @IsString()
  assignee: string;

  @ApiProperty({ description: 'Case reporter', example: 'jane.smith@example.com' })
  @IsString()
  reporter: string;

  @ApiPropertyOptional({
    description: 'Case tasks',
    type: [TaskDto],
  })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  tasks?: TaskDto[];

  @ApiPropertyOptional({ description: 'Investigation findings', example: 'Found malicious DLL...' })
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional({
    description: 'Related threat IDs',
    example: ['threat-001', 'threat-002'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedThreatIds?: string[];

  @ApiProperty({ description: 'Case creation date', example: '2024-01-15T10:30:00Z' })
  @IsString()
  created: string;

  @ApiPropertyOptional({ description: 'Case notes', type: [NoteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteDto)
  notes?: NoteDto[];

  @ApiPropertyOptional({ description: 'Case artifacts', type: [ArtifactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtifactDto)
  artifacts?: ArtifactDto[];

  @ApiPropertyOptional({ description: 'Case timeline', type: [TimelineEventDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineEventDto)
  timeline?: TimelineEventDto[];

  @ApiProperty({ description: 'Responsible agency', example: 'Cyber Defense Team' })
  @IsString()
  agency: string;

  @ApiProperty({
    description: 'Sharing scope',
    enum: ['INTERNAL', 'JOINT_TASK_FORCE', 'PUBLIC'],
    example: 'INTERNAL',
  })
  @IsEnum(['INTERNAL', 'JOINT_TASK_FORCE', 'PUBLIC'])
  sharingScope: 'INTERNAL' | 'JOINT_TASK_FORCE' | 'PUBLIC';

  @ApiPropertyOptional({
    description: 'Agencies shared with',
    example: ['Agency A', 'Agency B'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWith?: string[];

  @ApiPropertyOptional({ description: 'Due date', example: '2024-02-15' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Case labels',
    example: ['malware', 'apt', 'critical-infrastructure'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @ApiProperty({
    description: 'Traffic Light Protocol classification',
    enum: ['RED', 'AMBER', 'GREEN', 'CLEAR'],
    example: 'AMBER',
  })
  @IsEnum(['RED', 'AMBER', 'GREEN', 'CLEAR'])
  tlp: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @ApiPropertyOptional({ description: 'SLA breach flag', example: false })
  @IsOptional()
  @IsBoolean()
  slaBreach?: boolean;

  @ApiPropertyOptional({ description: 'Geographic region', example: 'North America' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Linked case IDs',
    example: ['case-002', 'case-003'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedCaseIds?: string[];
}

export class UpdateCaseDto {
  @ApiPropertyOptional({ description: 'Case title', example: 'APT29 Intrusion Investigation' })
  @IsOptional()
  @IsString()
  title?: string;

  @ApiPropertyOptional({
    description: 'Case description',
    example: 'Investigation of suspected APT29 activity in corporate network',
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiPropertyOptional({
    description: 'Case status',
    enum: ['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'],
    example: 'IN_PROGRESS',
  })
  @IsOptional()
  @IsEnum(['OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'])
  status?: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';

  @ApiPropertyOptional({
    description: 'Case priority',
    enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
    example: 'HIGH',
  })
  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  priority?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @ApiPropertyOptional({ description: 'Assigned analyst', example: 'john.doe@example.com' })
  @IsOptional()
  @IsString()
  assignee?: string;

  @ApiPropertyOptional({ description: 'Case reporter', example: 'jane.smith@example.com' })
  @IsOptional()
  @IsString()
  reporter?: string;

  @ApiPropertyOptional({ description: 'Case tasks', type: [TaskDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TaskDto)
  tasks?: TaskDto[];

  @ApiPropertyOptional({ description: 'Investigation findings', example: 'Found malicious DLL...' })
  @IsOptional()
  @IsString()
  findings?: string;

  @ApiPropertyOptional({
    description: 'Related threat IDs',
    example: ['threat-001', 'threat-002'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  relatedThreatIds?: string[];

  @ApiPropertyOptional({ description: 'Case creation date', example: '2024-01-15T10:30:00Z' })
  @IsOptional()
  @IsString()
  created?: string;

  @ApiPropertyOptional({ description: 'Case notes', type: [NoteDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => NoteDto)
  notes?: NoteDto[];

  @ApiPropertyOptional({ description: 'Case artifacts', type: [ArtifactDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => ArtifactDto)
  artifacts?: ArtifactDto[];

  @ApiPropertyOptional({ description: 'Case timeline', type: [TimelineEventDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => TimelineEventDto)
  timeline?: TimelineEventDto[];

  @ApiPropertyOptional({ description: 'Responsible agency', example: 'Cyber Defense Team' })
  @IsOptional()
  @IsString()
  agency?: string;

  @ApiPropertyOptional({
    description: 'Sharing scope',
    enum: ['INTERNAL', 'JOINT_TASK_FORCE', 'PUBLIC'],
    example: 'INTERNAL',
  })
  @IsOptional()
  @IsEnum(['INTERNAL', 'JOINT_TASK_FORCE', 'PUBLIC'])
  sharingScope?: 'INTERNAL' | 'JOINT_TASK_FORCE' | 'PUBLIC';

  @ApiPropertyOptional({
    description: 'Agencies shared with',
    example: ['Agency A', 'Agency B'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  sharedWith?: string[];

  @ApiPropertyOptional({ description: 'Due date', example: '2024-02-15' })
  @IsOptional()
  @IsString()
  dueDate?: string;

  @ApiPropertyOptional({
    description: 'Case labels',
    example: ['malware', 'apt', 'critical-infrastructure'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  labels?: string[];

  @ApiPropertyOptional({
    description: 'Traffic Light Protocol classification',
    enum: ['RED', 'AMBER', 'GREEN', 'CLEAR'],
    example: 'AMBER',
  })
  @IsOptional()
  @IsEnum(['RED', 'AMBER', 'GREEN', 'CLEAR'])
  tlp?: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @ApiPropertyOptional({ description: 'SLA breach flag', example: false })
  @IsOptional()
  @IsBoolean()
  slaBreach?: boolean;

  @ApiPropertyOptional({ description: 'Geographic region', example: 'North America' })
  @IsOptional()
  @IsString()
  region?: string;

  @ApiPropertyOptional({
    description: 'Linked case IDs',
    example: ['case-002', 'case-003'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  linkedCaseIds?: string[];
}

export class CaseResponseDto {
  @ApiProperty({ description: 'Case ID', example: 'case-001' })
  id: string;

  @ApiProperty({ description: 'Case title', example: 'APT29 Intrusion Investigation' })
  title: string;

  @ApiPropertyOptional({ description: 'Case description' })
  description?: string;

  @ApiProperty({ description: 'Case status', example: 'OPEN' })
  status: string;

  @ApiProperty({ description: 'Case priority', example: 'HIGH' })
  priority: string;

  @ApiProperty({ description: 'Assigned analyst', example: 'john.doe@example.com' })
  assignee: string;

  @ApiProperty({ description: 'Case reporter', example: 'jane.smith@example.com' })
  reporter: string;

  @ApiPropertyOptional({ description: 'Case tasks' })
  tasks?: any[];

  @ApiPropertyOptional({ description: 'Investigation findings' })
  findings?: string;

  @ApiPropertyOptional({ description: 'Related threat IDs' })
  relatedThreatIds?: string[];

  @ApiProperty({ description: 'Creation date' })
  created: string;

  @ApiPropertyOptional({ description: 'Case notes' })
  notes?: any[];

  @ApiPropertyOptional({ description: 'Case artifacts' })
  artifacts?: any[];

  @ApiPropertyOptional({ description: 'Case timeline' })
  timeline?: any[];

  @ApiProperty({ description: 'Responsible agency' })
  agency: string;

  @ApiProperty({ description: 'Sharing scope' })
  sharingScope: string;

  @ApiPropertyOptional({ description: 'Agencies shared with' })
  sharedWith?: string[];

  @ApiPropertyOptional({ description: 'Due date' })
  dueDate?: string;

  @ApiPropertyOptional({ description: 'Case labels' })
  labels?: string[];

  @ApiProperty({ description: 'TLP classification' })
  tlp: string;

  @ApiPropertyOptional({ description: 'SLA breach flag' })
  slaBreach?: boolean;

  @ApiPropertyOptional({ description: 'Geographic region' })
  region?: string;

  @ApiPropertyOptional({ description: 'Linked case IDs' })
  linkedCaseIds?: string[];
}

export class DeleteCaseResponseDto {
  @ApiProperty({ description: 'Whether the deletion was successful', example: true })
  deleted: boolean;
}
