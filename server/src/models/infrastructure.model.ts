import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'infrastructures',
  timestamps: true,
})
export class Infrastructure extends Model<Infrastructure> {
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
  value: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'DOWN'),
    allowNull: false,
  })
  status: 'ACTIVE' | 'DOWN';
}