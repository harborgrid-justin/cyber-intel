import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'active_defense_actions',
  timestamps: true,
})
export class ActiveDefenseAction extends Model<ActiveDefenseAction> {
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
  type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  target: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.ENUM('Planned', 'Executing', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Planned',
  })
  status: 'Planned' | 'Executing' | 'Completed' | 'Failed';

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  parameters?: any;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  results?: any;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  executedAt?: Date;

  @BelongsTo(() => Case)
  case: Case;
}