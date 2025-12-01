import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'sla_statuses',
  timestamps: true,
})
export class SlaStatus extends Model<SlaStatus> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.ENUM('ON_TRACK', 'WARNING', 'BREACHED'),
    allowNull: false,
  })
  status: 'ON_TRACK' | 'WARNING' | 'BREACHED';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  daysRemaining: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  dueDate: string;
}