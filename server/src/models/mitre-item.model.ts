import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'mitre_items',
  timestamps: true,
})
export class MitreItem extends Model<MitreItem> {
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
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  url?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  parent?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  type?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  aliases?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  tactic?: string;
}