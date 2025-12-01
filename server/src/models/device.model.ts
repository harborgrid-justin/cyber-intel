import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'devices',
  timestamps: true,
})
export class Device extends Model<Device> {
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
    type: DataType.ENUM('Mobile', 'Laptop', 'Server', 'Drive'),
    allowNull: false,
  })
  type: 'Mobile' | 'Laptop' | 'Server' | 'Drive';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  serial: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  custodian: string;

  @Column({
    type: DataType.ENUM('SECURE', 'ANALYSIS', 'RELEASED', 'QUARANTINED'),
    allowNull: false,
  })
  status: 'SECURE' | 'ANALYSIS' | 'RELEASED' | 'QUARANTINED';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  missedPatches?: number;
}