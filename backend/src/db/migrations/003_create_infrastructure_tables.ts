/**
 * Migration: Create Infrastructure Tables
 * Tables: assets, vulnerabilities, feeds, vendors
 */

import { QueryInterface, DataTypes } from 'sequelize';

export async function up(queryInterface: QueryInterface): Promise<void> {
  // Create assets table
  await queryInterface.createTable('assets', {
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
      comment: 'server, workstation, network_device, application, etc.'
    },
    ip_address: {
      type: DataTypes.STRING,
      allowNull: true
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      comment: 'active, inactive, maintenance, decommissioned'
    },
    criticality: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'CRITICAL, HIGH, MEDIUM, LOW'
    },
    owner: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Owner user ID or department'
    },
    last_seen: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW
    },
    load: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'CPU/Memory load percentage'
    },
    latency: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Network latency in milliseconds'
    },
    security_controls: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Security controls (EDR, Firewall, DLP, etc.)'
    },
    data_sensitivity: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'INTERNAL',
      comment: 'PUBLIC, INTERNAL, CONFIDENTIAL, RESTRICTED'
    },
    data_volume_gb: {
      type: DataTypes.FLOAT,
      allowNull: false,
      defaultValue: 0,
      comment: 'Data volume in gigabytes'
    }
  });

  // Create vulnerabilities table
  await queryInterface.createTable('vulnerabilities', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false,
      comment: 'CVE ID'
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    score: {
      type: DataTypes.FLOAT,
      allowNull: false,
      comment: 'CVSS score (0-10)'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'open',
      comment: 'open, patched, mitigated, accepted'
    },
    vendor: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Affected vendor/product'
    },
    vectors: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Attack vectors (Network, Local, Physical, Adjacent)'
    },
    zero_day: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    exploited: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Known to be exploited in the wild'
    },
    affected_assets: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'List of affected asset IDs'
    },
    kill_chain_ready: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
      comment: 'Ready for kill chain simulation'
    }
  });

  // Create feeds table
  await queryInterface.createTable('feeds', {
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
    url: {
      type: DataTypes.STRING,
      allowNull: false
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'STIX, TAXII, RSS, API, etc.'
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: 'active',
      comment: 'active, inactive, error'
    },
    interval_min: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 60,
      comment: 'Sync interval in minutes'
    },
    last_sync: {
      type: DataTypes.DATE,
      allowNull: true
    },
    configuration: {
      type: DataTypes.JSONB,
      allowNull: true,
      comment: 'Feed-specific configuration'
    },
    error_count: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0
    }
  });

  // Create vendors table
  await queryInterface.createTable('vendors', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true,
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    product: {
      type: DataTypes.STRING,
      allowNull: false
    },
    tier: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'CRITICAL, STRATEGIC, OPERATIONAL, TACTICAL'
    },
    category: {
      type: DataTypes.STRING,
      allowNull: false,
      comment: 'Software, Hardware, Service, etc.'
    },
    risk_score: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
      comment: 'Risk score (0-100)'
    },
    hq_location: {
      type: DataTypes.STRING,
      allowNull: true,
      comment: 'Headquarters location'
    },
    subcontractors: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Downstream dependencies/subcontractors'
    },
    compliance: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Compliance certifications'
    },
    access: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Access privileges granted to vendor'
    },
    sbom: {
      type: DataTypes.JSONB,
      allowNull: false,
      defaultValue: [],
      comment: 'Software Bill of Materials'
    }
  });

  // Add indexes for assets table
  await queryInterface.addIndex('assets', ['type'], {
    name: 'idx_assets_type'
  });

  await queryInterface.addIndex('assets', ['status'], {
    name: 'idx_assets_status'
  });

  await queryInterface.addIndex('assets', ['criticality'], {
    name: 'idx_assets_criticality'
  });

  await queryInterface.addIndex('assets', ['owner'], {
    name: 'idx_assets_owner'
  });

  await queryInterface.addIndex('assets', ['ip_address'], {
    name: 'idx_assets_ip_address'
  });

  await queryInterface.addIndex('assets', ['data_sensitivity'], {
    name: 'idx_assets_data_sensitivity'
  });

  // Add indexes for vulnerabilities table
  await queryInterface.addIndex('vulnerabilities', ['status'], {
    name: 'idx_vulnerabilities_status'
  });

  await queryInterface.addIndex('vulnerabilities', ['score'], {
    name: 'idx_vulnerabilities_score'
  });

  await queryInterface.addIndex('vulnerabilities', ['vendor'], {
    name: 'idx_vulnerabilities_vendor'
  });

  await queryInterface.addIndex('vulnerabilities', ['zero_day'], {
    name: 'idx_vulnerabilities_zero_day'
  });

  await queryInterface.addIndex('vulnerabilities', ['exploited'], {
    name: 'idx_vulnerabilities_exploited'
  });

  // Add indexes for feeds table
  await queryInterface.addIndex('feeds', ['name'], {
    name: 'idx_feeds_name',
    unique: true
  });

  await queryInterface.addIndex('feeds', ['status'], {
    name: 'idx_feeds_status'
  });

  await queryInterface.addIndex('feeds', ['type'], {
    name: 'idx_feeds_type'
  });

  // Add indexes for vendors table
  await queryInterface.addIndex('vendors', ['name'], {
    name: 'idx_vendors_name'
  });

  await queryInterface.addIndex('vendors', ['tier'], {
    name: 'idx_vendors_tier'
  });

  await queryInterface.addIndex('vendors', ['category'], {
    name: 'idx_vendors_category'
  });

  await queryInterface.addIndex('vendors', ['risk_score'], {
    name: 'idx_vendors_risk_score'
  });
}

export async function down(queryInterface: QueryInterface): Promise<void> {
  await queryInterface.dropTable('vendors');
  await queryInterface.dropTable('feeds');
  await queryInterface.dropTable('vulnerabilities');
  await queryInterface.dropTable('assets');
}
