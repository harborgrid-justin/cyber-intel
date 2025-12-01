import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'threats',
  timestamps: true,
})
export class Threat extends Model<Threat> {
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
  indicator: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  type: string;

  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  })
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  lastSeen: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  source: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.ENUM('NEW', 'INVESTIGATING', 'CONTAINED', 'CLOSED'),
    allowNull: false,
  })
  status: 'NEW' | 'INVESTIGATING' | 'CONTAINED' | 'CLOSED';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  confidence: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  region: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  threatActor: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  reputation: number;

  @Column({
    type: DataType.FLOAT,
    allowNull: false,
  })
  score: number;

  @Column({
    type: DataType.ENUM('RED', 'AMBER', 'GREEN', 'CLEAR'),
    allowNull: true,
  })
  tlp?: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  sanctioned?: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  mlRetrain?: boolean;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  tags?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  origin?: string;
}