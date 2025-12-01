import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'ttp_defs',
  timestamps: true,
})
export class TTPDef extends Model<TTPDef> {
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
    type: DataType.ENUM('Recon', 'Access', 'Execution', 'Persistence', 'C2', 'Exfil'),
    allowNull: false,
  })
  stage: 'Recon' | 'Access' | 'Execution' | 'Persistence' | 'C2' | 'Exfil';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  noise: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  cost: number;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  baseSuccess: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  mitreId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  desc: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  requires?: string[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  synergy?: string[];
}