
import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({ tableName: 'threats', timestamps: false })
export class Threat extends Model<Threat> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  indicator!: string;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  severity!: string;

  @Column(DataType.STRING)
  source!: string;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.INTEGER)
  score!: number;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  last_seen!: Date;

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.INTEGER)
  confidence!: number;

  @Column(DataType.STRING)
  region!: string;

  @Column(DataType.STRING)
  threat_actor!: string;

  @Column(DataType.INTEGER)
  reputation!: number;

  @Column(DataType.JSONB)
  tags!: string[];

  @Column(DataType.STRING)
  tlp!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  sanctioned!: boolean;

  @Default(false)
  @Column(DataType.BOOLEAN)
  ml_retrain!: boolean;

  @Column(DataType.STRING)
  origin!: string;
}

@Table({ tableName: 'cases', timestamps: true })
export class Case extends Model<Case> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  title!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.STRING)
  priority!: string;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.STRING)
  assignee!: string;

  @Column(DataType.STRING)
  created_by!: string;

  @Column(DataType.STRING)
  agency!: string;

  @Column(DataType.JSONB)
  related_threat_ids!: string[];

  @Column(DataType.JSONB)
  shared_with!: string[];

  @Default(false)
  @Column(DataType.BOOLEAN)
  sla_breach!: boolean;
  
  @Column(DataType.JSONB)
  timeline!: any[];
  
  @Column(DataType.JSONB)
  tasks!: any[];
}

@Table({ tableName: 'actors', timestamps: true })
export class Actor extends Model<Actor> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  origin!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.STRING)
  sophistication!: string;

  @Column(DataType.JSONB)
  targets!: string[];

  @Column(DataType.JSONB)
  aliases!: string[];

  @Column(DataType.JSONB)
  evasion_techniques!: string[]; // Critical for simulation

  @Column(DataType.JSONB)
  history!: any[];

  @Column(DataType.JSONB)
  exploits!: string[];
}

@Table({ tableName: 'campaigns', timestamps: true })
export class Campaign extends Model<Campaign> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.STRING)
  objective!: string;

  @Column(DataType.JSONB)
  actors!: string[];

  @Column(DataType.JSONB)
  target_sectors!: string[];

  @Column(DataType.JSONB)
  target_regions!: string[];

  @Column(DataType.JSONB)
  threat_ids!: string[];

  @Column(DataType.JSONB)
  ttps!: string[];

  @Column(DataType.DATE)
  first_seen!: Date;

  @Column(DataType.DATE)
  last_seen!: Date;
}
