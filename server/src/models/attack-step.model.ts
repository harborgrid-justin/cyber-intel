import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'attack_steps',
  timestamps: true,
})
export class AttackStep extends Model<AttackStep> {
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
  stage: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  node?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  method: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  successProbability: number;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.FLOAT,
    allowNull: true,
  })
  detectionRisk?: number;
}