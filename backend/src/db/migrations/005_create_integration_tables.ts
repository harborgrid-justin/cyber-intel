/**
 * Migration: Create Integration & Communication Tables
 * Tables: integrations, channels, messages
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create integrations table
  await queryInterface.createTable('integrations', {
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'SIEM, EDR, SOAR, Ticketing, Threat_Intel, etc.'
    },
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    api_key: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Encrypted API key'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      comment: 'active, inactive, error, maintenance'
    },
    last_sync: {
      type: DataTypes.DATE,
      allowNull: true,
      comment: 'Last successful sync timestamp'
    }
  });

  // Create channels table
  await queryInterface.createTable('channels', {
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
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'public, private, direct, case-specific'
    },
    topic: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Channel topic/description'
    },
    members: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Array of user IDs who are members'
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'User ID of channel creator'
    }
  });

  // Create messages table
  await queryInterface.createTable('messages', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    channel_id: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: 'channels',
        key: 'id'
      },
      onUpdate: 'CASCADE',
      onDelete: 'CASCADE'
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'User ID of message sender'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'text',
      comment: 'text, file, system, alert'
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

  // Add indexes for integrations table
  await queryInterface.addIndex('integrations', ['name'], {
    name: 'idx_integrations_name',
    unique: true
  });

  await queryInterface.addIndex('integrations', ['type'], {
    name: 'idx_integrations_type'
  });

  await queryInterface.addIndex('integrations', ['status'], {
    name: 'idx_integrations_status'
  });

  // Add indexes for channels table
  await queryInterface.addIndex('channels', ['name'], {
    name: 'idx_channels_name',
    unique: true
  });

  await queryInterface.addIndex('channels', ['type'], {
    name: 'idx_channels_type'
  });

  await queryInterface.addIndex('channels', ['created_by'], {
    name: 'idx_channels_created_by'
  });

  // Add indexes for messages table
  await queryInterface.addIndex('messages', ['channel_id'], {
    name: 'idx_messages_channel_id'
  });

  await queryInterface.addIndex('messages', ['user_id'], {
    name: 'idx_messages_user_id'
  });

  await queryInterface.addIndex('messages', ['createdAt'], {
    name: 'idx_messages_created_at'
  });

  await queryInterface.addIndex('messages', ['type'], {
    name: 'idx_messages_type'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('messages');
  await queryInterface.dropTable('channels');
  await queryInterface.dropTable('integrations');
}
