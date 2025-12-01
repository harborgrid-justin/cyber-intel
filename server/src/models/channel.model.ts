import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { TeamMessage } from './team-message.model';

@Table({
  tableName: 'channels',
  timestamps: true,
})
export class Channel extends Model<Channel> {
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
    type: DataType.ENUM('PUBLIC', 'PRIVATE', 'DM', 'WAR_ROOM'),
    allowNull: false,
  })
  type: 'PUBLIC' | 'PRIVATE' | 'DM' | 'WAR_ROOM';

  @Column({
    type: DataType.JSON,
    allowNull: false,
  })
  members: string[];

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  topic?: string;

  @HasMany(() => TeamMessage)
  messages: TeamMessage[];
}