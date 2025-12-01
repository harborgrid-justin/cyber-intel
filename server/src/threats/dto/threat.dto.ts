import { IsString, IsEnum, IsOptional, IsNumber, IsArray, IsBoolean } from 'class-validator';

export class CreateThreatDto {
  @IsString()
  id: string;

  @IsString()
  indicator: string;

  @IsString()
  type: string;

  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsString()
  lastSeen: string;

  @IsString()
  source: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsEnum(['NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'])
  status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';

  @IsNumber()
  confidence: number;

  @IsString()
  region: string;

  @IsString()
  threatActor: string;

  @IsNumber()
  reputation: number;

  @IsNumber()
  score: number;

  @IsOptional()
  @IsEnum(['RED', 'AMBER', 'GREEN', 'CLEAR'])
  tlp?: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @IsOptional()
  @IsBoolean()
  sanctioned?: boolean;

  @IsOptional()
  @IsBoolean()
  mlRetrain?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  origin?: string;
}

export class UpdateThreatDto {
  @IsOptional()
  @IsString()
  indicator?: string;

  @IsOptional()
  @IsString()
  type?: string;

  @IsOptional()
  @IsEnum(['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'])
  severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @IsOptional()
  @IsString()
  lastSeen?: string;

  @IsOptional()
  @IsString()
  source?: string;

  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsEnum(['NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'])
  status?: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';

  @IsOptional()
  @IsNumber()
  confidence?: number;

  @IsOptional()
  @IsString()
  region?: string;

  @IsOptional()
  @IsString()
  threatActor?: string;

  @IsOptional()
  @IsNumber()
  reputation?: number;

  @IsOptional()
  @IsNumber()
  score?: number;

  @IsOptional()
  @IsEnum(['RED', 'AMBER', 'GREEN', 'CLEAR'])
  tlp?: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @IsOptional()
  @IsBoolean()
  sanctioned?: boolean;

  @IsOptional()
  @IsBoolean()
  mlRetrain?: boolean;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  tags?: string[];

  @IsOptional()
  @IsString()
  origin?: string;
}