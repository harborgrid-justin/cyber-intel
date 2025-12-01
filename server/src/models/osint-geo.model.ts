import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'osint_geo',
  timestamps: true,
})
export class OsintGeo extends Model<OsintGeo> {
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
  ip: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  city: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  country: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  isp: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  asn: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  coords: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  ports?: number[];

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  threatScore: number;
}