import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'detections',
  timestamps: true,
})
export class Detection extends Model<Detection> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ruleId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ruleName: string;

  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  })
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  conditions?: any;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  actions?: any;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  enabled: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  threshold: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  category: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
  })
  lastTriggered: Date;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  triggerCount: number;
}