import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { AttackStep } from './attack-step.model';

@Table({
  tableName: 'attack_paths',
  timestamps: true,
})
export class AttackPath extends Model<AttackPath> {
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
  actorId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  entryPoint: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  steps: any[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  estimatedTime: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  criticalAssetCompromised: boolean;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  totalDetectionProbability: number;
}