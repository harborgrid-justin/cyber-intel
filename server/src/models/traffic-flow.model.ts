import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'traffic_flows',
  timestamps: true,
})
export class TrafficFlow extends Model<TrafficFlow> {
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
  source: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  dest: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  port: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  allowed: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  timestamp: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  policyMatched?: string;
}