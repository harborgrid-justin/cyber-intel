
import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({ tableName: 'audit_logs', timestamps: false })
export class AuditLog extends Model<AuditLog> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  user_id!: string;

  @Column(DataType.STRING)
  action!: string;

  @Column(DataType.TEXT)
  details!: string;

  @Column(DataType.STRING)
  resource_id!: string;

  @Column(DataType.STRING)
  ip_address!: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  timestamp!: Date;
}

@Table({ tableName: 'reports', timestamps: false })
export class Report extends Model<Report> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  author!: string;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.TEXT)
  content!: string;

  @Column(DataType.STRING)
  related_case_id!: string;
  
  @Column(DataType.STRING)
  related_actor_id!: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  date!: Date;
}

@Table({ tableName: 'playbooks', timestamps: false })
export class Playbook extends Model<Playbook> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.JSONB)
  tasks!: string[];

  @Column(DataType.STRING)
  trigger_label!: string;

  @Column(DataType.STRING)
  status!: string;

  @Default(0)
  @Column(DataType.INTEGER)
  usage_count!: number;

  @Default(0)
  @Column(DataType.INTEGER)
  skip_count!: number;

  @Default('LOW')
  @Column(DataType.STRING)
  risk_level!: string;
}

@Table({ tableName: 'artifacts', timestamps: false })
export class Artifact extends Model<Artifact> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  hash!: string;

  @Column(DataType.STRING)
  original_hash!: string; // For integrity verification

  @Column(DataType.STRING)
  size!: string;

  @Column(DataType.STRING)
  uploaded_by!: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  upload_date!: Date;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.STRING)
  case_id!: string;
}

@Table({ tableName: 'chain_events', timestamps: false })
export class ChainEvent extends Model<ChainEvent> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  artifact_id!: string;

  @Column(DataType.STRING)
  artifact_name!: string; // Denormalized for speed

  @Column(DataType.STRING)
  action!: string;

  @Column(DataType.STRING)
  user_id!: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  timestamp!: Date;

  @Column(DataType.TEXT)
  notes!: string;
}
