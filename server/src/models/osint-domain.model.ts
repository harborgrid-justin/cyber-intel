import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'osint_domains',
  timestamps: true,
})
export class OsintDomain extends Model<OsintDomain> {
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
  domain: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  registrar: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  created: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  expires: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  dns: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  subdomains?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  ssl: string;
}