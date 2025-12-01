import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'osint_results',
  timestamps: true,
})
export class OsintResult extends Model<OsintResult> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Case)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  caseId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: any;

  @Column({
    type: DataType.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Low',
  })
  confidence: 'Low' | 'Medium' | 'High' | 'Critical';

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  collectedAt: Date;

  @BelongsTo(() => Case)
  case: Case;
}