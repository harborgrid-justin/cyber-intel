import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'ttps',
  timestamps: true,
})
export class TTP extends Model<TTP> {
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
  code: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;
}