import { Table, Column, Model, DataType, ForeignKey, BelongsTo } from 'sequelize-typescript';
import { Actor } from './actor.model';

@Table({
  tableName: 'actor_histories',
  timestamps: true,
})
export class ActorHistory extends Model<ActorHistory> {
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
  date: string;

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

  @ForeignKey(() => Actor)
  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  actorId?: string;

  @BelongsTo(() => Actor)
  actor?: Actor;
}