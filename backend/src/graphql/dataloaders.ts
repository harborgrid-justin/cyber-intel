
import DataLoader from 'dataloader';
import { Model } from 'sequelize-typescript';
import {
  Threat, Case, Actor, Campaign, Asset, Vulnerability,
  Feed, Vendor, AuditLog, Report, Playbook, Artifact,
  ChainEvent, User, Role, Permission, Organization,
  Integration, Channel, Message
} from '../models';

/**
 * Generic batch loader function for any model
 */
async function batchLoad<T extends { [key: string]: any }>(
  ids: readonly string[],
  model: typeof Model & (new () => T),
  key: string = 'id'
): Promise<(T | Error)[]> {
  const records = await (model as any).findAll({
    where: {
      [key]: ids as string[]
    }
  }) as T[];

  const recordMap = new Map<string, T>();
  records.forEach((record: T) => {
    recordMap.set(record[key] as string, record);
  });

  return ids.map(id => recordMap.get(id as string) || new Error(`No record found for ${key}: ${id}`));
}

/**
 * Create all DataLoaders for the application
 */
export function createLoaders() {
  return {
    // Intelligence DataLoaders
    threatLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Threat)
    ),

    caseLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Case)
    ),

    actorLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Actor)
    ),

    campaignLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Campaign)
    ),

    // Infrastructure DataLoaders
    assetLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Asset)
    ),

    vulnerabilityLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Vulnerability)
    ),

    feedLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Feed)
    ),

    vendorLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Vendor)
    ),

    // Operations DataLoaders
    auditLogLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, AuditLog)
    ),

    reportLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Report)
    ),

    playbookLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Playbook)
    ),

    artifactLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Artifact)
    ),

    chainEventLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, ChainEvent)
    ),

    // System DataLoaders
    userLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, User)
    ),

    roleLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Role)
    ),

    permissionLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Permission)
    ),

    organizationLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Organization)
    ),

    integrationLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Integration)
    ),

    channelLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Channel)
    ),

    messageLoader: new DataLoader<string, any>(
      (ids) => batchLoad(ids, Message)
    ),

    // Relationship DataLoaders
    threatsByCaseLoader: new DataLoader<string, any[]>(
      async (caseIds: readonly string[]) => {
        const cases = await (Case as any).findAll({
          where: {
            id: caseIds as string[]
          }
        });

        const caseMap = new Map<string, string[]>();
        cases.forEach((c: Case) => {
          caseMap.set(c.id, c.related_threat_ids || []);
        });

        const allThreatIds = Array.from(new Set(
          Array.from(caseMap.values()).flat()
        ));

        const threats = await (Threat as any).findAll({
          where: {
            id: allThreatIds
          }
        });

        const threatMap = new Map<string, Threat>();
        threats.forEach((t: Threat) => {
          threatMap.set(t.id, t);
        });

        return caseIds.map(caseId => {
          const threatIds = caseMap.get(caseId as string) || [];
          return threatIds.map(id => threatMap.get(id)).filter(Boolean);
        });
      }
    ),

    campaignsByActorLoader: new DataLoader<string, any[]>(
      async (actorIds: readonly string[]) => {
        const campaigns = await (Campaign as any).findAll();

        const actorCampaignMap = new Map<string, Campaign[]>();
        actorIds.forEach(id => actorCampaignMap.set(id as string, []));

        campaigns.forEach((campaign: Campaign) => {
          const actors = campaign.actors || [];
          actors.forEach((actorId: string) => {
            if (actorCampaignMap.has(actorId)) {
              actorCampaignMap.get(actorId)!.push(campaign);
            }
          });
        });

        return actorIds.map(id => actorCampaignMap.get(id as string) || []);
      }
    ),

    vulnerabilitiesByAssetLoader: new DataLoader<string, any[]>(
      async (assetIds) => {
        const vulnerabilities = await Vulnerability.findAll();

        const assetVulnMap = new Map<string, any[]>();
        assetIds.forEach(id => assetVulnMap.set(id as string, []));

        vulnerabilities.forEach((vuln: any) => {
          const affectedAssets = vuln.affected_assets || [];
          affectedAssets.forEach((assetId: string) => {
            if (assetVulnMap.has(assetId)) {
              assetVulnMap.get(assetId)!.push(vuln);
            }
          });
        });

        return assetIds.map(id => assetVulnMap.get(id as string) || []);
      }
    ),

    artifactsByCaseLoader: new DataLoader<string, any[]>(
      async (caseIds) => {
        const artifacts = await Artifact.findAll({
          where: {
            case_id: caseIds as string[]
          }
        });

        const caseArtifactMap = new Map<string, any[]>();
        caseIds.forEach(id => caseArtifactMap.set(id as string, []));

        artifacts.forEach((artifact: any) => {
          if (caseArtifactMap.has(artifact.case_id)) {
            caseArtifactMap.get(artifact.case_id)!.push(artifact);
          }
        });

        return caseIds.map(id => caseArtifactMap.get(id as string) || []);
      }
    ),

    chainEventsByArtifactLoader: new DataLoader<string, any[]>(
      async (artifactIds) => {
        const events = await ChainEvent.findAll({
          where: {
            artifact_id: artifactIds as string[]
          }
        });

        const artifactEventMap = new Map<string, any[]>();
        artifactIds.forEach(id => artifactEventMap.set(id as string, []));

        events.forEach((event: any) => {
          if (artifactEventMap.has(event.artifact_id)) {
            artifactEventMap.get(event.artifact_id)!.push(event);
          }
        });

        return artifactIds.map(id => artifactEventMap.get(id as string) || []);
      }
    ),

    messagesByChannelLoader: new DataLoader<string, any[]>(
      async (channelIds) => {
        const messages = await Message.findAll({
          where: {
            channel_id: channelIds as string[]
          },
          order: [['createdAt', 'DESC']],
          limit: 100
        });

        const channelMessageMap = new Map<string, any[]>();
        channelIds.forEach(id => channelMessageMap.set(id as string, []));

        messages.forEach((message: any) => {
          if (channelMessageMap.has(message.channel_id)) {
            channelMessageMap.get(message.channel_id)!.push(message);
          }
        });

        return channelIds.map(id => channelMessageMap.get(id as string) || []);
      }
    )
  };
}

export type Loaders = ReturnType<typeof createLoaders>;
