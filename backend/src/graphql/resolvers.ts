
import { ThreatService } from '../services/threat.service';
import { CaseService } from '../services/case.service';
import { ActorService } from '../services/actor.service';
import { CampaignService } from '../services/campaign.service';
import { AuditService } from '../services/audit.service';
import { User } from '../models/system';

interface Context {
  user?: User;
}

export const rootResolver = {
  // Queries
  threats: async ({ limit, offset }: { limit?: number, offset?: number }) => {
    return await ThreatService.getAll(limit, offset);
  },
  threat: async ({ id }: { id: string }) => {
    return await ThreatService.getById(id);
  },
  cases: async ({ status, assignee }: { status?: string, assignee?: string }) => {
    return await CaseService.getAll({ status, assignee });
  },
  actors: async () => {
    return await ActorService.getAll();
  },
  campaigns: async () => {
    return await CampaignService.getAll();
  },
  auditLogs: async ({ limit }: { limit?: number }) => {
    return await AuditService.getLogs(limit || 50);
  },

  // Mutations
  createThreat: async ({ input }: { input: any }, context: Context) => {
    // In a real app, verify context.user
    const _user = context.user?.username || 'graphql-client';
    return await ThreatService.create(input);
  },
  updateThreatStatus: async ({ id, status }: { id: string, status: string }) => {
    return await ThreatService.updateStatus(id, status);
  },
  createCase: async ({ input }: { input: any }, context: Context) => {
    const user = context.user?.username || 'graphql-client';
    return await CaseService.create(input, user);
  },
  updateCaseStatus: async ({ id, status }: { id: string, status: string }, context: Context) => {
    const user = context.user?.username || 'graphql-client';
    return await CaseService.update(id, { status }, user);
  }
};
