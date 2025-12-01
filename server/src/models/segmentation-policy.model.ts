import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'segmentation_policies',
  timestamps: true,
})
export class SegmentationPolicy extends Model<SegmentationPolicy> {
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
  source: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  destination: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  port: string;

  @Column({
    type: DataType.ENUM('ALLOW', 'DENY'),
    allowNull: false,
  })
  action: 'ALLOW' | 'DENY';

  @Column({
    type: DataType.ENUM('ACTIVE', 'DRAFT', 'CONFLICT'),
    allowNull: false,
  })
  status: 'ACTIVE' | 'DRAFT' | 'CONFLICT';
}