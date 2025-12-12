/**
 * Migration: Create Operations Tables
 * Tables: audit_logs, reports, playbooks, artifacts, chain_events
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create audit_logs table
  await queryInterface.createTable('audit_logs', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'User who performed the action'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Action performed (CREATE, READ, UPDATE, DELETE, EXECUTE)'
    },
    details: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Detailed description of the action'
    },
    resource_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'ID of the affected resource'
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'IP address of the user'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Create reports table
  await queryInterface.createTable('reports', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'incident, threat_intel, vulnerability, executive, tactical'
    },
    author: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'User ID of the report author'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'draft',
      comment: 'draft, review, published, archived'
    },
    content: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: 'Report content (markdown or HTML)'
    },
    related_case_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Related case ID'
    },
    related_actor_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Related threat actor ID'
    },
    date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    }
  });

  // Create playbooks table
  await queryInterface.createTable('playbooks', {
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
    tasks: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'List of tasks/steps in the playbook'
    },
    trigger_label: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Trigger condition label'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      comment: 'active, inactive, testing'
    },
    usage_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of times playbook has been executed'
    },
    skip_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Number of times playbook was skipped'
    },
    risk_level: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'LOW',
      comment: 'LOW, MEDIUM, HIGH, CRITICAL'
    }
  });

  // Create artifacts table
  await queryInterface.createTable('artifacts', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'file, memory_dump, network_capture, log, screenshot, etc.'
    },
    hash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Current hash (SHA-256)'
    },
    original_hash: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Original hash for integrity verification'
    },
    size: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'File size (human-readable)'
    },
    uploaded_by: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'User ID of uploader'
    },
    upload_date: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'pending',
      comment: 'pending, analyzed, clean, malicious, quarantined'
    },
    case_id: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Associated case ID'
    }
  });

  // Create chain_events table (Chain of Custody)
  await queryInterface.createTable('chain_events', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    artifact_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Associated artifact ID'
    },
    artifact_name: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Denormalized artifact name for performance'
    },
    action: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'collected, transferred, analyzed, modified, destroyed'
    },
    user_id: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'User who performed the action'
    },
    timestamp: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: 'Additional notes about the chain event'
    }
  });

  // Add indexes for audit_logs table
  await queryInterface.addIndex('audit_logs', ['user_id'], {
    name: 'idx_audit_logs_user_id'
  });

  await queryInterface.addIndex('audit_logs', ['action'], {
    name: 'idx_audit_logs_action'
  });

  await queryInterface.addIndex('audit_logs', ['timestamp'], {
    name: 'idx_audit_logs_timestamp'
  });

  await queryInterface.addIndex('audit_logs', ['resource_id'], {
    name: 'idx_audit_logs_resource_id'
  });

  // Add indexes for reports table
  await queryInterface.addIndex('reports', ['type'], {
    name: 'idx_reports_type'
  });

  await queryInterface.addIndex('reports', ['author'], {
    name: 'idx_reports_author'
  });

  await queryInterface.addIndex('reports', ['status'], {
    name: 'idx_reports_status'
  });

  await queryInterface.addIndex('reports', ['related_case_id'], {
    name: 'idx_reports_related_case_id'
  });

  await queryInterface.addIndex('reports', ['date'], {
    name: 'idx_reports_date'
  });

  // Add indexes for playbooks table
  await queryInterface.addIndex('playbooks', ['name'], {
    name: 'idx_playbooks_name',
    unique: true
  });

  await queryInterface.addIndex('playbooks', ['status'], {
    name: 'idx_playbooks_status'
  });

  await queryInterface.addIndex('playbooks', ['risk_level'], {
    name: 'idx_playbooks_risk_level'
  });

  // Add indexes for artifacts table
  await queryInterface.addIndex('artifacts', ['hash'], {
    name: 'idx_artifacts_hash'
  });

  await queryInterface.addIndex('artifacts', ['uploaded_by'], {
    name: 'idx_artifacts_uploaded_by'
  });

  await queryInterface.addIndex('artifacts', ['status'], {
    name: 'idx_artifacts_status'
  });

  await queryInterface.addIndex('artifacts', ['case_id'], {
    name: 'idx_artifacts_case_id'
  });

  await queryInterface.addIndex('artifacts', ['upload_date'], {
    name: 'idx_artifacts_upload_date'
  });

  // Add indexes for chain_events table
  await queryInterface.addIndex('chain_events', ['artifact_id'], {
    name: 'idx_chain_events_artifact_id'
  });

  await queryInterface.addIndex('chain_events', ['user_id'], {
    name: 'idx_chain_events_user_id'
  });

  await queryInterface.addIndex('chain_events', ['timestamp'], {
    name: 'idx_chain_events_timestamp'
  });

  await queryInterface.addIndex('chain_events', ['action'], {
    name: 'idx_chain_events_action'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('chain_events');
  await queryInterface.dropTable('artifacts');
  await queryInterface.dropTable('playbooks');
  await queryInterface.dropTable('reports');
  await queryInterface.dropTable('audit_logs');
}
