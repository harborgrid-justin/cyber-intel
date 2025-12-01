import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'vendor_accesses',
  timestamps: true,
})
export class VendorAccess extends Model<VendorAccess> {
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
  systemId: string;

  @Column({
    type: DataType.ENUM('READ', 'WRITE', 'ADMIN'),
    allowNull: false,
  })
  accessLevel: 'READ' | 'WRITE' | 'ADMIN';

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  accountCount: number;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  lastAudit?: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
  })
  mfaEnabled?: boolean;
}