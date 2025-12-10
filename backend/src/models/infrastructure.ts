
import { Table, Column, Model, DataType, PrimaryKey, Default } from 'sequelize-typescript';

@Table({ tableName: 'assets', timestamps: false })
export class Asset extends Model<Asset> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  ip_address!: string;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.STRING)
  criticality!: string;

  @Column(DataType.STRING)
  owner!: string;

  @Default(DataType.NOW)
  @Column(DataType.DATE)
  last_seen!: Date;

  // --- Enhanced Metrics for Dashboard & Simulation ---
  
  @Default(0)
  @Column(DataType.INTEGER)
  load!: number; // CPU/Mem Load %

  @Default(0)
  @Column(DataType.INTEGER)
  latency!: number; // ms

  @Default([])
  @Column(DataType.JSONB)
  security_controls!: string[]; // e.g. ['EDR', 'FIREWALL', 'DLP']

  @Default('INTERNAL')
  @Column(DataType.STRING)
  data_sensitivity!: string; // PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED

  @Default(0)
  @Column(DataType.FLOAT)
  data_volume_gb!: number; // For Exfil physics
}

@Table({ tableName: 'vulnerabilities', timestamps: false })
export class Vulnerability extends Model<Vulnerability> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string; // CVE ID

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.FLOAT)
  score!: number;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.STRING)
  vendor!: string;

  @Column(DataType.STRING)
  vectors!: string; // Network, Local, Physical

  @Column(DataType.BOOLEAN)
  zero_day!: boolean;

  @Column(DataType.BOOLEAN)
  exploited!: boolean;

  @Column(DataType.JSONB)
  affected_assets!: string[];
  
  @Default(false)
  @Column(DataType.BOOLEAN)
  kill_chain_ready!: boolean;
}

@Table({ tableName: 'feeds', timestamps: false })
export class Feed extends Model<Feed> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  url!: string;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.INTEGER)
  interval_min!: number;

  @Column(DataType.DATE)
  last_sync!: Date;

  @Column(DataType.JSONB)
  configuration?: any;
  
  @Default(0)
  @Column(DataType.INTEGER)
  error_count!: number;
}

@Table({ tableName: 'vendors', timestamps: false })
export class Vendor extends Model<Vendor> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  product!: string;

  @Column(DataType.STRING)
  tier!: string;

  @Column(DataType.STRING)
  category!: string;

  @Column(DataType.INTEGER)
  risk_score!: number;

  @Column(DataType.STRING)
  hq_location!: string;

  @Column(DataType.JSONB)
  subcontractors!: string[]; // Downstream dependencies

  @Column(DataType.JSONB)
  compliance!: any[]; // Array of cert objects

  @Column(DataType.JSONB)
  access!: any[]; // Access privileges

  @Column(DataType.JSONB)
  sbom!: any[]; // Software components
}
