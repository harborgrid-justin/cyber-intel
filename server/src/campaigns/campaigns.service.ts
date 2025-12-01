import { Injectable, NotFoundException } from '@nestjs/common';
import { Campaign } from '@/types';
import { ThreatStore } from '@/services/stores/threatStore';
import { ActorStore } from '@/services/stores/actorStore';
import { MockAdapter } from '@/services/dbAdapter';
import { InitialDataFactory } from '@/services/initialData';

@Injectable()
export class CampaignsService {
  private campaignData: Campaign[] = [
    {
      id: 'camp-001',
      name: 'SolarWinds Supply Chain Attack',
      description: 'Large-scale supply chain compromise affecting multiple government agencies',
      status: 'ACTIVE',
      objective: 'ESPIONAGE',
      actors: ['apt-001'],
      firstSeen: '2020-03-01',
      lastSeen: '2021-12-31',
      targetSectors: ['Government', 'Technology'],
      targetRegions: ['United States', 'Europe'],
      threatIds: ['threat-001', 'threat-002'],
      ttps: ['T1195', 'T1059', 'T1071']
    },
    {
      id: 'camp-002',
      name: 'Colonial Pipeline Ransomware',
      description: 'Ransomware attack on critical infrastructure',
      status: 'DORMANT',
      objective: 'FINANCIAL',
      actors: ['apt-002'],
      firstSeen: '2021-05-07',
      lastSeen: '2021-05-07',
      targetSectors: ['Energy'],
      targetRegions: ['United States'],
      threatIds: ['threat-003'],
      ttps: ['T1486', 'T1055']
    }
  ];

  private threatStore: ThreatStore;
  private actorStore: ActorStore;

  constructor() {
    const adapter = new MockAdapter();
    this.threatStore = new ThreatStore('THREATS', InitialDataFactory.getThreats(), adapter);
    this.actorStore = new ActorStore('ACTORS', InitialDataFactory.getActors(), adapter);
  }
  private campaigns: Campaign[] = [
    {
      id: 'camp-001',
      name: 'SolarWinds Supply Chain Attack',
      description: 'Large-scale supply chain compromise affecting multiple government agencies',
      status: 'ACTIVE',
      objective: 'ESPIONAGE',
      actors: ['apt-001'],
      firstSeen: '2020-03-01',
      lastSeen: '2021-12-31',
      targetSectors: ['Government', 'Technology'],
      targetRegions: ['United States', 'Europe'],
      threatIds: ['threat-001', 'threat-002'],
      ttps: ['T1195', 'T1059', 'T1071']
    },
    {
      id: 'camp-002',
      name: 'Colonial Pipeline Ransomware',
      description: 'Ransomware attack on critical infrastructure',
      status: 'DORMANT',
      objective: 'FINANCIAL',
      actors: ['apt-002'],
      firstSeen: '2021-05-07',
      lastSeen: '2021-05-07',
      targetSectors: ['Energy'],
      targetRegions: ['United States'],
      threatIds: ['threat-003'],
      ttps: ['T1486', 'T1055']
    }
  ];

  async findAll(filters?: { status?: string; actor?: string }): Promise<Campaign[]> {
    let result = [...this.campaignData];

    if (filters?.status) {
      result = result.filter(campaign => campaign.status === filters.status);
    }

    if (filters?.actor) {
      result = result.filter(campaign => campaign.actors.includes(filters.actor));
    }

    return result;
  }

  async findOne(id: string): Promise<Campaign | null> {
    return this.campaignData.find(campaign => campaign.id === id) || null;
  }

  async create(createCampaignDto: Omit<Campaign, 'id'>): Promise<Campaign> {
    const newCampaign: Campaign = {
      ...createCampaignDto,
      id: `camp-${Date.now()}`
    };

    this.campaignData.push(newCampaign);
    return newCampaign;
  }

  async update(id: string, updateCampaignDto: Partial<Campaign>): Promise<Campaign | null> {
    const index = this.campaignData.findIndex(campaign => campaign.id === id);
    if (index === -1) {
      return null;
    }

    this.campaignData[index] = { ...this.campaignData[index], ...updateCampaignDto };
    return this.campaignData[index];
  }

  async remove(id: string): Promise<boolean> {
    const index = this.campaignData.findIndex(campaign => campaign.id === id);
    if (index === -1) {
      return false;
    }

    this.campaignData.splice(index, 1);
    return true;
  }

  async getCampaignThreats(campaignId: string): Promise<any[]> {
    const campaign = await this.findOne(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign.threatIds.map(threatId => {
      const threat = this.threatStore.getById(threatId);
      return threat ? {
        id: threat.id,
        indicator: threat.indicator,
        type: threat.type,
        severity: threat.severity,
        lastSeen: threat.lastSeen,
        confidence: threat.confidence
      } : null;
    }).filter(Boolean);
  }

  async getCampaignActors(campaignId: string): Promise<any[]> {
    const campaign = await this.findOne(campaignId);
    if (!campaign) {
      throw new NotFoundException('Campaign not found');
    }

    return campaign.actors.map(actorId => {
      const actor = this.actorStore.getById(actorId);
      return actor ? {
        id: actor.id,
        name: actor.name,
        aliases: actor.aliases,
        origin: actor.origin,
        sophistication: actor.sophistication
      } : null;
    }).filter(Boolean);
  }

  async getCampaignStats(): Promise<any> {
    const activeCampaigns = this.campaignData.filter(c => c.status === 'ACTIVE').length;
    const totalCampaigns = this.campaignData.length;
    const objectives = this.campaignData.reduce((acc, camp) => {
      acc[camp.objective] = (acc[camp.objective] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return {
      total: totalCampaigns,
      active: activeCampaigns,
      objectives,
      sectors: [...new Set(this.campaignData.flatMap(c => c.targetSectors))],
      regions: [...new Set(this.campaignData.flatMap(c => c.targetRegions))]
    };
  }
}