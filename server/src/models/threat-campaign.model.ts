import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Threat } from './threat.model';
import { Campaign } from './campaign.model';

@Table({
  tableName: 'threat_campaigns',
  timestamps: true,
})
export class ThreatCampaign extends Model<ThreatCampaign> {
  @Column({
    type: DataType.INTEGER,
    autoIncrement: true,
    primaryKey: true,
  })
  id: number;

  @ForeignKey(() => Threat)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  threatId: string;

  @ForeignKey(() => Campaign)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  campaignId: string;

  @Column({
    type: DataType.ENUM('Primary', 'Secondary', 'Related'),
    allowNull: false,
    defaultValue: 'Related',
  })
  relationship: 'Primary' | 'Secondary' | 'Related';

  @BelongsTo(() => Threat)
  threat: Threat;

  @BelongsTo(() => Campaign)
  campaign: Campaign;
}