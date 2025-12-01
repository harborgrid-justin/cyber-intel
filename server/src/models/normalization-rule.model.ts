import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'normalization_rules',
  timestamps: true,
})
export class NormalizationRule extends Model<NormalizationRule> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  inputFormat: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  outputFormat: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  transformationRules?: any;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  enabled: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  priority: number;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  conditions?: any;
}