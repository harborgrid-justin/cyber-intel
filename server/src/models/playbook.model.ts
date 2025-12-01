import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'playbooks',
  timestamps: true,
})
export class Playbook extends Model<Playbook> {
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
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  tasks?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  triggerLabel?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  usageCount?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  skipCount?: number;

  @Column({
    type: DataType.ENUM('ACTIVE', 'DEPRECATED'),
    allowNull: true,
  })
  status?: 'ACTIVE' | 'DEPRECATED';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  estimatedDuration?: string;

  @Column({
    type: DataType.ENUM('LOW', 'MODERATE', 'HIGH'),
    allowNull: true,
  })
  riskLevel?: 'LOW' | 'MODERATE' | 'HIGH';
}