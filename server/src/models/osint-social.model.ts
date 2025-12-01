import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'osint_social',
  timestamps: true,
})
export class OsintSocial extends Model<OsintSocial> {
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
  handle: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  platform: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  status: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  followers: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastPost: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  sentiment: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  bio?: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  priorityScore?: number;
}