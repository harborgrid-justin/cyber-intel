import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'integrations',
  timestamps: true,
})
export class Integration extends Model<Integration> {
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
    type: DataType.ENUM('Connected', 'Disconnected', 'Limited'),
    allowNull: false,
  })
  status: 'Connected' | 'Disconnected' | 'Limited';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;
}