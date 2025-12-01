import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'chain_events',
  timestamps: true,
})
export class ChainEvent extends Model<ChainEvent> {
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
  artifactId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  artifactName: string;

  @Column({
    type: DataType.ENUM('CHECK_IN', 'CHECK_OUT', 'TRANSFER', 'ANALYSIS', 'ARCHIVE'),
    allowNull: false,
  })
  action: 'CHECK_IN' | 'CHECK_OUT' | 'TRANSFER' | 'ANALYSIS' | 'ARCHIVE';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  user: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  notes?: string;
}