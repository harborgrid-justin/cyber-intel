import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'patch_prioritizations',
  timestamps: true,
})
export class PatchPrioritization extends Model<PatchPrioritization> {
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
  vulnId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  assetId: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  score: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  reason: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  cvss: number;

  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  })
  businessCriticality: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}