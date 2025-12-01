import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'system_nodes',
  timestamps: true,
})
export class SystemNode extends Model<SystemNode> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.ENUM('ONLINE', 'OFFLINE', 'DEGRADED', 'ISOLATED'),
    allowNull: false,
  })
  status: 'ONLINE' | 'OFFLINE' | 'DEGRADED' | 'ISOLATED';

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  load: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  latency: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  type?: 'Database' | 'Sensor' | 'Server' | 'Firewall' | 'Workstation';

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  vulnerabilities?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  vendor?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  criticalProcess?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  dependencies?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  securityControls: ('EDR' | 'AV' | 'DLP' | 'FIREWALL' | 'SIEM_AGENT')[];

  @Column({
    type: DataType.ENUM('PUBLIC', 'INTERNAL', 'CONFIDENTIAL', 'RESTRICTED'),
    allowNull: false,
  })
  dataSensitivity: 'PUBLIC' | 'INTERNAL' | 'CONFIDENTIAL' | 'RESTRICTED';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  dataVolumeGB: number;

  @Column({
    type: DataType.ENUM('DMZ', 'PROD', 'DEV', 'CORP'),
    allowNull: true,
  })
  segment?: 'DMZ' | 'PROD' | 'DEV' | 'CORP';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  networkConnections?: number;
}