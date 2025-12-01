import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Evidence } from './evidence.model';

@Table({
  tableName: 'cases',
  timestamps: true,
})
export class Case extends Model<Case> {
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
    type: DataType.TEXT,
    allowNull: true,
  })
  description?: string;

  @Column({
    type: DataType.ENUM('OPEN', 'IN_PROGRESS', 'PENDING_REVIEW', 'CLOSED'),
    allowNull: false,
  })
  status: 'OPEN' | 'IN_PROGRESS' | 'PENDING_REVIEW' | 'CLOSED';

  @Column({
    type: DataType.ENUM('LOW', 'MEDIUM', 'HIGH', 'CRITICAL'),
    allowNull: false,
  })
  priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  assignee: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  reporter: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  tasks?: any[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  findings?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  relatedThreatIds?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  created: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  notes?: any[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  artifacts?: any[];

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  timeline?: any[];

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  agency: string;

  @Column({
    type: DataType.ENUM('INTERNAL', 'JOINT_TASK_FORCE', 'PUBLIC'),
    allowNull: false,
  })
  sharingScope: 'INTERNAL' | 'JOINT_TASK_FORCE' | 'PUBLIC';

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  sharedWith?: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  dueDate?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  labels?: string[];

  @Column({
    type: DataType.ENUM('RED', 'AMBER', 'GREEN', 'CLEAR'),
    allowNull: false,
  })
  tlp: 'RED' | 'AMBER' | 'GREEN' | 'CLEAR';

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  slaBreach?: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  region?: string;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  linkedCaseIds?: string[];

  @HasMany(() => Evidence)
  evidence: Evidence[];
}