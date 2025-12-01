import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'osint_breaches',
  timestamps: true,
})
export class OsintBreach extends Model<OsintBreach> {
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
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  breach: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  date: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  data: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  hash: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source: string;
}