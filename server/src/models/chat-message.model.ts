import { Table, Column, Model, DataType } from 'sequelize-typescript';

@Table({
  tableName: 'chat_messages',
  timestamps: true,
})
export class ChatMessage extends Model<ChatMessage> {
  @Column({
    type: DataType.STRING,
    allowNull: false,
    primaryKey: true,
  })
  id: string;

  @Column({
    type: DataType.ENUM('user', 'model'),
    allowNull: false,
  })
  role: 'user' | 'model';

  @Column({
    type: DataType.TEXT,
    allowNull: false,
  })
  text: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: false,
  })
  timestamp: number;
}