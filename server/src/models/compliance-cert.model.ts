import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'compliance_certs',
  timestamps: true,
})
export class ComplianceCert extends Model<ComplianceCert> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.ENUM('SOC2', 'ISO27001', 'GDPR', 'HIPAA', 'FEDRAMP'),
    allowNull: false,
  })
  standard: 'SOC2' | 'ISO27001' | 'GDPR' | 'HIPAA' | 'FEDRAMP';

  @Column({
    type: DataType.ENUM('VALID', 'EXPIRED', 'PENDING'),
    allowNull: false,
  })
  status: 'VALID' | 'EXPIRED' | 'PENDING';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  expiry: string;
}