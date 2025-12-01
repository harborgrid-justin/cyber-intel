import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'nist_controls',
  timestamps: true,
})
export class NistControl extends Model<NistControl> {
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
  family: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.ENUM('IMPLEMENTED', 'PARTIAL', 'PLANNED', 'FAILED'),
    allowNull: false,
  })
  status: 'IMPLEMENTED' | 'PARTIAL' | 'PLANNED' | 'FAILED';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastAudit: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;
}