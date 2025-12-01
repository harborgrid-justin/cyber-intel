import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'compliance_items',
  timestamps: true,
})
export class ComplianceItem extends Model<ComplianceItem> {
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
  framework: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  controlId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  title: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  description: string;

  @Column({
    type: DataType.ENUM('Compliant', 'Non-Compliant', 'Not-Applicable', 'Compensated'),
    allowNull: false,
    defaultValue: 'Not-Applicable',
  })
  status: 'Compliant' | 'Non-Compliant' | 'Not-Applicable' | 'Compensated';

  @Column({
    type: DataType.ENUM('Low', 'Medium', 'High', 'Critical'),
    allowNull: false,
    defaultValue: 'Medium',
  })
  severity: 'Low' | 'Medium' | 'High' | 'Critical';

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  evidence?: string[];

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastAssessed?: Date;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  remediation?: string;
}