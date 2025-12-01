import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'forensic_jobs',
  timestamps: true,
})
export class ForensicJob extends Model<ForensicJob> {
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
    type: DataType.ENUM('PENDING', 'RUNNING', 'COMPLETED', 'FAILED'),
    allowNull: false,
  })
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  target: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  parameters?: any;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  startedAt?: Date;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  completedAt?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  result?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  priority: number;
}