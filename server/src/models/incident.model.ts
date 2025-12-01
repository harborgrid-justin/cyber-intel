import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'incidents',
  timestamps: true,
})
export class Incident extends Model<Incident> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.ENUM('OPEN', 'INVESTIGATING', 'CONTAINED', 'CLOSED'),
    allowNull: false,
  })
  status: 'OPEN' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';

  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  })
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  category: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  detectedAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  assignedTo: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  affectedAssets?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  impact?: any;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  resolution?: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  resolvedAt?: Date;

  @HasMany(() => Case)
  cases: Case[];
}