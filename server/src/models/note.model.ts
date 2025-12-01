import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'notes',
  timestamps: true,
})
export class Note extends Model<Note> {
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
  author: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  date: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  isInternal: boolean;

  @ForeignKey(() => Case)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  caseId?: string;

  @BelongsTo(() => Case)
  case?: Case;
}