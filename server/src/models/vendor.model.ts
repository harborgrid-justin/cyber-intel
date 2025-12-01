import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { SupplyChainRisk } from './supply-chain-risk.model';

@Table({
  tableName: 'vendors',
  timestamps: true,
})
export class Vendor extends Model<Vendor> {
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
    allowNull: true,
  })
  website?: string;

  @Column({
    type: DataType.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium',
  })
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  products?: string[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastAssessed?: Date;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
    defaultValue: false,
  })
  monitored: boolean;

  @HasMany(() => SupplyChainRisk)
  risks: SupplyChainRisk[];
}