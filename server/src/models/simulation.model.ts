import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'simulations',
  timestamps: true,
})
export class Simulation extends Model<Simulation> {
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
  name: string;

  @Column({
    type: DataType.ENUM('Planning', 'Running', 'Completed', 'Failed'),
    allowNull: false,
    defaultValue: 'Planning',
  })
  status: 'Planning' | 'Running' | 'Completed' | 'Failed';

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  config?: any;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  results?: any;

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

  @BelongsTo(() => Case)
  case: Case;
}