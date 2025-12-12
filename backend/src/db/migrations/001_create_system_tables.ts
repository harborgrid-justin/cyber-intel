/**
 * Migration: Create System Tables
 * Tables: organizations, permissions, roles, role_permissions, users
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create organizations table
  await queryInterface.createTable('organizations', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    parent_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    path: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Hierarchical path (e.g., /root/child/grandchild)'
    }
  });

  // Create permissions table
  await queryInterface.createTable('permissions', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    resource: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Resource name (e.g., threats, cases, reports)'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Action (e.g., read, write, delete, execute)'
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false
    }
  });

  // Create roles table
  await queryInterface.createTable('roles', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    parent_role_id: {
      type: DataTypes.STRING,
      allowNull: true,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'SET NULL'
    },
    ad_group_mapping: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Active Directory group mapping'
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Create role_permissions junction table
  await queryInterface.createTable('role_permissions', {
    role_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    permission_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'permissions',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    }
  });

  // Create users table
  await queryInterface.createTable('users', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true
    },
    role_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'roles',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    organization_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'organizations',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'RESTRICT'
    },
    clearance: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Security clearance level (UNCLASSIFIED, CONFIDENTIAL, SECRET, TOP_SECRET)'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      comment: 'User status (active, inactive, suspended)'
    },
    is_vip: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ad_sid: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Active Directory Security Identifier'
    },
    last_login: {
      type: DataTypes.DATE,
      allowNull: true
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Add indexes for system tables
  await queryInterface.addIndex('organizations', ['parent_id'], {
    name: 'idx_organizations_parent_id'
  });

  await queryInterface.addIndex('organizations', ['path'], {
    name: 'idx_organizations_path'
  });

  await queryInterface.addIndex('permissions', ['resource', 'action'], {
    name: 'idx_permissions_resource_action',
    unique: true
  });

  await queryInterface.addIndex('roles', ['name'], {
    name: 'idx_roles_name',
    unique: true
  });

  await queryInterface.addIndex('role_permissions', ['role_id', 'permission_id'], {
    name: 'idx_role_permissions_composite',
    unique: true
  });

  await queryInterface.addIndex('users', ['username'], {
    name: 'idx_users_username',
    unique: true
  });

  await queryInterface.addIndex('users', ['email'], {
    name: 'idx_users_email',
    unique: true
  });

  await queryInterface.addIndex('users', ['role_id'], {
    name: 'idx_users_role_id'
  });

  await queryInterface.addIndex('users', ['organization_id'], {
    name: 'idx_users_organization_id'
  });

  await queryInterface.addIndex('users', ['status'], {
    name: 'idx_users_status'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('users');
  await queryInterface.dropTable('role_permissions');
  await queryInterface.dropTable('roles');
  await queryInterface.dropTable('permissions');
  await queryInterface.dropTable('organizations');
}
