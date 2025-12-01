import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'audit_artifacts',
  timestamps: true,
})
export class AuditArtifact extends Model<AuditArtifact> {
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
  controlId: string;

  @Column({
    type: DataType.ENUM('SCREENSHOT', 'LOG', 'POLICY'),
    allowNull: false,
  })
  type: 'SCREENSHOT' | 'LOG' | 'POLICY';

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  timestamp: string;
}