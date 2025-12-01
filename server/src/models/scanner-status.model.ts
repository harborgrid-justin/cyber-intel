import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'scanner_status',
  timestamps: true,
})
export class ScannerStatus extends Model<ScannerStatus> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastScan: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  coverage: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  findings: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  healthScore?: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  licenseExpiry?: string;
}