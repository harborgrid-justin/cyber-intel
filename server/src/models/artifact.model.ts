import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'artifacts',
  timestamps: true,
})
export class Artifact extends Model<Artifact> {
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
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  size: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  hash: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  uploadedBy: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  uploadDate: string;

  @Column({
    type: DataType.ENUM('SECURE', 'CHECKED_OUT', 'ARCHIVED', 'COMPROMISED'),
    allowNull: true,
  })
  status?: 'SECURE' | 'CHECKED_OUT' | 'ARCHIVED' | 'COMPROMISED';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  originalHash?: string;

  @ForeignKey(() => Case)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  caseId?: string;

  @BelongsTo(() => Case)
  case?: Case;
}