import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'osint_file_meta',
  timestamps: true,
})
export class OsintFileMeta extends Model<OsintFileMeta> {
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
  size: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  author: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  created: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  gps: string;
}