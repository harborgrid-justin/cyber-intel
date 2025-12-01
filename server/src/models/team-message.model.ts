import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Channel } from './channel.model';

@Table({
  tableName: 'team_messages',
  timestamps: true,
})
export class TeamMessage extends Model<TeamMessage> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @ForeignKey(() => Channel)
  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  channelId: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  userId: string;

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  content: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  timestamp: string;

  @Column({
    type: DataType.ENUM('TEXT', 'SYSTEM', 'ALERT'),
    allowNull: false,
  })
  type: 'TEXT' | 'SYSTEM' | 'ALERT';

  @BelongsTo(() => Channel)
  channel: Channel;
}