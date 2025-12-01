import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'enrichment_modules',
  timestamps: true,
})
export class EnrichmentModule extends Model<EnrichmentModule> {
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
    type: DataType.ENUM('ACTIVE', 'DISABLED', 'ERROR'),
    allowNull: false,
  })
  status: 'ACTIVE' | 'DISABLED' | 'ERROR';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  configuration?: any;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  priority: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastRun?: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  successCount: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  errorCount: number;
}