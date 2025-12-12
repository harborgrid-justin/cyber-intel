
import { GraphQLFieldResolver } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import {
  Threat, Case, Actor, Campaign, Asset, Vulnerability,
  Feed, Vendor, AuditLog, Report, Playbook, Artifact,
  ChainEvent, User, Role, Permission, Organization,
  Integration, Channel, Message, RolePermission
} from '../models';
import { Loaders } from './dataloaders';
import { DateTimeScalar, JSONScalar, UUIDScalar } from './scalars';
import { Op } from 'sequelize';
import { v4 as uuidv4 } from 'uuid';

// PubSub instance for subscriptions
const pubsub = new PubSub();

// Subscription events
export const EVENTS = {
  THREAT_CREATED: 'THREAT_CREATED',
  THREAT_UPDATED: 'THREAT_UPDATED',
  THREAT_STATUS_CHANGED: 'THREAT_STATUS_CHANGED',
  CASE_CREATED: 'CASE_CREATED',
  CASE_UPDATED: 'CASE_UPDATED',
  CASE_STATUS_CHANGED: 'CASE_STATUS_CHANGED',
  CASE_ASSIGNED: 'CASE_ASSIGNED',
  ASSET_STATUS_CHANGED: 'ASSET_STATUS_CHANGED',
  VULNERABILITY_DETECTED: 'VULNERABILITY_DETECTED',
  FEED_SYNCED: 'FEED_SYNCED',
  AUDIT_LOG_CREATED: 'AUDIT_LOG_CREATED',
  REPORT_PUBLISHED: 'REPORT_PUBLISHED',
  PLAYBOOK_EXECUTED: 'PLAYBOOK_EXECUTED',
  ARTIFACT_UPLOADED: 'ARTIFACT_UPLOADED',
  MESSAGE_RECEIVED: 'MESSAGE_RECEIVED',
  USER_STATUS_CHANGED: 'USER_STATUS_CHANGED',
  INTEGRATION_STATUS_CHANGED: 'INTEGRATION_STATUS_CHANGED',
  DASHBOARD_UPDATED: 'DASHBOARD_UPDATED'
};

interface Context {
  user?: any;
  loaders: Loaders;
  ip?: string;
}

// Helper function to create connection from results
function createConnection(items: any[], offset: number = 0, totalCount: number) {
  return {
    edges: items.map((item, index) => ({
      node: item,
      cursor: Buffer.from(`${offset + index}`).toString('base64')
    })),
    pageInfo: {
      hasNextPage: offset + items.length < totalCount,
      hasPreviousPage: offset > 0,
      startCursor: items.length > 0 ? Buffer.from(`${offset}`).toString('base64') : null,
      endCursor: items.length > 0 ? Buffer.from(`${offset + items.length - 1}`).toString('base64') : null,
      totalCount
    }
  };
}

// Helper function to build where clause from filters
function buildWhereClause(filter: any) {
  const where: any = {};

  if (!filter) return where;

  Object.keys(filter).forEach(key => {
    if (filter[key] !== undefined && filter[key] !== null) {
      if (key.startsWith('min_')) {
        const field = key.replace('min_', '');
        where[field] = { ...(where[field] || {}), [Op.gte]: filter[key] };
      } else if (key.startsWith('max_')) {
        const field = key.replace('max_', '');
        where[field] = { ...(where[field] || {}), [Op.lte]: filter[key] };
      } else if (Array.isArray(filter[key])) {
        where[key] = { [Op.contains]: filter[key] };
      } else {
        where[key] = filter[key];
      }
    }
  });

  return where;
}

// Helper to create audit log
async function createAuditLog(userId: string, action: string, resourceId: string, details: string, ip?: string) {
  const log = await AuditLog.create({
    id: uuidv4(),
    user_id: userId,
    action,
    resource_id: resourceId,
    details,
    ip_address: ip,
    timestamp: new Date()
  });

  pubsub.publish(EVENTS.AUDIT_LOG_CREATED, { auditLogCreated: log });
  return log;
}

