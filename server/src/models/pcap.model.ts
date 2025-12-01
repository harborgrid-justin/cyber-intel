import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'pcaps',
  timestamps: true,
})
export class Pcap extends Model<Pcap> {
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
  date: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  protocol: string;

  @Column({
    type: DataType.ENUM('PENDING', 'ANALYZED'),
    allowNull: false,
  })
  analysisStatus: 'PENDING' | 'ANALYZED';

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  associatedActor?: string;
}