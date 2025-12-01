import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'campaigns',
  timestamps: true,
})
export class Campaign extends Model<Campaign> {
  @Column({
    type: DataType.STRING,
    primaryKey: true,
    allowNull: false,
  })
  id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.ENUM('ACTIVE', 'DORMANT', 'ARCHIVED'),
    allowNull: false,
  })
  status: 'ACTIVE' | 'DORMANT' | 'ARCHIVED';

  @Column({
    type: DataType.ENUM('ESPIONAGE', 'FINANCIAL', 'DESTRUCTION', 'INFLUENCE', 'UNKNOWN'),
    allowNull: false,
  })
  objective: 'ESPIONAGE' | 'FINANCIAL' | 'DESTRUCTION' | 'INFLUENCE' | 'UNKNOWN';

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  actors: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  firstSeen: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastSeen: string;

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  targetSectors: string[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  targetRegions: string[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  threatIds: string[];

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  ttps: string[];
}