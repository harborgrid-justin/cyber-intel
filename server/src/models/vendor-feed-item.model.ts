import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'vendor_feed_items',
  timestamps: true,
})
export class VendorFeedItem extends Model<VendorFeedItem> {
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
  vendor: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  date: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  severity: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  matchedAssets?: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  cveIds?: string[];
}