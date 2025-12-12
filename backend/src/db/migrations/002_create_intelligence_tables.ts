/**
 * Migration: Create Intelligence Tables
 * Tables: threats, cases, actors, campaigns
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create threats table
  await queryInterface.createTable('threats', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    indicator: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'IOC value (IP, domain, hash, etc.)'
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Threat type (ip, domain, hash, url, email, etc.)'
    },
    severity: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'CRITICAL, HIGH, MEDIUM, LOW'
    },
    source: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Source feed or vendor'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      comment: 'active, mitigated, false_positive'
    },
    score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Threat score (0-100)'
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    confidence: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 50,
      comment: 'Confidence level (0-100)'
    },
    region: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Geographic region'
    },
    threat_actor: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Associated threat actor'
    },
    reputation: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Reputation score (-100 to 100)'
    },
    tags: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    tlp: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'AMBER',
      comment: 'Traffic Light Protocol (WHITE, GREEN, AMBER, RED)'
    },
    sanctioned: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ml_retrain: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Flag for ML model retraining'
    },
    origin: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Origin country/region'
    }
  });

  // Create cases table
  await queryInterface.createTable('cases', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    title: {
      type: DataTypes.STRING,
      allowNull: false
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    priority: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'CRITICAL, HIGH, MEDIUM, LOW'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'open',
      comment: 'open, investigating, contained, resolved, closed'
    },
    assignee: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'User ID of assigned analyst'
    },
    created_by: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'User ID of creator'
    },
    agency: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Agency/organization handling the case'
    },
    related_threat_ids: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    shared_with: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'List of organization IDs with access'
    },
    sla_breach: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    timeline: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    tasks: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
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

  // Create actors table
  await queryInterface.createTable('actors', {
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
    origin: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Country/region of origin'
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false
    },
    sophistication: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'NOVICE, INTERMEDIATE, ADVANCED, EXPERT, STRATEGIC'
    },
    targets: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Targeted sectors/industries'
    },
    aliases: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    evasion_techniques: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    history: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    exploits: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Known exploits used by actor'
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

  // Create campaigns table
  await queryInterface.createTable('campaigns', {
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
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      comment: 'active, dormant, ended'
    },
    objective: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Campaign objective/goal'
    },
    actors: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Associated threat actor IDs'
    },
    target_sectors: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    target_regions: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: []
    },
    threat_ids: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Associated threat IDs'
    },
    ttps: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'MITRE ATT&CK TTPs'
    },
    first_seen: {
      type: DataTypes.DATE,
      allowNull: false
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: false
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

  // Add indexes for threats table
  await queryInterface.addIndex('threats', ['indicator'], {
    name: 'idx_threats_indicator'
  });

  await queryInterface.addIndex('threats', ['type'], {
    name: 'idx_threats_type'
  });

  await queryInterface.addIndex('threats', ['severity'], {
    name: 'idx_threats_severity'
  });

  await queryInterface.addIndex('threats', ['status'], {
    name: 'idx_threats_status'
  });

  await queryInterface.addIndex('threats', ['last_seen'], {
    name: 'idx_threats_last_seen'
  });

  await queryInterface.addIndex('threats', ['threat_actor'], {
    name: 'idx_threats_threat_actor'
  });

  await queryInterface.addIndex('threats', ['tags'], {
    name: 'idx_threats_tags',
    using: 'GIN'
  });

  // Add indexes for cases table
  await queryInterface.addIndex('cases', ['status'], {
    name: 'idx_cases_status'
  });

  await queryInterface.addIndex('cases', ['priority'], {
    name: 'idx_cases_priority'
  });

  await queryInterface.addIndex('cases', ['assignee'], {
    name: 'idx_cases_assignee'
  });

  await queryInterface.addIndex('cases', ['created_by'], {
    name: 'idx_cases_created_by'
  });

  await queryInterface.addIndex('cases', ['createdAt'], {
    name: 'idx_cases_created_at'
  });

  await queryInterface.addIndex('cases', ['sla_breach'], {
    name: 'idx_cases_sla_breach'
  });

  // Add indexes for actors table
  await queryInterface.addIndex('actors', ['name'], {
    name: 'idx_actors_name',
    unique: true
  });

  await queryInterface.addIndex('actors', ['origin'], {
    name: 'idx_actors_origin'
  });

  await queryInterface.addIndex('actors', ['sophistication'], {
    name: 'idx_actors_sophistication'
  });

  // Add indexes for campaigns table
  await queryInterface.addIndex('campaigns', ['name'], {
    name: 'idx_campaigns_name',
    unique: true
  });

  await queryInterface.addIndex('campaigns', ['status'], {
    name: 'idx_campaigns_status'
  });

  await queryInterface.addIndex('campaigns', ['first_seen'], {
    name: 'idx_campaigns_first_seen'
  });

  await queryInterface.addIndex('campaigns', ['last_seen'], {
    name: 'idx_campaigns_last_seen'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('campaigns');
  await queryInterface.dropTable('actors');
  await queryInterface.dropTable('cases');
  await queryInterface.dropTable('threats');
}
