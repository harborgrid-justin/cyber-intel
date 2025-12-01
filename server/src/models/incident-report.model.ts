import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'incident_reports',
  timestamps: true,
})
export class IncidentReport extends Model<IncidentReport> {
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
  title: string;

  @Column({
    type: DataType.ENUM('Executive', 'Forensic', 'Compliance', 'Technical'),
    allowNull: false,
  })
  type: 'Executive' | 'Forensic' | 'Compliance' | 'Technical';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  date: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  author: string;

  @Column({
    type: DataType.ENUM('DRAFT', 'READY', 'ARCHIVED'),
    allowNull: false,
  })
  status: 'DRAFT' | 'READY' | 'ARCHIVED';

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  content?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  relatedCaseId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  relatedActorId?: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  relatedThreatId?: string;
}