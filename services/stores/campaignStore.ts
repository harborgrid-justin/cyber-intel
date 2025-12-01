
import { Campaign } from '../../types';
import { BaseStore } from './baseStore';

export class CampaignStore extends BaseStore<Campaign> {
  addCampaign(campaign: Campaign) {
    this.add(campaign);
  }

  updateCampaign(campaign: Campaign) {
    this.update(campaign);
  }

  getByActor(actorName: string): Campaign[] {
    return this.items.filter(c => c.actors.includes(actorName));
  }

  getBySector(sector: string): Campaign[] {
    return this.items.filter(c => c.targetSectors.includes(sector));
  }
}
