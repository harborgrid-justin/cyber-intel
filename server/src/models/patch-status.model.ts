import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'patch_status',
  timestamps: true,
})
export class PatchStatus extends Model<PatchStatus> {
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
  system: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  total: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  patched: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  compliance: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  criticalPending: number;
}