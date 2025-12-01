import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'response_plans',
  timestamps: true,
})
export class ResponsePlan extends Model<ResponsePlan> {
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
    type: DataType.JSON,
    allowNull: false,
  })
  targetNodes: string[];

  @Column({
    type: DataType.ENUM('ISOLATION', 'PATCH', 'BLOCK_IP', 'DECEPTION'),
    allowNull: false,
  })
  type: 'ISOLATION' | 'PATCH' | 'BLOCK_IP' | 'DECEPTION';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  collateralDamageScore: number;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  businessImpact: string[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  successRate: number;

  @Column({
    type: DataType.ENUM('DRAFT', 'EXECUTING', 'COMPLETED'),
    allowNull: false,
  })
  status: 'DRAFT' | 'EXECUTING' | 'COMPLETED';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  requiredAuth?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  estimatedTTR?: string;
}