import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'chart_data_points',
  timestamps: true,
})
export class ChartDataPoint extends Model<ChartDataPoint> {
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
    type: DataType.FLOAT,
    allowNull: false,
  })
  value: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  fullMark?: number;
}