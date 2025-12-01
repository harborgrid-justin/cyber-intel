import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'sbom_components',
  timestamps: true,
})
export class SbomComponent extends Model<SbomComponent> {
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
    type: DataType.STRING,
    allowNull: false,
  })
  version: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  license: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  vulnerabilities: number;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: false,
  })
  critical: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  outdated?: boolean;
}