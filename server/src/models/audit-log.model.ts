import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'audit_logs',
  timestamps: true,
})
export class AuditLog extends Model<AuditLog> {
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
  action: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  user: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  timestamp: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  details?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  location?: string;
}