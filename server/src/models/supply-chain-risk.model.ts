import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Vendor } from './vendor.model';

@Table({
  tableName: 'supply_chain_risks',
  timestamps: true,
})
export class SupplyChainRisk extends Model<SupplyChainRisk> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Vendor)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  vendorId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  component: string;

  @Column({
    type: DataType.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
  })
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  mitigation?: string[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  discoveredAt?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  resolved: boolean;

  @BelongsTo(() => Vendor)
  vendor: Vendor;
}