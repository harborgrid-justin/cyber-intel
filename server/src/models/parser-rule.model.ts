import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'parser_rules',
  timestamps: true,
})
export class ParserRule extends Model<ParserRule> {
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
  pattern: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  sourceType: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  extractionRules?: any;

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
  tags?: string[];
}