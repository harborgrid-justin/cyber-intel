
import { Campaign } from '../../types';
import { BaseStore } from './baseStore';
import { DatabaseAdapter } from '../dbAdapter';
import { DataMapper } from '../dataMapper';
import { Result } from '../../types/result';

export class CampaignStore extends BaseStore<Campaign> {
  constructor(key: string, initialData: Campaign[], adapter: DatabaseAdapter, mapper?: DataMapper<Campaign>) {
    super(key, initialData, adapter, mapper);
  }

  addCampaign(campaign: Campaign): Result<void> {
    return this.add(campaign);
  }

  updateCampaign(campaign: Campaign): Result<void> {
    return this.update(campaign);
  }

  getByActor(actorName: string): Campaign[] {
    return this.items.filter(c => c.actors.includes(actorName));
  }

  getBySector(sector: string): Campaign[] {
    return this.items.filter(c => c.targetSectors.includes(sector));
  }
}
