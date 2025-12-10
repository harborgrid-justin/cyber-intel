
import { Table, Column, Model, DataType, PrimaryKey, Default, ForeignKey, BelongsTo, BelongsToMany, HasMany } from 'sequelize-typescript';

@Table({ tableName: 'organizations', timestamps: false })
export class Organization extends Model<Organization> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  parent_id?: string;

  @Column(DataType.STRING)
  path!: string; 
}

@Table({ tableName: 'permissions', timestamps: false })
export class Permission extends Model<Permission> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string; 

  @Column(DataType.STRING)
  resource!: string; 

  @Column(DataType.STRING)
  action!: string; 

  @Column(DataType.STRING)
  description!: string;
}

@Table({ tableName: 'roles', timestamps: true })
export class Role extends Model<Role> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.TEXT)
  description!: string;

  @Column(DataType.STRING)
  parent_role_id?: string; 

  @Column(DataType.STRING)
  ad_group_mapping?: string; 

  @BelongsToMany(() => Permission, () => RolePermission)
  permissions!: Permission[];
}

@Table({ tableName: 'role_permissions', timestamps: false })
export class RolePermission extends Model<RolePermission> {
  @ForeignKey(() => Role)
  @Column
  role_id!: string;

  @ForeignKey(() => Permission)
  @Column
  permission_id!: string;
}

@Table({ tableName: 'users', timestamps: true })
export class User extends Model<User> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  username!: string;

  @ForeignKey(() => Role)
  @Column(DataType.STRING)
  role_id!: string;

  @BelongsTo(() => Role)
  role!: Role;

  @ForeignKey(() => Organization)
  @Column(DataType.STRING)
  organization_id!: string;

  @Column(DataType.STRING)
  clearance!: string; 

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.STRING)
  email!: string;

  @Default(false)
  @Column(DataType.BOOLEAN)
  is_vip!: boolean;

  @Column(DataType.STRING)
  ad_sid?: string; 

  @Column(DataType.DATE)
  last_login!: Date;
}

@Table({ tableName: 'integrations', timestamps: false })
export class Integration extends Model<Integration> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  url!: string;

  @Column(DataType.STRING)
  api_key!: string;

  @Column(DataType.STRING)
  status!: string;

  @Column(DataType.DATE)
  last_sync!: Date;
}

@Table({ tableName: 'channels', timestamps: false })
export class Channel extends Model<Channel> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  name!: string;

  @Column(DataType.STRING)
  type!: string;

  @Column(DataType.STRING)
  topic!: string;

  @Column(DataType.JSONB)
  members!: string[];

  @Column(DataType.STRING)
  created_by!: string;
}

@Table({ tableName: 'messages', timestamps: true })
export class Message extends Model<Message> {
  @PrimaryKey
  @Column(DataType.STRING)
  id!: string;

  @Column(DataType.STRING)
  channel_id!: string;

  @Column(DataType.STRING)
  user_id!: string;

  @Column(DataType.TEXT)
  content!: string;
  
  @Column(DataType.STRING)
  type!: string;
}
