import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'feeds',
  timestamps: true,
})
export class Feed extends Model<Feed> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  url: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'INACTIVE', 'ERROR'),
    allowNull: false,
  })
  status: 'ACTIVE' | 'INACTIVE' | 'ERROR';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  updateInterval: number;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastUpdated?: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  itemCount: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  credentials?: any;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  format?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  filters?: any;
}