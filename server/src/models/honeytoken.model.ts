import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'honeytokens',
  timestamps: true,
})
export class Honeytoken extends Model<Honeytoken> {
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
    type: DataType.ENUM('FILE', 'CREDENTIAL', 'SERVICE'),
    allowNull: false,
  })
  type: 'FILE' | 'CREDENTIAL' | 'SERVICE';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  location: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'TRIGGERED', 'DORMANT'),
    allowNull: false,
  })
  status: 'ACTIVE' | 'TRIGGERED' | 'DORMANT';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastTriggered?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  effectiveness?: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  deploymentDate?: string;
}