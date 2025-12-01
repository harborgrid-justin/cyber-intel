import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'vip_profiles',
  timestamps: true,
})
export class VIPProfile extends Model<VIPProfile> {
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
  userId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  doxxingProb: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  phishingSusceptibility: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  exposedCreds: number;

  @Column({
    type: DataType.ENUM('Neutral', 'Negative', 'Hostile'),
    allowNull: false,
  })
  sentiment: 'Neutral' | 'Negative' | 'Hostile';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  recentMentions: number;
}