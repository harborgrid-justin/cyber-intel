import { Table, Column, Model, DataType, BelongsTo, ForeignKey } from 'sequelize-typescript';
import { Case } from './case.model';

@Table({
  tableName: 'evidence',
  timestamps: true,
})
export class Evidence extends Model<Evidence> {
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
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  collectedAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  hash?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  size: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metadata?: any;

  @Column({
    type: DataType.ENUM('VERIFIED', 'PENDING', 'REJECTED'),
    allowNull: false,
  })
  status: 'VERIFIED' | 'PENDING' | 'REJECTED';

  @ForeignKey(() => Case)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  caseId?: string;

  @BelongsTo(() => Case)
  case?: Case;
}