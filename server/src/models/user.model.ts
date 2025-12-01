import { Table, Column, Model, DataType, HasMany } from 'sequelize-typescript';
import { Case } from './case.model';
import { Task } from './task.model';
import { Note } from './note.model';

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
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
  username: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  role: string;

  @Column({
    type: DataType.ENUM('Active', 'Inactive', 'Suspended'),
    allowNull: false,
    defaultValue: 'Active',
  })
  status: 'Active' | 'Inactive' | 'Suspended';

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  lastLogin?: Date;

  @Column({
    type: DataType.JSON,
    allowNull: true,
  })
  preferences?: any;

  @HasMany(() => Case, 'assignedTo')
  assignedCases: Case[];

  @HasMany(() => Task, 'assignedTo')
  assignedTasks: Task[];

  @HasMany(() => Note, 'authorId')
  notes: Note[];
}