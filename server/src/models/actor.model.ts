import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'actors',
  timestamps: true,
})
export class Actor extends Model<Actor> {
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
    type: DataType.JSON,
    allowNull: true,
  })
  aliases?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  origin: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.ENUM('Advanced', 'Intermediate', 'Novice'),
    allowNull: false,
  })
  sophistication: 'Advanced' | 'Intermediate' | 'Novice';

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  targets?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  ttps?: any[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  campaigns?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  infrastructure?: any[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  exploits?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  references?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  history?: any[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  relatedActors?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  campaignDates?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  evasionTechniques?: string[];
}