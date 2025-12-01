import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'tasks',
  timestamps: true,
})
export class Task extends Model<Task> {
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
  title: string;

  @Column({
    type: DataType.ENUM('PENDING', 'DONE', 'SKIPPED'),
    allowNull: false,
  })
  status: 'PENDING' | 'DONE' | 'SKIPPED';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  assignee?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  dueDate?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  dependsOn?: string[];

  @ForeignKey(() => Case)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  caseId?: string;

  @BelongsTo(() => Case)
  case?: Case;
}