export const resolvers = {
  // Custom Scalars
  DateTime: DateTimeScalar,
  JSON: JSONScalar,
  UUID: UUIDScalar,

  // ============================================
  // QUERY RESOLVERS
  // ============================================
  Query: {
    // Intelligence Queries
    threats: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'last_seen', sortOrder = 'DESC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Threat.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    threat: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.threatLoader.load(id);
    },

    cases: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'created_at', sortOrder = 'DESC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Case.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    case: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.caseLoader.load(id);
    },

    actors: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'name', sortOrder = 'ASC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Actor.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    actor: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.actorLoader.load(id);
    },

    campaigns: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'first_seen', sortOrder = 'DESC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Campaign.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    campaign: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.campaignLoader.load(id);
    },

    // Infrastructure Queries
    assets: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'name', sortOrder = 'ASC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Asset.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    asset: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.assetLoader.load(id);
    },

    vulnerabilities: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'score', sortOrder = 'DESC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Vulnerability.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    vulnerability: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.vulnerabilityLoader.load(id);
    },

    feeds: async (_: any, { filter, limit = 50, offset = 0 }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Feed.findAndCountAll({
        where,
        limit,
        offset,
        order: [['name', 'ASC']]
      });
      return createConnection(rows, offset, count);
    },

    feed: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.feedLoader.load(id);
    },

    vendors: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'name', sortOrder = 'ASC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Vendor.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    vendor: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.vendorLoader.load(id);
    },

    // Operations Queries
    auditLogs: async (_: any, { limit = 100, offset = 0, user_id, action }: any) => {
      const where: any = {};
      if (user_id) where.user_id = user_id;
      if (action) where.action = action;

      const { count, rows } = await AuditLog.findAndCountAll({
        where,
        limit,
        offset,
        order: [['timestamp', 'DESC']]
      });
      return createConnection(rows, offset, count);
    },

    auditLog: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.auditLogLoader.load(id);
    },

    reports: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'date', sortOrder = 'DESC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Report.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    report: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.reportLoader.load(id);
    },

    playbooks: async (_: any, { filter, limit = 50, offset = 0 }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Playbook.findAndCountAll({
        where,
        limit,
        offset,
        order: [['name', 'ASC']]
      });
      return createConnection(rows, offset, count);
    },

    playbook: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.playbookLoader.load(id);
    },

    artifacts: async (_: any, { filter, limit = 50, offset = 0 }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Artifact.findAndCountAll({
        where,
        limit,
        offset,
        order: [['upload_date', 'DESC']]
      });
      return createConnection(rows, offset, count);
    },

    artifact: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.artifactLoader.load(id);
    },

    chainEvents: async (_: any, { artifact_id, limit = 50, offset = 0 }: any) => {
      const where: any = {};
      if (artifact_id) where.artifact_id = artifact_id;

      const { count, rows } = await ChainEvent.findAndCountAll({
        where,
        limit,
        offset,
        order: [['timestamp', 'DESC']]
      });
      return createConnection(rows, offset, count);
    },

    chainEvent: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.chainEventLoader.load(id);
    },

    // System Queries
    users: async (_: any, { filter, limit = 50, offset = 0, sortBy = 'username', sortOrder = 'ASC' }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await User.findAndCountAll({
        where,
        limit,
        offset,
        order: [[sortBy, sortOrder]]
      });
      return createConnection(rows, offset, count);
    },

    user: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.userLoader.load(id);
    },

    me: async (_: any, __: any, { user }: Context) => {
      if (!user) throw new Error('Not authenticated');
      return user;
    },

    roles: async (_: any, { limit = 50, offset = 0 }: any) => {
      const { count, rows } = await Role.findAndCountAll({
        limit,
        offset,
        order: [['name', 'ASC']]
      });
      return createConnection(rows, offset, count);
    },

    role: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.roleLoader.load(id);
    },

    permissions: async (_: any, { limit = 100, offset = 0 }: any) => {
      const { count, rows } = await Permission.findAndCountAll({
        limit,
        offset,
        order: [['resource', 'ASC'], ['action', 'ASC']]
      });
      return createConnection(rows, offset, count);
    },

    permission: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.permissionLoader.load(id);
    },

    organizations: async (_: any, { limit = 50, offset = 0 }: any) => {
      const { count, rows } = await Organization.findAndCountAll({
        limit,
        offset,
        order: [['name', 'ASC']]
      });
      return createConnection(rows, offset, count);
    },

    organization: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.organizationLoader.load(id);
    },

    integrations: async (_: any, { filter, limit = 50, offset = 0 }: any) => {
      const where = buildWhereClause(filter);
      const { count, rows } = await Integration.findAndCountAll({
        where,
        limit,
        offset,
        order: [['name', 'ASC']]
      });
      return createConnection(rows, offset, count);
    },

    integration: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.integrationLoader.load(id);
    },

    channels: async (_: any, { limit = 50, offset = 0 }: any) => {
      const { count, rows } = await Channel.findAndCountAll({
        limit,
        offset,
        order: [['name', 'ASC']]
      });
      return createConnection(rows, offset, count);
    },

    channel: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.channelLoader.load(id);
    },

    messages: async (_: any, { channel_id, limit = 100, offset = 0 }: any) => {
      const { count, rows } = await Message.findAndCountAll({
        where: { channel_id },
        limit,
        offset,
        order: [['createdAt', 'DESC']]
      });
      return createConnection(rows, offset, count);
    },

    message: async (_: any, { id }: any, { loaders }: Context) => {
      return loaders.messageLoader.load(id);
    },

    // Analytics Queries
    dashboardStats: async () => {
      const [
        totalThreats,
        activeCases,
        criticalAssets,
        openVulnerabilities
      ] = await Promise.all([
        Threat.count(),
        Case.count({ where: { status: { [Op.in]: ['OPEN', 'IN_PROGRESS'] } } }),
        Asset.count({ where: { criticality: 'CRITICAL' } }),
        Vulnerability.count({ where: { status: 'OPEN' } })
      ]);

      // Aggregate threats by source
      const threatsBySource = await Threat.findAll({
        attributes: ['source', [Threat.sequelize!.fn('COUNT', '*'), 'count']],
        group: ['source']
      });

      // Aggregate cases by priority
      const casesByPriority = await Case.findAll({
        attributes: ['priority', [Case.sequelize!.fn('COUNT', '*'), 'count']],
        group: ['priority']
      });

      // Aggregate assets by criticality
      const assetsByCriticality = await Asset.findAll({
        attributes: ['criticality', [Asset.sequelize!.fn('COUNT', '*'), 'count']],
        group: ['criticality']
      });

      return {
        totalThreats,
        activeCases,
        criticalAssets,
        openVulnerabilities,
        recentAlerts: 0, // To be implemented
        threatsBySource: threatsBySource.map((t: any) => ({ source: t.source, count: parseInt(t.dataValues.count) })),
        casesByPriority: casesByPriority.map((c: any) => ({ priority: c.priority, count: parseInt(c.dataValues.count) })),
        assetsByCriticality: assetsByCriticality.map((a: any) => ({ criticality: a.criticality, count: parseInt(a.dataValues.count) }))
      };
    },

    threatTrends: async (_: any, { days = 30 }: any) => {
      // Simple implementation - to be enhanced with time-series data
      const threats = await Threat.findAll({
        where: {
          last_seen: {
            [Op.gte]: new Date(Date.now() - days * 24 * 60 * 60 * 1000)
          }
        }
      });

      const trendMap = new Map<string, number>();
      threats.forEach((threat: any) => {
        const date = new Date(threat.last_seen).toISOString().split('T')[0];
        trendMap.set(date, (trendMap.get(date) || 0) + 1);
      });

      return Array.from(trendMap.entries())
        .map(([date, count]) => ({ date, count }))
        .sort((a, b) => a.date.localeCompare(b.date));
    },

    caseMetrics: async () => {
      const totalCases = await Case.count();
      const openCases = await Case.count({ where: { status: { [Op.in]: ['OPEN', 'IN_PROGRESS'] } } });
      const resolvedCases = await Case.count({ where: { status: 'RESOLVED' } });

      return {
        averageResolutionTime: null, // To be implemented
        slaComplianceRate: null, // To be implemented
        totalCases,
        openCases,
        resolvedCases
      };
    }
  },

  // ============================================
  // MUTATION RESOLVERS
  // ============================================
  Mutation: {
    // Intelligence Mutations
    createThreat: async (_: any, { input }: any, { user, ip }: Context) => {
      const threat = await Threat.create({
        id: uuidv4(),
        ...input,
        status: 'NEW',
        last_seen: new Date()
      });

      await createAuditLog(user?.id || 'system', 'CREATE_THREAT', threat.id, `Created threat: ${threat.indicator}`, ip);
      pubsub.publish(EVENTS.THREAT_CREATED, { threatCreated: threat });
      pubsub.publish(EVENTS.DASHBOARD_UPDATED, { dashboardUpdated: true });

      return threat;
    },

    updateThreat: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const threat = await Threat.findByPk(id);
      if (!threat) throw new Error('Threat not found');

      await threat.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_THREAT', id, `Updated threat: ${threat.indicator}`, ip);
      pubsub.publish(EVENTS.THREAT_UPDATED, { threatUpdated: threat });

      return threat;
    },

    updateThreatStatus: async (_: any, { id, status }: any, { user, ip }: Context) => {
      const threat = await Threat.findByPk(id);
      if (!threat) throw new Error('Threat not found');

      await threat.update({ status });
      await createAuditLog(user?.id || 'system', 'UPDATE_THREAT_STATUS', id, `Changed status to ${status}`, ip);
      pubsub.publish(EVENTS.THREAT_STATUS_CHANGED, { threatStatusChanged: threat });

      return threat;
    },

    deleteThreat: async (_: any, { id }: any, { user, ip }: Context) => {
      const threat = await Threat.findByPk(id);
      if (!threat) throw new Error('Threat not found');

      await threat.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_THREAT', id, `Deleted threat: ${threat.indicator}`, ip);

      return true;
    },

    createCase: async (_: any, { input }: any, { user, ip }: Context) => {
      const caseData = await Case.create({
        id: uuidv4(),
        ...input,
        created_by: user?.username || 'system',
        status: 'OPEN'
      });

      await createAuditLog(user?.id || 'system', 'CREATE_CASE', caseData.id, `Created case: ${caseData.title}`, ip);
      pubsub.publish(EVENTS.CASE_CREATED, { caseCreated: caseData });
      pubsub.publish(EVENTS.DASHBOARD_UPDATED, { dashboardUpdated: true });

      return caseData;
    },

    updateCase: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const caseData = await Case.findByPk(id);
      if (!caseData) throw new Error('Case not found');

      await caseData.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_CASE', id, `Updated case: ${caseData.title}`, ip);
      pubsub.publish(EVENTS.CASE_UPDATED, { caseUpdated: caseData });

      return caseData;
    },

    updateCaseStatus: async (_: any, { id, status }: any, { user, ip }: Context) => {
      const caseData = await Case.findByPk(id);
      if (!caseData) throw new Error('Case not found');

      await caseData.update({ status });
      await createAuditLog(user?.id || 'system', 'UPDATE_CASE_STATUS', id, `Changed status to ${status}`, ip);
      pubsub.publish(EVENTS.CASE_STATUS_CHANGED, { caseStatusChanged: caseData });

      return caseData;
    },

    deleteCase: async (_: any, { id }: any, { user, ip }: Context) => {
      const caseData = await Case.findByPk(id);
      if (!caseData) throw new Error('Case not found');

      await caseData.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_CASE', id, `Deleted case: ${caseData.title}`, ip);

      return true;
    },

    assignCase: async (_: any, { id, assignee }: any, { user, ip }: Context) => {
      const caseData = await Case.findByPk(id);
      if (!caseData) throw new Error('Case not found');

      await caseData.update({ assignee });
      await createAuditLog(user?.id || 'system', 'ASSIGN_CASE', id, `Assigned to ${assignee}`, ip);
      pubsub.publish(EVENTS.CASE_ASSIGNED, { caseAssigned: caseData });

      return caseData;
    },

    createActor: async (_: any, { input }: any, { user, ip }: Context) => {
      const actor = await Actor.create({
        id: uuidv4(),
        ...input
      });

      await createAuditLog(user?.id || 'system', 'CREATE_ACTOR', actor.id, `Created actor: ${actor.name}`, ip);
      return actor;
    },

    updateActor: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const actor = await Actor.findByPk(id);
      if (!actor) throw new Error('Actor not found');

      await actor.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_ACTOR', id, `Updated actor: ${actor.name}`, ip);

      return actor;
    },

    deleteActor: async (_: any, { id }: any, { user, ip }: Context) => {
      const actor = await Actor.findByPk(id);
      if (!actor) throw new Error('Actor not found');

      await actor.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_ACTOR', id, `Deleted actor: ${actor.name}`, ip);

      return true;
    },

    createCampaign: async (_: any, { input }: any, { user, ip }: Context) => {
      const campaign = await Campaign.create({
        id: uuidv4(),
        ...input,
        first_seen: new Date()
      });

      await createAuditLog(user?.id || 'system', 'CREATE_CAMPAIGN', campaign.id, `Created campaign: ${campaign.name}`, ip);
      return campaign;
    },

    updateCampaign: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const campaign = await Campaign.findByPk(id);
      if (!campaign) throw new Error('Campaign not found');

      await campaign.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_CAMPAIGN', id, `Updated campaign: ${campaign.name}`, ip);

      return campaign;
    },

    deleteCampaign: async (_: any, { id }: any, { user, ip }: Context) => {
      const campaign = await Campaign.findByPk(id);
      if (!campaign) throw new Error('Campaign not found');

      await campaign.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_CAMPAIGN', id, `Deleted campaign: ${campaign.name}`, ip);

      return true;
    },

    // Infrastructure Mutations
    createAsset: async (_: any, { input }: any, { user, ip }: Context) => {
      const asset = await Asset.create({
        id: uuidv4(),
        ...input,
        last_seen: new Date()
      });

      await createAuditLog(user?.id || 'system', 'CREATE_ASSET', asset.id, `Created asset: ${asset.name}`, ip);
      return asset;
    },

    updateAsset: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const asset = await Asset.findByPk(id);
      if (!asset) throw new Error('Asset not found');

      const oldStatus = asset.status;
      await asset.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_ASSET', id, `Updated asset: ${asset.name}`, ip);

      if (oldStatus !== asset.status) {
        pubsub.publish(EVENTS.ASSET_STATUS_CHANGED, { assetStatusChanged: asset });
      }

      return asset;
    },

    deleteAsset: async (_: any, { id }: any, { user, ip }: Context) => {
      const asset = await Asset.findByPk(id);
      if (!asset) throw new Error('Asset not found');

      await asset.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_ASSET', id, `Deleted asset: ${asset.name}`, ip);

      return true;
    },

    createVulnerability: async (_: any, { input }: any, { user, ip }: Context) => {
      const vuln = await Vulnerability.create({
        ...input,
        status: input.status || 'OPEN'
      });

      await createAuditLog(user?.id || 'system', 'CREATE_VULNERABILITY', vuln.id, `Created vulnerability: ${vuln.name}`, ip);
      pubsub.publish(EVENTS.VULNERABILITY_DETECTED, { vulnerabilityDetected: vuln });

      return vuln;
    },

    updateVulnerability: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const vuln = await Vulnerability.findByPk(id);
      if (!vuln) throw new Error('Vulnerability not found');

      await vuln.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_VULNERABILITY', id, `Updated vulnerability: ${vuln.name}`, ip);

      return vuln;
    },

    deleteVulnerability: async (_: any, { id }: any, { user, ip }: Context) => {
      const vuln = await Vulnerability.findByPk(id);
      if (!vuln) throw new Error('Vulnerability not found');

      await vuln.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_VULNERABILITY', id, `Deleted vulnerability: ${vuln.name}`, ip);

      return true;
    },

    createFeed: async (_: any, { input }: any, { user, ip }: Context) => {
      const feed = await Feed.create({
        id: uuidv4(),
        ...input,
        status: input.status || 'ACTIVE',
        error_count: 0
      });

      await createAuditLog(user?.id || 'system', 'CREATE_FEED', feed.id, `Created feed: ${feed.name}`, ip);
      return feed;
    },

    updateFeed: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const feed = await Feed.findByPk(id);
      if (!feed) throw new Error('Feed not found');

      await feed.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_FEED', id, `Updated feed: ${feed.name}`, ip);

      return feed;
    },

    deleteFeed: async (_: any, { id }: any, { user, ip }: Context) => {
      const feed = await Feed.findByPk(id);
      if (!feed) throw new Error('Feed not found');

      await feed.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_FEED', id, `Deleted feed: ${feed.name}`, ip);

      return true;
    },

    syncFeed: async (_: any, { id }: any, { user, ip }: Context) => {
      const feed = await Feed.findByPk(id);
      if (!feed) throw new Error('Feed not found');

      await feed.update({ last_sync: new Date() });
      await createAuditLog(user?.id || 'system', 'SYNC_FEED', id, `Synced feed: ${feed.name}`, ip);
      pubsub.publish(EVENTS.FEED_SYNCED, { feedSynced: feed });

      return feed;
    },

    createVendor: async (_: any, { input }: any, { user, ip }: Context) => {
      const vendor = await Vendor.create({
        id: uuidv4(),
        ...input
      });

      await createAuditLog(user?.id || 'system', 'CREATE_VENDOR', vendor.id, `Created vendor: ${vendor.name}`, ip);
      return vendor;
    },

    updateVendor: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const vendor = await Vendor.findByPk(id);
      if (!vendor) throw new Error('Vendor not found');

      await vendor.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_VENDOR', id, `Updated vendor: ${vendor.name}`, ip);

      return vendor;
    },

    deleteVendor: async (_: any, { id }: any, { user, ip }: Context) => {
      const vendor = await Vendor.findByPk(id);
      if (!vendor) throw new Error('Vendor not found');

      await vendor.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_VENDOR', id, `Deleted vendor: ${vendor.name}`, ip);

      return true;
    },

    // Operations Mutations
    createReport: async (_: any, { input }: any, { user, ip }: Context) => {
      const report = await Report.create({
        id: uuidv4(),
        ...input,
        author: input.author || user?.username || 'system',
        status: 'DRAFT',
        date: new Date()
      });

      await createAuditLog(user?.id || 'system', 'CREATE_REPORT', report.id, `Created report: ${report.title}`, ip);
      return report;
    },

    updateReport: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const report = await Report.findByPk(id);
      if (!report) throw new Error('Report not found');

      await report.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_REPORT', id, `Updated report: ${report.title}`, ip);

      return report;
    },

    publishReport: async (_: any, { id }: any, { user, ip }: Context) => {
      const report = await Report.findByPk(id);
      if (!report) throw new Error('Report not found');

      await report.update({ status: 'PUBLISHED' });
      await createAuditLog(user?.id || 'system', 'PUBLISH_REPORT', id, `Published report: ${report.title}`, ip);
      pubsub.publish(EVENTS.REPORT_PUBLISHED, { reportPublished: report });

      return report;
    },

    deleteReport: async (_: any, { id }: any, { user, ip }: Context) => {
      const report = await Report.findByPk(id);
      if (!report) throw new Error('Report not found');

      await report.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_REPORT', id, `Deleted report: ${report.title}`, ip);

      return true;
    },

    createPlaybook: async (_: any, { input }: any, { user, ip }: Context) => {
      const playbook = await Playbook.create({
        id: uuidv4(),
        ...input,
        status: 'ACTIVE',
        usage_count: 0,
        skip_count: 0
      });

      await createAuditLog(user?.id || 'system', 'CREATE_PLAYBOOK', playbook.id, `Created playbook: ${playbook.name}`, ip);
      return playbook;
    },

    updatePlaybook: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const playbook = await Playbook.findByPk(id);
      if (!playbook) throw new Error('Playbook not found');

      await playbook.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_PLAYBOOK', id, `Updated playbook: ${playbook.name}`, ip);

      return playbook;
    },

    executePlaybook: async (_: any, { id, context }: any, { user, ip }: Context) => {
      const playbook = await Playbook.findByPk(id);
      if (!playbook) throw new Error('Playbook not found');

      await playbook.increment('usage_count');
      await createAuditLog(user?.id || 'system', 'EXECUTE_PLAYBOOK', id, `Executed playbook: ${playbook.name}`, ip);

      const result = { playbookId: id, status: 'executed', context };
      pubsub.publish(EVENTS.PLAYBOOK_EXECUTED, { playbookExecuted: result });

      return result;
    },

    deletePlaybook: async (_: any, { id }: any, { user, ip }: Context) => {
      const playbook = await Playbook.findByPk(id);
      if (!playbook) throw new Error('Playbook not found');

      await playbook.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_PLAYBOOK', id, `Deleted playbook: ${playbook.name}`, ip);

      return true;
    },

    createArtifact: async (_: any, { input }: any, { user, ip }: Context) => {
      const artifact = await Artifact.create({
        id: uuidv4(),
        ...input,
        uploaded_by: user?.username || 'system',
        upload_date: new Date(),
        status: 'PENDING'
      });

      await createAuditLog(user?.id || 'system', 'CREATE_ARTIFACT', artifact.id, `Uploaded artifact: ${artifact.name}`, ip);
      pubsub.publish(EVENTS.ARTIFACT_UPLOADED, { artifactUploaded: artifact });

      return artifact;
    },

    updateArtifact: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const artifact = await Artifact.findByPk(id);
      if (!artifact) throw new Error('Artifact not found');

      await artifact.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_ARTIFACT', id, `Updated artifact: ${artifact.name}`, ip);

      return artifact;
    },

    deleteArtifact: async (_: any, { id }: any, { user, ip }: Context) => {
      const artifact = await Artifact.findByPk(id);
      if (!artifact) throw new Error('Artifact not found');

      await artifact.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_ARTIFACT', id, `Deleted artifact: ${artifact.name}`, ip);

      return true;
    },

    createChainEvent: async (_: any, { input }: any, { user, ip }: Context) => {
      const artifact = await Artifact.findByPk(input.artifact_id);
      if (!artifact) throw new Error('Artifact not found');

      const event = await ChainEvent.create({
        id: uuidv4(),
        ...input,
        artifact_name: artifact.name,
        user_id: user?.id || 'system',
        timestamp: new Date()
      });

      await createAuditLog(user?.id || 'system', 'CREATE_CHAIN_EVENT', event.id, `Created chain event for artifact: ${artifact.name}`, ip);
      return event;
    },

    // System Mutations
    createUser: async (_: any, { input }: any, { user, ip }: Context) => {
      const newUser = await User.create({
        id: uuidv4(),
        ...input,
        status: input.status || 'ACTIVE'
      });

      await createAuditLog(user?.id || 'system', 'CREATE_USER', newUser.id, `Created user: ${newUser.username}`, ip);
      return newUser;
    },

    updateUser: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const targetUser = await User.findByPk(id);
      if (!targetUser) throw new Error('User not found');

      const oldStatus = targetUser.status;
      await targetUser.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_USER', id, `Updated user: ${targetUser.username}`, ip);

      if (oldStatus !== targetUser.status) {
        pubsub.publish(EVENTS.USER_STATUS_CHANGED, { userStatusChanged: targetUser });
      }

      return targetUser;
    },

    deleteUser: async (_: any, { id }: any, { user, ip }: Context) => {
      const targetUser = await User.findByPk(id);
      if (!targetUser) throw new Error('User not found');

      await targetUser.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_USER', id, `Deleted user: ${targetUser.username}`, ip);

      return true;
    },

    createRole: async (_: any, { input }: any, { user, ip }: Context) => {
      const role = await Role.create({
        id: uuidv4(),
        ...input
      });

      await createAuditLog(user?.id || 'system', 'CREATE_ROLE', role.id, `Created role: ${role.name}`, ip);
      return role;
    },

    updateRole: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const role = await Role.findByPk(id);
      if (!role) throw new Error('Role not found');

      await role.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_ROLE', id, `Updated role: ${role.name}`, ip);

      return role;
    },

    deleteRole: async (_: any, { id }: any, { user, ip }: Context) => {
      const role = await Role.findByPk(id);
      if (!role) throw new Error('Role not found');

      await role.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_ROLE', id, `Deleted role: ${role.name}`, ip);

      return true;
    },

    assignPermissionToRole: async (_: any, { roleId, permissionId }: any, { user, ip }: Context) => {
      const role = await Role.findByPk(roleId);
      if (!role) throw new Error('Role not found');

      const permission = await Permission.findByPk(permissionId);
      if (!permission) throw new Error('Permission not found');

      await RolePermission.create({
        role_id: roleId,
        permission_id: permissionId
      });

      await createAuditLog(user?.id || 'system', 'ASSIGN_PERMISSION', roleId, `Assigned permission ${permissionId} to role ${roleId}`, ip);
      return role;
    },

    removePermissionFromRole: async (_: any, { roleId, permissionId }: any, { user, ip }: Context) => {
      await RolePermission.destroy({
        where: {
          role_id: roleId,
          permission_id: permissionId
        }
      });

      await createAuditLog(user?.id || 'system', 'REMOVE_PERMISSION', roleId, `Removed permission ${permissionId} from role ${roleId}`, ip);

      const role = await Role.findByPk(roleId);
      return role;
    },

    createPermission: async (_: any, { input }: any, { user, ip }: Context) => {
      const permission = await Permission.create({
        id: uuidv4(),
        ...input
      });

      await createAuditLog(user?.id || 'system', 'CREATE_PERMISSION', permission.id, `Created permission: ${permission.resource}:${permission.action}`, ip);
      return permission;
    },

    updatePermission: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const permission = await Permission.findByPk(id);
      if (!permission) throw new Error('Permission not found');

      await permission.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_PERMISSION', id, `Updated permission: ${permission.resource}:${permission.action}`, ip);

      return permission;
    },

    deletePermission: async (_: any, { id }: any, { user, ip }: Context) => {
      const permission = await Permission.findByPk(id);
      if (!permission) throw new Error('Permission not found');

      await permission.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_PERMISSION', id, `Deleted permission: ${permission.resource}:${permission.action}`, ip);

      return true;
    },

    createOrganization: async (_: any, { input }: any, { user, ip }: Context) => {
      const org = await Organization.create({
        id: uuidv4(),
        ...input,
        path: input.parent_id ? `${input.parent_id}/${uuidv4()}` : uuidv4()
      });

      await createAuditLog(user?.id || 'system', 'CREATE_ORGANIZATION', org.id, `Created organization: ${org.name}`, ip);
      return org;
    },

    updateOrganization: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const org = await Organization.findByPk(id);
      if (!org) throw new Error('Organization not found');

      await org.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_ORGANIZATION', id, `Updated organization: ${org.name}`, ip);

      return org;
    },

    deleteOrganization: async (_: any, { id }: any, { user, ip }: Context) => {
      const org = await Organization.findByPk(id);
      if (!org) throw new Error('Organization not found');

      await org.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_ORGANIZATION', id, `Deleted organization: ${org.name}`, ip);

      return true;
    },

    createIntegration: async (_: any, { input }: any, { user, ip }: Context) => {
      const integration = await Integration.create({
        id: uuidv4(),
        ...input,
        status: input.status || 'ACTIVE'
      });

      await createAuditLog(user?.id || 'system', 'CREATE_INTEGRATION', integration.id, `Created integration: ${integration.name}`, ip);
      return integration;
    },

    updateIntegration: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const integration = await Integration.findByPk(id);
      if (!integration) throw new Error('Integration not found');

      const oldStatus = integration.status;
      await integration.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_INTEGRATION', id, `Updated integration: ${integration.name}`, ip);

      if (oldStatus !== integration.status) {
        pubsub.publish(EVENTS.INTEGRATION_STATUS_CHANGED, { integrationStatusChanged: integration });
      }

      return integration;
    },

    deleteIntegration: async (_: any, { id }: any, { user, ip }: Context) => {
      const integration = await Integration.findByPk(id);
      if (!integration) throw new Error('Integration not found');

      await integration.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_INTEGRATION', id, `Deleted integration: ${integration.name}`, ip);

      return true;
    },

    testIntegration: async (_: any, { id }: any, { user, ip }: Context) => {
      const integration = await Integration.findByPk(id);
      if (!integration) throw new Error('Integration not found');

      await createAuditLog(user?.id || 'system', 'TEST_INTEGRATION', id, `Tested integration: ${integration.name}`, ip);

      // Simulate test - to be implemented
      return true;
    },

    createChannel: async (_: any, { input }: any, { user, ip }: Context) => {
      const channel = await Channel.create({
        id: uuidv4(),
        ...input,
        created_by: user?.id || 'system'
      });

      await createAuditLog(user?.id || 'system', 'CREATE_CHANNEL', channel.id, `Created channel: ${channel.name}`, ip);
      return channel;
    },

    updateChannel: async (_: any, { id, input }: any, { user, ip }: Context) => {
      const channel = await Channel.findByPk(id);
      if (!channel) throw new Error('Channel not found');

      await channel.update(input);
      await createAuditLog(user?.id || 'system', 'UPDATE_CHANNEL', id, `Updated channel: ${channel.name}`, ip);

      return channel;
    },

    deleteChannel: async (_: any, { id }: any, { user, ip }: Context) => {
      const channel = await Channel.findByPk(id);
      if (!channel) throw new Error('Channel not found');

      await channel.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_CHANNEL', id, `Deleted channel: ${channel.name}`, ip);

      return true;
    },

    addMemberToChannel: async (_: any, { channelId, userId }: any, { user, ip }: Context) => {
      const channel = await Channel.findByPk(channelId);
      if (!channel) throw new Error('Channel not found');

      const members = channel.members || [];
      if (!members.includes(userId)) {
        members.push(userId);
        await channel.update({ members });
        await createAuditLog(user?.id || 'system', 'ADD_CHANNEL_MEMBER', channelId, `Added user ${userId} to channel`, ip);
      }

      return channel;
    },

    removeMemberFromChannel: async (_: any, { channelId, userId }: any, { user, ip }: Context) => {
      const channel = await Channel.findByPk(channelId);
      if (!channel) throw new Error('Channel not found');

      const members = (channel.members || []).filter((m: string) => m !== userId);
      await channel.update({ members });
      await createAuditLog(user?.id || 'system', 'REMOVE_CHANNEL_MEMBER', channelId, `Removed user ${userId} from channel`, ip);

      return channel;
    },

    sendMessage: async (_: any, { input }: any, { user, ip }: Context) => {
      const message = await Message.create({
        id: uuidv4(),
        ...input,
        user_id: user?.id || 'system',
        type: input.type || 'TEXT'
      });

      await createAuditLog(user?.id || 'system', 'SEND_MESSAGE', message.id, `Sent message to channel ${input.channel_id}`, ip);
      pubsub.publish(EVENTS.MESSAGE_RECEIVED, { messageReceived: message, channelId: input.channel_id });

      return message;
    },

    deleteMessage: async (_: any, { id }: any, { user, ip }: Context) => {
      const message = await Message.findByPk(id);
      if (!message) throw new Error('Message not found');

      await message.destroy();
      await createAuditLog(user?.id || 'system', 'DELETE_MESSAGE', id, `Deleted message`, ip);

      return true;
    }
  },

  // ============================================
  // SUBSCRIPTION RESOLVERS
  // ============================================
  Subscription: {
    threatCreated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.THREAT_CREATED])
    },
    threatUpdated: {
      subscribe: (_: any, { id }: any) => {
        if (id) {
          return pubsub.asyncIterator([`${EVENTS.THREAT_UPDATED}_${id}`]);
        }
        return pubsub.asyncIterator([EVENTS.THREAT_UPDATED]);
      }
    },
    threatStatusChanged: {
      subscribe: () => pubsub.asyncIterator([EVENTS.THREAT_STATUS_CHANGED])
    },
    caseCreated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.CASE_CREATED])
    },
    caseUpdated: {
      subscribe: (_: any, { id }: any) => {
        if (id) {
          return pubsub.asyncIterator([`${EVENTS.CASE_UPDATED}_${id}`]);
        }
        return pubsub.asyncIterator([EVENTS.CASE_UPDATED]);
      }
    },
    caseStatusChanged: {
      subscribe: () => pubsub.asyncIterator([EVENTS.CASE_STATUS_CHANGED])
    },
    caseAssigned: {
      subscribe: () => pubsub.asyncIterator([EVENTS.CASE_ASSIGNED])
    },
    assetStatusChanged: {
      subscribe: () => pubsub.asyncIterator([EVENTS.ASSET_STATUS_CHANGED])
    },
    vulnerabilityDetected: {
      subscribe: () => pubsub.asyncIterator([EVENTS.VULNERABILITY_DETECTED])
    },
    feedSynced: {
      subscribe: (_: any, { id }: any) => {
        if (id) {
          return pubsub.asyncIterator([`${EVENTS.FEED_SYNCED}_${id}`]);
        }
        return pubsub.asyncIterator([EVENTS.FEED_SYNCED]);
      }
    },
    auditLogCreated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.AUDIT_LOG_CREATED])
    },
    reportPublished: {
      subscribe: () => pubsub.asyncIterator([EVENTS.REPORT_PUBLISHED])
    },
    playbookExecuted: {
      subscribe: () => pubsub.asyncIterator([EVENTS.PLAYBOOK_EXECUTED])
    },
    artifactUploaded: {
      subscribe: () => pubsub.asyncIterator([EVENTS.ARTIFACT_UPLOADED])
    },
    messageReceived: {
      subscribe: (_: any, { channelId }: any) => {
        return pubsub.asyncIterator([`${EVENTS.MESSAGE_RECEIVED}_${channelId}`]);
      }
    },
    userStatusChanged: {
      subscribe: () => pubsub.asyncIterator([EVENTS.USER_STATUS_CHANGED])
    },
    integrationStatusChanged: {
      subscribe: () => pubsub.asyncIterator([EVENTS.INTEGRATION_STATUS_CHANGED])
    },
    dashboardUpdated: {
      subscribe: () => pubsub.asyncIterator([EVENTS.DASHBOARD_UPDATED])
    }
  },

  // ============================================
  // TYPE RESOLVERS (Relationships)
  // ============================================
  Threat: {
    cases: async (threat: any, _: any, { loaders }: Context) => {
      const cases = await Case.findAll({
        where: {
          related_threat_ids: {
            [Op.contains]: [threat.id]
          }
        }
      });
      return cases;
    },
    campaigns: async (threat: any) => {
      const campaigns = await Campaign.findAll({
        where: {
          threat_ids: {
            [Op.contains]: [threat.id]
          }
        }
      });
      return campaigns;
    }
  },

  Case: {
    threats: async (caseObj: any, _: any, { loaders }: Context) => {
      return loaders.threatsByCaseLoader.load(caseObj.id);
    },
    artifacts: async (caseObj: any, _: any, { loaders }: Context) => {
      return loaders.artifactsByCaseLoader.load(caseObj.id);
    },
    reports: async (caseObj: any) => {
      return Report.findAll({ where: { related_case_id: caseObj.id } });
    },
    assigneeUser: async (caseObj: any, _: any, { loaders }: Context) => {
      if (!caseObj.assignee) return null;
      return User.findOne({ where: { username: caseObj.assignee } });
    }
  },

  Actor: {
    campaigns: async (actor: any, _: any, { loaders }: Context) => {
      return loaders.campaignsByActorLoader.load(actor.id);
    },
    reports: async (actor: any) => {
      return Report.findAll({ where: { related_actor_id: actor.id } });
    }
  },

  Campaign: {
    actorDetails: async (campaign: any, _: any, { loaders }: Context) => {
      const actorIds = campaign.actors || [];
      return Promise.all(actorIds.map((id: string) => loaders.actorLoader.load(id)));
    },
    threats: async (campaign: any, _: any, { loaders }: Context) => {
      const threatIds = campaign.threat_ids || [];
      return Promise.all(threatIds.map((id: string) => loaders.threatLoader.load(id)));
    }
  },

  Asset: {
    vulnerabilities: async (asset: any, _: any, { loaders }: Context) => {
      return loaders.vulnerabilitiesByAssetLoader.load(asset.id);
    },
    ownerUser: async (asset: any) => {
      if (!asset.owner) return null;
      return User.findOne({ where: { username: asset.owner } });
    }
  },

  Vulnerability: {
    assets: async (vuln: any, _: any, { loaders }: Context) => {
      const assetIds = vuln.affected_assets || [];
      return Promise.all(assetIds.map((id: string) => loaders.assetLoader.load(id)));
    }
  },

  AuditLog: {
    user: async (log: any, _: any, { loaders }: Context) => {
      if (!log.user_id) return null;
      return loaders.userLoader.load(log.user_id);
    }
  },

  Report: {
    case: async (report: any, _: any, { loaders }: Context) => {
      if (!report.related_case_id) return null;
      return loaders.caseLoader.load(report.related_case_id);
    },
    actor: async (report: any, _: any, { loaders }: Context) => {
      if (!report.related_actor_id) return null;
      return loaders.actorLoader.load(report.related_actor_id);
    },
    authorUser: async (report: any) => {
      if (!report.author) return null;
      return User.findOne({ where: { username: report.author } });
    }
  },

  Artifact: {
    case: async (artifact: any, _: any, { loaders }: Context) => {
      if (!artifact.case_id) return null;
      return loaders.caseLoader.load(artifact.case_id);
    },
    chainEvents: async (artifact: any, _: any, { loaders }: Context) => {
      return loaders.chainEventsByArtifactLoader.load(artifact.id);
    },
    uploader: async (artifact: any) => {
      if (!artifact.uploaded_by) return null;
      return User.findOne({ where: { username: artifact.uploaded_by } });
    }
  },

  ChainEvent: {
    artifact: async (event: any, _: any, { loaders }: Context) => {
      return loaders.artifactLoader.load(event.artifact_id);
    },
    user: async (event: any, _: any, { loaders }: Context) => {
      if (!event.user_id) return null;
      return loaders.userLoader.load(event.user_id);
    }
  },

  User: {
    role: async (user: any, _: any, { loaders }: Context) => {
      if (!user.role_id) return null;
      return loaders.roleLoader.load(user.role_id);
    },
    organization: async (user: any, _: any, { loaders }: Context) => {
      if (!user.organization_id) return null;
      return loaders.organizationLoader.load(user.organization_id);
    },
    assignedCases: async (user: any) => {
      return Case.findAll({ where: { assignee: user.username } });
    },
    auditLogs: async (user: any) => {
      return AuditLog.findAll({ where: { user_id: user.id }, order: [['timestamp', 'DESC']], limit: 100 });
    }
  },

  Role: {
    permissions: async (role: any) => {
      const rolePerms = await RolePermission.findAll({ where: { role_id: role.id } });
      const permissionIds = rolePerms.map((rp: any) => rp.permission_id);
      return Permission.findAll({ where: { id: permissionIds } });
    },
    users: async (role: any) => {
      return User.findAll({ where: { role_id: role.id } });
    },
    parentRole: async (role: any, _: any, { loaders }: Context) => {
      if (!role.parent_role_id) return null;
      return loaders.roleLoader.load(role.parent_role_id);
    }
  },

  Permission: {
    roles: async (permission: any) => {
      const rolePerms = await RolePermission.findAll({ where: { permission_id: permission.id } });
      const roleIds = rolePerms.map((rp: any) => rp.role_id);
      return Role.findAll({ where: { id: roleIds } });
    }
  },

  Organization: {
    users: async (org: any) => {
      return User.findAll({ where: { organization_id: org.id } });
    },
    parentOrganization: async (org: any, _: any, { loaders }: Context) => {
      if (!org.parent_id) return null;
      return loaders.organizationLoader.load(org.parent_id);
    },
    childOrganizations: async (org: any) => {
      return Organization.findAll({ where: { parent_id: org.id } });
    }
  },

  Channel: {
    messages: async (channel: any, _: any, { loaders }: Context) => {
      return loaders.messagesByChannelLoader.load(channel.id);
    },
    creator: async (channel: any, _: any, { loaders }: Context) => {
      if (!channel.created_by) return null;
      return loaders.userLoader.load(channel.created_by);
    }
  },

  Message: {
    channel: async (message: any, _: any, { loaders }: Context) => {
      return loaders.channelLoader.load(message.channel_id);
    },
    user: async (message: any, _: any, { loaders }: Context) => {
      if (!message.user_id) return null;
      return loaders.userLoader.load(message.user_id);
    }
  }
};

export { pubsub };
