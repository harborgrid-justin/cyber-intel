import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'timeline_events',
  timestamps: true,
})
export class TimelineEvent extends Model<TimelineEvent> {
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
  date: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.ENUM('ALERT', 'ACTION', 'SYSTEM', 'TRANSFER'),
    allowNull: false,
  })
  type: 'ALERT' | 'ACTION' | 'SYSTEM' | 'TRANSFER';

  @ForeignKey(() => Case)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  caseId?: string;

  @BelongsTo(() => Case)
  case?: Case;
}