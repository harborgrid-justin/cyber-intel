import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'system_health',
  timestamps: true,
})
export class SystemHealth extends Model<SystemHealth> {
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
  component: string;

  @Column({
    type: DataType.ENUM('Healthy', 'Degraded', 'Unhealthy', 'Unknown'),
    allowNull: false,
  })
  status: 'Healthy' | 'Degraded' | 'Unhealthy' | 'Unknown';

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  uptime?: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  responseTime?: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  metrics?: any;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastChecked: Date;
}